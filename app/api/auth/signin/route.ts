import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const { email, redirect, priceId } = await request.json();
    
    console.log('Sign in request:', { email, redirect, priceId });
    
    // During sign-in, we don't need to check if user is already authenticated
    // The client-side Supabase auth has already handled the authentication
    // We just need to handle redirects and any additional logic
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get the current session from cookies
    const cookieStore = request.cookies;
    const supabaseAccessToken = cookieStore.get('sb-access-token')?.value;
    const supabaseRefreshToken = cookieStore.get('sb-refresh-token')?.value;
    
    if (!supabaseAccessToken) {
      console.log('No Supabase access token found in cookies');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Set the session in Supabase client
    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseAccessToken);
    
    if (userError || !user) {
      console.log('Failed to get user from Supabase:', userError);
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    console.log('Supabase user found:', { id: user.id, email: user.email });
    
    // Now get the user from our database
    console.log('Sign-in API: Calling getUser()...');
    const dbUser = await getUser(supabaseAccessToken, supabaseRefreshToken);
    
    console.log('Sign-in API: Database user result:', {
      userId: dbUser?.id,
      email: dbUser?.email,
      hasLifetimeAccess: dbUser?.hasLifetimeAccess,
      hasUser: !!dbUser
    });
    
    if (!dbUser) {
      console.log('Sign-in API: No database user found, returning 401');
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 401 }
      );
    }
    
    // Determine redirect URL
    let redirectTo = '/dashboard';
    
    if (redirect) {
      redirectTo = redirect;
    } else if (priceId) {
      redirectTo = `/pricing?priceId=${priceId}`;
    } else if (!dbUser.hasLifetimeAccess) {
      redirectTo = '/pricing';
    }
    
    console.log('Sign-in API: Redirecting to:', redirectTo);
    
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        hasLifetimeAccess: dbUser.hasLifetimeAccess,
      },
      redirectTo,
    });
    
  } catch (error) {
    console.error('Sign-in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 