import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireSME, getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const authError = await requireSME();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const worker_id = searchParams.get("worker_id");

    if (!worker_id) {
      return NextResponse.json(
        { error: "Worker ID is required" },
        { status: 400 }
      );
    }

    // Extract user_id from worker_id (format: wkr-1 or just 1)
    const userId = worker_id.startsWith('wkr-') 
      ? parseInt(worker_id.replace('wkr-', ''))
      : parseInt(worker_id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid worker ID" },
        { status: 400 }
      );
    }

    // Check if recruitment request exists
    const request = database.prepare(`
      SELECT * FROM recruitment_requests 
      WHERE sme_id = ? AND worker_id = ?
    `).get(currentUser.userId, userId) as {
      request_id: number;
      status: string;
      created_at: string;
    } | undefined;

    return NextResponse.json({
      hasRequest: !!request,
      status: request?.status || null,
      request_id: request?.request_id || null,
    });
  } catch (error) {
    console.error("Error checking recruitment status:", error);
    return NextResponse.json(
      { error: "Failed to check recruitment status" },
      { status: 500 }
    );
  }
}

