-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
    -- Add has_lifetime_access column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'has_lifetime_access') THEN
        ALTER TABLE "users" ADD COLUMN "has_lifetime_access" boolean DEFAULT false NOT NULL;
    END IF;
    
    -- Add stripe_customer_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;
    END IF;
    
    -- Add stripe_payment_intent_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_payment_intent_id') THEN
        ALTER TABLE "users" ADD COLUMN "stripe_payment_intent_id" text;
    END IF;
    
    -- Add purchase_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'purchase_date') THEN
        ALTER TABLE "users" ADD COLUMN "purchase_date" timestamp;
    END IF;
    
    -- Add last_login_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;
    END IF;
END $$;

-- Add unique constraints if they don't exist
DO $$ 
BEGIN
    -- Add stripe_customer_id unique constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'users_stripe_customer_id_unique') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id");
    END IF;
    
    -- Add stripe_payment_intent_id unique constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'users_stripe_payment_intent_id_unique') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id");
    END IF;
END $$; 