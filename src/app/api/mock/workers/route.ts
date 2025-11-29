import { NextResponse } from "next/server";

import { getWorkers } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({ results: getWorkers() });
}


