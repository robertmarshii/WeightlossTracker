<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();
if ($schema) {
    $db->exec("SET search_path TO $schema");
}

echo "Checking users table columns:\n";
$stmt = $db->query("SELECT column_name FROM information_schema.columns WHERE table_schema = '$schema' AND table_name = 'users'");
foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $col) {
    echo "  - $col\n";
}

echo "\n\nSample user record:\n";
$stmt = $db->query("SELECT * FROM users LIMIT 1");
print_r($stmt->fetch(PDO::FETCH_ASSOC));
