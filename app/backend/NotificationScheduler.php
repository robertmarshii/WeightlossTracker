<?php
/**
 * Notification Scheduler
 * Sends weekly email reminders to users based on their notification preferences
 *
 * Usage: php NotificationScheduler.php
 * Cron: Every 15 minutes - cd /var/app/backend && php NotificationScheduler.php
 */

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/AuthManager.php';

class NotificationScheduler {
    private $db;
    private $logFile;
    private $testMode = false;
    private $testEmail = null;

    public function __construct($testMode = false, $testEmail = null) {
        $this->db = Database::getInstance()->getdbConnection();
        $this->logFile = __DIR__ . '/../../logs/notifications.log';
        $this->testMode = $testMode;
        $this->testEmail = $testEmail;

        // Ensure log directory exists
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }

    /**
     * Execute parameterized query
     */
    private function query($sql, $params = []) {
        // Set schema if configured
        $schema = Database::getSchema();
        if ($schema) {
            $this->db->exec("SET search_path TO $schema");
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Log message to file with timestamp
     */
    private function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] {$message}\n";
        file_put_contents($this->logFile, $logMessage, FILE_APPEND);
        echo $logMessage; // Also output to console for cron logging
    }

    /**
     * Get current day name and time in user's timezone
     */
    private function getCurrentDayAndTime($timezone) {
        try {
            $tz = new DateTimeZone($timezone);
            $now = new DateTime('now', $tz);
            return [
                'day' => $now->format('l'), // Monday, Tuesday, etc.
                'time' => $now->format('H:i') // 09:00, 14:30, etc.
            ];
        } catch (Exception $e) {
            $this->log("Invalid timezone '{$timezone}': " . $e->getMessage());
            // Fallback to UTC
            $now = new DateTime('now', new DateTimeZone('UTC'));
            return [
                'day' => $now->format('l'),
                'time' => $now->format('H:i')
            ];
        }
    }

    /**
     * Check if user should receive notification now
     */
    private function shouldSendNotification($user) {
        // Check if notifications are enabled
        if (!$user['email_notifications']) {
            return false;
        }

        // Get current day and time in user's timezone
        $timezone = $user['timezone'] ?? 'Europe/London';
        $current = $this->getCurrentDayAndTime($timezone);

        // Check if current day matches user's preferred day
        if (strcasecmp($current['day'], $user['email_day']) !== 0) {
            return false;
        }

        // Check if current time matches user's preferred time (within 15-minute window)
        $preferredTime = $user['email_time'];
        $currentTime = $current['time'];

        // Parse times to minutes for comparison
        list($prefHour, $prefMin) = explode(':', $preferredTime);
        list($currHour, $currMin) = explode(':', $currentTime);

        $preferredMinutes = ($prefHour * 60) + $prefMin;
        $currentMinutes = ($currHour * 60) + $currMin;

        // Allow 5-minute window (since cron runs every 5 minutes)
        $timeDiff = abs($currentMinutes - $preferredMinutes);

        return $timeDiff < 5;
    }


    /**
     * Get user's latest weight data
     */
    private function getUserWeightData($userId) {
        // Get latest weight
        $latestWeight = $this->query(
            "SELECT weight_kg, entry_date FROM weight_entries
             WHERE user_id = ?
             ORDER BY entry_date DESC LIMIT 1",
            [$userId]
        );

        // Get goal weight
        $goal = $this->query(
            "SELECT target_weight_kg, target_date FROM goals
             WHERE user_id = ? AND is_active = true
             ORDER BY created_at DESC LIMIT 1",
            [$userId]
        );

        // Get weight from 7 days ago for weekly progress
        $weekAgo = date('Y-m-d', strtotime('-7 days'));
        $weekAgoWeight = $this->query(
            "SELECT weight_kg FROM weight_entries
             WHERE user_id = ? AND entry_date <= ?
             ORDER BY entry_date DESC LIMIT 1",
            [$userId, $weekAgo]
        );

        return [
            'current_weight' => $latestWeight[0]['weight_kg'] ?? null,
            'current_date' => $latestWeight[0]['entry_date'] ?? null,
            'goal_weight' => $goal[0]['target_weight_kg'] ?? null,
            'goal_date' => $goal[0]['target_date'] ?? null,
            'week_ago_weight' => $weekAgoWeight[0]['weight_kg'] ?? null
        ];
    }

