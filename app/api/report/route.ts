import { NextRequest, NextResponse } from 'next/server'
import { ChangeLog, fetchTable, ExpendRecord, updateTable } from '@/lib/source'
import { pushFileChanges } from '@/lib/github'
import { buildCsv } from '@/lib/csv'

export async function POST(req: NextRequest) {
  const { changeLogs } = await req.json() as { changeLogs: ChangeLog[] }
  const monthMap = new Map<string, ExpendRecord[]>()
  for (const log of changeLogs) {
    const { action, record, target } = log
    const { date } = record
    if (!monthMap.has(date)) {
      monthMap.set(date, await fetchTable(date))
    }
    const records = monthMap.get(date) as ExpendRecord[]
    if (action === 'add') {
      records.unshift(record)
    }
    const index = records.findIndex(r => r.rid === target)
    if (index >= 0) {
      if (action === 'delete') {
        const index = records.findIndex(r => r.rid === target)
        records.splice(index, 1)
      }
      if (action === 'update') {
        records.splice(index, 1, record)
      }
    }
  }
  await pushFileChanges({
    additions: await Promise.all(Array.from(monthMap).map(async ([month, records]) => ({
      path: `${month}.csv`,
      contents: await buildCsv(records)
    })))
  })
}