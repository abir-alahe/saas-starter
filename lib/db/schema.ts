import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(), // Supabase auth user ID
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  // Remove passwordHash as Supabase handles authentication
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  // Dog training specific fields
  hasLifetimeAccess: boolean('has_lifetime_access').notNull().default(false),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  purchaseDate: timestamp('purchase_date'),
  lastLoginAt: timestamp('last_login_at'),
});

export const dogs = pgTable('dogs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  breed: varchar('breed', { length: 100 }),
  age: integer('age'),
  weight: integer('weight'),
  temperament: varchar('temperament', { length: 50 }),
  trainingLevel: varchar('training_level', { length: 50 }).default('beginner'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const trainingSessions = pgTable('training_sessions', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  dogId: integer('dog_id')
    .notNull()
    .references(() => dogs.id),
  sessionType: varchar('session_type', { length: 50 }).notNull(), // 'basic', 'tricks', 'games'
  duration: integer('duration'), // in minutes
  notes: text('notes'),
  completed: boolean('completed').notNull().default(false),
  sessionDate: timestamp('session_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const trainingProgress = pgTable('training_progress', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  dogId: integer('dog_id')
    .notNull()
    .references(() => dogs.id),
  skillName: varchar('skill_name', { length: 100 }).notNull(),
  skillType: varchar('skill_type', { length: 50 }).notNull(), // 'command', 'trick', 'behavior'
  proficiency: integer('proficiency').notNull().default(0), // 0-100
  lastPracticed: timestamp('last_practiced'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const trainingContent = pgTable('training_content', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  contentType: varchar('content_type', { length: 50 }).notNull(), // 'video', 'article', 'exercise'
  difficulty: varchar('difficulty', { length: 20 }).notNull(), // 'beginner', 'intermediate', 'advanced'
  category: varchar('category', { length: 50 }).notNull(), // 'basic_commands', 'tricks', 'games', 'behavior'
  videoUrl: text('video_url'),
  articleContent: text('article_content'),
  exerciseSteps: jsonb('exercise_steps'),
  estimatedDuration: integer('estimated_duration'), // in minutes
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  contentId: integer('content_id')
    .notNull()
    .references(() => trainingContent.id),
  status: varchar('status', { length: 20 }).notNull().default('not_started'), // 'not_started', 'in_progress', 'completed'
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: jsonb('metadata'),
});

// Legacy tables for migration (keeping for now)
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// Relations for new dog training schema
export const usersRelations = relations(users, ({ many }) => ({
  dogs: many(dogs),
  trainingSessions: many(trainingSessions),
  trainingProgress: many(trainingProgress),
  userProgress: many(userProgress),
  activityLogs: many(activityLogs),
  // Legacy relations
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const dogsRelations = relations(dogs, ({ one, many }) => ({
  user: one(users, {
    fields: [dogs.userId],
    references: [users.id],
  }),
  trainingSessions: many(trainingSessions),
  trainingProgress: many(trainingProgress),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one }) => ({
  user: one(users, {
    fields: [trainingSessions.userId],
    references: [users.id],
  }),
  dog: one(dogs, {
    fields: [trainingSessions.dogId],
    references: [dogs.id],
  }),
}));

export const trainingProgressRelations = relations(trainingProgress, ({ one }) => ({
  user: one(users, {
    fields: [trainingProgress.userId],
    references: [users.id],
  }),
  dog: one(dogs, {
    fields: [trainingProgress.dogId],
    references: [dogs.id],
  }),
}));

export const trainingContentRelations = relations(trainingContent, ({ many }) => ({
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  content: one(trainingContent, {
    fields: [userProgress.contentId],
    references: [trainingContent.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Legacy relations (keeping for migration)
export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Dog = typeof dogs.$inferSelect;
export type NewDog = typeof dogs.$inferInsert;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type NewTrainingSession = typeof trainingSessions.$inferInsert;
export type TrainingProgress = typeof trainingProgress.$inferSelect;
export type NewTrainingProgress = typeof trainingProgress.$inferInsert;
export type TrainingContent = typeof trainingContent.$inferSelect;
export type NewTrainingContent = typeof trainingContent.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

// Legacy types
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  ADD_DOG = 'ADD_DOG',
  UPDATE_DOG = 'UPDATE_DOG',
  DELETE_DOG = 'DELETE_DOG',
  START_TRAINING_SESSION = 'START_TRAINING_SESSION',
  COMPLETE_TRAINING_SESSION = 'COMPLETE_TRAINING_SESSION',
  UPDATE_PROGRESS = 'UPDATE_PROGRESS',
  COMPLETE_CONTENT = 'COMPLETE_CONTENT',
  PURCHASE_LIFETIME_ACCESS = 'PURCHASE_LIFETIME_ACCESS',
  // Legacy activity types
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
