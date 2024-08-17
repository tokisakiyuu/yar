import { attachDB } from '@/lib/mongo'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const id = params.get('id')
  if (!id) {
    return NextResponse.json({ msg: '`id` is required' }, { status: 403 })
  }

  const db = await attachDB()
  const result = await db.collection('records').deleteOne({
    _id: new ObjectId(id),
  })

  return NextResponse.json(result)
}

export const dynamic = 'force-dynamic'
