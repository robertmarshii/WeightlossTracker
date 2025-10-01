<?php
/**
 * Test Both Email Types - Direct Method
 * Sends both weekly reminder and monthly report to robertmarshgb@gmail.com
 */

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/AuthManager.php';

echo "\n========================================\n";
echo "TEST BOTH EMAIL TYPES\n";
echo "========================================\n\n";

// Disable sandbox mode
putenv('EMAIL_SANDBOX_MODE=false');
$_ENV['EMAIL_SANDBOX_MODE'] = 'false';

$testEmail = 'robertmarshgb@gmail.com';

// TEST 1: Weekly Reminder Email
echo "--- TEST 1: Weekly Reminder Email ---\n";
echo "Sending to: {$testEmail}\n\n";

$weeklySubject = "Weekly Weight Tracking Reminder 📊";
$weeklyContent = "Weekly Weight Tracking Reminder\n\n" .
    "Your Progress:\n" .
    "Current Weight: 85.5 kg\n" .
    "Goal Weight: 75.0 kg\n\n" .
    "Great job! You lost 1.5 kg this week! 🎉\n\n" .
    "Log your weight now: https://www.weightloss-tracker.com/dashboard.php\n\n" .
    "You're receiving this email because you enabled weekly weight tracking reminders.\n" .
    "To change your notification preferences, visit: https://www.weightloss-tracker.com/dashboard.php#settings";

try {
    $result1 = AuthManager::sendEmail($testEmail, $weeklySubject, $weeklyContent);
    if ($result1) {
        echo "✅ Weekly reminder email sent successfully!\n";
    } else {
        echo "❌ Failed to send weekly reminder email\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

// TEST 2: Monthly Progress Report
echo "\n--- TEST 2: Monthly Progress Report Email ---\n";
echo "Sending to: {$testEmail}\n\n";

$monthName = date('F Y');
$monthlySubject = "Monthly Progress Report - {$monthName} 📊";
$monthlyContent = "Monthly Progress Report - {$monthName}\n\n" .
    "📊 Your September Summary:\n\n" .
    "✅ Entries logged this month: 4\n" .
    "📉 Starting weight: 89.5 kg\n" .
    "📈 Current weight: 85.5 kg\n" .
    "🎯 Monthly progress: -4.0 kg\n\n" .
    "Weight entries:\n" .
    "  • Sep 1:  88.0 kg\n" .
    "  • Sep 8:  87.5 kg\n" .
    "  • Sep 15: 86.2 kg\n" .
    "  • Sep 22: 85.5 kg\n\n" .
    "Great progress! Keep up the good work! 💪\n\n" .
    "View your full progress: https://www.weightloss-tracker.com/dashboard.php\n\n" .
    "You're receiving this email because you enabled monthly progress reports.\n" .
    "To change your notification preferences, visit: https://www.weightloss-tracker.com/dashboard.php#settings";

try {
    $result2 = AuthManager::sendEmail($testEmail, $monthlySubject, $monthlyContent);
    if ($result2) {
        echo "✅ Monthly report email sent successfully!\n";
    } else {
        echo "❌ Failed to send monthly report email\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n========================================\n";
echo "TESTS COMPLETED\n";
echo "========================================\n\n";

echo "Check robertmarshgb@gmail.com inbox for:\n";
echo "1. Weekly Weight Tracking Reminder\n";
echo "2. Monthly Progress Report - {$monthName}\n\n";
