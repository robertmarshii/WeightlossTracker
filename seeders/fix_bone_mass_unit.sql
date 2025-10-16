-- Fix bone_mass unit from 'kg' to '%'
-- This migration updates any existing bone_mass entries that have 'kg' as the unit

-- Update wt_dev schema
UPDATE wt_dev.body_data_entries
SET unit = '%'
WHERE metric_type = 'bone_mass' AND unit = 'kg';

-- Update wt_test schema
UPDATE wt_test.body_data_entries
SET unit = '%'
WHERE metric_type = 'bone_mass' AND unit = 'kg';

-- Verify the changes
SELECT COUNT(*) as bone_mass_kg_entries_remaining
FROM wt_dev.body_data_entries
WHERE metric_type = 'bone_mass' AND unit = 'kg';

SELECT COUNT(*) as bone_mass_percent_entries
FROM wt_dev.body_data_entries
WHERE metric_type = 'bone_mass' AND unit = '%';
