-- WeightLoss Tracker Test Schema Seeder
-- Contains comprehensive test data for thorough testing

-- Create and seed wt_test schema with extensive test data
DROP SCHEMA IF EXISTS wt_test CASCADE;
CREATE SCHEMA wt_test;

-- Create users table for wt_test
CREATE TABLE wt_test.users (
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
CREATE TABLE wt_test.auth_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    code_type VARCHAR(20) NOT NULL, -- 'login' or 'signup'
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create test_table for wt_test
CREATE TABLE wt_test.test_table (
    id SERIAL PRIMARY KEY,
    val VARCHAR(50) NOT NULL
);

-- Create weight_entries table for wt_test
CREATE TABLE wt_test.weight_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES wt_test.users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    entry_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create body_fat_entries table for wt_test
CREATE TABLE wt_test.body_fat_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES wt_test.users(id) ON DELETE CASCADE,
    body_fat_percent DECIMAL(5,2) NOT NULL CHECK (body_fat_percent > 0 AND body_fat_percent <= 60),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_body_fat_per_day UNIQUE (user_id, entry_date)
);

CREATE INDEX idx_body_fat_user_date ON wt_test.body_fat_entries(user_id, entry_date DESC);

-- Create goals table for wt_test
CREATE TABLE wt_test.goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES wt_test.users(id) ON DELETE CASCADE,
    target_weight_kg DECIMAL(5,2) NOT NULL,
    target_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profile table for wt_test
CREATE TABLE wt_test.user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES wt_test.users(id) ON DELETE CASCADE,
    height_cm INTEGER,
    body_frame VARCHAR(10), -- small | medium | large
    age INTEGER,
    activity_level VARCHAR(20), -- e.g., sedentary, light, moderate, very, athlete
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User settings table for wt_test
CREATE TABLE wt_test.user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES wt_test.users(id) ON DELETE CASCADE,
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

-- Seed comprehensive test data for wt_test
INSERT INTO wt_test.users (email, first_name, last_name, is_verified) VALUES
    ('test@dev.com', 'Test', 'User', true),
    ('robertmarshgb@gmail.com', 'Robert', 'Marsh', true),
    ('test1@example.com', 'Alice', 'Johnson', true),
    ('test2@example.com', 'Bob', 'Smith', true),
    ('test3@example.com', 'Carol', 'Williams', true),
    ('test4@example.com', 'David', 'Brown', true),
    ('test5@example.com', 'Emma', 'Davis', true),
    ('test6@example.com', 'Frank', 'Miller', true),
    ('test7@example.com', 'Grace', 'Wilson', true),
    ('test8@example.com', 'Henry', 'Moore', true),
    ('test9@example.com', 'Ivy', 'Taylor', true),
    ('test10@example.com', 'Jack', 'Anderson', true),
    ('admin@test.com', 'Admin', 'Test', true),
    ('manager@test.com', 'Manager', 'Test', true);

INSERT INTO wt_test.test_table (val) VALUES
    ('test1'),
    ('test2'),
    ('test3');

-- Extensive weight entries for testing (multiple entries per user over several months)
INSERT INTO wt_test.weight_entries (user_id, weight_kg, entry_date, notes) VALUES
    -- User 1 - Alice's weight loss journey
    (1, 85.0, '2024-01-01', 'Starting weight - New Year resolution'),
    (1, 84.5, '2024-01-08', 'Week 1 - Good start'),
    (1, 84.2, '2024-01-15', 'Week 2 - Slow progress'),
    (1, 83.8, '2024-01-22', 'Week 3 - Getting momentum'),
    (1, 83.1, '2024-01-29', 'Week 4 - Month 1 complete'),
    (1, 82.9, '2024-02-05', 'February start'),
    (1, 82.3, '2024-02-12', 'Valentine week stress eating'),
    (1, 82.0, '2024-02-19', 'Back on track'),
    (1, 81.5, '2024-02-26', 'February end'),
    (1, 81.2, '2024-03-05', 'March momentum'),
    (1, 80.8, '2024-03-12', 'Spring motivation'),
    (1, 80.3, '2024-03-19', 'Quarter way there'),
    (1, 79.9, '2024-03-26', 'March end'),
    
    -- User 2 - Robert Marsh's exact actual weight history
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
    
    -- User 3 - Carol's aggressive cut
    (3, 92.0, '2024-01-01', 'Starting aggressive weight loss'),
    (3, 91.2, '2024-01-08', 'First week strong'),
    (3, 90.5, '2024-01-15', 'Aggressive deficit working'),
    (3, 89.8, '2024-01-22', 'Energy getting low'),
    (3, 89.0, '2024-01-29', 'Month 1 - 3kg down'),
    (3, 88.5, '2024-02-05', 'Continuing strong'),
    (3, 87.8, '2024-02-12', 'Halfway to goal'),
    (3, 87.2, '2024-02-19', 'Plateau starting'),
    (3, 87.0, '2024-02-26', 'Need to adjust approach'),
    
    -- User 4 - David's bulk phase
    (4, 68.0, '2024-01-01', 'Starting lean bulk'),
    (4, 68.3, '2024-01-08', 'Gaining slowly'),
    (4, 68.7, '2024-01-15', 'Muscle building phase'),
    (4, 69.0, '2024-01-22', 'Good progress'),
    (4, 69.4, '2024-01-29', 'Strength increasing'),
    (4, 69.8, '2024-02-05', 'Continuing bulk'),
    (4, 70.1, '2024-02-12', 'Right on track'),
    (4, 70.5, '2024-02-19', 'Feeling strong'),
    (4, 70.8, '2024-02-26', 'Good muscle gain'),
    
    -- User 5 - Emma's inconsistent logging
    (5, 77.5, '2024-01-01', 'New year new me'),
    (5, 76.8, '2024-01-15', 'Missed a few weigh-ins'),
    (5, 77.2, '2024-02-01', 'Back to logging'),
    (5, 76.5, '2024-02-20', 'Sporadic tracking'),
    (5, 76.0, '2024-03-10', 'Getting more consistent'),
    
    -- More test data for other users
    (6, 82.0, '2024-01-01', 'Frank starting journey'),
    (6, 81.5, '2024-01-08', 'Week 1 complete'),
    (6, 81.0, '2024-01-15', 'Steady progress'),
    
    (7, 65.5, '2024-01-01', 'Grace maintenance'),
    (7, 65.8, '2024-01-08', 'Slight increase'),
    (7, 65.3, '2024-01-15', 'Back to normal'),
    
    (8, 95.0, '2024-01-01', 'Henry big cut start'),
    (8, 94.2, '2024-01-08', 'First week success'),
    (8, 93.5, '2024-01-15', 'Momentum building'),
    (8, 92.8, '2024-01-22', 'Feeling great'),
    
    (9, 58.0, '2024-01-01', 'Ivy reverse diet'),
    (9, 58.2, '2024-01-08', 'Slowly increasing'),
    (9, 58.5, '2024-01-15', 'Building up metabolism'),
    
    (10, 105.0, '2024-01-01', 'Jack transformation start'),
    (10, 104.0, '2024-01-08', 'Strong first week'),
    (10, 103.2, '2024-01-15', 'Lifestyle change'),
    (10, 102.5, '2024-01-22', 'Building habits');

