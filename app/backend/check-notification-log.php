<?php
require_once __DIR__ . '/Config.php';

$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();
if ($schema) {
    $db->exec("SET search_path TO $schema");
}

echo "Checking notification log for user_id 1:\n\n";
$stmt = $db->query("SELECT * FROM notification_log WHERE user_id = 1 ORDER BY sent_at DESC LIMIT 5");
$logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($logs)) {
    echo "No notifications logged yet.\n";
} else {
    foreach ($logs as $log) {
        print_r($log);
    }
}
