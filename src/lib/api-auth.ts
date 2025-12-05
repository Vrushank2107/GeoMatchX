import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  return null; // No error, user is authenticated
}

export async function requireSME() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  if (user.userType !== 'SME') {
    return NextResponse.json(
      { error: 'This action requires company account' },
      { status: 403 }
    );
  }
  return null; // No error, user is SME
}

export async function requireWorker() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  if (user.userType !== 'CANDIDATE') {
    return NextResponse.json(
      { error: 'This action requires candidate account' },
      { status: 403 }
    );
  }
  return null; // No error, user is candidate
}

export async function getAuthenticatedUser() {
  return await getCurrentUser();
}

