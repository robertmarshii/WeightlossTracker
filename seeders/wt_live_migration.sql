-- WeightLoss Tracker Live Schema Migration
-- NON-DESTRUCTIVE: Only adds/modifies structure, never destroys existing data
-- Safe to run on production - will not drop schemas, tables, or data

-- Create wt_live schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS wt_live;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS wt_live.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create auth_codes table for passwordless authentication if it doesn't exist
CREATE TABLE IF NOT EXISTS wt_live.auth_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    code_type VARCHAR(20) NOT NULL, -- 'login' or 'signup'
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create test_table if it doesn't exist
CREATE TABLE IF NOT EXISTS wt_live.test_table (
    id SERIAL PRIMARY KEY,
    val VARCHAR(50) NOT NULL
);

-- Create weight_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS wt_live.weight_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    weight_kg DECIMAL(5,2) NOT NULL,
    entry_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create goals table if it doesn't exist
CREATE TABLE IF NOT EXISTS wt_live.goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    target_weight_kg DECIMAL(5,2) NOT NULL,
    target_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints if they don't exist (safe way)
-- Note: This uses a more complex pattern because PostgreSQL doesn't have 
-- "ADD CONSTRAINT IF NOT EXISTS" until version 9.6+

DO $$ 
BEGIN
    -- Add foreign key for weight_entries.user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'weight_entries_user_id_fkey' 
        AND table_schema = 'wt_live'
    ) THEN
        ALTER TABLE wt_live.weight_entries 
        ADD CONSTRAINT weight_entries_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES wt_live.users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for goals.user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'goals_user_id_fkey' 
        AND table_schema = 'wt_live'
    ) THEN
        ALTER TABLE wt_live.goals 
        ADD CONSTRAINT goals_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES wt_live.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes if they don't exist (for performance)
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id ON wt_live.weight_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_entries_date ON wt_live.weight_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON wt_live.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_active ON wt_live.goals(is_active);

-- Example of how to safely add new columns (uncomment when needed):
-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM information_schema.columns 
--         WHERE table_schema = 'wt_live' 
--         AND table_name = 'users' 
--         AND column_name = 'timezone'
--     ) THEN
--         ALTER TABLE wt_live.users ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
--     END IF;
-- END $$;

-- Add minimal seed data ONLY if tables are empty (safe for production)
INSERT INTO wt_live.test_table (val) 
SELECT 'live1' WHERE NOT EXISTS (SELECT 1 FROM wt_live.test_table WHERE val = 'live1');

INSERT INTO wt_live.test_table (val) 
SELECT 'live2' WHERE NOT EXISTS (SELECT 1 FROM wt_live.test_table WHERE val = 'live2');

INSERT INTO wt_live.test_table (val) 
SELECT 'live3' WHERE NOT EXISTS (SELECT 1 FROM wt_live.test_table WHERE val = 'live3');

-- Add Robert Marsh user safely (only if doesn't exist)
INSERT INTO wt_live.users (email, first_name, last_name, is_verified) 
SELECT 'robertmarshgb@gmail.com', 'Robert', 'Marsh', true 
WHERE NOT EXISTS (SELECT 1 FROM wt_live.users WHERE email = 'robertmarshgb@gmail.com');

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON SCHEMA wt_live TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA wt_live TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA wt_live TO your_app_user;