import { NextResponse } from "next/server";
import { database, getLocationCoordinates } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    // Check authentication
    const authError = await requireAuth();
    if (authError) {
      return authError;
    }
    
    // Get top matches ordered by score
    const matches = database.prepare(`
      SELECT * FROM matches
      ORDER BY score DESC
      LIMIT 10
    `).all() as Array<{
      match_id: number;
      job_id: number | null;
      worker_id: number | null;
      distance_km: number | null;
      score: number | null;
      created_at: string;
    }>;

    // Transform to recommendations format
    const recommendations = await Promise.all(matches.map(async (match, index) => {
      if (!match.worker_id) return null;

      // Get worker
      const worker = database.prepare(`
        SELECT * FROM users WHERE user_id = ? AND user_type = 'WORKER'
      `).get(match.worker_id) as {
        user_id: number;
        name: string;
        email: string;
        phone: string | null;
        user_type: string;
        created_at: string;
      } | undefined;

      if (!worker) return null;

      // Get location
      const locations = database.prepare(`
        SELECT * FROM user_locations
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).all(worker.user_id) as Array<{
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
      `).all(worker.user_id) as Array<{
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

      const workerFormatted = {
        id: `wkr-${worker.user_id}`,
        name: worker.name,
        headline: userSkills.length > 0 
          ? `${userSkills[0].skill_name} specialist`
          : "Available worker",
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
        bio: `Experienced ${userSkills.map(us => us.skill_name).join(", ")} professional.`
      };

      // Determine match driver based on score and distance
      let driver = "Skill proximity + verified completion rate";
      if (match.distance_km && match.distance_km < 5) {
        driver = "Within 5km radius & high reliability score";
      } else if (match.score && match.score > 90) {
        driver = "Top percentile service reviews";
      }

      return {
        id: `rec-${match.match_id}`,
        worker: workerFormatted,
        matchScore: match.score || 85 - index * 5,
        driver
      };
    }));

    // Filter out null values and return top 3
    const validRecommendations = recommendations.filter(r => r !== null).slice(0, 3);

    return NextResponse.json({ recommendations: validRecommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
