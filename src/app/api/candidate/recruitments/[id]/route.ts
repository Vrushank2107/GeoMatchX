import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireWorker, getAuthenticatedUser } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const authError = await requireWorker();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle Next.js 16 params which might be a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const requestId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { status } = body;

    if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be ACCEPTED or REJECTED" },
        { status: 400 }
      );
    }

    // Verify the request belongs to this candidate
    const recruitmentRequest = database.prepare(`
      SELECT * FROM recruitment_requests WHERE request_id = ? AND worker_id = ?
    `).get(requestId, currentUser.userId) as {
      request_id: number;
      sme_id: number;
      worker_id: number;
      status: string;
    } | undefined;

    if (!recruitmentRequest) {
      return NextResponse.json(
        { error: "Recruitment request not found" },
        { status: 404 }
      );
    }

    // Update request status
    database.prepare(`
      UPDATE recruitment_requests 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE request_id = ?
    `).run(status, requestId);

    // Create notification for the company
    const candidate = database.prepare(`
      SELECT name FROM users WHERE user_id = ?
    `).get(currentUser.userId) as { name: string } | undefined;

    if (candidate) {
      database.prepare(`
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (?, 'APPLICATION_UPDATE', 'Recruitment Response', ?, ?)
      `).run(
        recruitmentRequest.sme_id,
        `${candidate.name} has ${status.toLowerCase()} your recruitment request`,
        `/sme/dashboard`
      );
    }

    return NextResponse.json({
      message: `Recruitment request ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Error updating recruitment request:", error);
    return NextResponse.json(
      { error: "Failed to update recruitment request" },
      { status: 500 }
    );
  }
}

