import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  const records = await kv.zrange("records", 0, -1);

  return NextResponse.json(records);
}

export const dynamic = "force-dynamic";
