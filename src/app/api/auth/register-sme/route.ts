import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Check database connection
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL in .env file.' },
        { status: 500 }
      );
    }

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
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create SME user
    const user = await prisma.user.create({
      data: {
        name: companyName,
        email,
        password: hashedPassword,
        phone: phone || null,
        user_type: 'SME',
      },
    });

    // Add location if provided
    if (hqCity) {
      await prisma.userLocation.create({
        data: {
          user_id: user.user_id,
          address: hqCity,
          geom: null, // Would need geocoding to set this
        },
      });
    }

    // Create session
    try {
      await createSession(user.user_id, user.user_type);
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      // Continue even if session creation fails - user is still created
    }

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
      // Provide more specific error messages
      if (error instanceof Error) {
        // Check for Prisma errors
        if (error.message.includes('Unique constraint') || error.message.includes('unique')) {
          return NextResponse.json(
            { error: 'Email already registered. Please use a different email or try logging in.' },
            { status: 400 }
          );
        }
        if (error.message.includes('connect') || error.message.includes('database') || error.message.includes('Prisma')) {
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
      // Fallback if even error response fails
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

