<?php
/**
 * One-time script to backfill body fat data for existing weight entries
 * Run this via: php backfill-body-fat.php
 */

require_once __DIR__ . '/Database.php';

$db = Database::getInstance()->getDbConnection();
$schema = 'wt_dev'; // Change to wt_test if needed

try {
    echo "Starting body fat backfill...\n";

    // Get all users with their profile data
    $stmt = $db->query("
        SELECT u.id as user_id, up.height_cm, up.age
        FROM {$schema}.users u
        INNER JOIN {$schema}.user_profiles up ON u.id = up.user_id
        WHERE up.height_cm IS NOT NULL AND up.age IS NOT NULL
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Found " . count($users) . " users with complete profile data\n";

    foreach ($users as $user) {
        $userId = $user['user_id'];
        $heightCm = floatval($user['height_cm']);
        $age = intval($user['age']);

        echo "\nProcessing user $userId (height: {$heightCm}cm, age: {$age})...\n";

        // Get all weight entries for this user
        $stmt = $db->prepare("
            SELECT entry_date, weight_kg
            FROM {$schema}.weight_entries
            WHERE user_id = ?
            ORDER BY entry_date ASC
        ");
        $stmt->execute([$userId]);
        $weights = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo "  Found " . count($weights) . " weight entries\n";

        $insertCount = 0;
        foreach ($weights as $weight) {
            $weightKg = floatval($weight['weight_kg']);
            $date = $weight['entry_date'];

            // Calculate BMI
            $heightM = $heightCm / 100.0;
            $bmi = $weightKg / ($heightM * $heightM);

            // Deurenberg formula - use average of male/female
            $bfpMale = 1.2 * $bmi + 0.23 * $age - 16.2;
            $bfpFemale = 1.2 * $bmi + 0.23 * $age - 5.4;
            $bodyFatPercent = ($bfpMale + $bfpFemale) / 2.0;

            // Insert or update
            $stmt = $db->prepare("
                INSERT INTO {$schema}.body_fat_entries (user_id, body_fat_percent, entry_date)
                VALUES (?, ?, ?)
                ON CONFLICT (user_id, entry_date)
                DO UPDATE SET body_fat_percent = ?
            ");
            $stmt->execute([$userId, round($bodyFatPercent, 1), $date, round($bodyFatPercent, 1)]);
            $insertCount++;
        }

        echo "  Inserted/updated $insertCount body fat entries\n";
    }

    echo "\n✅ Backfill complete!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
