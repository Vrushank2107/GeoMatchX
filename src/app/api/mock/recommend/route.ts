import { NextResponse } from "next/server";

import { getRecommendations } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({ recommendations: getRecommendations() });
}


