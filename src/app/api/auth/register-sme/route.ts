import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { findGeoLocationByCity } from '@/lib/locations';

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
    const { companyName, email, password, phone, hqCity, industriesServed, deploymentNeeds } = body;

    // Validate required fields
    if (!companyName || !email || !password) {
      return NextResponse.json(
        { error: 'Company name, email, and password are required' },
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

    // Create SME user
    const result = database.prepare(`
      INSERT INTO users (name, email, password, phone, user_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(companyName, email, hashedPassword, phone || null, 'SME');

    const userId = result.lastInsertRowid as number;

    // Add location if provided
    if (hqCity) {
      const geo = findGeoLocationByCity(hqCity);
      database.prepare(`
        INSERT INTO user_locations (user_id, address, latitude, longitude)
        VALUES (?, ?, ?, ?)
      `).run(
        userId,
        hqCity,
        geo?.latitude ?? null,
        geo?.longitude ?? null,
      );
    }

    // Create session
    try {
      await createSession(userId, 'SME');
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
      user_type: 'SME' | 'CANDIDATE';
    };

    const response = NextResponse.json({
      success: true,
      message: 'SME account created successfully',
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
