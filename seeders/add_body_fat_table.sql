-- Body fat entries table for tracking body fat percentage over time

CREATE TABLE IF NOT EXISTS body_fat_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body_fat_percent DECIMAL(5,2) NOT NULL CHECK (body_fat_percent > 0 AND body_fat_percent <= 60),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one entry per user per day
    CONSTRAINT unique_body_fat_per_day UNIQUE (user_id, entry_date)
);

-- Index for efficient querying by user and date
CREATE INDEX IF NOT EXISTS idx_body_fat_user_date ON body_fat_entries(user_id, entry_date DESC);

-- Comments on table and columns
COMMENT ON TABLE body_fat_entries IS 'Tracks body fat percentage measurements over time';
COMMENT ON COLUMN body_fat_entries.body_fat_percent IS 'Body fat percentage (1-60%)';
COMMENT ON COLUMN body_fat_entries.entry_date IS 'Date of measurement (one entry per user per day)';
