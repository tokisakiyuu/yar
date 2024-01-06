import { csvToJson, jsonToCsv } from "@/lib/csv";
import { getAllFiles, pushFileChanges } from "@/lib/github";
import { collectKindsFromFiles } from "@/lib/kindHelper";
import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import { NextResponse } from "next/server";

export async function GET() {
  const files = await getAllFiles();
  await recollectKinds(files);
  await pushRecords(files);
  return NextResponse.json("ok");
}

async function recollectKinds(files: File[]) {
  const csvFiles = files.filter((file) => file.name.endsWith(".csv"));
  const kinds = await collectKindsFromFiles(csvFiles);
  await kv.set("kinds", kinds);
}

async function pushRecords(files: File[]) {
  const records = await kv.zrange<Record[]>("records", 0, -1);
  if (!records.length) return;

  const monthGroup: Map<string, Record[]> = new Map();

  for (const record of records) {
    const month = dayjs(record.date, "YYYY-M-D").format("YYYY-MM");
    if (!monthGroup.has(month)) {
      monthGroup.set(month, [record]);
    } else {
      const exists = monthGroup.get(month) as Record[];
      monthGroup.set(month, [...exists, record]);
    }
  }

  const targetMonths = await Promise.all(
    Array.from(monthGroup.keys()).map(async (month) => {
      const file = files.find((file) => file.name === `${month}.csv`);
      if (!file) return { month, records: [] };
      return { month, records: await csvToJson(file?.content) };
    }),
  );

  await kv.set("backup_before_push:targetMonths", targetMonths);
  await kv.set("backup_before_push:records", records);

  const updateMonths = Array.from(monthGroup.keys()).map((month) => {
    const target = targetMonths.find((item) => item.month === month);
    if (!target) throw new Error("Sync Failed");
    const cachedRecords = monthGroup.get(month) as Record[];
    return { month, records: [...target.records, ...cachedRecords] };
  });

  await pushFileChanges(
    {
      additions: await Promise.all(
        updateMonths.map(async (item) => ({
          path: `${item.month}.csv`,
          contents: await jsonToCsv(item.records),
        })),
      ),
    },
    "sync",
  );

  await kv.del("records");
}

interface Record {
  rid: string;
  amount: string;
  kind: string;
  date: string;
  remark: string;
}

interface File {
  name: string;
  content: string;
}

export const dynamic = "force-dynamic";
