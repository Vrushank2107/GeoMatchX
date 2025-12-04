import { NextResponse } from "next/server";

import { getWorkerById } from "@/lib/mockData";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = context.params instanceof Promise ? await context.params : context.params;
  const worker = getWorkerById(resolvedParams.id);
  if (!worker) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }
  return NextResponse.json(worker);
}


