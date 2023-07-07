import { buildCsv, parseCsv } from "./csv"
import { fetchFileContent, pushFileChanges } from "./github"

export interface ExpendRecord {
  rid: string       // uuid
  kind: string      // 餐饮
  remark: string    // 早餐
  amount: number    // -12.4
  date: string      // 2023-06-20
  createAt: string  // 2023-06-20 6:50
}

export async function fetchTable(month: string): Promise<ExpendRecord[]> {
  const source = await fetchFileContent(`${month}.csv`)
  return source
    ? (await parseCsv(source)) as ExpendRecord[]
    : []
}

export async function fetchTableBatch(monthList: string[]): Promise<ExpendRecord[][]> {
  const sourceList = await fetchFileContent(monthList.map(m => `${m}.csv`))
  return Promise.all(
    sourceList.map(async source => {
      return source
        ? (await parseCsv(source)) as ExpendRecord[]
        : []
    })
  )
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

export async function updateTableBatch(list: { month: string; records: ExpendRecord[] }[]): Promise<void> {
  await pushFileChanges({
    additions: await Promise.all(
      list.map(async item => ({
        path: `${item.month}.csv`,
        contents: await buildCsv(item.records)
      }))
    )
  })
}