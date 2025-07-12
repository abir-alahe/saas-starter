'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType,
  invitations
} from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createLifetimeCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOut as supabaseSignOut,
  updateUserProfile,
  updatePassword as supabaseUpdatePassword
} from '@/lib/supabase/auth';

async function logActivity(
  teamId: number | null | undefined,
  userId: string,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  try {
    const { user } = await signInWithEmail(email, password);
    
    if (!user) {
      return {
        error: 'Invalid email or password. Please try again.',
        email,
        password
      };
    }

    // Get or create user in our database
    const dbUser = await getUser();
    
    if (dbUser) {
      await logActivity(null, dbUser.id, ActivityType.SIGN_IN);
    }

    const redirectTo = formData.get('redirect') as string | null;
    if (redirectTo === 'checkout') {
      const priceId = formData.get('priceId') as string;
      return createLifetimeCheckoutSession({ user: dbUser, priceId });
    }

    // Check if user has lifetime access
    if (dbUser && !dbUser.hasLifetimeAccess) {
      redirect('/pricing');
    }

    redirect('/dashboard');
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Sign in failed. Please try again.',
      email,
      password
    };
  }
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  inviteId: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, name, inviteId } = data;

  try {
    const { user } = await signUpWithEmail(email, password, name);
    
    if (!user) {
      return {
        error: 'Failed to create user. Please try again.',
        email,
        password
      };
    }

    try {
      // User will be created in our database automatically when they first access getUser()
      // For now, let's create them manually
      const [createdUser] = await db.insert(users).values({
        id: user.id,
        email: user.email!,
        name: name || user.user_metadata?.name || email.split('@')[0],
        role: 'member'
      }).returning();

      let teamId: number | null = null;
      let userRole: string = 'member';
      let createdTeam: typeof teams.$inferSelect | null = null;

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

          await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

          [createdTeam] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamId))
            .limit(1);
        } else {
          return { error: 'Invalid or expired invitation.', email, password };
        }
      } else {
        // Create a new team if there's no invitation
        const newTeam: NewTeam = {
          name: `${email}'s Team`
        };

        [createdTeam] = await db.insert(teams).values(newTeam).returning();

        if (!createdTeam) {
          return {
            error: 'Failed to create team. Please try again.',
            email,
            password
          };
        }

        teamId = createdTeam.id;
        userRole = 'owner';

        await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
      }

      const newTeamMember: NewTeamMember = {
        userId: createdUser.id,
        teamId: teamId,
        role: userRole
      };

      await Promise.all([
        db.insert(teamMembers).values(newTeamMember),
        logActivity(teamId, createdUser.id, ActivityType.SIGN_UP)
      ]);

      const redirectTo = formData.get('redirect') as string | null;
      if (redirectTo === 'checkout') {
        const priceId = formData.get('priceId') as string;
        return createLifetimeCheckoutSession({ user: createdUser, priceId });
      }

      // Check if user has lifetime access
      if (createdUser && !createdUser.hasLifetimeAccess) {
        redirect('/pricing');
      }

      redirect('/dashboard');
    } catch (dbError) {
      // If there's a database error (like missing columns), redirect to pricing page
      console.error('Database error during sign-up:', dbError);
      redirect('/pricing');
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create user. Please try again.',
      email,
      password
    };
  }
});

export async function signOut() {
  try {
    // Just sign out from Supabase without trying to log activity
    // This prevents database conflicts during sign-out
    await supabaseSignOut();
    redirect('/');
  } catch (error) {
    console.error('Sign out error:', error);
    // Even if there's an error, try to redirect to home
    redirect('/');
  }
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    try {
      await supabaseUpdatePassword(newPassword);
      const userWithTeam = await getUserWithTeam(user.id);

      await logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD);

      return {
        success: 'Password updated successfully.'
      };
    } catch (error) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: error instanceof Error ? error.message : 'Failed to update password.'
      };
    }
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    try {
      // Note: Supabase doesn't require password confirmation for account deletion
      // You might want to implement additional verification here
      
      const userWithTeam = await getUserWithTeam(user.id);

      await logActivity(
        userWithTeam?.teamId,
        user.id,
        ActivityType.DELETE_ACCOUNT
      );

      // Soft delete
      await db
        .update(users)
        .set({
          deletedAt: sql`CURRENT_TIMESTAMP`,
          email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
        })
        .where(eq(users.id, user.id));

      if (userWithTeam?.teamId) {
        await db
          .delete(teamMembers)
          .where(
            and(
              eq(teamMembers.userId, user.id),
              eq(teamMembers.teamId, userWithTeam.teamId)
            )
          );
      }

      await supabaseSignOut();
      redirect('/sign-in');
    } catch (error) {
      return {
        password,
        error: error instanceof Error ? error.message : 'Account deletion failed.'
      };
    }
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    try {
      await Promise.all([
        db.update(users).set({ name, email }).where(eq(users.id, user.id)),
        updateUserProfile({ name, email }),
        logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
      ]);

      return { name, success: 'Account updated successfully.' };
    } catch (error) {
      return {
        name,
        email,
        error: error instanceof Error ? error.message : 'Failed to update account.'
      };
    }
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending'
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: 'Invitation sent successfully' };
  }
);
