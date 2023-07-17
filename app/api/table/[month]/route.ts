import { NextRequest, NextResponse } from 'next/server'
import { fetchFileContent, pushFileChanges } from '@/lib/github'
import { csvToJson, jsonToCsv } from '@/lib/csv'
import { ExpendRecord, OperationRecord } from '@/lib/types'
import recordsCalculator from '@/lib/recordsCalculator'

/**
 * 获取指定月份的记录表
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { month: string } }
) {
  const { month } = params
  const { content } = await fetchFileContent(`${month}.csv`)
  if (!content) return NextResponse.json([])
  const records = await csvToJson(content)
  return NextResponse.json(records)
}

/**
 * 更新指定月份记录表
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { month: string } }
) {
  const { month } = params
  const ops = await req.json()
  const { content } = await fetchFileContent(`${month}.csv`)
  const records: ExpendRecord[] = content ? (await csvToJson(content)) : []
  const newRecords = recordsCalculator(records, ops)
  if (!newRecords.length) {
    await pushFileChanges({
      deletions: [{ path: `${month}.csv` }]
    })
    return NextResponse.json(null)
  }
  await pushFileChanges({
    additions: [
      {
        path: `${month}.csv`,
        contents: await jsonToCsv(newRecords)
      }
    ]
  })
  return NextResponse.json(null)
}