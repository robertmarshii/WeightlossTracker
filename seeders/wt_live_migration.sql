-- Focused migration to add missing items from compare report
-- This script adds only the specific missing elements identified in the schema comparison

-- Add missing remember token columns to users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'wt_live'
        AND table_name = 'users'
        AND column_name = 'remember_token'
    ) THEN
        ALTER TABLE wt_live.users ADD COLUMN remember_token VARCHAR(255) NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'wt_live'
        AND table_name = 'users'
        AND column_name = 'remember_token_expires'
    ) THEN
        ALTER TABLE wt_live.users ADD COLUMN remember_token_expires TIMESTAMP NULL;
    END IF;
END $$;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_goals_active ON wt_live.goals(is_active);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON wt_live.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON wt_live.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON wt_live.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_entries_date ON wt_live.weight_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id ON wt_live.weight_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_wt_live_users_remember_token ON wt_live.users(remember_token);

-- Add missing foreign key constraint for user_profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'user_profiles_user_id_fkey'
        AND table_schema = 'wt_live'
    ) THEN
        ALTER TABLE wt_live.user_profiles
        ADD CONSTRAINT user_profiles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES wt_live.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure user_settings table exists (in case it's still missing)
CREATE TABLE IF NOT EXISTS wt_live.user_settings (
    user_id INTEGER PRIMARY KEY,
    weight_unit VARCHAR(10) DEFAULT 'kg',
    height_unit VARCHAR(10) DEFAULT 'cm',
    temperature_unit VARCHAR(5) DEFAULT 'c',
    date_format VARCHAR(10) DEFAULT 'uk',
    time_format VARCHAR(5) DEFAULT '24',
    timezone VARCHAR(50) DEFAULT 'Europe/London',
    theme VARCHAR(20) DEFAULT 'glassmorphism',
    language VARCHAR(10) DEFAULT 'en',
    start_of_week VARCHAR(10) DEFAULT 'monday',
    share_data BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT false,
    email_day VARCHAR(10) DEFAULT 'monday',
    email_time VARCHAR(5) DEFAULT '09:00',
    weekly_reports BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for user_settings if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'user_settings_user_id_fkey'
        AND table_schema = 'wt_live'
    ) THEN
        ALTER TABLE wt_live.user_settings
        ADD CONSTRAINT user_settings_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES wt_live.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create default user_settings entries for all existing users who don't have settings yet
INSERT INTO wt_live.user_settings (user_id, weight_unit, height_unit, temperature_unit, date_format, time_format, timezone, theme, language, start_of_week, share_data, email_notifications, email_day, email_time, weekly_reports, updated_at)
SELECT
    u.id,
    'kg',
    'cm',
    'c',
    'uk',
    '24',
    'Europe/London',
    'glassmorphism',
    'en',
    'monday',
    false,
    false,
    'monday',
    '09:00',
    false,
    NOW()
FROM wt_live.users u
WHERE NOT EXISTS (SELECT 1 FROM wt_live.user_settings WHERE user_id = u.id);