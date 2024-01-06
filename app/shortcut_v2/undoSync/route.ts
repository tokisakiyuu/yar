// @ts-nocheck
import { jsonToCsv } from "@/lib/csv";
import { pushFileChanges } from "@/lib/github";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  const targetMonths = await kv.get<MonthData[]>(
    "backup_before_push:targetMonths",
  );
  const records = await kv.get<Record[]>("backup_before_push:records");

  if (!targetMonths || !records) {
    return NextResponse.json("No need to undo");
  }

  await pushFileChanges(
    {
      additions: await Promise.all(
        targetMonths
          .filter((item) => item.records.length)
          .map(async (item) => ({
            path: `${item.month}.csv`,
            contents: await jsonToCsv(item.records),
          })),
      ),
      deletions: targetMonths
        .filter((item) => !item.records.length)
        .map((item) => ({ path: `${item.month}.csv` })),
    },
    "undo sync",
  );

  await kv.zadd(
    "records",
    ...records.map((record, i) => ({ score: i, member: record })),
  );

  await kv.del("backup_before_push:targetMonths");
  await kv.del("backup_before_push:records");

  return NextResponse.json("ok");
}

interface MonthData {
  month: string;
  records: Record[];
}

interface Record {
  rid: string;
  amount: string;
  kind: string;
  date: string;
  remark: string;
}

export const dynamic = "force-dynamic";
