import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireSME, getAuthenticatedUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    // Check authentication and user type
    const authError = await requireSME();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      budget,
      location,
      requiredSkills,
      company
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: title and description" },
        { status: 400 }
      );
    }

    // Get the authenticated SME user
    const sme = database.prepare(`
      SELECT * FROM users 
      WHERE user_id = ? AND user_type = 'SME'
    `).get(currentUser.userId) as {
      user_id: number;
      name: string;
      email: string;
      user_type: string;
    } | undefined;

    if (!sme) {
      return NextResponse.json(
        { error: "Company account not found" },
        { status: 404 }
      );
    }

    // Parse budget to get numeric value
    const salary = budget 
      ? parseFloat(budget.toString().replace(/[^0-9.]/g, ''))
      : null;

    // Create the job
    const jobResult = database.prepare(`
      INSERT INTO sme_jobs (sme_id, job_title, job_description, salary, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(sme.user_id, title, description, salary, 'OPEN');

    const jobId = jobResult.lastInsertRowid as number;

    // Add skills to the job
    if (requiredSkills && Array.isArray(requiredSkills) && requiredSkills.length > 0) {
      for (const skillName of requiredSkills) {
        // Find or create skill
        let skill = database.prepare(`
          SELECT skill_id FROM skills WHERE LOWER(skill_name) = LOWER(?)
        `).get(skillName) as { skill_id: number } | undefined;

        if (!skill) {
          const skillResult = database.prepare(`
            INSERT INTO skills (skill_name) VALUES (?)
          `).run(skillName);
          skill = { skill_id: skillResult.lastInsertRowid as number };
        }

        // Link skill to job
        database.prepare(`
          INSERT INTO job_skills (job_id, skill_id)
          VALUES (?, ?)
        `).run(jobId, skill.skill_id);
      }
    }

    // If location is provided, update or create SME location
    if (location && location.lat && location.lng) {
      // Check if SME already has a location
      const existingLocation = database.prepare(`
        SELECT location_id FROM user_locations WHERE user_id = ? LIMIT 1
      `).get(sme.user_id) as { location_id: number } | undefined;

      if (existingLocation) {
        // Update existing location
        database.prepare(`
          UPDATE user_locations 
          SET latitude = ?, longitude = ?, address = ?
          WHERE location_id = ?
        `).run(location.lat, location.lng, location.city || location.address || '', existingLocation.location_id);
      } else {
        // Create new location
        database.prepare(`
          INSERT INTO user_locations (user_id, address, latitude, longitude)
          VALUES (?, ?, ?, ?)
        `).run(sme.user_id, location.city || location.address || '', location.lat, location.lng);
      }
    }

    // Get the created job
    const job = database.prepare(`
      SELECT * FROM sme_jobs WHERE job_id = ?
    `).get(jobId) as {
      job_id: number;
      sme_id: number;
      job_title: string | null;
      job_description: string | null;
      salary: number | null;
      status: string;
      created_at: string;
    };

    // Return formatted job response
    const formattedJob = {
      id: `job-${job.job_id}`,
      title: job.job_title || title,
      company: company || sme.name,
      budget: budget || (salary ? `₹${salary}` : "Not specified"),
      location: location || { city: "Unknown", country: "India", lat: 0, lng: 0 },
      requiredSkills: requiredSkills || [],
      description: job.job_description || description
    };

    return NextResponse.json({ 
      job: formattedJob, 
      message: "Job brief captured. Our network team will follow up within 24h." 
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job posting" },
      { status: 500 }
    );
  }
}
