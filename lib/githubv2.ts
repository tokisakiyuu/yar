import { Octokit } from '@octokit/rest'

export async function createOrUpdateFileContents(client: Octokit) {
  return client.repos.createOrUpdateFileContents({
    owner: 'tokisakiyuu',
    repo: 'yar_archive',
    branch: 'test-data',
    path: 'test.json',
    message: 'test push file change',
    content: btoa(JSON.stringify({ msg: 'Hello World' }, null, 2)),
  })
}
