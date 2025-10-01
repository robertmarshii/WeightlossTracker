<?php
/**
 * Simple Email Test
 * Sends a test notification email to robertmarshgb@gmail.com
 */

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/AuthManager.php';

echo "\n========================================\n";
echo "SIMPLE EMAIL TEST\n";
echo "========================================\n\n";

// Disable sandbox mode
putenv('EMAIL_SANDBOX_MODE=false');
$_ENV['EMAIL_SANDBOX_MODE'] = 'false';

// Test email details
$email = 'robertmarshgb@gmail.com';
$subject = "Weekly Weight Tracking Reminder 📊";

$htmlContent = "
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <h2 style='color: #4A5568;'>Weekly Weight Tracking Reminder</h2>

    <div style='background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;'>
        <h3 style='color: #2D3748; margin-top: 0;'>Your Progress</h3>
        <p style='font-size: 18px; color: #4A5568;'>
            <strong>Current Weight:</strong> 85.0 kg
        </p>
        <p style='font-size: 16px; color: #4A5568;'>
            <strong>Goal Weight:</strong> 75.0 kg
        </p>
        <p style='font-size: 16px; color: #2C7A7B; background: #E6FFFA; padding: 10px; border-radius: 4px;'>
            Great job! You lost 2.0 kg this week! 🎉
        </p>
    </div>

    <div style='margin: 30px 0;'>
        <a href='https://www.weightloss-tracker.com/dashboard.php'
           style='background: #4299E1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;'>
            Log Your Weight Now
        </a>
    </div>

    <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #718096; font-size: 14px;'>
        <p>This is a test email from the notification system.</p>
        <p>To change your notification preferences, visit the <a href='https://www.weightloss-tracker.com/dashboard.php#settings'>Settings</a> page.</p>
    </div>
</div>
";

$plainContent = "Weekly Weight Tracking Reminder\n\n" .
    "Your Progress:\n" .
    "Current Weight: 85.0 kg\n" .
    "Goal Weight: 75.0 kg\n\n" .
    "Great job! You lost 2.0 kg this week!\n\n" .
    "Log your weight now: https://www.weightloss-tracker.com/dashboard.php\n\n" .
    "This is a test email from the notification system.\n" .
    "To change your notification preferences, visit: https://www.weightloss-tracker.com/dashboard.php#settings";

echo "Sending test email to: {$email}\n";
echo "Sandbox mode: DISABLED (real email will be sent)\n\n";

try {
    // Note: sendEmail only sends plain text, so we'll send the HTML content as text
    // SparkPost will render it properly
    $result = AuthManager::sendEmail($email, $subject, $plainContent);

    if ($result) {
        echo "✅ Email sent successfully!\n";
        echo "Check robertmarshgb@gmail.com inbox.\n";
    } else {
        echo "❌ Failed to send email.\n";
        echo "Check SparkPost API key and configuration in .env file.\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n========================================\n";
echo "TEST COMPLETED\n";
echo "========================================\n\n";
