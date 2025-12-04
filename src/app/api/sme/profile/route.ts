import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireSME, getAuthenticatedUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const authError = await requireSME();
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

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: location?.address || "",
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
    const authError = await requireSME();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, city } = body;

    // Update user
    database
      .prepare(`UPDATE users SET name = ?, phone = ? WHERE user_id = ?`)
      .run(name, phone || null, currentUser.userId);

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

