import { attachDB } from '@/lib/mongo'
import dayjs from 'dayjs'
import joi from 'joi'
import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
  amount: string
  kind: string
  remark: string
  date: string
}

export async function POST(req: NextRequest) {
  const data: RequestBody = await req.json()
  const result = requestBodySchema.validate(data)
  if (result.error) {
    return NextResponse.json(result, { status: 403 })
  }

  const db = await attachDB()
  const record = await db.collection('records').insertOne({
    ...data,
    date: dayjs(data.date).toDate(),
  })
  return NextResponse.json(record)
}

const requestBodySchema = joi.object({
  amount: joi.number().required(),
  kind: joi.string().trim().required(),
  remark: joi.string().allow(''),
  date: joi.date().iso().required(),
})
