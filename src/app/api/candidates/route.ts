import { NextResponse } from "next/server";
import { database, getLocationCoordinates } from "@/lib/db";

export async function GET() {
  try {
    // Get all candidates
    const candidates = database.prepare(`
      SELECT * FROM users WHERE user_type = 'CANDIDATE'
    `).all() as Array<{
      user_id: number;
      name: string;
      email: string;
      phone: string | null;
      user_type: string;
      created_at: string;
    }>;

    // Get locations and skills for each candidate
    const candidatesWithDetails = candidates.map(candidate => {
      const locations = database.prepare(`
        SELECT * FROM user_locations
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).all(candidate.user_id) as Array<{
        location_id: number;
        user_id: number;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
        created_at: string;
      }>;

      const userSkills = database.prepare(`
        SELECT us.*, s.skill_name
        FROM user_skills us
        JOIN skills s ON us.skill_id = s.skill_id
        WHERE us.user_id = ?
      `).all(candidate.user_id) as Array<{
        user_id: number;
        skill_id: number;
        experience_years: number | null;
        skill_name: string;
      }>;

      return {
        ...candidate,
        locations,
        skills: userSkills
      };
    });

    // Transform to match the expected format
    const formattedCandidates = await Promise.all(candidatesWithDetails.map(async (candidate) => {
      const candidateLocation = candidate.locations[0];
      let lat = 0;
      let lng = 0;
      
      if (candidateLocation?.latitude && candidateLocation?.longitude) {
        lat = candidateLocation.latitude;
        lng = candidateLocation.longitude;
      } else if (candidateLocation?.location_id) {
        const coords = getLocationCoordinates(candidateLocation.location_id);
        if (coords) {
          lng = coords.longitude;
          lat = coords.latitude;
        }
      }

      // Calculate average experience years
      const avgExperience = candidate.skills.length > 0
        ? Math.round(
            candidate.skills.reduce((sum, us) => sum + (us.experience_years || 0), 0) /
            candidate.skills.length
          )
        : 0;

      return {
        id: `wkr-${candidate.user_id}`,
        name: candidate.name,
        headline: candidate.skills.length > 0 
          ? `${candidate.skills[0].skill_name} specialist`
          : "Available candidate",
        experience: avgExperience,
        availability: "Immediate" as const,
        hourlyRate: 30 + Math.floor(Math.random() * 30), // Mock hourly rate
        location: {
          city: candidateLocation?.address || "Unknown",
          country: "India",
          lat,
          lng
        },
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        skills: candidate.skills.map(us => us.skill_name) as any[],
        bio: `Experienced ${candidate.skills.map(us => us.skill_name).join(", ")} professional.`
      };
    }));

    return NextResponse.json({ results: formattedCandidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}
