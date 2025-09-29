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

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON SCHEMA wt_dev TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA wt_dev TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA wt_dev TO your_app_user;
