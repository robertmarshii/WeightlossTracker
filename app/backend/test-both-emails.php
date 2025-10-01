<?php
/**
 * Test Both Email Types
 * Sends both weekly reminder and monthly report to robertmarshgb@gmail.com
 */

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/AuthManager.php';
require_once __DIR__ . '/NotificationScheduler.php';

echo "\n========================================\n";
echo "TEST BOTH EMAIL TYPES\n";
echo "========================================\n\n";

// Disable sandbox mode
putenv('EMAIL_SANDBOX_MODE=false');
$_ENV['EMAIL_SANDBOX_MODE'] = 'false';

$testEmail = 'robertmarshgb@gmail.com';

echo "Creating test scheduler in test mode...\n";
$scheduler = new NotificationScheduler(true, $testEmail);

// Don't call processNotifications() - we'll call the email methods directly

echo "\n--- TEST 1: Weekly Reminder Email ---\n";
echo "Sending to: {$testEmail}\n\n";

// Create mock user for weekly reminder
$weeklyUser = [
    'user_id' => 999,
    'email' => $testEmail,
    'email_notifications' => true,
    'email_day' => 'Tuesday',
    'email_time' => '23:40',
    'timezone' => 'Europe/London',
    'weight_unit' => 'kg'
];

// Create mock weight data
$weeklyWeightData = [
    'current_weight' => 85.5,
    'current_date' => date('Y-m-d'),
    'goal_weight' => 75.0,
    'goal_date' => date('Y-m-d', strtotime('+3 months')),
    'week_ago_weight' => 87.0
];

// Use reflection to access private method
$reflector = new ReflectionClass($scheduler);
$method = $reflector->getMethod('sendReminderEmail');
$method->setAccessible(true);

if ($method->invoke($scheduler, $weeklyUser, $weeklyWeightData)) {
    echo "✅ Weekly reminder email sent successfully!\n";
} else {
    echo "❌ Failed to send weekly reminder email\n";
}

echo "\n--- TEST 2: Monthly Progress Report Email ---\n";
echo "Sending to: {$testEmail}\n\n";

// Create mock user for monthly report
$monthlyUser = [
    'user_id' => 999,
    'email' => $testEmail,
    'weekly_reports' => true,
    'weight_unit' => 'kg',
    'timezone' => 'Europe/London'
];

// Create mock monthly data
$monthlyData = [
    'weights' => [
        ['weight_kg' => 88.0, 'date' => date('Y-m-01')],
        ['weight_kg' => 87.5, 'date' => date('Y-m-08')],
        ['weight_kg' => 86.2, 'date' => date('Y-m-15')],
        ['weight_kg' => 85.5, 'date' => date('Y-m-22')]
    ],
    'previous_month_weight' => 89.5,
    'entries_count' => 4,
    'month_name' => date('F Y')
];

$method = $reflector->getMethod('sendMonthlyReport');
$method->setAccessible(true);

if ($method->invoke($scheduler, $monthlyUser, $monthlyData)) {
    echo "✅ Monthly report email sent successfully!\n";
} else {
    echo "❌ Failed to send monthly report email\n";
}

echo "\n========================================\n";
echo "TESTS COMPLETED\n";
echo "========================================\n\n";

echo "Check robertmarshgb@gmail.com inbox for:\n";
echo "1. Weekly Weight Tracking Reminder\n";
echo "2. Monthly Progress Report - " . date('F Y') . "\n\n";

echo "Both emails should have been sent with test data.\n\n";
