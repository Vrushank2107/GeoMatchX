import { NextResponse } from "next/server";

import { createJobPosting, type Job } from "@/lib/mockData";

export async function POST(request: Request) {
  const payload = (await request.json()) as Omit<Job, "id">;
  const job = createJobPosting(payload);
  return NextResponse.json({ job, message: "Job brief captured. Our network team will follow up within 24h." });
}


