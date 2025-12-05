import { NextResponse } from "next/server";
import { database, getLocationCoordinates, findLocationsWithinRadius } from "@/lib/db";
import { requireAuth, getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");
    const location = searchParams.get("location");
    const keyword = searchParams.get("keyword") || undefined;
    const page = Number(searchParams.get("page") || "1") || 1;
    const pageSize = Number(searchParams.get("pageSize") || "12") || 12;

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
      WHERE u.user_type = 'CANDIDATE'
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

    const candidates = database.prepare(query).all(...params) as Array<{
      user_id: number;
      name: string;
      email: string;
      phone: string | null;
      user_type: string;
      created_at: string;
    }>;

    // Get locations and skills for each candidate
    const workersWithDetails = candidates.map(candidate => {
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

    // Apply keyword filter (name or any skill match)
    let filteredWorkers = workersWithDetails;
    if (keyword) {
      const kw = keyword.toLowerCase();
      filteredWorkers = filteredWorkers.filter((candidate) => {
        const matchesName = candidate.name.toLowerCase().includes(kw);
        const matchesSkill = candidate.skills.some((s) => s.skill_name.toLowerCase().includes(kw));
        return matchesName || matchesSkill;
      });
    }

    // Filter by location if provided
    if (location) {
      const loc = location.toLowerCase();
      filteredWorkers = filteredWorkers.filter((candidate) => {
        const workerLocation = candidate.locations[0];
        return workerLocation?.address?.toLowerCase().includes(loc);
      });
    }

    const total = filteredWorkers.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedWorkers = filteredWorkers.slice(start, end);

    // Transform to expected format
    const formattedWorkers = await Promise.all(pagedWorkers.map(async (candidate) => {
      const workerLocation = candidate.locations[0];
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
        hourlyRate: 30 + Math.floor(Math.random() * 30),
        location: {
          city: workerLocation?.address || "Unknown",
          country: "India",
          lat,
          lng
        },
        rating: 4.5 + Math.random() * 0.5,
        skills: candidate.skills.map(us => us.skill_name) as any[],
        bio: `Experienced ${candidate.skills.map(us => us.skill_name).join(", ")} professional.`
      };
    }));

    return NextResponse.json({ 
      results: formattedWorkers, 
      total,
    });
  } catch (error) {
    console.error("Error searching candidates:", error);
    return NextResponse.json(
      { error: "Failed to search candidates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const skill = body.skill as string | undefined;
    const location = body.location as string | undefined;
    const keyword = (body.keyword as string | undefined) || undefined;
    const page = (body.page as number | undefined) && body.page > 0 ? body.page : 1;
    const pageSize = (body.pageSize as number | undefined) && body.pageSize > 0 ? body.pageSize : 12;
    const radius = typeof body.radius === "number" && body.radius > 0 ? body.radius : undefined;

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
      WHERE u.user_type = 'CANDIDATE'
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

    const candidates = database.prepare(query).all(...params) as Array<{
      user_id: number;
      name: string;
      email: string;
      phone: string | null;
      user_type: string;
      created_at: string;
    }>;

    // Get locations and skills for each candidate
    const workersWithDetails = candidates.map(candidate => {
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

    let filteredWorkers = workersWithDetails;

    if (keyword) {
      const kw = keyword.toLowerCase();
      filteredWorkers = filteredWorkers.filter((candidate) => {
        const matchesName = candidate.name.toLowerCase().includes(kw);
        const matchesSkill = candidate.skills.some((s) => s.skill_name.toLowerCase().includes(kw));
        return matchesName || matchesSkill;
      });
    }

    if (location) {
      const loc = location.toLowerCase();
      filteredWorkers = filteredWorkers.filter((candidate) => {
        const workerLocation = candidate.locations[0];
        return workerLocation?.address?.toLowerCase().includes(loc);
      });
    }

    const total = filteredWorkers.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedWorkers = filteredWorkers.slice(start, end);

    const formattedWorkers = await Promise.all(pagedWorkers.map(async (candidate) => {
      const workerLocation = candidate.locations[0];
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
        hourlyRate: 30 + Math.floor(Math.random() * 30),
        location: {
          city: workerLocation?.address || "Unknown",
          country: "India",
          lat,
          lng
        },
        rating: 4.5 + Math.random() * 0.5,
        skills: candidate.skills.map(us => us.skill_name) as any[],
        bio: `Experienced ${candidate.skills.map(us => us.skill_name).join(", ")} professional.`
      };
    }));

    return NextResponse.json({ 
      results: formattedWorkers, 
      total,
    });
  } catch (error) {
    console.error("Error searching candidates:", error);
    return NextResponse.json(
      { error: "Failed to search candidates" },
      { status: 500 }
    );
  }
}
