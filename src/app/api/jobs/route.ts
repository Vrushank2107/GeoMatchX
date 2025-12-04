import { NextResponse } from "next/server";
import { database } from "@/lib/db";

export async function GET() {
  try {
    // Get all open jobs with company details
    const jobs = database.prepare(`
      SELECT 
        j.job_id,
        j.job_title,
        j.job_description,
        j.salary,
        j.status,
        j.created_at,
        u.name as company_name,
        ul.address,
        ul.latitude,
        ul.longitude
      FROM sme_jobs j
      JOIN users u ON j.sme_id = u.user_id
      LEFT JOIN user_locations ul ON u.user_id = ul.user_id
      WHERE j.status = 'OPEN'
      ORDER BY j.created_at DESC
    `).all() as Array<{
      job_id: number;
      job_title: string | null;
      job_description: string | null;
      salary: number | null;
      status: string;
      created_at: string;
      company_name: string;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
    }>;

    // Get skills for each job
    const jobsWithSkills = jobs.map(job => {
      const jobSkills = database.prepare(`
        SELECT s.skill_name
        FROM job_skills js
        JOIN skills s ON js.skill_id = s.skill_id
        WHERE js.job_id = ?
      `).all(job.job_id) as Array<{ skill_name: string }>;

      return {
        id: `job-${job.job_id}`,
        title: job.job_title || "Untitled Job",
        company: job.company_name,
        budget: job.salary ? `₹${job.salary}` : "Not specified",
        location: {
          city: job.address || "Unknown",
          country: "India",
          lat: job.latitude || 0,
          lng: job.longitude || 0,
        },
        requiredSkills: jobSkills.map(s => s.skill_name) as any[],
        description: job.job_description || "",
        job_id: job.job_id,
      };
    });

    return NextResponse.json({ jobs: jobsWithSkills });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

