import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data: Income = await req.json();
  const incomeRecord: Record = {
    rid: nanoid(),
    amount: String(data.amount) ?? 0,
    kind: data.kind ?? "",
    date: dayjs().format("YYYY-M-D"),
    remark: data.remark ?? "",
  };

  await kv.zadd("records", { score: Date.now(), member: incomeRecord });

  return NextResponse.json(incomeRecord);
}

interface Income {
  amount: number;
  kind: string;
  remark: string;
}

interface Record {
  rid: string;
  amount: string;
  kind: string;
  date: string;
  remark: string;
}
