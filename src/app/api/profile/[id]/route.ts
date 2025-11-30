import { NextResponse } from "next/server";
import { prisma, getLocationCoordinates } from "@/lib/db";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
  try {
    // Extract user_id from id (format: wkr-1 or just 1)
    const userId = params.id.startsWith('wkr-') 
      ? parseInt(params.id.replace('wkr-', ''))
      : parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid worker ID" },
        { status: 400 }
      );
    }

    const worker = await prisma.user.findUnique({
      where: {
        user_id: userId,
        user_type: 'WORKER'
      },
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
    });

    if (!worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

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

    const formattedWorker = {
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
      bio: `Experienced ${worker.skills.map(us => us.skill.skill_name).join(", ")} professional.`,
      email: worker.email,
      phone: worker.phone
    };

    return NextResponse.json(formattedWorker);
  } catch (error) {
    console.error("Error fetching worker profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch worker profile" },
      { status: 500 }
    );
  }
}

