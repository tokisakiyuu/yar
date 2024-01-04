/**
 * 获取收支分类，按权重排序
 */
import { NextRequest, NextResponse } from "next/server";
import { fetchFileContent, pushFileChanges } from "@/lib/github";

export async function GET() {
  const { content } = await fetchFileContent("kinds.json");
  const kinds: Kind[] = JSON.parse(content);
  const sorted = kinds.sort((a, b) => b.weight - a.weight);
  return NextResponse.json(sorted.map((item) => item.name));
}

interface Kind {
  name: string;
  weight: number;
}
