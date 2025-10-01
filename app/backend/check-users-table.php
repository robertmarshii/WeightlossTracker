<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();
if ($schema) {
    $db->exec("SET search_path TO $schema");
}

echo "Checking for users table...\n\n";

try {
    $stmt = $db->query("SELECT table_name FROM information_schema.tables WHERE table_schema = '$schema' AND table_name LIKE '%user%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "Tables with 'user' in name:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }

    echo "\n\nChecking user_settings columns:\n";
    $stmt = $db->query("SELECT column_name FROM information_schema.columns WHERE table_schema = '$schema' AND table_name = 'user_settings'");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($columns as $column) {
        echo "  - $column\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
