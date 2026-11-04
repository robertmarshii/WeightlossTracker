-- Rate-limit / brute-force state for login codes (replaces app/backend/rate_limits.json).
-- The app also creates this table on first use (Security::throttleTable); run this by hand
-- if the database user is not allowed to create tables. Repeat for each schema in use.
CREATE TABLE IF NOT EXISTS wt_live.security_throttle (
    id BIGSERIAL PRIMARY KEY,
    bucket VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS security_throttle_bucket_idx ON wt_live.security_throttle (bucket, created_at);
