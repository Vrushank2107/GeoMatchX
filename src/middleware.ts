import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/', // Home page - allow unauthenticated users to see website info
  '/auth/login',
  '/auth/login-worker',
  '/auth/login-sme',
  '/auth/register-worker',
  '/auth/register-sme',
];

// All other routes require authentication

// Routes that are SME-only
const smeOnlyRoutes = [
  '/post-job',
];

// Routes that are Worker-only (if any)
const workerOnlyRoutes: string[] = [];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes (home page and auth pages)
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // All other routes require authentication
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie) {
    // Redirect to login page
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    const userType = session.userType;

    // Check SME-only routes
    if (smeOnlyRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (userType !== 'SME') {
        return NextResponse.redirect(new URL('/workers', request.url));
      }
    }

    // Check Worker-only routes
    if (workerOnlyRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (userType !== 'WORKER') {
        return NextResponse.redirect(new URL('/post-job', request.url));
      }
    }
  } catch {
    // Invalid session, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

