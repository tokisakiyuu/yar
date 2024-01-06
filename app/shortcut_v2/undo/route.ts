import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  await kv.zremrangebyrank("records", -1, -1);

  return NextResponse.json("ok");
}

export const dynamic = "force-dynamic";
