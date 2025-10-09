-- WeightLoss Tracker Dev Schema Seeder  
-- Contains basic initialization data for development

-- Create and seed wt_dev schema with basic development data
DROP SCHEMA IF EXISTS wt_dev CASCADE;
CREATE SCHEMA wt_dev;

-- Create users table for wt_dev
CREATE TABLE wt_dev.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    remember_token VARCHAR(64) NULL,
    remember_token_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create auth_codes table for passwordless authentication
CREATE TABLE wt_dev.auth_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    code_type VARCHAR(20) NOT NULL, -- 'login' or 'signup'
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create test_table for wt_dev
CREATE TABLE wt_dev.test_table (
    id SERIAL PRIMARY KEY,
    val VARCHAR(50) NOT NULL
);

-- Create weight_entries table for wt_dev
CREATE TABLE wt_dev.weight_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES wt_dev.users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    entry_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create body_fat_entries table for wt_dev
CREATE TABLE wt_dev.body_fat_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES wt_dev.users(id) ON DELETE CASCADE,
    body_fat_percent DECIMAL(5,2) NOT NULL CHECK (body_fat_percent > 0 AND body_fat_percent <= 60),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_body_fat_per_day UNIQUE (user_id, entry_date)
);

CREATE INDEX idx_body_fat_user_date ON wt_dev.body_fat_entries(user_id, entry_date DESC);

-- Create body_data_entries table for all body metrics (Smart Data, Measurements, Calipers)
CREATE TABLE wt_dev.body_data_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES wt_dev.users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- muscle_mass, fat_percent, water_percent, bone_mass, measurement_neck, measurement_chest, measurement_waist, measurement_hips, measurement_thigh, measurement_calf, measurement_arm, caliper_chest, caliper_abdomen, caliper_thigh, caliper_tricep, caliper_suprailiac
    value DECIMAL(6,2) NOT NULL CHECK (value >= 0),
    unit VARCHAR(10) NOT NULL, -- %, cm, kg, mm, etc.
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_body_metric_per_day UNIQUE (user_id, metric_type, entry_date)
);

CREATE INDEX idx_body_data_user_date ON wt_dev.body_data_entries(user_id, entry_date DESC);
CREATE INDEX idx_body_data_metric_type ON wt_dev.body_data_entries(metric_type);
CREATE INDEX idx_body_data_user_metric ON wt_dev.body_data_entries(user_id, metric_type, entry_date DESC);

-- Create goals table for wt_dev
CREATE TABLE wt_dev.goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES wt_dev.users(id) ON DELETE CASCADE,
    target_weight_kg DECIMAL(5,2) NOT NULL,
    target_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profile table for wt_dev
CREATE TABLE wt_dev.user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES wt_dev.users(id) ON DELETE CASCADE,
    height_cm INTEGER,
    body_frame VARCHAR(10), -- small | medium | large
    age INTEGER,
    activity_level VARCHAR(20), -- e.g., sedentary, light, moderate, very, athlete
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User settings table for wt_dev
CREATE TABLE wt_dev.user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES wt_dev.users(id) ON DELETE CASCADE,
    weight_unit VARCHAR(10) DEFAULT 'kg', -- kg, lbs, st
    height_unit VARCHAR(10) DEFAULT 'cm', -- cm, ft, m
    temperature_unit VARCHAR(5) DEFAULT 'c', -- c, f
    date_format VARCHAR(10) DEFAULT 'uk', -- uk, us, iso, euro
    time_format VARCHAR(5) DEFAULT '24', -- 24, 12
    timezone VARCHAR(50) DEFAULT 'Europe/London',
    theme VARCHAR(20) DEFAULT 'glassmorphism',
    language VARCHAR(10) DEFAULT 'en',
    start_of_week VARCHAR(10) DEFAULT 'monday', -- monday, sunday
    share_data BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT false,
    email_day VARCHAR(10) DEFAULT 'monday', -- monday, tuesday, etc.
    email_time VARCHAR(5) DEFAULT '09:00', -- HH:MM format
    weekly_reports BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed basic development data for wt_dev (minimal, clean data for development)
INSERT INTO wt_dev.users (email, first_name, last_name, is_verified) VALUES
    ('robertmarshgb@gmail.com', 'Robert', 'Marsh', true),
    ('dev@company.com', 'Dev', 'User', true),
    ('test@dev.com', 'Test', 'Account', true),
    ('admin@dev.com', 'Admin', 'Account', true);

INSERT INTO wt_dev.test_table (val) VALUES
    ('dev1'),
    ('dev2'),
    ('dev3');

-- User profiles with detailed information
INSERT INTO wt_dev.user_profiles (user_id, height_cm, body_frame, age, activity_level) VALUES
    (1, 178, 'large', 40, 'light');

