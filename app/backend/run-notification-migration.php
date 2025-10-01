<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();
if ($schema) {
    $db->exec("SET search_path TO $schema");
}

echo "Running notification_log table migration...\n";

$sql = file_get_contents('/var/app/seeders/notifications.sql');

try {
    $db->exec($sql);
    echo "✅ Migration completed successfully!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