    /**
     * Send reminder email to user
     */
    private function sendReminderEmail($user, $weightData) {
        // Use test email if in test mode
        $email = $this->testMode && $this->testEmail ? $this->testEmail : $user['email'];
        $weightUnit = $user['weight_unit'] ?? 'kg';

        // Convert weights to user's preferred unit
        $currentWeight = $weightData['current_weight'];
        $goalWeight = $weightData['goal_weight'];
        $weekAgoWeight = $weightData['week_ago_weight'];

        if ($weightUnit === 'lb' && $currentWeight) {
            $currentWeight = round($currentWeight * 2.20462, 1);
            $goalWeight = $goalWeight ? round($goalWeight * 2.20462, 1) : null;
            $weekAgoWeight = $weekAgoWeight ? round($weekAgoWeight * 2.20462, 1) : null;
        }

        // Calculate weekly progress
        $weeklyProgress = null;
        $progressMessage = '';
        if ($currentWeight && $weekAgoWeight) {
            $weeklyProgress = $weekAgoWeight - $currentWeight;
            if ($weeklyProgress > 0) {
                $progressMessage = "Great job! You lost {$weeklyProgress} {$weightUnit} last week! 🎉";
            } elseif ($weeklyProgress < 0) {
                $progressMessage = "You gained " . abs($weeklyProgress) . " {$weightUnit} last week. Keep going! 💪";
            } else {
                $progressMessage = "Your weight stayed the same last week. Stay consistent! 🎯";
            }
        }

        // Build email content
        $subject = "Weekly Weight Tracking Reminder 📊";

        $htmlContent = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #4A5568;'>Weekly Weight Tracking Reminder</h2>

            " . ($currentWeight ? "
            <div style='background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                <h3 style='color: #2D3748; margin-top: 0;'>Your Progress</h3>
                <p style='font-size: 18px; color: #4A5568;'>
                    <strong>Current Weight:</strong> {$currentWeight} {$weightUnit}
                </p>
                " . ($goalWeight ? "
                <p style='font-size: 16px; color: #4A5568;'>
                    <strong>Goal Weight:</strong> {$goalWeight} {$weightUnit}
                </p>
                " : "") . "
                " . ($progressMessage ? "
                <p style='font-size: 16px; color: #2C7A7B; background: #E6FFFA; padding: 10px; border-radius: 4px;'>
                    {$progressMessage}
                </p>
                " : "") . "
            </div>
            " : "
            <div style='background: #FFF5F5; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                <p style='color: #C53030;'>
                    We noticed you haven't logged your weight recently. Don't forget to track your progress!
                </p>
            </div>
            ") . "

            <div style='margin: 30px 0;'>
                <a href='https://www.weightloss-tracker.com/dashboard.php'
                   style='background: #4299E1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;'>
                    Log Your Weight Now
                </a>
            </div>

            <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #718096; font-size: 14px;'>
                <p>You're receiving this email because you enabled weekly weight tracking reminders.</p>
                <p>To change your notification preferences, visit the <a href='https://www.weightloss-tracker.com/dashboard.php#settings'>Settings</a> page.</p>
            </div>
        </div>
        ";

        $plainContent = "Weekly Weight Tracking Reminder\n\n" .
            ($currentWeight ?
                "Your Progress:\n" .
                "Current Weight: {$currentWeight} {$weightUnit}\n" .
                ($goalWeight ? "Goal Weight: {$goalWeight} {$weightUnit}\n" : "") .
                ($progressMessage ? "\n{$progressMessage}\n" : "") :
                "We noticed you haven't logged your weight recently. Don't forget to track your progress!\n"
            ) . "\n\n" .
            "Log your weight now: https://www.weightloss-tracker.com/dashboard.php\n\n" .
            "You're receiving this email because you enabled weekly weight tracking reminders.\n" .
            "To change your notification preferences, visit: https://www.weightloss-tracker.com/dashboard.php#settings";

        try {
            $result = AuthManager::sendEmail($email, $subject, $plainContent, $htmlContent);

            if ($result) {
                $this->log("✅ Sent reminder to {$email}");
                return true;
            } else {
                $this->log("❌ Failed to send reminder to {$email}");
                return false;
            }
        } catch (Exception $e) {
            $this->log("❌ Error sending reminder to {$email}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get monthly weight data for user (PREVIOUS month's data)
     */
    private function getMonthlyWeightData($userId) {
        // Get all weights from PREVIOUS month (since we run on 1st of new month)
        $firstDay = date('Y-m-01', strtotime('first day of last month'));
        $lastDay = date('Y-m-t', strtotime('last day of last month'));

        $weights = $this->query(
            "SELECT weight_kg, entry_date FROM weight_entries
             WHERE user_id = ? AND entry_date >= ? AND entry_date <= ?
             ORDER BY entry_date ASC",
            [$userId, $firstDay, $lastDay]
        );

        // Get month before that for comparison
        $twoMonthsAgoLast = $this->query(
            "SELECT weight_kg FROM weight_entries
             WHERE user_id = ? AND entry_date < ?
             ORDER BY entry_date DESC LIMIT 1",
            [$userId, $firstDay]
        );

        return [
            'weights' => $weights,
            'previous_month_weight' => $twoMonthsAgoLast[0]['weight_kg'] ?? null,
            'entries_count' => count($weights),
            'month_name' => date('F Y', strtotime('first day of last month'))
        ];
    }

    /**
     * Send monthly progress report email
     */
    private function sendMonthlyReport($user, $monthlyData) {
        $email = $this->testMode && $this->testEmail ? $this->testEmail : $user['email'];
        $weightUnit = $user['weight_unit'] ?? 'kg';
        $monthName = $monthlyData['month_name'];
        $weights = $monthlyData['weights'];
        $entriesCount = $monthlyData['entries_count'];

        $subject = "Monthly Progress Report - {$monthName} 📊";

        // Calculate stats
        $startWeight = null;
        $endWeight = null;
        $monthProgress = null;
        $progressMessage = '';

        if ($entriesCount > 0) {
            $startWeight = $weights[0]['weight_kg'];
            $endWeight = $weights[$entriesCount - 1]['weight_kg'];

            // Convert to user's preferred unit
            if ($weightUnit === 'lb') {
                $startWeight = round($startWeight * 2.20462, 1);
                $endWeight = round($endWeight * 2.20462, 1);
            }

            $monthProgress = $startWeight - $endWeight;

            if ($monthProgress > 0) {
                $progressMessage = "Amazing! You lost {$monthProgress} {$weightUnit} this month! 🎉";
            } elseif ($monthProgress < 0) {
                $progressMessage = "You gained " . abs($monthProgress) . " {$weightUnit} this month. Keep pushing! 💪";
            } else {
                $progressMessage = "Your weight stayed stable this month. 🎯";
            }
        }

        // Build weight entries list for HTML
        $entriesHtml = '';
        foreach ($weights as $entry) {
            $weight = $entry['weight_kg'];
            if ($weightUnit === 'lb') {
                $weight = round($weight * 2.20462, 1);
            }
            $date = date('M j', strtotime($entry['entry_date']));
            $entriesHtml .= "<li style='padding: 5px 0;'>{$date}: <strong>{$weight} {$weightUnit}</strong></li>";
        }

        // Build weight entries list for plain text
        $entriesText = '';
        foreach ($weights as $entry) {
            $weight = $entry['weight_kg'];
            if ($weightUnit === 'lb') {
                $weight = round($weight * 2.20462, 1);
            }
            $date = date('M j', strtotime($entry['entry_date']));
            $entriesText .= "  • {$date}: {$weight} {$weightUnit}\n";
        }

        // Build HTML content
        $htmlContent = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #4A5568;'>Monthly Progress Report - {$monthName}</h2>

            " . ($entriesCount > 0 ? "
            <div style='background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                <h3 style='color: #2D3748; margin-top: 0;'>Your Summary</h3>
                <p style='font-size: 16px; color: #4A5568;'>
                    <strong>Entries logged:</strong> {$entriesCount}<br>
                    <strong>Starting weight:</strong> {$startWeight} {$weightUnit}<br>
                    <strong>Ending weight:</strong> {$endWeight} {$weightUnit}<br>
                    <strong>Monthly change:</strong> " . ($monthProgress > 0 ? "-" : "+") . abs($monthProgress) . " {$weightUnit}
                </p>
                " . ($progressMessage ? "
                <p style='font-size: 16px; color: #2C7A7B; background: #E6FFFA; padding: 10px; border-radius: 4px; margin-top: 15px;'>
                    {$progressMessage}
                </p>
                " : "") . "
            </div>

            <div style='background: #FFFFFF; padding: 20px; border-radius: 8px; border: 1px solid #E2E8F0; margin: 20px 0;'>
                <h3 style='color: #2D3748; margin-top: 0;'>Your Entries</h3>
                <ul style='list-style: none; padding: 0; margin: 0;'>
                    {$entriesHtml}
                </ul>
            </div>
            " : "
            <div style='background: #FFF5F5; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                <p style='color: #C53030;'>
                    No entries logged this month. Start tracking your progress!
                </p>
            </div>
            ") . "

            <div style='margin: 30px 0;'>
                <a href='https://www.weightloss-tracker.com/dashboard.php'
                   style='background: #4299E1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;'>
                    View Your Full Progress
                </a>
            </div>

            <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #718096; font-size: 14px;'>
                <p>You're receiving this email because you enabled monthly progress reports.</p>
                <p>To change your notification preferences, visit the <a href='https://www.weightloss-tracker.com/dashboard.php#settings'>Settings</a> page.</p>
            </div>
        </div>
        ";

        $plainContent = "Monthly Progress Report - {$monthName}\n\n" .
            ($entriesCount > 0 ?
                "Your Summary:\n" .
                "Entries logged: {$entriesCount}\n" .
                "Starting weight: {$startWeight} {$weightUnit}\n" .
                "Ending weight: {$endWeight} {$weightUnit}\n" .
                "Monthly change: " . ($monthProgress > 0 ? "-" : "+") . abs($monthProgress) . " {$weightUnit}\n\n" .
                ($progressMessage ? "{$progressMessage}\n\n" : "") .
                "Your Entries:\n{$entriesText}\n" :
                "No entries logged this month. Start tracking your progress!\n\n"
            ) .
            "View your full progress: https://www.weightloss-tracker.com/dashboard.php\n\n" .
            "You're receiving this email because you enabled monthly progress reports.\n" .
            "To change your notification preferences, visit: https://www.weightloss-tracker.com/dashboard.php#settings";

        try {
            $result = AuthManager::sendEmail($email, $subject, $plainContent, $htmlContent);

            if ($result) {
                $this->log("✅ Sent monthly report to {$email}");
                return true;
            } else {
                $this->log("❌ Failed to send monthly report to {$email}");
                return false;
            }
        } catch (Exception $e) {
            $this->log("❌ Error sending monthly report to {$email}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if today is the 1st day of the month at 5am UTC (within cron window)
     */
    private function isFirstDayOfMonthAt5am() {
        $now = new DateTime('now', new DateTimeZone('UTC'));

        // Check if today is the 1st
        if ($now->format('d') !== '01') {
            return false;
        }

        // Check if it's close to 5am (within 5-minute cron window)
        $hour = (int)$now->format('H');
        $minute = (int)$now->format('i');

        // 5am = 05:00, allow 05:00-05:04
        if ($hour !== 5 || $minute > 4) {
            return false;
        }

        return true;
    }

    /**
     * Process weekly reminder notifications (user-scheduled)
     */
    public function processWeeklyReminders() {
        $this->log("Processing weekly reminders...");

        $users = $this->query(
            "SELECT u.id as user_id, u.email,
                    s.email_notifications, s.email_day, s.email_time,
                    s.timezone, s.weight_unit
             FROM users u
             LEFT JOIN user_settings s ON u.id = s.user_id
             WHERE u.email IS NOT NULL
               AND s.email_notifications = true"
        );

        if (!$users || count($users) === 0) {
            $this->log("No users with enabled weekly reminders");
            return 0;
        }

        $this->log("Found " . count($users) . " users with weekly reminders enabled");

        $sentCount = 0;
        $skippedCount = 0;

        foreach ($users as $user) {
            $userId = $user['user_id'];
            $email = $user['email'];

            // Check if notification should be sent
            if (!$this->shouldSendNotification($user)) {
                $this->log("⏭️  Skipped {$email} - not scheduled for now");
                $skippedCount++;
                continue;
            }

            // Get user's weight data
            $weightData = $this->getUserWeightData($userId);

            // Send reminder email
            if ($this->sendReminderEmail($user, $weightData)) {
                $sentCount++;
            }
        }

        $this->log("Weekly reminders: Sent: {$sentCount}, Skipped: {$skippedCount}");
        return $sentCount;
    }

    /**
     * Process monthly progress reports (1st day of month at 5am UTC)
     */
    public function processMonthlyReports() {
        // Only run on 1st day of month at 5am UTC
        if (!$this->isFirstDayOfMonthAt5am()) {
            return 0;
        }

        $this->log("Processing monthly progress reports (1st of month at 5am UTC)...");

        $users = $this->query(
            "SELECT u.id as user_id, u.email,
                    s.weekly_reports, s.weight_unit, s.timezone
             FROM users u
             LEFT JOIN user_settings s ON u.id = s.user_id
             WHERE u.email IS NOT NULL
               AND s.weekly_reports = true"
        );

        if (!$users || count($users) === 0) {
            $this->log("No users with enabled monthly reports");
            return 0;
        }

        $this->log("Found " . count($users) . " users with monthly reports enabled");

        $sentCount = 0;

        foreach ($users as $user) {
            $userId = $user['user_id'];
            $email = $user['email'];

            // Get monthly weight data
            $monthlyData = $this->getMonthlyWeightData($userId);

            // Send monthly progress report
            if ($this->sendMonthlyReport($user, $monthlyData)) {
                $sentCount++;
            }
        }

        $this->log("Monthly reports: Sent: {$sentCount}");
        return $sentCount;
    }

    /**
     * Process all notifications (main entry point)
     */
    public function processNotifications() {
        $this->log("========================================");
        $this->log("Starting notification scheduler");

        $weeklyCount = $this->processWeeklyReminders();
        $monthlyCount = $this->processMonthlyReports();

        $this->log("Notification scheduler completed");
        $this->log("Total sent: " . ($weeklyCount + $monthlyCount) . " (Weekly: {$weeklyCount}, Monthly: {$monthlyCount})");
        $this->log("========================================");
    }
}

// Run scheduler if called directly
if (php_sapi_name() === 'cli') {
    $scheduler = new NotificationScheduler();
    $scheduler->processNotifications();
}
