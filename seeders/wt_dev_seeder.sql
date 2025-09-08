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

-- Basic weight entries for development testing
INSERT INTO wt_dev.weight_entries (user_id, weight_kg, entry_date, notes) VALUES
    (1, 75.0, '2024-01-01', 'Development baseline'),
    (1, 74.5, '2024-01-08', 'Week 1 progress'),
    (1, 74.0, '2024-01-15', 'Steady progress'),
    (2, 80.0, '2024-01-01', 'Test user baseline'),
    (2, 79.5, '2024-01-08', 'Test progress');

-- Basic goals for development
INSERT INTO wt_dev.goals (user_id, target_weight_kg, target_date) VALUES
    (1, 70.0, '2024-06-01'),
    (2, 75.0, '2024-05-01');

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON SCHEMA wt_dev TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA wt_dev TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA wt_dev TO your_app_user;