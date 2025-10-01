<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();
if ($schema) {
    $db->exec("SET search_path TO $schema");
}

echo "Checking user_settings table structure...\n\n";

$stmt = $db->query("SELECT * FROM user_settings LIMIT 1");
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    echo "Columns in user_settings:\n";
    foreach (array_keys($row) as $column) {
        echo "  - $column\n";
    }

    echo "\n\nChecking for users with email notifications:\n";
    $stmt2 = $db->query("SELECT user_id, email_notifications, email_day, email_time, timezone FROM user_settings WHERE email_notifications = true LIMIT 5");
    $users = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    if (empty($users)) {
        echo "No users with email notifications enabled.\n";
    } else {
        foreach ($users as $user) {
            print_r($user);
        }
    }
}
