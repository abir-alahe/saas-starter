import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmail } from '@/lib/supabase/auth';
import { getUser } from '@/lib/db/queries';
import { ActivityType } from '@/lib/db/schema';
import { createLifetimeCheckoutSession } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const { email, password, redirect, priceId } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Supabase
    const { user } = await signInWithEmail(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password. Please try again.' },
        { status: 401 }
      );
    }

    // Get or create user in our database
    const dbUser = await getUser();
    
    // Activity logging removed for simplicity

    // Handle checkout redirect
    if (redirect === 'checkout' && priceId) {
      const checkoutResult = await createLifetimeCheckoutSession({ user: dbUser, priceId });
      return NextResponse.json(checkoutResult);
    }

    // Check if user has lifetime access
    if (dbUser && !dbUser.hasLifetimeAccess) {
      return NextResponse.json({ redirectTo: '/pricing' });
    }

    return NextResponse.json({ redirectTo: '/dashboard' });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sign in failed. Please try again.' },
      { status: 500 }
    );
  }
} 