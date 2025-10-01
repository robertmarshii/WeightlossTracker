<?php
/**
 * Test Notification System
 * CLI tool to test the notification scheduler with debug output
 *
 * Usage:
 *   docker exec docker-php-fpm php /var/app/backend/test-notifications.php
 *   docker exec docker-php-fpm php /var/app/backend/test-notifications.php --user=user@example.com
 */

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/AuthManager.php';
require_once __DIR__ . '/NotificationScheduler.php';

// Parse command line arguments
$options = getopt('', ['user:', 'help']);

if (isset($options['help'])) {
    echo "Test Notification System\n";
    echo "========================\n\n";
    echo "Usage:\n";
    echo "  php test-notifications.php              - Test all users\n";
    echo "  php test-notifications.php --user=EMAIL - Test specific user\n";
    echo "  php test-notifications.php --help       - Show this help\n\n";
    exit(0);
}

$db = Database::getInstance();

echo "\n";
echo "========================================\n";
echo "NOTIFICATION SYSTEM TEST\n";
echo "========================================\n\n";

// Check if notification_log table exists
echo "1. Checking database setup...\n";
$tableCheck = $db->query("SELECT to_regclass('public.notification_log') as exists");
if (!$tableCheck[0]['exists']) {
    echo "   ❌ ERROR: notification_log table does not exist!\n";
    echo "   Run: docker exec postgres psql -U root -d weightloss -f /docker-entrypoint-initdb.d/notifications.sql\n\n";
    exit(1);
}
echo "   ✅ notification_log table exists\n\n";

// Get users with notifications enabled
$whereClause = '';
$params = [];

if (isset($options['user'])) {
    $email = $options['user'];
    $whereClause = "AND u.email = $1";
    $params = [$email];
    echo "2. Testing notifications for: {$email}\n\n";
} else {
    echo "2. Testing notifications for all users\n\n";
}

$users = $db->query(
    "SELECT u.user_id, u.email,
            s.email_notifications, s.weekly_reports, s.email_day, s.email_time,
            s.timezone, s.weight_unit
     FROM users u
     LEFT JOIN user_settings s ON u.user_id = s.user_id
     WHERE u.email IS NOT NULL {$whereClause}",
    $params
);

if (!$users || count($users) === 0) {
    echo "   ❌ No users found\n";
    exit(1);
}

echo "   Found " . count($users) . " user(s)\n\n";

// Display user notification settings
echo "3. User notification settings:\n";
echo "   " . str_repeat("-", 100) . "\n";
printf("   %-30s %-10s %-10s %-12s %-10s %-20s\n",
    "Email", "Enabled", "Weekly", "Day", "Time", "Timezone");
echo "   " . str_repeat("-", 100) . "\n";

foreach ($users as $user) {
    printf("   %-30s %-10s %-10s %-12s %-10s %-20s\n",
        $user['email'],
        $user['email_notifications'] ? '✅ Yes' : '❌ No',
        $user['weekly_reports'] ? '✅ Yes' : '❌ No',
        $user['email_day'] ?? 'N/A',
        $user['email_time'] ?? 'N/A',
        $user['timezone'] ?? 'UTC'
    );
}
echo "   " . str_repeat("-", 100) . "\n\n";

// Check current day/time for each user's timezone
echo "4. Current day/time in user timezones:\n";
foreach ($users as $user) {
    $timezone = $user['timezone'] ?? 'UTC';
    try {
        $tz = new DateTimeZone($timezone);
        $now = new DateTime('now', $tz);
        $currentDay = $now->format('l');
        $currentTime = $now->format('H:i');

        $match = strcasecmp($currentDay, $user['email_day']) === 0 ? '✅ MATCHES' : '❌ No match';

        echo "   {$user['email']}: {$currentDay} {$currentTime} ({$timezone}) - Preferred: {$user['email_day']} {$user['email_time']} {$match}\n";
    } catch (Exception $e) {
        echo "   {$user['email']}: ❌ Invalid timezone: {$timezone}\n";
    }
}
echo "\n";

// Check notification history
echo "5. Recent notification history:\n";
foreach ($users as $user) {
    $history = $db->query(
        "SELECT sent_date, sent_at, notification_type
         FROM notification_log
         WHERE user_id = $1
         ORDER BY sent_at DESC LIMIT 5",
        [$user['user_id']]
    );

    if ($history && count($history) > 0) {
        echo "   {$user['email']}:\n";
        foreach ($history as $entry) {
            echo "      - {$entry['notification_type']} sent on {$entry['sent_date']} at {$entry['sent_at']}\n";
        }
    } else {
        echo "   {$user['email']}: No notifications sent yet\n";
    }
}
echo "\n";

// Ask if user wants to force send a test notification
echo "6. Would you like to force send a test notification? (yes/no): ";
$handle = fopen("php://stdin", "r");
$line = trim(fgets($handle));

if (strtolower($line) === 'yes' || strtolower($line) === 'y') {
    echo "\n   Forcing notification send to robertmarshgb@gmail.com...\n";
    echo "   (Sandbox mode disabled - real email will be sent)\n\n";

    // Temporarily disable sandbox mode for testing
    putenv('EMAIL_SANDBOX_MODE=false');
    $_ENV['EMAIL_SANDBOX_MODE'] = 'false';

    // Temporarily disable duplicate check by deleting today's notifications
    $today = date('Y-m-d');
    foreach ($users as $user) {
        $db->query(
            "DELETE FROM notification_log
             WHERE user_id = $1 AND sent_date = $2 AND notification_type = 'weekly_reminder'",
            [$user['user_id'], $today]
        );
    }

    // Run the scheduler in test mode (sends all emails to robertmarshgb@gmail.com)
    $scheduler = new NotificationScheduler(true, 'robertmarshgb@gmail.com');
    $scheduler->processNotifications();

    echo "\n   Test completed! Check robertmarshgb@gmail.com for email.\n";
} else {
    echo "\n   Test cancelled. No notifications sent.\n";
}

echo "\n";
echo "========================================\n";
echo "TEST COMPLETED\n";
echo "========================================\n\n";

echo "Useful commands:\n";
echo "  - View notification logs: docker exec postgres psql -U root -d weightloss -c 'SELECT * FROM notification_log ORDER BY sent_at DESC LIMIT 10;'\n";
echo "  - View cron logs: docker exec docker-php-fpm cat /var/app/logs/cron.log\n";
echo "  - View notification logs: docker exec docker-php-fpm cat /var/app/logs/notifications.log\n";
echo "  - Run scheduler manually: docker exec docker-php-fpm php /var/app/backend/NotificationScheduler.php\n\n";
