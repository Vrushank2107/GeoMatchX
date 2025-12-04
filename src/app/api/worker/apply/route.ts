import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireWorker, getAuthenticatedUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const authError = await requireWorker();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { job_id, cover_letter } = body;

    if (!job_id) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = database.prepare(`
      SELECT * FROM sme_jobs WHERE job_id = ? AND status = 'OPEN'
    `).get(job_id) as {
      job_id: number;
      sme_id: number;
    } | undefined;

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or not available" },
        { status: 404 }
      );
    }

    // Check if already applied for this job
    const existingApplication = database.prepare(`
      SELECT * FROM job_applications 
      WHERE worker_id = ? AND job_id = ?
    `).get(currentUser.userId, job_id) as {
      application_id: number;
    } | undefined;

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job" },
        { status: 400 }
      );
    }

    // Prevent applying if there is an active recruitment request from this company
    const activeRecruitment = database.prepare(`
      SELECT request_id, status
      FROM recruitment_requests
      WHERE sme_id = ? AND worker_id = ?
        AND status IN ('PENDING', 'ACCEPTED')
      LIMIT 1
    `).get(job.sme_id, currentUser.userId) as {
      request_id: number;
      status: string;
    } | undefined;

    if (activeRecruitment) {
      return NextResponse.json(
        { error: "You already have a recruitment offer from this company. Please respond to that offer instead of applying for this job." },
        { status: 400 }
      );
    }

    // Create application
    database.prepare(`
      INSERT INTO job_applications (worker_id, job_id, status, cover_letter)
      VALUES (?, ?, 'PENDING', ?)
    `).run(currentUser.userId, job_id, cover_letter || null);

    // Create notification for the company
    const companyUser = database.prepare(`
      SELECT sme_id as user_id FROM sme_jobs WHERE job_id = ?
    `).get(job_id) as { user_id: number } | undefined;

    if (companyUser) {
      const worker = database.prepare(`
        SELECT name FROM users WHERE user_id = ?
      `).get(currentUser.userId) as { name: string } | undefined;

      if (worker) {
        database.prepare(`
          INSERT INTO notifications (user_id, type, title, message, link)
          VALUES (?, 'APPLICATION_UPDATE', 'New Job Application', ?, ?)
        `).run(
          companyUser.user_id,
          `${worker.name} applied for your job posting`,
          `/sme/applications?job_id=${job_id}`
        );
      }
    }

    return NextResponse.json({
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

