import { LRUCache } from 'lru-cache'
import { graphql, GraphqlResponseError } from '@octokit/graphql'
import dayjs from 'dayjs'

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

interface File {
  content: string
  lastUpdateAt: string
}

const fileCache = new LRUCache<string, File>({ max: 20 })

/**
 * push some file changes to github repository
 */
export async function pushFileChanges(changes: FileChanges, message?: string): Promise<void> {
  const { additions, deletions } = changes
  let committedDate: string | null
  try {
    committedDate = await createCommitOnMainBranch(changes, message)
  } catch (error) {
    if ((error instanceof GraphqlResponseError) && error.errors) {
      const topError = error.errors.at(0)
      if (topError && topError.type === 'NOT_FOUND') {
        return
      }
    }
    throw error
  }
  if (typeof committedDate === 'string') {
    // update cache
    additions && additions.forEach(item => fileCache.set(item.path, { content: item.contents, lastUpdateAt: committedDate as string }))
    deletions && deletions.forEach(item => fileCache.delete(item.path))
  }
}

/**
 * get file content from github repository
 */
export async function fetchFileContent(path: string): Promise<File> {
  if (fileCache.has(path)) {
    return fileCache.get(path) as File
  }
  // 发起请求
  const res = await gq(`
    query FileContent($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        object(expression: "main:${path}") {
          ... on Blob {
            text
          }
        }
        ref(qualifiedName: "refs/heads/main") {
          target {
            ... on Commit {
              history(first: 1, path: "${path}") {
                nodes {
                  committedDate
                }
              }
            }
          }
        }
      }
    }
  `)
  const text = res.repository.object?.text || ''
  const lastUpdateAt = res.repository.ref.target.history.nodes.pop() || dayjs(0).toISOString()
  const file: File = {
    content: text,
    lastUpdateAt
  }
  fileCache.set(path, file)
  return file
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

/**
 * return commit create date or null
 */
async function createCommitOnMainBranch(changes: FileChanges, message?: string): Promise<string | null> {
  const additions = changes.additions || []
  const deletions = changes.deletions || []
  const count = additions.length + deletions.length
  if (!count) return null
  const oid = await getLastCommitOid()
  const res = await gq(`
    mutation FileChanges($input: CreateCommitOnBranchInput!) {
      createCommitOnBranch(input: $input) {
        commit {
          url
          committedDate
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
  return res.createCommitOnBranch.commit.committedDate
}

