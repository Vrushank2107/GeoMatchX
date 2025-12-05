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

    // Get application stats
    const applications = database
      .prepare(
        `SELECT COUNT(*) as count FROM job_applications WHERE worker_id = ?`
      )
      .get(currentUser.userId) as { count: number };

    const pending = database
      .prepare(
        `SELECT COUNT(*) as count FROM job_applications WHERE worker_id = ? AND status = 'PENDING'`
      )
      .get(currentUser.userId) as { count: number };

    const accepted = database
      .prepare(
        `SELECT COUNT(*) as count FROM job_applications WHERE worker_id = ? AND status = 'ACCEPTED'`
      )
      .get(currentUser.userId) as { count: number };

    // Get pending recruitment requests count
    const recruitments = database
      .prepare(
        `SELECT COUNT(*) as count FROM recruitment_requests WHERE worker_id = ? AND status = 'PENDING'`
      )
      .get(currentUser.userId) as { count: number };

    return NextResponse.json({
      applications: applications.count || 0,
      pending: pending.count || 0,
      accepted: accepted.count || 0,
      recruitments: recruitments.count || 0,
    });
  } catch (error) {
    console.error("Error fetching candidate stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

