<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getDbConnection();
$schema = Database::getSchema();

echo "Current schema: {$schema}\n\n";
echo "Running body_fat_entries table migration...\n\n";

$sql = file_get_contents('/var/app/seeders/add_body_fat_table.sql');

try {
    $db->exec($sql);
    echo "✅ Body fat table migration completed successfully!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
