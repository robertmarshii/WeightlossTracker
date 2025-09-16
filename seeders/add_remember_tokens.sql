-- Add remember token columns to users table for persistent login
-- This will be applied to all schemas (wt_dev, wt_live, wt_test)

-- Add remember token columns to wt_dev schema
ALTER TABLE wt_dev.users
ADD COLUMN remember_token VARCHAR(64) NULL,
ADD COLUMN remember_token_expires TIMESTAMP NULL;

-- Add remember token columns to wt_live schema (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'wt_live') THEN
        ALTER TABLE wt_live.users
        ADD COLUMN IF NOT EXISTS remember_token VARCHAR(64) NULL,
        ADD COLUMN IF NOT EXISTS remember_token_expires TIMESTAMP NULL;
    END IF;
END $$;

-- Add remember token columns to wt_test schema (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'wt_test') THEN
        ALTER TABLE wt_test.users
        ADD COLUMN IF NOT EXISTS remember_token VARCHAR(64) NULL,
        ADD COLUMN IF NOT EXISTS remember_token_expires TIMESTAMP NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wt_dev_users_remember_token ON wt_dev.users(remember_token);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'wt_live') THEN
        CREATE INDEX IF NOT EXISTS idx_wt_live_users_remember_token ON wt_live.users(remember_token);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'wt_test') THEN
        CREATE INDEX IF NOT EXISTS idx_wt_test_users_remember_token ON wt_test.users(remember_token);
    END IF;
END $$;