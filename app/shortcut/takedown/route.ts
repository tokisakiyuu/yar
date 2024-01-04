/**
 * 记一笔
 */
import { NextRequest, NextResponse } from "next/server";
import { fetchFileContent, pushFileChanges } from "@/lib/github";
import { ExpendRecord } from "@/lib/types";
import { csvToJson, jsonToCsv } from "@/lib/csv";
import dayjs from "dayjs";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const data: Income = await req.json();
  const month = dayjs().format("YYYY-MM");
  const date = dayjs().format("YYYY-M-D");
  const { content } = await fetchFileContent(`${month}.csv`);

  const records: ExpendRecord[] = content ? await csvToJson(content) : [];
  const newRecord = {
    rid: nanoid(),
    date,
    amount: String(data.amount),
    kind: data.kind,
    remark: data.remark,
  };
  records.push(newRecord);

  await pushFileChanges({
    additions: [
      {
        path: `${month}.csv`,
        contents: await jsonToCsv(records),
      },
    ],
  });

  return NextResponse.json(newRecord);
}

interface Income {
  amount: number;
  kind: string;
  remark: string;
}

export const fetchCache = "force-no-store";
