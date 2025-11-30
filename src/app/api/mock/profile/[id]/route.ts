import { NextResponse } from "next/server";

import { getWorkerById } from "@/lib/mockData";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
  const worker = getWorkerById(params.id);
  if (!worker) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }
  return NextResponse.json(worker);
}


