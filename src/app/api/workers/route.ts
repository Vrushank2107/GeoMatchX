import { NextResponse } from "next/server";
import { prisma, getLocationCoordinates } from "@/lib/db";

export async function GET() {
  try {
    // Get all workers with their locations and skills
    const workers = await prisma.user.findMany({
      where: {
        user_type: 'WORKER'
      },
      include: {
        locations: {
          take: 1, // Get the most recent location
          orderBy: {
            created_at: 'desc'
          }
        },
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    // Transform to match the expected format
    const formattedWorkers = await Promise.all(workers.map(async (worker) => {
      const location = worker.locations[0];
      let lat = 0;
      let lng = 0;
      
      if (location?.geom) {
        // Extract coordinates from PostGIS geometry
        const coords = await getLocationCoordinates(location.location_id);
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
          ? `${worker.skills[0].skill.skill_name} specialist`
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
        skills: worker.skills.map(us => us.skill.skill_name) as any[],
        bio: `Experienced ${worker.skills.map(us => us.skill.skill_name).join(", ")} professional.`
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

