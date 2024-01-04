import { NextResponse } from "next/server";
import { fetchFileContent, pushFileChanges } from "@/lib/github";
import { ExpendRecord } from "@/lib/types";
import { csvToJson, jsonToCsv } from "@/lib/csv";
import dayjs from "dayjs";

export async function GET() {
  const month = dayjs().format("YYYY-MM");
  const { content } = await fetchFileContent(`${month}.csv`);

  const records: ExpendRecord[] = content ? await csvToJson(content) : [];
  const record = records.pop();

  await pushFileChanges(
    {
      additions: [
        {
          path: `${month}.csv`,
          contents: await jsonToCsv(records),
        },
      ],
    },
    "undo",
  );

  return NextResponse.json(record);
}

export const dynamic = "force-dynamic";
