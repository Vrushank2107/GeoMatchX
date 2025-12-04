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
    const jobId = searchParams.get("job_id");

    let query = `
      SELECT 
        ja.application_id,
        ja.job_id,
        ja.worker_id,
        ja.status,
        ja.cover_letter,
        ja.created_at,
        j.job_title,
        u.name as worker_name,
        u.email as worker_email,
        u.phone as worker_phone
      FROM job_applications ja
      JOIN sme_jobs j ON ja.job_id = j.job_id
      JOIN users u ON ja.worker_id = u.user_id
      WHERE j.sme_id = ?
    `;

    const params: unknown[] = [currentUser.userId];

    if (jobId) {
      query += ` AND j.job_id = ?`;
      params.push(parseInt(jobId));
    }

    query += ` ORDER BY ja.created_at DESC`;

    const applications = database.prepare(query).all(...params) as Array<{
      application_id: number;
      job_id: number;
      worker_id: number;
      status: string;
      cover_letter: string | null;
      created_at: string;
      job_title: string | null;
      worker_name: string;
      worker_email: string;
      worker_phone: string | null;
    }>;

    return NextResponse.json({
      applications: applications.map((app) => ({
        application_id: app.application_id,
        job_id: app.job_id,
        job_title: app.job_title,
        worker_id: app.worker_id,
        worker_name: app.worker_name,
        worker_email: app.worker_email,
        worker_phone: app.worker_phone,
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

