import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';

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
    
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has a password (for existing users without passwords, we'll allow login)
    if (!user.password) {
      // For existing users without passwords, create a temporary password or deny access
      return NextResponse.json(
        { error: 'Please set a password. Use registration to create an account.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    await createSession(user.user_id, user.user_type);

    return NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        userType: user.user_type,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Always return JSON, never let Next.js return HTML error page
    try {
      // Provide more specific error messages
      if (error instanceof Error) {
        // Check for database connection errors
        if (error.message.includes('connect') || error.message.includes('database') || error.message.includes('Prisma')) {
          return NextResponse.json(
            { error: 'Database connection error. Please check your database configuration or contact support.' },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: error.message || 'Failed to login. Please check your credentials and try again.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to login. Please try again later.' },
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

