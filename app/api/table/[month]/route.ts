import { NextRequest, NextResponse } from 'next/server'
import { ExpendRecord, fetchTable, updateTable } from '@/lib/source'

/**
 * 获取指定月份的记录表
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { month: string } }
) {
  const { month } = params
  const table = await fetchTable(month)
  return NextResponse.json(table || [])
}

/**
 * 更新指定月份记录表
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { month: string } }
) {
  const records = await req.json() as ExpendRecord[]
  const { month } = params
  await updateTable(month, records)
  return new NextResponse(null, { status: 200 })
}