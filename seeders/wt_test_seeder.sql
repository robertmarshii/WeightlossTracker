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

-- Create goals table for wt_test
CREATE TABLE wt_test.goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES wt_test.users(id) ON DELETE CASCADE,
    target_weight_kg DECIMAL(5,2) NOT NULL,
    target_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed comprehensive test data for wt_test
INSERT INTO wt_test.users (email, first_name, last_name, is_verified) VALUES
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
    
    -- User 2 - Bob's maintenance phase
    (2, 75.5, '2024-01-01', 'Maintenance phase start'),
    (2, 75.8, '2024-01-08', 'Holiday weight still showing'),
    (2, 75.2, '2024-01-15', 'Getting back to normal'),
    (2, 75.0, '2024-01-22', 'Stable weight'),
    (2, 74.8, '2024-01-29', 'Good consistency'),
    (2, 75.1, '2024-02-05', 'Weekend indulgence'),
    (2, 74.9, '2024-02-12', 'Back to baseline'),
    (2, 75.0, '2024-02-19', 'Steady as she goes'),
    (2, 74.7, '2024-02-26', 'Slight loss'),
    
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

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON SCHEMA wt_test TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA wt_test TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA wt_test TO your_app_user;