-- Weight entries for Robert Marsh - exact actual weight history data
INSERT INTO wt_dev.weight_entries (user_id, weight_kg, entry_date, notes) VALUES
    (1, 128.0, '2025-06-13', 'Weight entry'),
    (1, 126.5, '2025-06-20', 'Weight entry'),
    (1, 125.5, '2025-06-27', 'Weight entry'),
    (1, 125.2, '2025-07-04', 'Weight entry'),
    (1, 123.6, '2025-07-11', 'Weight entry'),
    (1, 122.4, '2025-07-18', 'Weight entry'),
    (1, 122.2, '2025-07-25', 'Weight entry'),
    (1, 121.7, '2025-08-01', 'Weight entry'),
    (1, 121.3, '2025-08-08', 'Weight entry'),
    (1, 120.2, '2025-08-15', 'Weight entry'),
    (1, 119.4, '2025-08-22', 'Weight entry'),
    (1, 119.2, '2025-08-29', 'Weight entry'),
    (1, 119.0, '2025-09-05', 'Weight entry'),
    (1, 118.7, '2025-09-12', 'Weight entry'),
    (1, 117.9, '2025-09-19', 'Weight entry'),
    -- Other users
    (2, 80.0, '2024-01-01', 'Test user baseline'),
    (2, 79.5, '2024-01-08', 'Test progress');

-- Goals for development (including current active goal)
INSERT INTO wt_dev.goals (user_id, target_weight_kg, target_date, is_active) VALUES
    (1, 70.0, '2024-06-01', false),
    (1, 115.0, '2025-10-15', false),
    (1, 115.0, '2025-10-15', true),
    (2, 75.0, '2024-05-01', true);

-- Body data entries for development testing
INSERT INTO wt_dev.body_data_entries (user_id, metric_type, value, unit, entry_date) VALUES
    -- Smart Data entries for user 1 - Week 1
    (1, 'muscle_mass', 42.5, '%', '2025-10-01'),
    (1, 'fat_percent', 28.3, '%', '2025-10-01'),
    (1, 'water_percent', 54.2, '%', '2025-10-01'),
    (1, 'bone_mass', 3.2, 'kg', '2025-10-01'),
    -- Measurements for user 1 - Week 1
    (1, 'measurement_neck', 40.5, 'cm', '2025-10-01'),
    (1, 'measurement_chest', 110.0, 'cm', '2025-10-01'),
    (1, 'measurement_waist', 98.5, 'cm', '2025-10-01'),
    (1, 'measurement_hips', 105.0, 'cm', '2025-10-01'),
    (1, 'measurement_thigh', 62.0, 'cm', '2025-10-01'),
    (1, 'measurement_calf', 40.0, 'cm', '2025-10-01'),
    (1, 'measurement_arm', 35.5, 'cm', '2025-10-01'),
    -- Calipers for user 1 - Week 1
    (1, 'caliper_chest', 18.5, 'mm', '2025-10-01'),
    (1, 'caliper_abdomen', 22.0, 'mm', '2025-10-01'),
    (1, 'caliper_thigh', 20.5, 'mm', '2025-10-01'),
    (1, 'caliper_tricep', 15.0, 'mm', '2025-10-01'),
    (1, 'caliper_suprailiac', 19.5, 'mm', '2025-10-01'),

    -- Smart Data entries for user 1 - Week 2 (showing progress)
    (1, 'muscle_mass', 42.8, '%', '2025-10-05'),
    (1, 'fat_percent', 27.9, '%', '2025-10-05'),
    (1, 'water_percent', 54.5, '%', '2025-10-05'),
    (1, 'bone_mass', 3.3, 'kg', '2025-10-05'),
    -- Measurements for user 1 - Week 2 (showing progress)
    (1, 'measurement_neck', 40.0, 'cm', '2025-10-05'),
    (1, 'measurement_chest', 109.5, 'cm', '2025-10-05'),
    (1, 'measurement_waist', 98.0, 'cm', '2025-10-05'),
    (1, 'measurement_hips', 104.5, 'cm', '2025-10-05'),
    (1, 'measurement_thigh', 61.5, 'cm', '2025-10-05'),
    (1, 'measurement_calf', 39.8, 'cm', '2025-10-05'),
    (1, 'measurement_arm', 35.3, 'cm', '2025-10-05'),
    -- Calipers for user 1 - Week 2 (showing progress)
    (1, 'caliper_chest', 18.0, 'mm', '2025-10-05'),
    (1, 'caliper_abdomen', 21.5, 'mm', '2025-10-05'),
    (1, 'caliper_thigh', 20.0, 'mm', '2025-10-05'),
    (1, 'caliper_tricep', 14.5, 'mm', '2025-10-05'),
    (1, 'caliper_suprailiac', 19.0, 'mm', '2025-10-05');

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON SCHEMA wt_dev TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA wt_dev TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA wt_dev TO your_app_user;
