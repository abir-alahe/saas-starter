-- Add missing columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_lifetime_access" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "purchase_date" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp;

-- Add unique constraints
ALTER TABLE "users" ADD CONSTRAINT IF NOT EXISTS "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id");
ALTER TABLE "users" ADD CONSTRAINT IF NOT EXISTS "users_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id"); 