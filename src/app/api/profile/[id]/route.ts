import { NextResponse } from "next/server";
import { database, getLocationCoordinates } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle Next.js 16 params which might be a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }
    
    // Extract user_id from id (format: wkr-1 or just 1)
    const userId = resolvedParams.id.startsWith('wkr-') 
      ? parseInt(resolvedParams.id.replace('wkr-', ''))
      : parseInt(resolvedParams.id);

    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid candidate ID" },
        { status: 400 }
      );
    }

    // Check database connection
    if (!database) {
      console.error("Database not initialized");
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    const candidate = database.prepare(`
      SELECT * FROM users 
      WHERE user_id = ? AND user_type = 'CANDIDATE'
    `).get(userId) as {
      user_id: number;
      name: string;
      email: string;
      phone: string | null;
      user_type: string;
      created_at: string;
    } | undefined;

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Get location
    const locations = database.prepare(`
      SELECT * FROM user_locations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).all(userId) as Array<{
      location_id: number;
      user_id: number;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
      created_at: string;
    }>;

    // Get skills
    const userSkills = database.prepare(`
      SELECT us.*, s.skill_name
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.skill_id
      WHERE us.user_id = ?
    `).all(userId) as Array<{
      user_id: number;
      skill_id: number;
      experience_years: number | null;
      skill_name: string;
    }>;

    const location = locations[0];
    let lat = 0;
    let lng = 0;
    
    if (location?.latitude && location?.longitude) {
      lat = location.latitude;
      lng = location.longitude;
    } else if (location?.location_id) {
      const coords = getLocationCoordinates(location.location_id);
      if (coords) {
        lng = coords.longitude;
        lat = coords.latitude;
      }
    }

    const avgExperience = userSkills.length > 0
      ? Math.round(
          userSkills.reduce((sum, us) => sum + (us.experience_years || 0), 0) /
          userSkills.length
        )
      : 0;

    const formattedWorker = {
      id: `wkr-${candidate.user_id}`,
      name: candidate.name,
      headline: userSkills.length > 0 
        ? `${userSkills[0].skill_name} specialist`
        : "Available candidate",
      experience: avgExperience,
      availability: "Immediate" as const,
      hourlyRate: 30 + Math.floor(Math.random() * 30),
      location: {
        city: location?.address || "Unknown",
        country: "India",
        lat,
        lng
      },
      rating: 4.5 + Math.random() * 0.5,
      skills: userSkills.map(us => us.skill_name) as any[],
      bio: `Experienced ${userSkills.map(us => us.skill_name).join(", ")} professional.`,
      email: candidate.email,
      phone: candidate.phone
    };

    return NextResponse.json(formattedWorker);
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to fetch candidate profile",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
