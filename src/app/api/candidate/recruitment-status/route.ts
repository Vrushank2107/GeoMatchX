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
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    // Extract user_id from worker_id (format: wkr-1 or just 1)
    const userId = worker_id.startsWith('wkr-') 
      ? parseInt(worker_id.replace('wkr-', ''))
      : parseInt(worker_id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid candidate ID" },
        { status: 400 }
      );
    }

    // Check if recruitment request exists
    const recruitmentRequest = database.prepare(`
      SELECT * FROM recruitment_requests 
      WHERE sme_id = ? AND worker_id = ?
    `).get(currentUser.userId, userId) as {
      request_id: number;
      status: string;
      created_at: string;
    } | undefined;

    // Check if candidate already has an active application with this company
    const activeApplication = database.prepare(`
      SELECT ja.application_id, ja.status
      FROM job_applications ja
      JOIN sme_jobs j ON ja.job_id = j.job_id
      WHERE ja.worker_id = ? AND j.sme_id = ?
        AND ja.status IN ('PENDING', 'ACCEPTED')
      LIMIT 1
    `).get(userId, currentUser.userId) as {
      application_id: number;
      status: string;
    } | undefined;

    return NextResponse.json({
      hasRequest: !!recruitmentRequest,
      status: recruitmentRequest?.status || null,
      request_id: recruitmentRequest?.request_id || null,
      hasApplication: !!activeApplication,
      canRecruit: !recruitmentRequest && !activeApplication,
    });
  } catch (error) {
    console.error("Error checking recruitment status:", error);
    return NextResponse.json(
      { error: "Failed to check recruitment status" },
      { status: 500 }
    );
  }
}

