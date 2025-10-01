<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();
if ($schema) {
    $db->exec("SET search_path TO $schema");
}

echo "Checking for goal columns in user_profiles:\n";
$stmt = $db->query("SELECT * FROM user_profiles LIMIT 1");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if ($row) {
    foreach (array_keys($row) as $col) {
        echo "  - $col\n";
    }
}
