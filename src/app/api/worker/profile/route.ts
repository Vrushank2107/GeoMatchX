import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireWorker, getAuthenticatedUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const authError = await requireWorker();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const user = database
      .prepare(`SELECT * FROM users WHERE user_id = ?`)
      .get(currentUser.userId) as any;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get location
    const location = database
      .prepare(
        `SELECT * FROM user_locations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
      )
      .get(currentUser.userId) as any;

    // Get skills
    const skills = database
      .prepare(
        `SELECT s.skill_name, us.experience_years 
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.skill_id
         WHERE us.user_id = ?`
      )
      .all(currentUser.userId) as Array<{ skill_name: string; experience_years: number | null }>;

    const avgExperience = skills.length > 0
      ? Math.round(
          skills.reduce((sum, s) => sum + (s.experience_years || 0), 0) / skills.length
        )
      : 0;

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: location?.address || "",
      skills: skills.map((s) => s.skill_name),
      experience: avgExperience,
      bio: user.bio || (
        skills.length > 0
          ? `Experienced ${skills.map((s) => s.skill_name).join(", ")} professional.`
          : "Available worker ready for opportunities."
      ),
      rating: 4.5 + Math.random() * 0.5, // Mock rating for now
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authError = await requireWorker();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, city, skills, experience, bio } = body;

    // Update user
    database
      .prepare(`UPDATE users SET name = ?, phone = ?, bio = ? WHERE user_id = ?`)
      .run(name, phone || null, bio || null, currentUser.userId);

    // Update location
    if (city) {
      const existingLocation = database
        .prepare(`SELECT location_id FROM user_locations WHERE user_id = ? LIMIT 1`)
        .get(currentUser.userId) as { location_id: number } | undefined;

      if (existingLocation) {
        database
          .prepare(`UPDATE user_locations SET address = ? WHERE location_id = ?`)
          .run(city, existingLocation.location_id);
      } else {
        database
          .prepare(
            `INSERT INTO user_locations (user_id, address, latitude, longitude) VALUES (?, ?, ?, ?)`
          )
          .run(currentUser.userId, city, null, null);
      }
    }

    // Update skills
    if (skills) {
      const skillList = skills.split(",").map((s: string) => s.trim()).filter(Boolean);
      
      // Remove existing skills
      database
        .prepare(`DELETE FROM user_skills WHERE user_id = ?`)
        .run(currentUser.userId);

      // Add new skills
      for (const skillName of skillList) {
        let skill = database
          .prepare(`SELECT skill_id FROM skills WHERE LOWER(skill_name) = LOWER(?)`)
          .get(skillName) as { skill_id: number } | undefined;

        if (!skill) {
          const result = database
            .prepare(`INSERT INTO skills (skill_name) VALUES (?)`)
            .run(skillName);
          skill = { skill_id: result.lastInsertRowid as number };
        }

        database
          .prepare(
            `INSERT INTO user_skills (user_id, skill_id, experience_years) VALUES (?, ?, ?)`
          )
          .run(currentUser.userId, skill.skill_id, experience ? parseInt(experience) : null);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

