import { NextResponse } from "next/server";
import { database, getLocationCoordinates } from "@/lib/db";

export async function GET() {
  try {
    // Get all workers
    const workers = database.prepare(`
      SELECT * FROM users WHERE user_type = 'WORKER'
    `).all() as Array<{
      user_id: number;
      name: string;
      email: string;
      phone: string | null;
      user_type: string;
      created_at: string;
    }>;

    // Get locations and skills for each worker
    const workersWithDetails = workers.map(worker => {
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

      return {
        ...worker,
        locations,
        skills: userSkills
      };
    });

    // Transform to match the expected format
    const formattedWorkers = await Promise.all(workersWithDetails.map(async (worker) => {
      const location = worker.locations[0];
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

      // Calculate average experience years
      const avgExperience = worker.skills.length > 0
        ? Math.round(
            worker.skills.reduce((sum, us) => sum + (us.experience_years || 0), 0) /
            worker.skills.length
          )
        : 0;

      return {
        id: `wkr-${worker.user_id}`,
        name: worker.name,
        headline: worker.skills.length > 0 
          ? `${worker.skills[0].skill_name} specialist`
          : "Available worker",
        experience: avgExperience,
        availability: "Immediate" as const,
        hourlyRate: 30 + Math.floor(Math.random() * 30), // Mock hourly rate
        location: {
          city: location?.address || "Unknown",
          country: "India",
          lat,
          lng
        },
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        skills: worker.skills.map(us => us.skill_name) as any[],
        bio: `Experienced ${worker.skills.map(us => us.skill_name).join(", ")} professional.`
      };
    }));

    return NextResponse.json({ results: formattedWorkers });
  } catch (error) {
    console.error("Error fetching workers:", error);
    return NextResponse.json(
      { error: "Failed to fetch workers" },
      { status: 500 }
    );
  }
}
