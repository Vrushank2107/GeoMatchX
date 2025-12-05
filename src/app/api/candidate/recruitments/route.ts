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

    // Get all recruitment requests for this candidate
    const requests = database.prepare(`
      SELECT 
        rr.request_id,
        rr.status,
        rr.created_at,
        u.user_id as sme_id,
        u.name as company_name,
        u.email as company_email
      FROM recruitment_requests rr
      JOIN users u ON rr.sme_id = u.user_id
      WHERE rr.worker_id = ?
      ORDER BY rr.created_at DESC
    `).all(currentUser.userId) as Array<{
      request_id: number;
      status: string;
      created_at: string;
      sme_id: number;
      company_name: string;
      company_email: string;
    }>;

    return NextResponse.json({
      recruitments: requests.map((req) => ({
        request_id: req.request_id,
        company_id: req.sme_id,
        company_name: req.company_name,
        company_email: req.company_email,
        status: req.status,
        created_at: req.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching recruitments:", error);
    return NextResponse.json(
      { error: "Failed to fetch recruitments" },
      { status: 500 }
    );
  }
}

