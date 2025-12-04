import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireSME, getAuthenticatedUser } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireSME();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicationId = parseInt(params.id);
    const body = await request.json();
    const { status } = body;

    if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be ACCEPTED or REJECTED" },
        { status: 400 }
      );
    }

    // Verify the application belongs to a job posted by this SME
    const application = database.prepare(`
      SELECT ja.*, j.sme_id
      FROM job_applications ja
      JOIN sme_jobs j ON ja.job_id = j.job_id
      WHERE ja.application_id = ?
    `).get(applicationId) as {
      application_id: number;
      job_id: number;
      worker_id: number;
      sme_id: number;
      status: string;
    } | undefined;

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.sme_id !== currentUser.userId) {
      return NextResponse.json(
        { error: "Unauthorized to update this application" },
        { status: 403 }
      );
    }

    // Update application status
    database.prepare(`
      UPDATE job_applications 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE application_id = ?
    `).run(status, applicationId);

    // Create notification for the worker
    const job = database.prepare(`
      SELECT job_title FROM sme_jobs WHERE job_id = ?
    `).get(application.job_id) as { job_title: string | null } | undefined;

    const company = database.prepare(`
      SELECT name FROM users WHERE user_id = ?
    `).get(currentUser.userId) as { name: string } | undefined;

    if (job && company) {
      database.prepare(`
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (?, 'APPLICATION_UPDATE', 'Application ${status}', ?, ?)
      `).run(
        application.worker_id,
        `Your application for "${job.job_title || "Job"}" at ${company.name} has been ${status.toLowerCase()}`,
        `/applications`
      );
    }

    return NextResponse.json({
      message: `Application ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

