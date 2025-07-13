import { getUser } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching user from API');
    const user = await getUser();
    console.log('User from database:', { userId: user?.id, hasLifetimeAccess: user?.hasLifetimeAccess });
    
    if (!user) {
      console.log('No user found, returning 401');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Return user data without sensitive information
    const { ...safeUser } = user;
    console.log('Returning user data');
    
    return NextResponse.json(safeUser);
  } catch (error) {
    // Don't log AuthSessionMissingError as it's expected during sign-out
    if (error instanceof Error && !error.message.includes('Auth session missing')) {
      console.error('Error fetching user:', error);
    }
    
    // If it's an auth session error, return 401 instead of 500
    if (error instanceof Error && error.message.includes('Auth session missing')) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
