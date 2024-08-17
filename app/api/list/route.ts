import { attachDB } from '@/lib/mongo'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const skip = Number(params.get('skip') ?? 0)
  const limit = Number(params.get('limit') ?? 50)

  const db = await attachDB()
  const records = await db
    .collection('records')
    .find()
    .sort('date', 'desc')
    .skip(skip)
    .limit(limit)
    .toArray()
  const total = await db.collection('records').countDocuments()

  return NextResponse.json({
    records,
    total,
    skip,
    limit,
  })
}

export const dynamic = 'force-dynamic'
