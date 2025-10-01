<?php
require_once __DIR__ . '/Config.php';

echo "Current UTC time: " . date('Y-m-d H:i:s') . "\n";

$timezone = 'Europe/London';
$tz = new DateTimeZone($timezone);
$now = new DateTime('now', $tz);

echo "Current London time: " . $now->format('Y-m-d H:i:s') . "\n";
echo "Current London day: " . $now->format('l') . "\n";
echo "Current London time (H:i): " . $now->format('H:i') . "\n";

echo "\nChecking notification settings:\n";
$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();
if ($schema) {
    $db->exec("SET search_path TO $schema");
}

$stmt = $db->query("SELECT u.email, s.email_day, s.email_time, s.timezone FROM users u JOIN user_settings s ON u.id = s.user_id WHERE s.email_notifications = true");
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $user) {
    echo "\nUser: {$user['email']}\n";
    echo "  Day: {$user['email_day']}\n";
    echo "  Time: {$user['email_time']}\n";
    echo "  Timezone: {$user['timezone']}\n";

    // Calculate time difference
    list($prefHour, $prefMin) = explode(':', $user['email_time']);
    list($currHour, $currMin) = explode(':', $now->format('H:i'));

    $preferredMinutes = ($prefHour * 60) + $prefMin;
    $currentMinutes = ($currHour * 60) + $currMin;
    $timeDiff = abs($currentMinutes - $preferredMinutes);

    echo "  Time difference: {$timeDiff} minutes\n";
    echo "  Should send? " . ($timeDiff < 15 && strcasecmp($now->format('l'), $user['email_day']) === 0 ? 'YES' : 'NO') . "\n";
}
