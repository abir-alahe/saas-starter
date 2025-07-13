-- Drop the old users table and rename users_new to users
DO $$ 
BEGIN
    -- Drop the old users table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP TABLE "users" CASCADE;
    END IF;
    
    -- Rename users_new to users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_new') THEN
        ALTER TABLE "users_new" RENAME TO "users";
    END IF;
END $$; 