import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format. Please check your input.' },
        { status: 400 }
      );
    }
    const { name, email, password, phone, skillFocus, city, experienceSummary } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = database.prepare(`
      SELECT user_id FROM users WHERE email = ?
    `).get(email) as { user_id: number } | undefined;

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = database.prepare(`
      INSERT INTO users (name, email, password, phone, user_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, hashedPassword, phone || null, 'WORKER');

    const userId = result.lastInsertRowid as number;

    // Add skills if provided
    if (skillFocus) {
      const skills = skillFocus.split(',').map((s: string) => s.trim());
      for (const skillName of skills) {
        if (!skillName) continue;
        
        // Find or create skill (case-insensitive search)
        let skill = database.prepare(`
          SELECT skill_id FROM skills WHERE LOWER(skill_name) = LOWER(?)
        `).get(skillName) as { skill_id: number } | undefined;

        if (!skill) {
          const skillResult = database.prepare(`
            INSERT INTO skills (skill_name) VALUES (?)
          `).run(skillName);
          skill = { skill_id: skillResult.lastInsertRowid as number };
        }

        // Link skill to user
        database.prepare(`
          INSERT INTO user_skills (user_id, skill_id, experience_years)
          VALUES (?, ?, ?)
        `).run(userId, skill.skill_id, null);
      }
    }

    // Add location if provided
    if (city) {
      database.prepare(`
        INSERT INTO user_locations (user_id, address, latitude, longitude)
        VALUES (?, ?, ?, ?)
      `).run(userId, city, null, null);
    }

    // Create session
    try {
      await createSession(userId, 'WORKER');
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      // Continue even if session creation fails - user is still created
    }

    // Get the created user
    const user = database.prepare(`
      SELECT user_id, name, email, user_type FROM users WHERE user_id = ?
    `).get(userId) as {
      user_id: number;
      name: string;
      email: string;
      user_type: 'SME' | 'WORKER';
    };

    const response = NextResponse.json({
      success: true,
      message: 'Worker account created successfully',
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        userType: user.user_type,
      },
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Always return JSON, never let Next.js return HTML error page
    try {
      if (error instanceof Error) {
        // Check for unique constraint errors
        if (error.message.includes('UNIQUE constraint') || error.message.includes('unique')) {
          return NextResponse.json(
            { error: 'Email already registered. Please use a different email or try logging in.' },
            { status: 400 }
          );
        }
        if (error.message.includes('connect') || error.message.includes('database')) {
          return NextResponse.json(
            { error: 'Database connection error. Please check your database configuration.' },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: error.message || 'Failed to create account. Please try again.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create account. Please check your information and try again.' },
        { status: 500 }
      );
    } catch (responseError) {
      console.error('Failed to create error response:', responseError);
      return new NextResponse(
        JSON.stringify({ error: 'An unexpected error occurred. Please try again later.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
}
