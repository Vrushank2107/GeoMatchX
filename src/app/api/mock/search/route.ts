import { NextResponse } from "next/server";

import { searchWorkers, type SkillTag } from "@/lib/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get("skill") as SkillTag | null;
  const city = searchParams.get("location");

  const results = searchWorkers(skill ?? undefined, city ?? undefined);
  return NextResponse.json({ results, total: results.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  const results = searchWorkers(body.skill as SkillTag | undefined, body.location);
  return NextResponse.json({ results, total: results.length });
}


