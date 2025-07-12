-- Data migration: Copy data from old tables to new tables
-- Note: This migration assumes you want to start fresh with Supabase auth
-- If you have existing data you want to preserve, you'll need to map the old user IDs to new UUIDs

-- For now, we'll drop the old tables and rename the new ones
-- This is the safest approach when switching to Supabase auth

-- Drop old tables (this will also drop their constraints)
DROP TABLE IF EXISTS "activity_logs" CASCADE;
DROP TABLE IF EXISTS "invitations" CASCADE;
DROP TABLE IF EXISTS "team_members" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Rename new tables to replace the old ones
ALTER TABLE "users_new" RENAME TO "users";
ALTER TABLE "activity_logs_new" RENAME TO "activity_logs";
ALTER TABLE "team_members_new" RENAME TO "team_members";
ALTER TABLE "invitations_new" RENAME TO "invitations";

-- Update the foreign key constraint names to match the new table names
ALTER TABLE "dogs" DROP CONSTRAINT "dogs_user_id_users_new_id_fk";
ALTER TABLE "dogs" ADD CONSTRAINT "dogs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "training_progress" DROP CONSTRAINT "training_progress_user_id_users_new_id_fk";
ALTER TABLE "training_progress" ADD CONSTRAINT "training_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "training_sessions" DROP CONSTRAINT "training_sessions_user_id_users_new_id_fk";
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_user_id_users_new_id_fk";
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_new_user_id_users_new_id_fk";
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "team_members" DROP CONSTRAINT "team_members_new_user_id_users_new_id_fk";
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "team_members" DROP CONSTRAINT "team_members_new_team_id_teams_id_fk";
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "invitations" DROP CONSTRAINT "invitations_new_team_id_teams_id_fk";
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "invitations" DROP CONSTRAINT "invitations_new_invited_by_users_new_id_fk";
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; 