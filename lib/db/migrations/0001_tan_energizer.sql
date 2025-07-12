-- First, create new tables with the correct schema
CREATE TABLE "dogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"breed" varchar(100),
	"age" integer,
	"weight" integer,
	"temperament" varchar(50),
	"training_level" varchar(50) DEFAULT 'beginner',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"content_type" varchar(50) NOT NULL,
	"difficulty" varchar(20) NOT NULL,
	"category" varchar(50) NOT NULL,
	"video_url" text,
	"article_content" text,
	"exercise_steps" jsonb,
	"estimated_duration" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"dog_id" integer NOT NULL,
	"skill_name" varchar(100) NOT NULL,
	"skill_type" varchar(50) NOT NULL,
	"proficiency" integer DEFAULT 0 NOT NULL,
	"last_practiced" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"dog_id" integer NOT NULL,
	"session_type" varchar(50) NOT NULL,
	"duration" integer,
	"notes" text,
	"completed" boolean DEFAULT false NOT NULL,
	"session_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"content_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'not_started' NOT NULL,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Create a temporary table for users with UUID
CREATE TABLE "users_new" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100),
	"email" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"has_lifetime_access" boolean DEFAULT false NOT NULL,
	"stripe_customer_id" text,
	"stripe_payment_intent_id" text,
	"purchase_date" timestamp,
	"last_login_at" timestamp,
	CONSTRAINT "users_new_email_unique" UNIQUE("email"),
	CONSTRAINT "users_new_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "users_new_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
-- Create a temporary table for activity_logs with UUID user_id
CREATE TABLE "activity_logs_new" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"metadata" jsonb
);
--> statement-breakpoint
-- Create a temporary table for team_members with UUID user_id
CREATE TABLE "team_members_new" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" integer NOT NULL,
	"role" varchar(50) NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Create a temporary table for invitations with UUID invited_by
CREATE TABLE "invitations_new" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"invited_by" uuid NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
-- Add foreign key constraints for new tables
ALTER TABLE "dogs" ADD CONSTRAINT "dogs_user_id_users_new_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_new"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_progress" ADD CONSTRAINT "training_progress_user_id_users_new_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_new"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_progress" ADD CONSTRAINT "training_progress_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_user_id_users_new_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_new"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_new_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_new"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_content_id_training_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."training_content"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "activity_logs_new" ADD CONSTRAINT "activity_logs_new_user_id_users_new_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_new"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "team_members_new" ADD CONSTRAINT "team_members_new_user_id_users_new_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_new"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "team_members_new" ADD CONSTRAINT "team_members_new_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "invitations_new" ADD CONSTRAINT "invitations_new_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "invitations_new" ADD CONSTRAINT "invitations_new_invited_by_users_new_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users_new"("id") ON DELETE no action ON UPDATE no action;