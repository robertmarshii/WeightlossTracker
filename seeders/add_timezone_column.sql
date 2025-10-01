-- Add timezone column to user_settings table
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Europe/London';

-- Create index for timezone lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_timezone ON user_settings(timezone);

-- Update existing users to Europe/London as default
UPDATE user_settings SET timezone = 'Europe/London' WHERE timezone IS NULL;

COMMENT ON COLUMN user_settings.timezone IS 'User timezone (e.g., Europe/London, America/New_York) - used for notification scheduling';
