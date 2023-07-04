import { NextRequest, NextResponse } from 'next/server'
import { fetchTable } from '@/lib/source'

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