
export const runtime = "nodejs";

import { prisma } from "@/lib/db";

export async function GET() {
  const me = await prisma.user.findMany();
  return Response.json(me);
}

