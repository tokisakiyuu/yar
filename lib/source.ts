import { buildCsv, parseCsv } from "./csv"
import { fetchFileContent, pushFileChanges } from "./github"

export interface Manifest {
  tables: {
    month: string     // 2023-06
    updateAt: string  // 2023-06-30 10:30:50
    rowCount: number  // 99
  }[]
}

export interface ChangeLog {
  action: 'add' | 'delete' | 'update'
  target: string     // rid
  at: string    // 2023-06-20 06:50
  record: ExpendRecord
}

export async function fetchManifest(): Promise<Manifest> {
  const source = await fetchFileContent('_manifest.json')
  if (!source) {
    return {
      tables: []
    }
  }
  return JSON.parse(source)
}

export async function updateManifest(manifest: Manifest) {
  await pushFileChanges({
    additions: [
      { path: '_manifest.json', contents: JSON.stringify(manifest) }
    ]
  })
}

export interface Table {
  records: ExpendRecord[]
  updateAt: string      // 2023-06-30 10:30:50
}

export interface ExpendRecord {
  rid: string       // uuid
  kind: string      // 餐饮
  remark: string    // 早餐
  amount: number    // -12.4
  date: string      // 2023-6-20
  createAt: string  // 2023-6-20 6:50
}

export async function fetchTable(month: string): Promise<ExpendRecord[]> {
  const source = await fetchFileContent(`${month}.csv`)
  return source
    ? (await parseCsv(source)) as ExpendRecord[]
    : []
}

export async function updateTable(month: string, records: ExpendRecord[]): Promise<void> {
  await pushFileChanges({
    additions: [
      {
        path: `${month}.csv`,
        contents: await buildCsv(records)
      }
    ]
  })
}