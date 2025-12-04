import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireSME, getAuthenticatedUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const authError = await requireSME();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all jobs for this company
    const jobs = database.prepare(`
      SELECT 
        j.job_id,
        j.job_title,
        j.job_description,
        j.salary,
        j.status,
        j.created_at
      FROM sme_jobs j
      WHERE j.sme_id = ?
      ORDER BY j.created_at DESC
    `).all(currentUser.userId) as Array<{
      job_id: number;
      job_title: string | null;
      job_description: string | null;
      salary: number | null;
      status: string;
      created_at: string;
    }>;

    const jobsWithStats = jobs.map((job) => {
      const appStats = database
        .prepare(
          `SELECT 
             COUNT(*) as total,
             SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
             SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted
           FROM job_applications
           WHERE job_id = ?`
        )
        .get(job.job_id) as {
          total: number | null;
          pending: number | null;
          accepted: number | null;
        } | undefined;

      return {
        id: `job-${job.job_id}`,
        title: job.job_title || "Untitled Job",
        budget: job.salary ? `₹${job.salary}` : "Not specified",
        status: job.status,
        created_at: job.created_at,
        job_id: job.job_id,
        applications_total: appStats?.total || 0,
        applications_pending: appStats?.pending || 0,
        applications_accepted: appStats?.accepted || 0,
      };
    });

    return NextResponse.json({ jobs: jobsWithStats });
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

