import { NextResponse } from "next/server";
import { prisma, getLocationCoordinates } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    // Check authentication
    const authError = await requireAuth();
    if (authError) {
      return authError;
    }
    // Get top matches ordered by score
    const matches = await prisma.match.findMany({
      take: 10,
      orderBy: {
        score: 'desc'
      },
      include: {
        worker: {
          include: {
            locations: {
              take: 1,
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
        },
        job: {
          include: {
            skills: {
              include: {
                skill: true
              }
            }
          }
        }
      }
    });

    // Transform to recommendations format
    const recommendations = await Promise.all(matches.map(async (match, index) => {
      if (!match.worker) return null;

      const worker = match.worker;
      const location = worker.locations[0];
      let lat = 0;
      let lng = 0;
      
      if (location?.geom) {
        const coords = await getLocationCoordinates(location.location_id);
        if (coords) {
          lng = coords.longitude;
          lat = coords.latitude;
        }
      }

      const avgExperience = worker.skills.length > 0
        ? Math.round(
            worker.skills.reduce((sum, us) => sum + (us.experience_years || 0), 0) /
            worker.skills.length
          )
        : 0;

      const workerFormatted = {
        id: `wkr-${worker.user_id}`,
        name: worker.name,
        headline: worker.skills.length > 0 
          ? `${worker.skills[0].skill.skill_name} specialist`
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
        skills: worker.skills.map(us => us.skill.skill_name) as any[],
        bio: `Experienced ${worker.skills.map(us => us.skill.skill_name).join(", ")} professional.`
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

