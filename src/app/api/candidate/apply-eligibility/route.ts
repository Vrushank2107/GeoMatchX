import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireWorker, getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const authError = await requireWorker();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobIdParam = searchParams.get("job_id");

    if (!jobIdParam) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const job_id = parseInt(jobIdParam, 10);
    if (isNaN(job_id)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const job = database.prepare(`
      SELECT job_id, sme_id, status FROM sme_jobs WHERE job_id = ?
    `).get(job_id) as { job_id: number; sme_id: number; status: string } | undefined;

    if (!job || job.status !== "OPEN") {
      return NextResponse.json({
        canApply: false,
        reason: "Job is not available",
        hasActiveRecruitment: false,
        hasApplicationForJob: false,
      });
    }

    const existingApplication = database.prepare(`
      SELECT application_id, status FROM job_applications
      WHERE worker_id = ? AND job_id = ?
      LIMIT 1
    `).get(currentUser.userId, job.job_id) as {
      application_id: number;
      status: string;
    } | undefined;

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

    const hasApplicationForJob = !!existingApplication && ["PENDING", "ACCEPTED"].includes(existingApplication.status);
    const hasActiveRecruitment = !!activeRecruitment;

    if (hasApplicationForJob) {
      return NextResponse.json({
        canApply: false,
        reason: "You have already applied for this job.",
        hasActiveRecruitment,
        hasApplicationForJob,
      });
    }

    if (hasActiveRecruitment) {
      return NextResponse.json({
        canApply: false,
        reason: "You already have a recruitment offer from this company.",
        hasActiveRecruitment,
        hasApplicationForJob,
      });
    }

    return NextResponse.json({
      canApply: true,
      reason: null,
      hasActiveRecruitment,
      hasApplicationForJob,
    });
  } catch (error) {
    console.error("Error checking apply eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check apply eligibility" },
      { status: 500 }
    );
  }
}
