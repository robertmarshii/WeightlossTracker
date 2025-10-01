<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();
if ($schema) {
    $db->exec("SET search_path TO $schema");
}

echo "Checking notification settings...\n\n";

$stmt = $db->query("SELECT email, email_notifications, email_day, email_time, timezone FROM user_settings WHERE email_notifications = true");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($users)) {
    echo "No users with email notifications enabled.\n";
} else {
    foreach ($users as $user) {
        echo "Email: {$user['email']}\n";
        echo "Day: {$user['email_day']}\n";
        echo "Time: {$user['email_time']}\n";
        echo "Timezone: {$user['timezone']}\n";
        echo "---\n";
    }
}
