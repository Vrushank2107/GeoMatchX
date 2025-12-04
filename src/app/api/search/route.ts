import { NextResponse } from "next/server";
import { database, getLocationCoordinates } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");
    const location = searchParams.get("location");

    // Build base query
    let query = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.user_type,
        u.created_at
      FROM users u
      WHERE u.user_type = 'WORKER'
    `;

    const params: unknown[] = [];

    // If skill filter is provided, join with skills
    if (skill) {
      query += `
        AND EXISTS (
          SELECT 1 FROM user_skills us
          JOIN skills s ON us.skill_id = s.skill_id
          WHERE us.user_id = u.user_id
          AND LOWER(s.skill_name) LIKE LOWER(?)
        )
      `;
      params.push(`%${skill}%`);
    }

    const workers = database.prepare(query).all(...params) as Array<{
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

    // Filter by location if provided
    let filteredWorkers = workersWithDetails;
    if (location) {
      filteredWorkers = workersWithDetails.filter(worker => {
        const workerLocation = worker.locations[0];
        return workerLocation?.address?.toLowerCase().includes(location.toLowerCase());
      });
    }

    // Transform to expected format
    const formattedWorkers = await Promise.all(filteredWorkers.map(async (worker) => {
      const workerLocation = worker.locations[0];
      let lat = 0;
      let lng = 0;
      
      if (workerLocation?.latitude && workerLocation?.longitude) {
        lat = workerLocation.latitude;
        lng = workerLocation.longitude;
      } else if (workerLocation?.location_id) {
        const coords = getLocationCoordinates(workerLocation.location_id);
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
          ? `${worker.skills[0].skill_name} specialist`
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
        skills: worker.skills.map(us => us.skill_name) as any[],
        bio: `Experienced ${worker.skills.map(us => us.skill_name).join(", ")} professional.`
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

    // Build base query
    let query = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.user_type,
        u.created_at
      FROM users u
      WHERE u.user_type = 'WORKER'
    `;

    const params: unknown[] = [];

    if (skill) {
      query += `
        AND EXISTS (
          SELECT 1 FROM user_skills us
          JOIN skills s ON us.skill_id = s.skill_id
          WHERE us.user_id = u.user_id
          AND LOWER(s.skill_name) LIKE LOWER(?)
        )
      `;
      params.push(`%${skill}%`);
    }

    const workers = database.prepare(query).all(...params) as Array<{
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

    let filteredWorkers = workersWithDetails;
    if (location) {
      filteredWorkers = workersWithDetails.filter(worker => {
        const workerLocation = worker.locations[0];
        return workerLocation?.address?.toLowerCase().includes(location.toLowerCase());
      });
    }

    const formattedWorkers = await Promise.all(filteredWorkers.map(async (worker) => {
      const workerLocation = worker.locations[0];
      let lat = 0;
      let lng = 0;
      
      if (workerLocation?.latitude && workerLocation?.longitude) {
        lat = workerLocation.latitude;
        lng = workerLocation.longitude;
      } else if (workerLocation?.location_id) {
        const coords = getLocationCoordinates(workerLocation.location_id);
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
          ? `${worker.skills[0].skill_name} specialist`
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
        skills: worker.skills.map(us => us.skill_name) as any[],
        bio: `Experienced ${worker.skills.map(us => us.skill_name).join(", ")} professional.`
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
