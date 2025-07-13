import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, invitations } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { createLifetimeCheckoutSession } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const { email, name, inviteId, redirect, priceId } = await request.json();

    console.log('Sign up request:', { email, name, inviteId, redirect, priceId });

    // During sign-up, we expect the client-side Supabase auth to have already created the user
    // We just need to handle database setup and redirects
    
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

    try {
      // Create user in our database
      const [createdUser] = await db.insert(users).values({
        id: user.id,
        email: user.email!,
        name: name || user.user_metadata?.name || email.split('@')[0],
        role: 'member'
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email!,
          name: name || user.user_metadata?.name || email.split('@')[0],
          updatedAt: new Date(),
        }
      }).returning();

      let teamId: number | null = null;
      let userRole: string = 'member';

      if (inviteId) {
        // Check if there's a valid invitation
        const [invitation] = await db
          .select()
          .from(invitations)
          .where(
            and(
              eq(invitations.id, parseInt(inviteId)),
              eq(invitations.email, email),
              eq(invitations.status, 'pending')
            )
          )
          .limit(1);

        if (invitation) {
          teamId = invitation.teamId;
          userRole = invitation.role;

          await db
            .update(invitations)
            .set({ status: 'accepted' })
            .where(eq(invitations.id, invitation.id));
        } else {
          return NextResponse.json(
            { error: 'Invalid or expired invitation.' },
            { status: 400 }
          );
        }
      } else {
        // Create a new team if there's no invitation
        const [createdTeam] = await db.insert(teams).values({
          name: `${email}'s Team`
        }).returning();

        if (!createdTeam) {
          return NextResponse.json(
            { error: 'Failed to create team. Please try again.' },
            { status: 500 }
          );
        }

        teamId = createdTeam.id;
        userRole = 'owner';
      }

      const newTeamMember = {
        userId: createdUser.id,
        teamId: teamId,
        role: userRole
      };

      await db.insert(teamMembers).values(newTeamMember);

      // Determine redirect URL
      let redirectTo = '/dashboard';
      
      if (redirect) {
        redirectTo = redirect;
      } else if (priceId) {
        redirectTo = `/pricing?priceId=${priceId}`;
      } else if (!createdUser.hasLifetimeAccess) {
        redirectTo = '/pricing';
      }

      console.log('Sign-up API: Redirecting to:', redirectTo);

      return NextResponse.json({
        success: true,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          hasLifetimeAccess: createdUser.hasLifetimeAccess,
        },
        redirectTo,
      });
    } catch (dbError) {
      // If there's a database error, redirect to pricing page
      console.error('Database error during sign-up:', dbError);
      return NextResponse.json({ 
        success: true,
        redirectTo: '/pricing' 
      });
    }
  } catch (error) {
    console.error('Sign-up API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 