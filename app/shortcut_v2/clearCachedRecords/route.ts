import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  await kv.del("records");

  return NextResponse.json("ok");
}

export const dynamic = "force-dynamic";
