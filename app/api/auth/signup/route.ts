import { NextRequest, NextResponse } from 'next/server';
import { signUpWithEmail } from '@/lib/supabase/auth';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, invitations, ActivityType } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { createLifetimeCheckoutSession } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, inviteId, redirect, priceId } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign up with Supabase
    const { user } = await signUpWithEmail(email, password, name);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user. Please try again.' },
        { status: 500 }
      );
    }

    try {
      // Create user in our database
      const [createdUser] = await db.insert(users).values({
        id: user.id,
        email: user.email!,
        name: name || user.user_metadata?.name || email.split('@')[0],
        role: 'member'
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

          // Activity logging removed for simplicity
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

        // Activity logging removed for simplicity
      }

      const newTeamMember = {
        userId: createdUser.id,
        teamId: teamId,
        role: userRole
      };

      await db.insert(teamMembers).values(newTeamMember);

      // Handle checkout redirect
      if (redirect === 'checkout' && priceId) {
        const checkoutResult = await createLifetimeCheckoutSession({ user: createdUser, priceId });
        return NextResponse.json(checkoutResult);
      }

      // Check if user has lifetime access
      if (createdUser && !createdUser.hasLifetimeAccess) {
        return NextResponse.json({ redirectTo: '/pricing' });
      }

      return NextResponse.json({ redirectTo: '/dashboard' });
    } catch (dbError) {
      // If there's a database error, redirect to pricing page
      console.error('Database error during sign-up:', dbError);
      return NextResponse.json({ redirectTo: '/pricing' });
    }
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user. Please try again.' },
      { status: 500 }
    );
  }
} 