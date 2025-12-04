import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireSME, getAuthenticatedUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const authError = await requireSME();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { worker_id } = body;

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

    // Verify worker exists
    const worker = database.prepare(`
      SELECT * FROM users WHERE user_id = ? AND user_type = 'WORKER'
    `).get(userId) as {
      user_id: number;
      name: string;
    } | undefined;

    if (!worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    // Check if recruitment request already exists
    const existingRequest = database.prepare(`
      SELECT * FROM recruitment_requests 
      WHERE sme_id = ? AND worker_id = ?
    `).get(currentUser.userId, userId) as {
      request_id: number;
      status: string;
    } | undefined;

    if (existingRequest) {
      return NextResponse.json({
        message: "Recruitment request already sent",
        request_id: existingRequest.request_id,
      });
    }

    // Prevent recruitment if worker already has an active application with this company
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

    if (activeApplication) {
      return NextResponse.json(
        { error: "This worker already has an active job application with your company. Please manage it from your Applications page instead of sending a recruitment request." },
        { status: 400 }
      );
    }

    // Get company name
    const company = database.prepare(`
      SELECT name FROM users WHERE user_id = ?
    `).get(currentUser.userId) as { name: string } | undefined;

    // Create recruitment request
    const requestResult = database.prepare(`
      INSERT INTO recruitment_requests (sme_id, worker_id, status)
      VALUES (?, ?, 'PENDING')
    `).run(currentUser.userId, userId);

    // Create notification for the worker
    database.prepare(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (?, 'RECRUITMENT_REQUEST', 'Recruitment Request', ?, ?)
    `).run(
      userId,
      `${company?.name || 'A company'} has sent you a recruitment request`,
      `/worker/recruitments`
    );

    return NextResponse.json({
      message: "Recruitment request sent successfully",
      request_id: requestResult.lastInsertRowid,
    });
  } catch (error) {
    console.error("Error sending recruitment request:", error);
    return NextResponse.json(
      { error: "Failed to send recruitment request" },
      { status: 500 }
    );
  }
}

