<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();

echo "Current schema: {$schema}\n\n";

// Determine which seeder to run based on schema
$seederFile = null;
if ($schema === 'wt_dev') {
    $seederFile = '/var/app/seeders/wt_dev_seeder.sql';
} elseif ($schema === 'wt_test') {
    $seederFile = '/var/app/seeders/wt_test_seeder.sql';
} elseif ($schema === 'wt_live') {
    $seederFile = '/var/app/seeders/wt_live_migration.sql';
} else {
    echo "Unknown schema: {$schema}\n";
    exit(1);
}

echo "Running seeder: {$seederFile}\n\n";

$sql = file_get_contents($seederFile);

try {
    $db->exec($sql);
    echo "✅ Seeder completed successfully!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
