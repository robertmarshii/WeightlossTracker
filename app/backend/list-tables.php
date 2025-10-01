<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();
if ($schema) {
    $db->exec("SET search_path TO $schema");
}

echo "Tables in schema $schema:\n";
$stmt = $db->query("SELECT table_name FROM information_schema.tables WHERE table_schema = '$schema' ORDER BY table_name");
foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $table) {
    echo "  - $table\n";
}
