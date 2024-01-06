import { kv } from "@vercel/kv";
import joi from "joi";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

const incomeSchema = joi.object({
  amount: joi.number().required(),
  kind: joi.string().trim().required(),
  remark: joi.string().allow(""),
  date: joi
    .string()
    .trim()
    .pattern(/^[0-9]{4}\-[0-9]{1,2}-[0-9]{1,2}$/)
    .required(),
});

export async function POST(req: NextRequest) {
  const data: Income = await req.json();
  const result = incomeSchema.validate(data);
  if (result.error) {
    return new Response(JSON.stringify(result.error, null, 2), { status: 400 });
  }

  const incomeRecord: Record = {
    rid: nanoid(),
    amount: String(data.amount) ?? 0,
    kind: data.kind ?? "",
    date: data.date,
    remark: data.remark ?? "",
  };

  await kv.zadd("records", { score: Date.now(), member: incomeRecord });

  return NextResponse.json(incomeRecord);
}

interface Income {
  amount: number;
  kind: string;
  remark: string;
  date: string;
}

interface Record {
  rid: string;
  amount: string;
  kind: string;
  date: string;
  remark: string;
}
