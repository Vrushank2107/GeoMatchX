import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireWorker, getAuthenticatedUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const authError = await requireWorker();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get applications with job details
    const applications = database
      .prepare(
        `SELECT 
          ja.application_id,
          ja.job_id,
          ja.status,
          ja.cover_letter,
          ja.created_at,
          j.job_title,
          u.name as company_name
         FROM job_applications ja
         JOIN sme_jobs j ON ja.job_id = j.job_id
         JOIN users u ON j.sme_id = u.user_id
         WHERE ja.worker_id = ?
         ORDER BY ja.created_at DESC`
      )
      .all(currentUser.userId) as Array<{
        application_id: number;
        job_id: number;
        status: string;
        cover_letter: string | null;
        created_at: string;
        job_title: string | null;
        company_name: string;
      }>;

    return NextResponse.json({
      applications: applications.map((app) => ({
        application_id: app.application_id,
        job_id: app.job_id,
        job_title: app.job_title,
        company_name: app.company_name,
        status: app.status,
        cover_letter: app.cover_letter,
        created_at: app.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

