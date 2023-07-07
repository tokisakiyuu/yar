import { LRUCache } from 'lru-cache'
import { graphql, GraphqlResponseError } from '@octokit/graphql'

interface FileChanges {
  additions?: AdditionChange[]
  deletions?: DeletionChange[]
}

interface AdditionChange {
  path: string
  contents: string
}

interface DeletionChange {
  path: string
}

const fileCache = new LRUCache<string, string>({ max: 20 })

/**
 * push some file changes to github repository
 */
export async function pushFileChanges(changes: FileChanges, message?: string): Promise<void> {
  const { additions, deletions } = changes
  try {
    await createCommitOnMainBranch(changes, message)
  } catch (error) {
    if ((error instanceof GraphqlResponseError) && error.errors) {
      const topError = error.errors.at(0)
      if (topError && topError.type === 'NOT_FOUND') {
        return
      }
    }
    throw error
  }
  // update cache
  additions && additions.forEach(item => fileCache.set(item.path, item.contents))
  deletions && deletions.forEach(item => fileCache.delete(item.path))
}

/**
 * get file content from github repository
 */
export async function fetchFileContent(path: string): Promise<string>
export async function fetchFileContent(paths: string[]): Promise<string[]>
export async function fetchFileContent(input: string | string[]): Promise<string | string[]> {
  const paths = []
  if (typeof input === 'string') {
    if (!input) return ''
    paths.push(input)
  } else if (Array.isArray(input)) {
    if (!input.length) return []
    paths.push(...input)
  }
  // 把已经缓存过的文件和没缓存过的分开，待和后面请求结果返回时合并
  const cachedPaths: { path: string; content: string }[] = []
  const uncachedPaths: { path: string; content: string }[] = []
  paths.forEach((path, index) => {
    if (fileCache.has(path)) {
      cachedPaths.push({
        path,
        content: fileCache.get(path) as string
      })
    } else {
      uncachedPaths.push({
        path,
        content: ''
      })
    }
  })
  if (uncachedPaths.length) {
    // 发起请求
    const res = await gq(`
      query FileContent($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          ${uncachedPaths.map((item, index) => (`
            file${index}: object(expression: "HEAD:${item.path}") {
              ... on Blob {
                text
              }
            }
          `)).join('')}
        }
      }
    `)
    // 请求完成填充返回内容
    Object.keys(res.repository).forEach(key => {
      const index = Number(key.substring(4))
      const content: string = res.repository[key]?.text || ''
      uncachedPaths[index].content = content
    })
    // 更新缓存
    uncachedPaths.forEach(item => {
      const { path, content } = item
      fileCache.set(path, content)
    })
  }
  // 合并结果
  const resultMap = cachedPaths.concat(uncachedPaths).reduce<{ [path: string]: string }>((map, item) => {
    map[item.path] = item.content
    return map
  }, {})
  const result = paths.map(path => resultMap[path])
  // 返回结果
  return (typeof input === 'string') ? result[0] : result
}

async function gq<T = any>(doc: string, variables?: any): Promise<T> {
  return graphql(
    doc,
    Object.assign(
      {
        owner: process.env.REPO_OWNER,
        name: process.env.REPO_NAME,
        headers: {
          authorization: `Bearer ${process.env.REPO_ACCESS_TOKEN}`
        },
        request: (input: RequestInfo, init: RequestInit = {}) => fetch(input, { cache: 'no-store', ...init })
      },
      variables
    )
  )
}

async function getLastCommitOid() {
  const res = await gq(`
    query LastCommit($owner: String!, $name: String!) {
      repository(name: $name, owner: $owner) {
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 1) {
                nodes {
                  oid
                }
              }
            }
          }
        }
      }
    }`
  )
  return res.repository.defaultBranchRef.target.history.nodes[0].oid
}

async function createCommitOnMainBranch(changes: FileChanges, message?: string) {
  const additions = changes.additions || []
  const deletions = changes.deletions || []
  const count = additions.length + deletions.length
  if (!count) return
  const oid = await getLastCommitOid()
  return await gq(`
    mutation FileChanges($input: CreateCommitOnBranchInput!) {
      createCommitOnBranch(input: $input) {
        commit {
          url
        }
      }
    }
  `,
  {
    input: {
      branch: {
        repositoryNameWithOwner: `${process.env.REPO_OWNER}/${process.env.REPO_NAME}`,
        branchName: 'main'
      },
      message: {
        headline: message || `${count} files pushed`
      },
      fileChanges: {
        additions: additions?.map<AdditionChange>(item => ({ path: item.path, contents: Buffer.from(item.contents).toString('base64') })),
        deletions: deletions
      },
      expectedHeadOid: oid
    }
  })
}

