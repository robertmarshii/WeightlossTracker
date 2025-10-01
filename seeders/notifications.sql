-- Notification log table to track sent notifications and prevent duplicates

CREATE TABLE IF NOT EXISTS notification_log (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'weekly_reminder', 'goal_reminder', etc.
    sent_date DATE NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Create index for fast lookups
    CONSTRAINT unique_notification_per_day UNIQUE (user_id, notification_type, sent_date)
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_notification_log_user_date ON notification_log(user_id, sent_date);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(notification_type);

-- Comment on table
COMMENT ON TABLE notification_log IS 'Tracks sent email notifications to prevent duplicate sends';
COMMENT ON COLUMN notification_log.notification_type IS 'Type of notification: weekly_reminder, goal_reminder, etc.';
COMMENT ON COLUMN notification_log.sent_date IS 'Date when notification was sent (used to prevent duplicates)';
