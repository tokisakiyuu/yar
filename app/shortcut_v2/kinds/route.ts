import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const urlInfo = new URL(req.url);
  const withWeight = urlInfo.searchParams.has("weight");

  const kinds = await kv.get<Kind[]>("kinds");
  if (!kinds) {
    return NextResponse.json([]);
  }
  const sortedKinds = kinds.sort((a, b) => b.weight - a.weight);

  return NextResponse.json(
    withWeight ? sortedKinds : sortedKinds.map((kind) => kind.name),
  );
}

interface Kind {
  name: string;
  weight: number;
}

export const dynamic = "force-dynamic";
