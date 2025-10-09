<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getDbConnection();
$schema = Database::getSchema();

echo "Current schema: {$schema}\n\n";
echo "Running body_data_entries table migration...\n\n";

$sql = file_get_contents('/var/app/seeders/add_body_data_entries.sql');

try {
    $db->exec($sql);
    echo "✅ Body data entries table migration completed successfully!\n";
    echo "✅ body_data_entries table created with indexes\n";
    echo "✅ Sample data inserted for testing\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
