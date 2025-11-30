import { NextResponse } from "next/server";
import { prisma, queryDb } from "@/lib/db";
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
    const sme = await prisma.user.findUnique({
      where: { user_id: currentUser.userId, user_type: 'SME' }
        });

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
    const job = await prisma.smeJob.create({
      data: {
        sme_id: sme.user_id,
        job_title: title,
        job_description: description,
        salary: salary,
        status: 'OPEN'
      }
    });

    // Add skills to the job
    if (requiredSkills && Array.isArray(requiredSkills) && requiredSkills.length > 0) {
      for (const skillName of requiredSkills) {
        // Find or create skill
        let skill = await prisma.skill.findFirst({
          where: {
            skill_name: {
              equals: skillName,
              mode: 'insensitive'
            }
          }
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: {
              skill_name: skillName
            }
          });
        }

        // Link skill to job
        await prisma.jobSkill.create({
          data: {
            job_id: job.job_id,
            skill_id: skill.skill_id
          }
        });
      }
    }

    // If location is provided, update or create SME location
    if (location && location.lat && location.lng) {
      // Check if SME already has a location
      const existingLocation = await prisma.userLocation.findFirst({
        where: { user_id: sme.user_id }
      });

      if (existingLocation) {
        // Update existing location
        await queryDb(
          `UPDATE user_locations 
           SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
               address = $3
           WHERE location_id = $4`,
          location.lng,
          location.lat,
          location.city || location.address || '',
          existingLocation.location_id
        );
      } else {
        // Create new location
        await queryDb(
          `INSERT INTO user_locations (user_id, address, geom)
           VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography)`,
          sme.user_id,
          location.city || location.address || '',
          location.lng,
          location.lat
        );
      }
    }

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

