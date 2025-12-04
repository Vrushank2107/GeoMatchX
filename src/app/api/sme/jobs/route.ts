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

    return NextResponse.json({ 
      jobs: jobs.map(job => ({
        id: `job-${job.job_id}`,
        title: job.job_title || "Untitled Job",
        budget: job.salary ? `₹${job.salary}` : "Not specified",
        status: job.status,
        created_at: job.created_at,
        job_id: job.job_id,
      }))
    });
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

