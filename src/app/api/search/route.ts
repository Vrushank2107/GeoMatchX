import { NextResponse } from "next/server";
import { prisma, getLocationCoordinates } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");
    const location = searchParams.get("location");

    // Build query conditions
    const where: any = {
      user_type: 'WORKER'
    };

    // If skill filter is provided, filter by skill
    if (skill) {
      where.skills = {
        some: {
          skill: {
            skill_name: {
              contains: skill,
              mode: 'insensitive'
            }
          }
        }
      };
    }

    const workers = await prisma.user.findMany({
      where,
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

    // Filter by location if provided
    let filteredWorkers = workers;
    if (location) {
      filteredWorkers = workers.filter(worker => {
        const workerLocation = worker.locations[0];
        return workerLocation?.address?.toLowerCase().includes(location.toLowerCase());
      });
    }

    // Transform to expected format
    const formattedWorkers = await Promise.all(filteredWorkers.map(async (worker) => {
      const workerLocation = worker.locations[0];
      let lat = 0;
      let lng = 0;
      
      if (workerLocation?.geom) {
        const coords = await getLocationCoordinates(workerLocation.location_id);
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

      return {
        id: `wkr-${worker.user_id}`,
        name: worker.name,
        headline: worker.skills.length > 0 
          ? `${worker.skills[0].skill.skill_name} specialist`
          : "Available worker",
        experience: avgExperience,
        availability: "Immediate" as const,
        hourlyRate: 30 + Math.floor(Math.random() * 30),
        location: {
          city: workerLocation?.address || "Unknown",
          country: "India",
          lat,
          lng
        },
        rating: 4.5 + Math.random() * 0.5,
        skills: worker.skills.map(us => us.skill.skill_name) as any[],
        bio: `Experienced ${worker.skills.map(us => us.skill.skill_name).join(", ")} professional.`
      };
    }));

    return NextResponse.json({ 
      results: formattedWorkers, 
      total: formattedWorkers.length 
    });
  } catch (error) {
    console.error("Error searching workers:", error);
    return NextResponse.json(
      { error: "Failed to search workers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const skill = body.skill;
    const location = body.location;

    // Build query conditions
    const where: any = {
      user_type: 'WORKER'
    };

    if (skill) {
      where.skills = {
        some: {
          skill: {
            skill_name: {
              contains: skill,
              mode: 'insensitive'
            }
          }
        }
      };
    }

    const workers = await prisma.user.findMany({
      where,
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

    let filteredWorkers = workers;
    if (location) {
      filteredWorkers = workers.filter(worker => {
        const workerLocation = worker.locations[0];
        return workerLocation?.address?.toLowerCase().includes(location.toLowerCase());
      });
    }

    const formattedWorkers = await Promise.all(filteredWorkers.map(async (worker) => {
      const workerLocation = worker.locations[0];
      let lat = 0;
      let lng = 0;
      
      if (workerLocation?.geom) {
        const coords = await getLocationCoordinates(workerLocation.location_id);
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

      return {
        id: `wkr-${worker.user_id}`,
        name: worker.name,
        headline: worker.skills.length > 0 
          ? `${worker.skills[0].skill.skill_name} specialist`
          : "Available worker",
        experience: avgExperience,
        availability: "Immediate" as const,
        hourlyRate: 30 + Math.floor(Math.random() * 30),
        location: {
          city: workerLocation?.address || "Unknown",
          country: "India",
          lat,
          lng
        },
        rating: 4.5 + Math.random() * 0.5,
        skills: worker.skills.map(us => us.skill.skill_name) as any[],
        bio: `Experienced ${worker.skills.map(us => us.skill.skill_name).join(", ")} professional.`
      };
    }));

    return NextResponse.json({ 
      results: formattedWorkers, 
      total: formattedWorkers.length 
    });
  } catch (error) {
    console.error("Error searching workers:", error);
    return NextResponse.json(
      { error: "Failed to search workers" },
      { status: 500 }
    );
  }
}