-- Diverse goals for testing
INSERT INTO wt_test.goals (user_id, target_weight_kg, target_date, is_active) VALUES
    (1, 75.0, '2024-06-01', true),
    (2, 74.0, '2024-12-31', true),
    (3, 80.0, '2024-04-01', true),
    (4, 75.0, '2024-06-01', true), -- Bulk to 75kg
    (5, 70.0, '2024-08-01', true),
    (6, 78.0, '2024-05-01', true),
    (7, 65.0, '2024-12-31', false), -- Already at goal
    (8, 85.0, '2024-07-01', true),
    (9, 62.0, '2024-04-01', true), -- Reverse diet goal
    (10, 90.0, '2024-10-01', true),
    -- Some inactive/completed goals
    (1, 80.0, '2024-03-01', false), -- Previous goal
    (3, 85.0, '2024-02-01', false), -- Intermediate goal
    (8, 100.0, '2024-02-01', false); -- First milestone

-- User profiles for comprehensive testing
INSERT INTO wt_test.user_profiles (user_id, height_cm, body_frame, age, activity_level) VALUES
    (1, 170, 'medium', 28, 'moderate'),     -- test@dev.com - Primary test user
    (2, 183, 'large', 35, 'active'),        -- robertmarshgb@gmail.com
    (3, 165, 'small', 24, 'very'),          -- Carol - aggressive cut user
    (4, 178, 'medium', 22, 'very'),         -- David - bulk phase user
    (5, 162, 'medium', 30, 'light'),        -- Emma - inconsistent logger
    (6, 175, 'large', 40, 'moderate'),      -- Frank
    (7, 158, 'small', 26, 'active'),        -- Grace - maintenance user
    (8, 180, 'large', 32, 'light'),         -- Henry - big cut user
    (9, 155, 'small', 20, 'sedentary'),     -- Ivy - reverse diet user
    (10, 185, 'large', 45, 'moderate'),     -- Jack - transformation user
    (11, 175, 'medium', 35, 'moderate'),    -- admin@test.com
    (12, 170, 'medium', 30, 'active');      -- manager@test.com

-- User settings for comprehensive testing
INSERT INTO wt_test.user_settings (user_id, weight_unit, height_unit, date_format, theme) VALUES
    (1, 'kg', 'cm', 'uk', 'glassmorphism'),      -- test@dev.com - Default UK settings
    (2, 'kg', 'cm', 'uk', 'glassmorphism'),      -- robertmarshgb@gmail.com
    (3, 'kg', 'cm', 'iso', 'dark'),              -- Carol - ISO date format
    (4, 'lbs', 'ft', 'us', 'light'),             -- David - US format
    (5, 'kg', 'cm', 'euro', 'glassmorphism'),    -- Emma - European format
    (6, 'st', 'ft', 'uk', 'glassmorphism'),      -- Frank - UK stones
    (7, 'kg', 'cm', 'uk', 'glassmorphism'),      -- Grace - Default
    (8, 'kg', 'cm', 'uk', 'glassmorphism'),      -- Henry - Default
    (9, 'kg', 'cm', 'uk', 'glassmorphism'),      -- Ivy - Default
    (10, 'kg', 'cm', 'uk', 'glassmorphism'),     -- Jack - Default
    (11, 'kg', 'cm', 'uk', 'glassmorphism'),     -- admin@test.com
    (12, 'kg', 'cm', 'uk', 'glassmorphism');     -- manager@test.com

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON SCHEMA wt_test TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA wt_test TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA wt_test TO your_app_user;
