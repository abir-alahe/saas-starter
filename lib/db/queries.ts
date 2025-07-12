import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { 
  activityLogs, 
  teamMembers, 
  teams, 
  users, 
  dogs, 
  trainingSessions, 
  trainingProgress, 
  trainingContent, 
  userProgress 
} from './schema';
import { getUser as getSupabaseUser } from '@/lib/supabase/auth';

export async function getUser() {
  try {
    const supabaseUser = await getSupabaseUser();
    
    if (!supabaseUser) {
      return null;
    }

    // Get user from our database using Supabase user ID
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, supabaseUser.id), isNull(users.deletedAt)))
      .limit(1);

    if (user.length === 0) {
      // Create user in our database if they don't exist, or update if they do
      const [newUser] = await db
        .insert(users)
        .values({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
          role: 'member',
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
            updatedAt: new Date(),
          }
        })
        .returning();
      
      return newUser;
    }

    return user[0];
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
}

export async function getUserByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserLifetimeAccess(
  userId: string,
  lifetimeData: {
    hasLifetimeAccess: boolean;
    stripePaymentIntentId: string;
    purchaseDate: Date;
  }
) {
  await db
    .update(users)
    .set({
      ...lifetimeData,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getUserWithTeam(userId: string) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      metadata: activityLogs.metadata
    })
    .from(activityLogs)
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

// New dog training specific queries
export async function getUserDogs(userId: string) {
  return await db
    .select()
    .from(dogs)
    .where(eq(dogs.userId, userId))
    .orderBy(desc(dogs.createdAt));
}

export async function getDogById(dogId: number, userId: string) {
  const result = await db
    .select()
    .from(dogs)
    .where(and(eq(dogs.id, dogId), eq(dogs.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createDog(dogData: {
  userId: string;
  name: string;
  breed?: string;
  age?: number;
  weight?: number;
  temperament?: string;
  trainingLevel?: string;
}) {
  const [newDog] = await db.insert(dogs).values(dogData).returning();
  return newDog;
}

export async function updateDog(
  dogId: number,
  userId: string,
  dogData: Partial<{
    name: string;
    breed: string;
    age: number;
    weight: number;
    temperament: string;
    trainingLevel: string;
  }>
) {
  const [updatedDog] = await db
    .update(dogs)
    .set({ ...dogData, updatedAt: new Date() })
    .where(and(eq(dogs.id, dogId), eq(dogs.userId, userId)))
    .returning();

  return updatedDog;
}

export async function deleteDog(dogId: number, userId: string) {
  await db
    .delete(dogs)
    .where(and(eq(dogs.id, dogId), eq(dogs.userId, userId)));
}

export async function getTrainingSessions(userId: string, dogId?: number) {
  if (dogId) {
    return await db
      .select()
      .from(trainingSessions)
      .where(and(
        eq(trainingSessions.userId, userId),
        eq(trainingSessions.dogId, dogId)
      ))
      .orderBy(desc(trainingSessions.sessionDate));
  }

  return await db
    .select()
    .from(trainingSessions)
    .where(eq(trainingSessions.userId, userId))
    .orderBy(desc(trainingSessions.sessionDate));
}

export async function createTrainingSession(sessionData: {
  userId: string;
  dogId: number;
  sessionType: string;
  duration?: number;
  notes?: string;
}) {
  const [newSession] = await db.insert(trainingSessions).values(sessionData).returning();
  return newSession;
}

export async function updateTrainingSession(
  sessionId: number,
  userId: string,
  sessionData: Partial<{
    sessionType: string;
    duration: number;
    notes: string;
    completed: boolean;
  }>
) {
  const [updatedSession] = await db
    .update(trainingSessions)
    .set(sessionData)
    .where(and(eq(trainingSessions.id, sessionId), eq(trainingSessions.userId, userId)))
    .returning();

  return updatedSession;
}

export async function getTrainingProgress(userId: string, dogId?: number) {
  if (dogId) {
    return await db
      .select()
      .from(trainingProgress)
      .where(and(
        eq(trainingProgress.userId, userId),
        eq(trainingProgress.dogId, dogId)
      ))
      .orderBy(desc(trainingProgress.updatedAt));
  }

  return await db
    .select()
    .from(trainingProgress)
    .where(eq(trainingProgress.userId, userId))
    .orderBy(desc(trainingProgress.updatedAt));
}

export async function updateTrainingProgress(progressData: {
  userId: string;
  dogId: number;
  skillName: string;
  skillType: string;
  proficiency: number;
}) {
  const existing = await db
    .select()
    .from(trainingProgress)
    .where(
      and(
        eq(trainingProgress.userId, progressData.userId),
        eq(trainingProgress.dogId, progressData.dogId),
        eq(trainingProgress.skillName, progressData.skillName)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(trainingProgress)
      .set({
        proficiency: progressData.proficiency,
        lastPracticed: new Date(),
        updatedAt: new Date()
      })
      .where(eq(trainingProgress.id, existing[0].id))
      .returning();
    return updated;
  } else {
    const [newProgress] = await db
      .insert(trainingProgress)
      .values({
        ...progressData,
        lastPracticed: new Date()
      })
      .returning();
    return newProgress;
  }
}

export async function getTrainingContent(category?: string, difficulty?: string) {
  const conditions = [eq(trainingContent.isActive, true)];
  
  if (category) {
    conditions.push(eq(trainingContent.category, category));
  }
  
  if (difficulty) {
    conditions.push(eq(trainingContent.difficulty, difficulty));
  }

  return await db
    .select()
    .from(trainingContent)
    .where(and(...conditions))
    .orderBy(desc(trainingContent.createdAt));
}

export async function getUserProgress(userId: string) {
  return await db
    .select({
      progress: userProgress,
      content: trainingContent
    })
    .from(userProgress)
    .leftJoin(trainingContent, eq(userProgress.contentId, trainingContent.id))
    .where(eq(userProgress.userId, userId))
    .orderBy(desc(userProgress.updatedAt));
}

export async function updateUserProgress(progressData: {
  userId: string;
  contentId: number;
  status: string;
  notes?: string;
}) {
  const existing = await db
    .select()
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, progressData.userId),
        eq(userProgress.contentId, progressData.contentId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(userProgress)
      .set({
        status: progressData.status,
        notes: progressData.notes,
        completedAt: progressData.status === 'completed' ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(userProgress.id, existing[0].id))
      .returning();
    return updated;
  } else {
    const [newProgress] = await db
      .insert(userProgress)
      .values({
        ...progressData,
        completedAt: progressData.status === 'completed' ? new Date() : null
      })
      .returning();
    return newProgress;
  }
}
