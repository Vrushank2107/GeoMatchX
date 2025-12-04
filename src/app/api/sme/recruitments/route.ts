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

    const requests = database
      .prepare(
        `SELECT 
           rr.request_id,
           rr.status,
           rr.created_at,
           u.user_id as worker_id,
           u.name as worker_name,
           u.email as worker_email
         FROM recruitment_requests rr
         JOIN users u ON rr.worker_id = u.user_id
         WHERE rr.sme_id = ?
         ORDER BY rr.created_at DESC
         LIMIT 50`
      )
      .all(currentUser.userId) as Array<{
        request_id: number;
        status: string;
        created_at: string;
        worker_id: number;
        worker_name: string;
        worker_email: string;
      }>;

    return NextResponse.json({
      recruitments: requests.map((req) => ({
        request_id: req.request_id,
        worker_id: req.worker_id,
        worker_name: req.worker_name,
        worker_email: req.worker_email,
        status: req.status,
        created_at: req.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching SME recruitments:", error);
    return NextResponse.json(
      { error: "Failed to fetch recruitments" },
      { status: 500 },
    );
  }
}