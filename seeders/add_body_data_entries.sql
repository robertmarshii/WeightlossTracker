-- Add body_data_entries table for all body metrics
-- This table handles Smart Data, Measurements, and Calipers entries

-- Create body_data_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS wt_dev.body_data_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES wt_dev.users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- muscle_mass, fat_percent, water_percent, bone_mass, measurement_neck, measurement_chest, measurement_waist, measurement_hips, measurement_thigh, measurement_calf, measurement_arm, caliper_chest, caliper_abdomen, caliper_thigh, caliper_tricep, caliper_suprailiac
    value DECIMAL(6,2) NOT NULL CHECK (value >= 0), -- The actual measurement value
    unit VARCHAR(10) NOT NULL, -- %, cm, kg, mm, etc.
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_body_metric_per_day UNIQUE (user_id, metric_type, entry_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_body_data_user_date ON wt_dev.body_data_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_data_metric_type ON wt_dev.body_data_entries(metric_type);
CREATE INDEX IF NOT EXISTS idx_body_data_user_metric ON wt_dev.body_data_entries(user_id, metric_type, entry_date DESC);

-- Add some sample data for testing (optional)
INSERT INTO wt_dev.body_data_entries (user_id, metric_type, value, unit, entry_date) VALUES
    (1, 'muscle_mass', 42.5, '%', '2025-10-01'),
    (1, 'fat_percent', 28.3, '%', '2025-10-01'),
    (1, 'water_percent', 54.2, '%', '2025-10-01'),
    (1, 'bone_mass', 3.2, '%', '2025-10-01'),
    (1, 'measurement_neck', 40.5, 'cm', '2025-10-01'),
    (1, 'measurement_chest', 110.0, 'cm', '2025-10-01'),
    (1, 'measurement_waist', 98.5, 'cm', '2025-10-01'),
    (1, 'caliper_chest', 18.5, 'mm', '2025-10-01')
ON CONFLICT (user_id, metric_type, entry_date) DO NOTHING;
