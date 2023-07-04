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
export async function fetchFileContent(path: string): Promise<string> {
  if (fileCache.has(path)) {
    return fileCache.get(path) as string
  }
  const res = await gq(`
    query FileContent($owner: String!, $name: String!, $expression: String!) {
      repository(owner: $owner, name: $name) {
        object(expression: $expression) {
          ... on Blob {
            text
          }
        }
      }
    }
  `, {
    expression: `HEAD:${path}`
  })
  const content =  res.repository?.object?.text || ''
  // update cache
  fileCache.set(path, content)
  return content
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
        }
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

