<?php
   session_start();
   require_once '/var/app/backend/CoverageLogger.php';
   require_once '/var/app/backend/Security.php';

    // Plausible weights for an adult, in kg (js/dashboard.js checks the same limits)
    const WEIGHT_MIN_KG = 20;
    const WEIGHT_MAX_KG = 500;
    // A goal's target date may be up to this many years ahead (js/dashboard.js checks the same)
    const GOAL_DATE_MAX_YEARS = 10;

    if(isset($_GET["controller"])) {
        $controller = htmlspecialchars($_GET["controller"]);
        if($controller === "profile") {
            ProfileController();
        } elseif (Security::isTestEnv()) {
            // Test/dev-only controllers: never routed unless the server runs with APP_ENV=test
            if($controller === "get1") { Get1(); }
            if($controller === "schema") { SchemaController(); }
            if($controller === "seeder") { SeederController(); }
            if($controller === "email") { EmailController(); }
            if($controller === "coverage") { CoverageController(); }
            if($controller === "seeder_tester") { SeederTesterController(); }
        } else {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Not found']);
        }
    }

    function Get1() {
        COVERAGE_LOG('Get1', 'Router', __FILE__, __LINE__);
        if(!isset($_POST["page"])) { $_POST["page"] = 1; }
        $page = htmlspecialchars($_POST["page"]);
        require_once ('/var/app/backend/Get1.php'); //load the dataset model
        $data = new Get1(); //set the variable to a new instance of the dataset
        $response = $data->Get($page); 
        echo $response;  
    }

    function SchemaController() {
        COVERAGE_LOG('SchemaController', 'Router', __FILE__, __LINE__);
        require_once ('/var/app/backend/SchemaManager.php');
        
        // Accept both form-encoded and JSON payloads
        $request = $_POST;
        if (!isset($request['action'])) {
            $raw = file_get_contents('php://input');
            if ($raw) {
                $json = json_decode($raw, true);
                if (is_array($json)) { $request = array_merge($request, $json); }
            }
        }
        
        if (isset($request['action'])) {
            $action = htmlspecialchars($request['action']);
            
            if ($action === 'switch' && isset($request['schema'])) {
                $schema = htmlspecialchars($request['schema']);
                $result = SchemaManager::switchSchema($schema);
                echo json_encode($result);
            } elseif ($action === 'get') {
                $currentSchema = SchemaManager::getCurrentSchema();
                echo json_encode(['success' => true, 'schema' => $currentSchema]);
            }
        }
    }

    function SeederController() {
        COVERAGE_LOG('SeederController', 'Router', __FILE__, __LINE__);
        require_once ('/var/app/backend/DatabaseSeeder.php');
        
        if (isset($_POST['action'])) {
            $action = htmlspecialchars($_POST['action']);
            
            if ($action === 'reset_all') {
                $result = DatabaseSeeder::resetSchemas(['wt_test', 'wt_dev']);
                echo json_encode($result);
            } elseif ($action === 'reset_schemas' && isset($_POST['schemas'])) {
                $schemas = is_array($_POST['schemas']) ? $_POST['schemas'] : [$_POST['schemas']];
                $result = DatabaseSeeder::resetSchemas($schemas);
                echo json_encode($result);
            } elseif ($action === 'seed_schema' && isset($_POST['schema'])) {
                $schema = htmlspecialchars($_POST['schema']);
                $result = DatabaseSeeder::seedSchema($schema);
                echo json_encode($result);
            } elseif ($action === 'reset_schema' && isset($_POST['schema'])) {
                $schema = htmlspecialchars($_POST['schema']);
                $result = DatabaseSeeder::resetSchemas([$schema]);
                echo json_encode($result);
            } elseif ($action === 'migrate_live') {
                $result = DatabaseSeeder::migrateLive();
                echo json_encode($result);
            }
        }
    }

    function ProfileController() {
        COVERAGE_LOG('ProfileController', 'Router', __FILE__, __LINE__);

        try {
            require_once ('/var/app/backend/Config.php');
            require_once ('/var/app/backend/AuthManager.php');

            if (!AuthManager::isLoggedIn()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Not authenticated']);
                return;
            }

            // Give the page a fresh token (e.g. after the session was restored from the remember-me cookie).
            // Safe without a token: other sites cannot read the response.
            if (($_POST['action'] ?? '') === 'csrf_token') {
                echo json_encode(['success' => true, 'csrf_token' => Security::csrfToken()]);
                return;
            }

            // CSRF: every request must carry this session's token (sent by js/global.js as X-CSRF-Token)
            if (!Security::csrfValid()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Your session has expired. Please reload the page.', 'csrf' => false]);
                return;
            }

            // Lets an open dashboard notice that a newer version is live (js/global.js asks the user to reload)
            header('X-App-Version: ' . (int)Security::CLIENT_VERSION);

            $userId = (int)$_SESSION['user_id'];
            $db = Database::getInstance()->getdbConnection();
            $schema = Database::getSchema();

            if (!$db) {
                throw new Exception('Database connection failed');
            }

            // Pending one-off data fixes: applied at container start (run-migrations.php). Here only a cheap
            // check: a marker file once applied, a back-off file after a failure, a short wait for the lock.
            require_once('/var/app/backend/Migrations.php');
            Migrations::run($db, $schema, Migrations::MODE_REQUEST);

        } catch (Exception $e) {
            error_log("ProfileController ERROR: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
            return;
        }

        if (!isset($_POST['action'])) {
            echo json_encode(['success' => false, 'message' => 'No action specified']);
            return;
        }

        $action = htmlspecialchars($_POST['action']);
        try {
            if ($action === 'get_profile') {
                $stmt = $db->prepare("SELECT user_id, height_cm, body_frame, age, activity_level FROM {$schema}.user_profiles WHERE user_id = ?");
                $stmt->execute([$userId]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
                echo json_encode(['success' => true, 'profile' => $row]);
                return;
            }

            if ($action === 'save_profile') {
                $height = (isset($_POST['height_cm']) && $_POST['height_cm'] !== '' && is_numeric($_POST['height_cm'])) ? (int)$_POST['height_cm'] : null;
                $rawFrame = isset($_POST['body_frame']) ? strtolower(trim((string)$_POST['body_frame'])) : '';
                $frame = in_array($rawFrame, ['small','medium','large'], true) ? $rawFrame : null;
                $age = (isset($_POST['age']) && $_POST['age'] !== '' && is_numeric($_POST['age'])) ? (int)$_POST['age'] : null;
                $rawAct = isset($_POST['activity_level']) ? strtolower(trim((string)$_POST['activity_level'])) : '';
                $activity = in_array($rawAct, ['sedentary','light','moderate','very','athlete'], true) ? $rawAct : null;

                $sql = "INSERT INTO {$schema}.user_profiles (user_id, height_cm, body_frame, age, activity_level, updated_at)
                        VALUES (?, ?, ?, ?, ?, NOW())
                        ON CONFLICT (user_id) DO UPDATE SET height_cm = EXCLUDED.height_cm, body_frame = EXCLUDED.body_frame, age = EXCLUDED.age, activity_level = EXCLUDED.activity_level, updated_at = NOW()";
                $stmt = $db->prepare($sql);
                $stmt->execute([$userId, $height, $frame, $age, $activity]);
                echo json_encode(['success' => true, 'message' => 'Profile saved']);
                return;
            }

            if ($action === 'add_weight') {
                $w = isset($_POST['weight_kg']) && is_numeric($_POST['weight_kg']) ? (float)$_POST['weight_kg'] : null;
                $date = isset($_POST['entry_date']) ? (string)$_POST['entry_date'] : date('Y-m-d');
                if ($err = weightEntryError($w, $date)) {
                    echo json_encode(['success' => false] + $err);
                    return;
                }
                $stmt = $db->prepare("INSERT INTO {$schema}.weight_entries (user_id, weight_kg, entry_date, notes) VALUES (?, ?, ?, NULL)");
                $stmt->execute([$userId, $w, $date]);

                // Body fat estimate (Deurenberg) for that day, from its latest weight
                syncBodyFatForDate($userId, $date, $db, $schema);

                echo json_encode(['success' => true, 'message' => 'Weight entry added']);
                return;
            }

            if ($action === 'get_latest_weight') {
                $stmt = $db->prepare("SELECT weight_kg, entry_date FROM {$schema}.weight_entries WHERE user_id = ? ORDER BY entry_date DESC, id DESC LIMIT 1");
                $stmt->execute([$userId]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
                echo json_encode(['success' => true, 'latest' => $row]);
                return;
            }

            if ($action === 'save_goal') {
                // Target weight: a number within the same 20-500 kg limits as a weight entry
                $rawTw = $_POST['target_weight_kg'] ?? null;
                $tw = (is_string($rawTw) && is_numeric(trim($rawTw))) ? (float)trim($rawTw) : null;
                if ($tw === null || !is_finite($tw) || $tw < WEIGHT_MIN_KG || $tw > WEIGHT_MAX_KG) {
                    echo json_encode(['success' => false, 'code' => 'weight_out_of_range', 'message' => 'Weight must be between ' . WEIGHT_MIN_KG . ' and ' . WEIGHT_MAX_KG . ' kg']);
                    return;
                }
                // No date: the dashboard sends "null" (or nothing, or ""); any other value must be a real date
                // from today up to GOAL_DATE_MAX_YEARS ahead (see goalDateError)
                $td = isset($_POST['target_date']) && is_string($_POST['target_date']) ? trim($_POST['target_date']) : '';
                if ($td === '' || $td === 'null') {
                    $td = null;
                } elseif ($err = goalDateError($td)) {
                    echo json_encode(['success' => false] + $err);
                    return;
                }
                // Replace the active goal in one transaction: if the insert fails, the current goal stays active
                $db->beginTransaction();
                try {
                    $db->prepare("UPDATE {$schema}.goals SET is_active = false WHERE user_id = ? AND is_active = true")->execute([$userId]);
                    $stmt = $db->prepare("INSERT INTO {$schema}.goals (user_id, target_weight_kg, target_date, is_active, created_at) VALUES (?, ?, ?, true, NOW())");
                    $stmt->execute([$userId, $tw, $td]);
                    $db->commit();
                } catch (Throwable $e) {
                    if ($db->inTransaction()) {
                        $db->rollBack();
                    }
                    throw $e;
                }
                echo json_encode(['success' => true, 'message' => 'Goal saved']);
                return;
            }

            if ($action === 'get_goal') {
                $stmt = $db->prepare("SELECT target_weight_kg, target_date FROM {$schema}.goals WHERE user_id = ? AND is_active = true ORDER BY created_at DESC, id DESC LIMIT 1");
                $stmt->execute([$userId]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
                echo json_encode(['success' => true, 'goal' => $row]);
                return;
            }

            if ($action === 'get_quick_look_metrics') {
                COVERAGE_LOG('get_quick_look_metrics', 'ProfileController', __FILE__, __LINE__);
                $metrics = calculateQuickLookMetrics($userId, $db, $schema);
                echo json_encode(['success' => true, 'metrics' => $metrics]);
                return;
            }

            if ($action === 'get_goal_progress_enhanced') {
                COVERAGE_LOG('get_goal_progress_enhanced', 'ProfileController', __FILE__, __LINE__);
                $progress = calculateGoalProgressEnhanced($userId, $db, $schema);
                echo json_encode(['success' => true, 'progress' => $progress]);
                return;
            }

            if ($action === 'get_streak_data') {
                COVERAGE_LOG('get_streak_data', 'ProfileController', __FILE__, __LINE__);
                $streakData = calculateStreakData($userId, $db, $schema);
                echo json_encode(['success' => true, 'data' => $streakData]);
                return;
            }

            if ($action === 'get_total_progress') {
                COVERAGE_LOG('get_total_progress', 'ProfileController', __FILE__, __LINE__);
                $progress = calculateTotalProgress($userId, $db, $schema);
                echo json_encode(['success' => true, 'total_progress' => $progress]);
                return;
            }

            // log_body_fat action removed - body fat is now automatically calculated when weight is logged

            if ($action === 'get_bmi') {
                // Fetch profile
                $stmt = $db->prepare("SELECT height_cm, body_frame, age FROM {$schema}.user_profiles WHERE user_id = ?");
                $stmt->execute([$userId]);
                $prof = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

                // Latest weight
                $stmt = $db->prepare("SELECT weight_kg FROM {$schema}.weight_entries WHERE user_id = ? ORDER BY entry_date DESC, id DESC LIMIT 1");
                $stmt->execute([$userId]);
                $wrow = $stmt->fetch(PDO::FETCH_ASSOC);

                $heightCm = isset($prof['height_cm']) ? (int)$prof['height_cm'] : 0;
                $age = isset($prof['age']) ? (int)$prof['age'] : null;
                $frame = isset($prof['body_frame']) ? strtolower($prof['body_frame']) : 'medium';
                $weightKg = $wrow ? (float)$wrow['weight_kg'] : null;

                if ($weightKg === null || $heightCm <= 0) {
                    echo json_encode(['success' => false, 'message' => 'Need height and a recent weight to compute BMI']);
                    return;
                }

                $h = $heightCm / 100.0;
                $bmi = $weightKg / ($h * $h);

                $category = 'normal';
                if ($bmi < 18.5) $category = 'underweight';
                elseif ($bmi < 25) $category = 'normal';
                elseif ($bmi < 30) $category = 'overweight';
                else $category = 'obese';

                // Light frame heuristic adjustment for interpretation
                $frameFactor = 1.0;
                if ($frame === 'small') $frameFactor = 1.03; // slightly higher relative BMI impact
                if ($frame === 'large') $frameFactor = 0.97; // slightly lower relative BMI impact
                $adjBmi = $bmi * $frameFactor;

                $adjCategory = 'normal';
                if ($adjBmi < 18.5) $adjCategory = 'underweight';
                elseif ($adjBmi < 25) $adjCategory = 'normal';
                elseif ($adjBmi < 30) $adjCategory = 'overweight';
                else $adjCategory = 'obese';

                $notes = [];
                if ($age !== null && $age >= 65) {
                    $notes[] = 'For older adults, BMI may be less predictive of health risks.';
                }
                if ($age !== null && $age < 18) {
                    $notes[] = 'For children/teens, use BMI-for-age percentiles rather than adult BMI categories.';
                }
                $notes[] = 'Frame-adjusted BMI is a heuristic interpretation only.';

                echo json_encode([
                    'success' => true,
                    'bmi' => round($bmi, 1),
                    'category' => $category,
                    'adjusted_bmi' => round($adjBmi, 1),
                    'adjusted_category' => $adjCategory,
                    'weight_kg' => $weightKg,
                    'height_cm' => $heightCm,
                    'age' => $age,
                    'body_frame' => $frame,
                    'notes' => $notes,
                ]);
                return;
            }

            if ($action === 'get_weight_history') {
                // Get user's profile for height (needed for BMI calculation)
                $stmt = $db->prepare("SELECT height_cm FROM {$schema}.user_profiles WHERE user_id = ?");
                $stmt->execute([$userId]);
                $profile = $stmt->fetch(PDO::FETCH_ASSOC);
                $heightCm = $profile ? (int)$profile['height_cm'] : null;

                // Get weight history ordered by date (newest first)
                $stmt = $db->prepare("SELECT id, weight_kg, entry_date, notes FROM {$schema}.weight_entries WHERE user_id = ? ORDER BY entry_date DESC, id DESC");
                $stmt->execute([$userId]);
                $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Calculate BMI for each entry if height is available
                if ($heightCm && $heightCm > 0) {
                    $h = $heightCm / 100.0;
                    foreach ($entries as &$entry) {
                        $bmi = (float)$entry['weight_kg'] / ($h * $h);
                        $entry['bmi'] = round($bmi, 1);
                    }
                }

                echo json_encode(['success' => true, 'history' => $entries]);
                return;
            }

            if ($action === 'delete_weight') {
                if (!isset($_POST['id'])) {
                    echo json_encode(['success' => false, 'message' => 'Entry ID required']);
                    return;
                }

                $entryId = (int)$_POST['id'];
                $stmt = $db->prepare("DELETE FROM {$schema}.weight_entries WHERE id = ? AND user_id = ? RETURNING entry_date");
                $stmt->execute([$entryId, $userId]);
                $deletedDate = $stmt->fetchColumn();

                if ($deletedDate !== false) {
                    // That day's body fat estimate now comes from its remaining weight, or goes
                    syncBodyFatForDate($userId, $deletedDate, $db, $schema);
                    echo json_encode(['success' => true, 'message' => 'Weight entry deleted']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Entry not found or not authorized']);
                }
                return;
            }

            if ($action === 'update_weight') {
                // Edit an existing entry in place (the Data tab's ✎ button)
                $entryId = isset($_POST['id']) && is_scalar($_POST['id']) ? (int)$_POST['id'] : 0;
                $w = isset($_POST['weight_kg']) && is_numeric($_POST['weight_kg']) ? (float)$_POST['weight_kg'] : null;
                $date = isset($_POST['entry_date']) && is_string($_POST['entry_date']) ? $_POST['entry_date'] : '';
                if ($entryId <= 0) {
                    echo json_encode(['success' => false, 'message' => 'Entry ID required']);
                    return;
                }
                if ($err = weightEntryError($w, $date)) {
                    echo json_encode(['success' => false] + $err);
                    return;
                }
                $db->beginTransaction();
                try {
                    $stmt = $db->prepare("SELECT entry_date FROM {$schema}.weight_entries WHERE id = ? AND user_id = ? FOR UPDATE");
                    $stmt->execute([$entryId, $userId]);
                    $oldDate = $stmt->fetchColumn();
                    if ($oldDate === false) {
                        $db->rollBack();
                        echo json_encode(['success' => false, 'message' => 'Entry not found or not authorized']);
                        return;
                    }
                    $stmt = $db->prepare("UPDATE {$schema}.weight_entries SET weight_kg = ?, entry_date = ? WHERE id = ? AND user_id = ?");
                    $stmt->execute([$w, $date, $entryId, $userId]);
                    // Body fat estimates follow the weights: the new day's, and the old day's if the date moved
                    syncBodyFatForDate($userId, $date, $db, $schema);
                    if ($oldDate !== $date) {
                        syncBodyFatForDate($userId, $oldDate, $db, $schema);
                    }
                    $db->commit();
                } catch (Throwable $e) {
                    if ($db->inTransaction()) {
                        $db->rollBack();
                    }
                    throw $e;
                }
                echo json_encode(['success' => true, 'message' => 'Weight entry updated']);
                return;
            }

            if ($action === 'get_health_stats') {
                // Gather inputs
                $stmt = $db->prepare("SELECT height_cm, body_frame, age, activity_level FROM {$schema}.user_profiles WHERE user_id = ?");
                $stmt->execute([$userId]);
                $prof = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

                $stmt = $db->prepare("SELECT weight_kg FROM {$schema}.weight_entries WHERE user_id = ? ORDER BY entry_date DESC, id DESC LIMIT 1");
                $stmt->execute([$userId]);
                $wrow = $stmt->fetch(PDO::FETCH_ASSOC);

                $heightCm = isset($prof['height_cm']) ? (int)$prof['height_cm'] : 0;
                $age = isset($prof['age']) ? (int)$prof['age'] : null;
                $frame = isset($prof['body_frame']) ? strtolower($prof['body_frame']) : 'medium';
                $activity = isset($prof['activity_level']) ? strtolower($prof['activity_level']) : '';
                $weightKg = $wrow ? (float)$wrow['weight_kg'] : null;

                if (!$weightKg || $heightCm <= 0) {
                    echo json_encode(['success' => false, 'message' => 'Need height and a recent weight to compute health stats']);
                    return;
                }

                $h = $heightCm / 100.0;
                $bmi = $weightKg / ($h * $h);

                $category = 'normal';
                if ($bmi < 18.5) $category = 'underweight';
                elseif ($bmi < 25) $category = 'normal';
                elseif ($bmi < 30) $category = 'overweight';
                else $category = 'obese';

                // Frame-adjusted BMI (heuristic)
                $frameFactor = 1.0;
                if ($frame === 'small') $frameFactor = 1.03;
                if ($frame === 'large') $frameFactor = 0.97;
                $adjBmi = $bmi * $frameFactor;
                $adjCategory = 'normal';
                if ($adjBmi < 18.5) $adjCategory = 'underweight';
                elseif ($adjBmi < 25) $adjCategory = 'normal';
                elseif ($adjBmi < 30) $adjCategory = 'overweight';
                else $adjCategory = 'obese';

                // Estimated body fat percentage range using Deurenberg formula bounds
                $bfpRange = null;
                $bfpNotes = [];
                if ($age !== null) {
                    $bfpMale = 1.2 * $bmi + 0.23 * $age - 16.2;   // male
                    $bfpFemale = 1.2 * $bmi + 0.23 * $age - 5.4; // female
                    $min = min($bfpMale, $bfpFemale);
                    $max = max($bfpMale, $bfpFemale);
                    $bfpRange = [round($min, 1), round($max, 1)];
                    $bfpNotes[] = 'Body fat estimated with the Deurenberg formula (BMI, age). The range runs from the result for men to the result for women.';
                } else {
                    $bfpNotes[] = 'Add your age in profile to estimate body fat percentage.';
                }


                echo json_encode([
                    'success' => true,
                    'bmi' => round($bmi, 1),
                    'category' => $category,
                    'adjusted_bmi' => round($adjBmi, 1),
                    'adjusted_category' => $adjCategory,
                    'estimated_body_fat_range' => $bfpRange, // [min%, max%] or null
                    'body_fat_notes' => $bfpNotes,
                    'height_cm' => $heightCm,
                    'age' => $age,
                ]);
                return;
            }

            if ($action === 'get_settings') {
                $stmt = $db->prepare("SELECT * FROM {$schema}.user_settings WHERE user_id = ?");
                $stmt->execute([$userId]);
                $settings = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$settings) {
                    // Return default settings if none exist
                    $defaultSettings = [
                        'weight_unit' => 'kg',
                        'height_unit' => 'cm',
                        'temperature_unit' => 'c',
                        'date_format' => 'uk',
                        'time_format' => '24',
                        'timezone' => 'Europe/London',
                        'theme' => 'glassmorphism',
                        'language' => 'en',
                        'start_of_week' => 'monday',
                        'email_notifications' => false,
                        'email_day' => 'monday',
                        'email_time' => '09:00',
                        'weekly_reports' => false
                    ];
                    echo json_encode(['success' => true, 'settings' => $defaultSettings]);
                } else {
                    // Convert string/integer/boolean values to actual booleans
                    unset($settings['share_data']); // retired setting: column may still exist, never sent to the page
                    $settings['email_notifications'] = $settings['email_notifications'] === '1' || $settings['email_notifications'] === 'true' || $settings['email_notifications'] === 1 || $settings['email_notifications'] === true;
                    $settings['weekly_reports'] = $settings['weekly_reports'] === '1' || $settings['weekly_reports'] === 'true' || $settings['weekly_reports'] === 1 || $settings['weekly_reports'] === true;
                    echo json_encode(['success' => true, 'settings' => $settings]);
                }
                return;
            }

            if ($action === 'save_settings') {
                $weightUnit = isset($_POST['weight_unit']) ? $_POST['weight_unit'] : 'kg';
                $heightUnit = isset($_POST['height_unit']) ? $_POST['height_unit'] : 'cm';
                $temperatureUnit = isset($_POST['temperature_unit']) ? $_POST['temperature_unit'] : 'c';
                $dateFormat = isset($_POST['date_format']) ? $_POST['date_format'] : 'uk';
                $timeFormat = isset($_POST['time_format']) ? $_POST['time_format'] : '24';
                $timezone = isset($_POST['timezone']) ? $_POST['timezone'] : 'Europe/London';
                $theme = isset($_POST['theme']) ? $_POST['theme'] : 'glassmorphism';
                $language = isset($_POST['language']) ? $_POST['language'] : 'en';
                $startOfWeek = isset($_POST['start_of_week']) ? $_POST['start_of_week'] : 'monday';
                $emailNotifications = isset($_POST['email_notifications']) && ($_POST['email_notifications'] === 'true' || $_POST['email_notifications'] === true) ? 1 : 0;
                $emailDay = isset($_POST['email_day']) ? $_POST['email_day'] : 'monday';
                $emailTime = isset($_POST['email_time']) ? $_POST['email_time'] : '09:00';
                $weeklyReports = isset($_POST['weekly_reports']) && ($_POST['weekly_reports'] === 'true' || $_POST['weekly_reports'] === true) ? 1 : 0;

                // Only known values are stored; anything else falls back to the default
                $pick = function ($value, array $allowed, $default) {
                    return (is_string($value) && in_array($value, $allowed, true)) ? $value : $default;
                };
                $weightUnit = $pick($weightUnit, ['kg', 'lbs', 'st'], 'kg');
                $heightUnit = $pick($heightUnit, ['cm', 'ft', 'm'], 'cm');
                $temperatureUnit = $pick($temperatureUnit, ['c', 'f'], 'c');
                $dateFormat = $pick($dateFormat, ['uk', 'us', 'iso', 'euro'], 'uk');
                $timeFormat = $pick($timeFormat, ['24', '12'], '24');
                $timezone = $pick($timezone, DateTimeZone::listIdentifiers(), 'Europe/London');
                $theme = $pick($theme, ['glassmorphism', 'neumorphism', 'skeuomorphism', 'minimalism', 'retro', 'material'], 'glassmorphism');
                $language = $pick($language, ['en', 'es', 'fr', 'de'], 'en');
                $startOfWeek = $pick($startOfWeek, ['monday', 'sunday'], 'monday');
                $emailDay = $pick($emailDay, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], 'monday');
                $emailTime = (is_string($emailTime) && preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $emailTime)) ? $emailTime : '09:00';

                $sql = "INSERT INTO {$schema}.user_settings (
                    user_id, weight_unit, height_unit, temperature_unit, date_format, time_format,
                    timezone, theme, language, start_of_week, email_notifications,
                    email_day, email_time, weekly_reports, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    weight_unit = EXCLUDED.weight_unit,
                    height_unit = EXCLUDED.height_unit,
                    temperature_unit = EXCLUDED.temperature_unit,
                    date_format = EXCLUDED.date_format,
                    time_format = EXCLUDED.time_format,
                    timezone = EXCLUDED.timezone,
                    theme = EXCLUDED.theme,
                    language = EXCLUDED.language,
                    start_of_week = EXCLUDED.start_of_week,
                    email_notifications = EXCLUDED.email_notifications,
                    email_day = EXCLUDED.email_day,
                    email_time = EXCLUDED.email_time,
                    weekly_reports = EXCLUDED.weekly_reports,
                    updated_at = NOW()";

                $stmt = $db->prepare($sql);
                $stmt->execute([
                    $userId, $weightUnit, $heightUnit, $temperatureUnit, $dateFormat, $timeFormat,
                    $timezone, $theme, $language, $startOfWeek, $emailNotifications,
                    $emailDay, $emailTime, $weeklyReports
                ]);
                
                echo json_encode(['success' => true, 'message' => 'Settings saved']);
                return;
            }

            if ($action === 'get_ideal_weight') {
                // Get user's profile for height and body frame
                $stmt = $db->prepare("SELECT height_cm, body_frame FROM {$schema}.user_profiles WHERE user_id = ?");
                $stmt->execute([$userId]);
                $profile = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$profile || !$profile['height_cm'] || $profile['height_cm'] <= 0) {
                    echo json_encode(['success' => false, 'message' => 'Height required to calculate ideal weight range']);
                    return;
                }
                
                $heightCm = (float)$profile['height_cm'];
                $bodyFrame = strtolower($profile['body_frame'] ?? 'medium');
                
                // Get current weight and weight history for timeline calculation
                $stmt = $db->prepare("SELECT weight_kg, entry_date FROM {$schema}.weight_entries WHERE user_id = ? ORDER BY entry_date DESC, id DESC");
                $stmt->execute([$userId]);
                $weights = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Hamwi (1964) rule of thumb, as listed by Peterson et al. 2016 (Am J Clin Nutr): the app does not
                // know the user's sex, so the range runs from the women's value to the men's value for their height.
                [$minWeightKg, $maxWeightKg] = hamwiRangeKg($heightCm);
                $idealWeightKg = ($minWeightKg + $maxWeightKg) / 2;

                // Calculate timeline to reach upper limit of ideal range
                $timeline = null;
                if (count($weights) >= 2 && $weights[0]['weight_kg'] > $maxWeightKg) {
                    // Calculate weight loss rate from recent entries
                    $recentWeights = array_slice($weights, 0, min(8, count($weights))); // Last 8 entries or all available
                    if (count($recentWeights) >= 2) {
                        $oldestRecent = end($recentWeights);
                        $newestRecent = $recentWeights[0];
                        
                        $weightDiff = (float)$oldestRecent['weight_kg'] - (float)$newestRecent['weight_kg'];
                        $timeDiff = (strtotime($newestRecent['entry_date']) - strtotime($oldestRecent['entry_date'])) / (24 * 60 * 60); // days
                        
                        if ($timeDiff > 0 && $weightDiff > 0) {
                            $ratePerWeek = ($weightDiff / $timeDiff) * 7;
                            $remainingWeight = (float)$newestRecent['weight_kg'] - $maxWeightKg;
                            
                            if ($remainingWeight > 0) {
                                $weeksToGoal = ceil($remainingWeight / $ratePerWeek);
                                $targetDate = new DateTime($newestRecent['entry_date']);
                                $targetDate->add(new DateInterval('P' . ($weeksToGoal * 7) . 'D'));
                                
                                $timeline = [
                                    'weeks_to_goal' => $weeksToGoal,
                                    'target_date' => $targetDate->format('Y-m'),
                                    'current_rate_kg_per_week' => round($ratePerWeek, 2),
                                    'remaining_weight_kg' => round($remainingWeight, 1)
                                ];
                            }
                        }
                    }
                }
                
                echo json_encode([
                    'success' => true,
                    'ideal_weight_kg' => round($idealWeightKg, 1),
                    'min_weight_kg' => round($minWeightKg, 1),
                    'max_weight_kg' => round($maxWeightKg, 1),
                    'body_frame' => $bodyFrame,
                    'method' => 'Hamwi (women to men)',
                    'note' => 'Hamwi (1964) rule of thumb: from the value for women to the value for men of your height. A rough guide, not a health target.',
                    'timeline' => $timeline
                ]);
                return;
            }

            if ($action === 'get_weight_progress') {
                // Get user's height for BMI calculations
                $stmt = $db->prepare("SELECT height_cm FROM {$schema}.user_profiles WHERE user_id = ?");
                $stmt->execute([$userId]);
                $profile = $stmt->fetch(PDO::FETCH_ASSOC);
                $heightCm = $profile ? (int)$profile['height_cm'] : null;

                // Get all weight entries ordered by date
                $stmt = $db->prepare("SELECT weight_kg, entry_date FROM {$schema}.weight_entries WHERE user_id = ? ORDER BY entry_date ASC, id ASC");
                $stmt->execute([$userId]);
                $weights = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($weights) < 2) {
                    echo json_encode(['success' => false, 'message' => 'Need at least 2 weight entries to calculate progress']);
                    return;
                }
                
                $oldestWeight = (float)$weights[0]['weight_kg'];
                $newestWeight = (float)$weights[count($weights) - 1]['weight_kg'];
                $totalWeightLost = $oldestWeight - $newestWeight;
                
                // Rule of thumb: about three-quarters of weight lost by dieting is fat (Heymsfield et al., Obes Rev 2014,
                // who also show it varies a lot between people). A general estimate, not a measurement.
                $fatLossPercentage = 0.75;
                $estimatedFatLoss = $totalWeightLost * $fatLossPercentage;
                $estimatedMuscleWaterLoss = $totalWeightLost * (1 - $fatLossPercentage);
                
                // Calculate timeline
                $startDate = new DateTime($weights[0]['entry_date']);
                $endDate = new DateTime($weights[count($weights) - 1]['entry_date']);
                $daysDiff = $startDate->diff($endDate)->days;
                $weeksDiff = round($daysDiff / 7, 1);
                
                // Weekly rate
                $weeklyRate = $weeksDiff > 0 ? $totalWeightLost / $weeksDiff : 0;
                
                echo json_encode([
                    'success' => true,
                    'total_weight_lost_kg' => round($totalWeightLost, 1),
                    'estimated_fat_loss_kg' => round($estimatedFatLoss, 1),
                    'estimated_muscle_water_loss_kg' => round($estimatedMuscleWaterLoss, 1),
                    'fat_loss_percentage' => round($fatLossPercentage * 100),
                    'start_weight_kg' => round($oldestWeight, 2),
                    'current_weight_kg' => round($newestWeight, 2),
                    'start_date' => $weights[0]['entry_date'],
                    'current_date' => $weights[count($weights) - 1]['entry_date'],
                    'weeks_elapsed' => $weeksDiff,
                    'avg_weekly_rate_kg' => round($weeklyRate, 2),
                    'height_cm' => $heightCm,
                    'research_note' => 'A common rule of thumb is that about three-quarters of weight lost by dieting is fat; it varies a lot between people.'
                ]);
                return;
            }

            if ($action === 'get_all_dashboard_data') {
                // New consolidated endpoint that gets ALL dashboard data in one call
                // This is for testing - to compare with individual endpoint results
                $allData = [];

                // Get latest weight (like get_latest_weight)
                $stmt = $db->prepare("SELECT weight_kg, entry_date FROM {$schema}.weight_entries WHERE user_id = ? ORDER BY entry_date DESC, id DESC LIMIT 1");
                $stmt->execute([$userId]);
                $latestWeight = $stmt->fetch(PDO::FETCH_ASSOC);
                $allData['latest_weight'] = $latestWeight ?: null;

                // Get goal (like get_goal)
                $stmt = $db->prepare("SELECT target_weight_kg, target_date FROM {$schema}.goals WHERE user_id = ? AND is_active = true ORDER BY created_at DESC, id DESC LIMIT 1");
                $stmt->execute([$userId]);
                $goal = $stmt->fetch(PDO::FETCH_ASSOC);
                $allData['goal'] = $goal ?: null;

                // Get profile (like get_profile)
                $stmt = $db->prepare("SELECT user_id, height_cm, body_frame, age, activity_level FROM {$schema}.user_profiles WHERE user_id = ?");
                $stmt->execute([$userId]);
                $profile = $stmt->fetch(PDO::FETCH_ASSOC);
                $allData['profile'] = $profile ?: null;

                // Get weight history (like get_weight_history)
                $stmt = $db->prepare("SELECT id, weight_kg, entry_date, notes FROM {$schema}.weight_entries WHERE user_id = ? ORDER BY entry_date DESC, id DESC");
                $stmt->execute([$userId]);
                $weightHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $allData['weight_history'] = $weightHistory;

                // Get settings (like get_settings)
                $stmt = $db->prepare("SELECT * FROM {$schema}.user_settings WHERE user_id = ?");
                $stmt->execute([$userId]);
                $settings = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$settings) {
                    // Return default settings if none exist
                    $settings = [
                        'weight_unit' => 'kg',
                        'height_unit' => 'cm',
                        'temperature_unit' => 'c',
                        'date_format' => 'uk',
                        'time_format' => '24',
                        'timezone' => 'Europe/London',
                        'theme' => 'glassmorphism',
                        'language' => 'en',
                        'start_of_week' => 'monday',
                        'email_notifications' => false,
                        'email_day' => 'monday',
                        'email_time' => '09:00',
                        'weekly_reports' => false
                    ];
                } else {
                    // Convert string/integer booleans to actual booleans
                    unset($settings['share_data']); // retired setting: column may still exist, never sent to the page
                    $settings['email_notifications'] = $settings['email_notifications'] === '1' || $settings['email_notifications'] === 'true' || $settings['email_notifications'] === 1 || $settings['email_notifications'] === true;
                    $settings['weekly_reports'] = $settings['weekly_reports'] === '1' || $settings['weekly_reports'] === 'true' || $settings['weekly_reports'] === 1 || $settings['weekly_reports'] === true;
                }
                $allData['settings'] = $settings;

                // Add health stats (like get_health_stats)
                $allData['health_stats'] = null;
                if ($profile && isset($profile['height_cm']) && $profile['height_cm'] > 0 && $latestWeight) {
                    $heightCm = (int)$profile['height_cm'];
                    $age = isset($profile['age']) ? (int)$profile['age'] : null;
                    $frame = isset($profile['body_frame']) ? strtolower($profile['body_frame']) : 'medium';
                    $activity = isset($profile['activity_level']) ? strtolower($profile['activity_level']) : '';
                    $weightKg = (float)$latestWeight['weight_kg'];

                    $h = $heightCm / 100.0;
                    $bmi = $weightKg / ($h * $h);

                    $category = 'normal';
                    if ($bmi < 18.5) $category = 'underweight';
                    elseif ($bmi < 25) $category = 'normal';
                    elseif ($bmi < 30) $category = 'overweight';
                    else $category = 'obese';

                    // Frame-adjusted BMI (heuristic)
                    $frameFactor = 1.0;
                    if ($frame === 'small') $frameFactor = 1.03;
                    if ($frame === 'large') $frameFactor = 0.97;
                    $adjBmi = $bmi * $frameFactor;
                    $adjCategory = 'normal';
                    if ($adjBmi < 18.5) $adjCategory = 'underweight';
                    elseif ($adjBmi < 25) $adjCategory = 'normal';
                    elseif ($adjBmi < 30) $adjCategory = 'overweight';
                    else $adjCategory = 'obese';

                    // Estimated body fat percentage range using Deurenberg formula bounds
                    $bfpRange = null;
                    $bfpNotes = [];
                    if ($age !== null) {
                        $bfpMale = 1.2 * $bmi + 0.23 * $age - 16.2;   // male
                        $bfpFemale = 1.2 * $bmi + 0.23 * $age - 5.4; // female
                        $min = min($bfpMale, $bfpFemale);
                        $max = max($bfpMale, $bfpFemale);
                        $bfpRange = [round($min, 1), round($max, 1)];
                        $bfpNotes[] = 'Body fat estimated with the Deurenberg formula (BMI, age). The range runs from the result for men to the result for women.';
                    } else {
                        $bfpNotes[] = 'Add your age in profile to estimate body fat percentage.';
                    }


                    $allData['health_stats'] = [
                        'bmi' => round($bmi, 1),
                        'category' => $category,
                        'adjusted_bmi' => round($adjBmi, 1),
                        'adjusted_category' => $adjCategory,
                        'estimated_body_fat_range' => $bfpRange,
                        'body_fat_notes' => $bfpNotes,
                        'height_cm' => $heightCm,
                        'age' => $age,
                    ];
                }

                // Add ideal weight calculation (like get_ideal_weight)
                $allData['ideal_weight'] = null;
                if ($profile && isset($profile['height_cm']) && $profile['height_cm'] > 0) {
                    $heightCm = (float)$profile['height_cm'];
                    $bodyFrame = strtolower($profile['body_frame'] ?? 'medium');

                    // Hamwi (1964): from the women's to the men's value for this height (sex is not known)
                    [$minWeightKg, $maxWeightKg] = hamwiRangeKg($heightCm);
                    $idealWeightKg = ($minWeightKg + $maxWeightKg) / 2;

                    // Calculate timeline to reach upper limit of ideal range
                    $timeline = null;
                    if (count($weightHistory) >= 2 && $latestWeight && (float)$latestWeight['weight_kg'] > $maxWeightKg) {
                        // Calculate weight loss rate from recent entries
                        $recentWeights = array_slice($weightHistory, 0, min(8, count($weightHistory))); // Last 8 entries or all available
                        if (count($recentWeights) >= 2) {
                            $oldestRecent = end($recentWeights);
                            $newestRecent = $recentWeights[0];

                            $weightDiff = (float)$oldestRecent['weight_kg'] - (float)$newestRecent['weight_kg'];
                            $timeDiff = (strtotime($newestRecent['entry_date']) - strtotime($oldestRecent['entry_date'])) / (24 * 60 * 60); // days

                            if ($timeDiff > 0 && $weightDiff > 0) {
                                $ratePerWeek = ($weightDiff / $timeDiff) * 7;
                                $remainingWeight = (float)$newestRecent['weight_kg'] - $maxWeightKg;

                                if ($remainingWeight > 0) {
                                    $weeksToGoal = ceil($remainingWeight / $ratePerWeek);
                                    $targetDate = new DateTime($newestRecent['entry_date']);
                                    $targetDate->add(new DateInterval('P' . ($weeksToGoal * 7) . 'D'));

                                    $timeline = [
                                        'weeks_to_goal' => $weeksToGoal,
                                        'target_date' => $targetDate->format('Y-m'),
                                        'current_rate_kg_per_week' => round($ratePerWeek, 2),
                                        'remaining_weight_kg' => round($remainingWeight, 1)
                                    ];
                                }
                            }
                        }
                    }

                    $allData['ideal_weight'] = [
                        'success' => true,
                        'min_weight_kg' => round($minWeightKg, 1),
                        'max_weight_kg' => round($maxWeightKg, 1),
                        'ideal_weight_kg' => round($idealWeightKg, 1),
                        'body_frame' => $bodyFrame,
                        'timeline' => $timeline,
                        'note' => 'Hamwi (1964) rule of thumb: from the value for women to the value for men of your height. A rough guide, not a health target.'
                    ];
                }

                // Add weight progress calculation (like get_weight_progress)
                $allData['weight_progress'] = null;
                if (count($weightHistory) >= 2) {
                    // Reverse for chronological order (oldest first)
                    $chronological = array_reverse($weightHistory);
                    $oldestWeight = (float)$chronological[0]['weight_kg'];
                    $newestWeight = (float)$chronological[count($chronological) - 1]['weight_kg'];
                    $totalWeightLost = $oldestWeight - $newestWeight;

                    // Rule of thumb: about three-quarters of weight lost is fat (Heymsfield et al., Obes Rev 2014)
                    $fatLossPercentage = 0.75;
                    $estimatedFatLoss = $totalWeightLost * $fatLossPercentage;

                    // Calculate BMI change if height available
                    $bmiChange = null;
                    if ($profile && isset($profile['height_cm']) && $profile['height_cm'] > 0) {
                        $heightCm = (int)$profile['height_cm'];
                        $h = $heightCm / 100.0;
                        $oldestBmi = $oldestWeight / ($h * $h);
                        $newestBmi = $newestWeight / ($h * $h);
                        $bmiChange = round($oldestBmi - $newestBmi, 1);
                    }

                    // Calculate time period
                    $startDate = new DateTime($chronological[0]['entry_date']);
                    $endDate = new DateTime($chronological[count($chronological) - 1]['entry_date']);
                    $daysDiff = $startDate->diff($endDate)->days;
                    $weeksDiff = round($daysDiff / 7, 1);

                    // Calculate average weekly loss
                    $avgWeeklyLoss = $weeksDiff > 0 ? round($totalWeightLost / $weeksDiff, 2) : 0;

                    $allData['weight_progress'] = [
                        'success' => true,
                        'total_weight_lost_kg' => round($totalWeightLost, 1),
                        'start_weight_kg' => round($oldestWeight, 2),
                        'current_weight_kg' => round($newestWeight, 2),
                        'estimated_fat_loss_kg' => round($estimatedFatLoss, 1),
                        'fat_loss_percentage' => round($fatLossPercentage * 100, 1),
                        'weeks_elapsed' => round($weeksDiff, 1),
                        'avg_weekly_rate_kg' => round($avgWeeklyLoss, 2),
                        'research_note' => 'A common rule of thumb is that about three-quarters of weight lost by dieting is fat; it varies a lot between people.',
                        'oldest_weight_kg' => round($oldestWeight, 1),
                        'newest_weight_kg' => round($newestWeight, 1),
                        'start_date' => $chronological[0]['entry_date'],
                        'end_date' => $chronological[count($chronological) - 1]['entry_date'],
                        'days_tracked' => $daysDiff,
                        'weeks_tracked' => $weeksDiff,
                        'average_weekly_loss_kg' => $avgWeeklyLoss,
                        'bmi_change' => $bmiChange,
                        'total_entries' => count($weightHistory)
                    ];
                }

                // Add Quick Look metrics (Phase 1)
                $allData['quick_look_metrics'] = calculateQuickLookMetrics($userId, $db, $schema);

                // Add Goal Progress Enhanced (Phase 2)
                $allData['goal_progress_enhanced'] = calculateGoalProgressEnhanced($userId, $db, $schema);

                // Add Streak Data (Phase 3)
                $allData['streak_data'] = calculateStreakData($userId, $db, $schema);

                // Add Total Progress (Phase 4)
                $allData['total_progress'] = calculateTotalProgress($userId, $db, $schema);

                // Add Body Data entries (Smart Data, Measurements, Calipers)
                $stmt = $db->prepare("SELECT id, metric_type, value, unit, entry_date FROM {$schema}.body_data_entries WHERE user_id = ? ORDER BY entry_date DESC, id DESC");
                $stmt->execute([$userId]);
                $bodyDataEntries = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Group body data by metric type and get latest value for each
                $bodyData = [];
                $bodyDataHistory = [];
                foreach ($bodyDataEntries as $entry) {
                    $metricType = $entry['metric_type'];

                    // Store latest value (first occurrence since ordered DESC)
                    if (!isset($bodyData[$metricType])) {
                        $bodyData[$metricType] = [
                            'id' => $entry['id'],
                            'value' => $entry['value'],
                            'unit' => $entry['unit'],
                            'entry_date' => $entry['entry_date']
                        ];
                    }

                    // Store all history for each metric
                    if (!isset($bodyDataHistory[$metricType])) {
                        $bodyDataHistory[$metricType] = [];
                    }
                    $bodyDataHistory[$metricType][] = [
                        'id' => $entry['id'],
                        'value' => $entry['value'],
                        'unit' => $entry['unit'],
                        'entry_date' => $entry['entry_date']
                    ];
                }

                $allData['body_data'] = $bodyData;
                $allData['body_data_history'] = $bodyDataHistory;

                echo json_encode([
                    'success' => true,
                    'data' => $allData,
                    'message' => 'Consolidated dashboard data (testing phase)'
                ]);
                return;
            }

            if ($action === 'save_body_data') {
                // Save body data entry
                $metricType = $_POST['metric_type'] ?? null;
                $value = $_POST['value'] ?? null;
                $unit = $_POST['unit'] ?? null;
                $entryDate = $_POST['entry_date'] ?? date('Y-m-d');

                // Validate inputs
                if (!$metricType || !$value || !$unit) {
                    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
                    return;
                }

                // Pages loaded before the caliper fix (Nov 2026) saved the thigh card as caliper_tricep: that
                // one is unambiguous, so store it under its real name. Their armpit and belly cards used
                // caliper_abdomen and caliper_thigh, which now mean belly and thigh: refuse those and ask
                // for a reload, so a stale tab cannot file a reading under the wrong site.
                if ($metricType === 'caliper_tricep') {
                    $metricType = 'caliper_thigh';
                } elseif (in_array($metricType, ['caliper_abdomen', 'caliper_thigh'], true) && Security::clientVersion() < 2) {
                    // The old page shows this message as it is, so it is sent in the user's language
                    $stmt = $db->prepare("SELECT language FROM {$schema}.user_settings WHERE user_id = ?");
                    $stmt->execute([$userId]);
                    $reloadMessages = [
                        'en' => 'This page is out of date. Please reload the page, then save again.',
                        'es' => 'Esta página no está actualizada. Recarga la página y vuelve a guardar.',
                        'fr' => 'Cette page n\'est plus à jour. Rechargez la page, puis enregistrez de nouveau.',
                        'de' => 'Diese Seite ist nicht mehr aktuell. Bitte laden Sie die Seite neu und speichern Sie dann erneut.',
                    ];
                    $lang = (string)($stmt->fetchColumn() ?: 'en');
                    echo json_encode(['success' => false, 'reload' => true, 'message' => $reloadMessages[$lang] ?? $reloadMessages['en']]);
                    return;
                }

                // Only known metrics, each with its own unit
                $metricUnits = [
                    'muscle_mass' => '%', 'fat_percent' => '%', 'water_percent' => '%', 'bone_mass' => '%',
                    'measurement_neck' => 'cm', 'measurement_chest' => 'cm', 'measurement_waist' => 'cm',
                    'measurement_hips' => 'cm', 'measurement_thigh' => 'cm', 'measurement_calf' => 'cm',
                    'measurement_arm' => 'cm',
                    'caliper_chest' => 'mm', 'caliper_abdomen' => 'mm', 'caliper_thigh' => 'mm',
                    'caliper_midaxillary' => 'mm', 'caliper_suprailiac' => 'mm',
                ];
                if (!is_string($metricType) || !isset($metricUnits[$metricType]) || $unit !== $metricUnits[$metricType]) {
                    echo json_encode(['success' => false, 'message' => 'Invalid metric or unit']);
                    return;
                }
                if (!isValidEntryDate($entryDate)) {
                    echo json_encode(['success' => false, 'message' => 'Invalid date']);
                    return;
                }

                if (!is_numeric($value) || $value <= 0) {
                    echo json_encode(['success' => false, 'message' => 'Invalid value']);
                    return;
                }

                // Insert or update body data entry
                try {
                    $stmt = $db->prepare("
                        INSERT INTO {$schema}.body_data_entries (user_id, metric_type, value, unit, entry_date, created_at)
                        VALUES (?, ?, ?, ?, ?, NOW())
                        ON CONFLICT (user_id, metric_type, entry_date)
                        DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit
                    ");
                    $stmt->execute([$userId, $metricType, $value, $unit, $entryDate]);

                    echo json_encode([
                        'success' => true,
                        'message' => 'Body data saved successfully'
                    ]);
                } catch (Exception $e) {
                    error_log("save_body_data error: " . $e->getMessage());
                    echo json_encode(['success' => false, 'message' => 'Could not save. Please try again.']);
                }
                return;
            }

            if ($action === 'delete_body_data') {
                if (!isset($_POST['id'])) {
                    echo json_encode(['success' => false, 'message' => 'Entry ID required']);
                    return;
                }

                $entryId = (int)$_POST['id'];
                $stmt = $db->prepare("DELETE FROM {$schema}.body_data_entries WHERE id = ? AND user_id = ?");
                $stmt->execute([$entryId, $userId]);

                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Body data entry deleted']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Entry not found or not authorized']);
                }
                return;
            }

            echo json_encode(['success' => false, 'message' => 'Invalid action']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
    }

    /**
     * Hamwi (1964) "ideal" weight for a height, as a rule of thumb (formulas as listed in Peterson et al.,
     * Am J Clin Nutr 2016;103:1197): women 100 lb + 5 lb per inch over 5 ft, men 106 lb + 6 lb per inch.
     * Returns [women kg, men kg], rounded to 0.1 kg.
     */
    function hamwiRangeKg($heightCm) {
        $inchesOver5ft = ((float)$heightCm / 2.54) - 60;
        $womenLb = 100 + 5 * $inchesOver5ft;
        $menLb = 106 + 6 * $inchesOver5ft;
        return [round($womenLb / 2.20462, 1), round($menLb / 2.20462, 1)];
    }

    /**
     * Why a weight entry cannot be saved, or null if it can: weight 20-500 kg and a real date that is
     * no later than tomorrow anywhere on Earth: tomorrow in UTC+14 (Kiribati), the zone furthest ahead, so a
     * user's own "tomorrow" is always allowed wherever they are. (user_settings.timezone defaults to
     * Europe/London for everyone, so it can't be relied on to be where the user is.)
     */
    function weightEntryError($weightKg, $date) {
        if ($weightKg === null || !is_finite((float)$weightKg) || $weightKg < WEIGHT_MIN_KG || $weightKg > WEIGHT_MAX_KG) {
            return ['code' => 'weight_out_of_range', 'message' => 'Weight must be between ' . WEIGHT_MIN_KG . ' and ' . WEIGHT_MAX_KG . ' kg'];
        }
        if (!isValidEntryDate($date)) {
            return ['code' => 'invalid_date', 'message' => 'Invalid date'];
        }
        $latest = (new DateTime('now', new DateTimeZone('+14:00')))->modify('+1 day')->format('Y-m-d');
        if ($date > $latest) {
            return ['code' => 'date_out_of_range', 'message' => 'Date cannot be later than tomorrow'];
        }
        return null;
    }

    /**
     * Keeps a day's body fat estimate in step with that day's weights: worked out from the day's latest
     * weight (highest id, the same entry the "latest" queries pick), or removed if no weight is left.
     */
    function syncBodyFatForDate($userId, $date, $db, $schema) {
        // A failed statement aborts a Postgres transaction. Inside one (update_weight), run the sync under a
        // savepoint and roll back only to it on failure, so the weight change still commits; the estimate is
        // extra and a failure here must never undo the user's edit.
        $inTx = $db->inTransaction();
        if ($inTx) {
            $db->exec('SAVEPOINT body_fat_sync');
        }
        try {
            $stmt = $db->prepare("SELECT weight_kg FROM {$schema}.weight_entries WHERE user_id = ? AND entry_date = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$userId, $date]);
            $kg = $stmt->fetchColumn();
            if ($kg === false) {
                $db->prepare("DELETE FROM {$schema}.body_fat_entries WHERE user_id = ? AND entry_date = ?")->execute([$userId, $date]);
            } else {
                autoCalculateAndStoreBodyFat($userId, (float)$kg, $date, $db, $schema);
            }
            if ($inTx) {
                $db->exec('RELEASE SAVEPOINT body_fat_sync');
            }
        } catch (Throwable $e) {
            if ($inTx) {
                $db->exec('ROLLBACK TO SAVEPOINT body_fat_sync');
                $db->exec('RELEASE SAVEPOINT body_fat_sync');
            }
            // The weight change is kept; this day's body fat estimate may now be out of date (stale).
            // Counted for /status (BodyFatSyncLog: times only).
            error_log("Body fat sync FAILED for user {$userId} on {$date}: the weight was saved but that day's body fat estimate may be out of date. "
                . get_class($e) . ': ' . $e->getMessage());
            require_once('/var/app/backend/BodyFatSyncLog.php');
            BodyFatSyncLog::record();
        }
    }

    /**
     * Why a goal's target date cannot be saved, or null if it can: a real date in YYYY-MM-DD form, no earlier
     * than today anywhere on Earth (today in UTC-12, the zone furthest behind, so a user's own "today" is always
     * allowed) and no later than GOAL_DATE_MAX_YEARS from today in UTC+14.
     */
    function goalDateError($date) {
        if (!is_string($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return ['code' => 'invalid_date', 'message' => 'Invalid date'];
        }
        $d = DateTime::createFromFormat('!Y-m-d', $date);
        if (!$d || $d->format('Y-m-d') !== $date) {
            return ['code' => 'invalid_date', 'message' => 'Invalid date'];
        }
        $earliest = (new DateTime('now', new DateTimeZone('-12:00')))->format('Y-m-d');
        $latest = (new DateTime('now', new DateTimeZone('+14:00')))->modify('+' . GOAL_DATE_MAX_YEARS . ' years')->format('Y-m-d');
        if ($date < $earliest || $date > $latest) {
            return ['code' => 'goal_date_out_of_range', 'message' => 'The goal date must be between today and ' . GOAL_DATE_MAX_YEARS . ' years from now'];
        }
        return null;
    }

    /** A real calendar date in YYYY-MM-DD form, between 1900 and one year from today. */
    function isValidEntryDate($date) {
        if (!is_string($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return false;
        }
        $d = DateTime::createFromFormat('!Y-m-d', $date);
        if (!$d || $d->format('Y-m-d') !== $date) {
            return false;
        }
        return $date >= '1900-01-01' && $date <= date('Y-m-d', strtotime('+1 year'));
    }

    // ==================== Quick Look Helper Functions (Phase 1) ====================

    /**
     * Calculate Quick Look metrics for dashboard
     * @param int $userId - User ID
     * @param PDO $db - Database connection
     * @param string $schema - Schema name
     * @return array Metrics array
     */
    function calculateQuickLookMetrics($userId, $db, $schema) {
        COVERAGE_LOG('calculateQuickLookMetrics', 'ProfileController', __FILE__, __LINE__);

        try {
            // Get user's weight history (last 90 days for frequency calculation)
            $stmt = $db->prepare("
                SELECT entry_date, weight_kg
                FROM {$schema}.weight_entries
                WHERE user_id = ?
                AND entry_date >= CURRENT_DATE - INTERVAL '90 days'
                ORDER BY entry_date DESC, id DESC
            ");
            $stmt->execute([$userId]);
            $weights = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get user's goal
            $stmt = $db->prepare("
                SELECT target_weight_kg, target_date
                FROM {$schema}.goals
                WHERE user_id = ?
                AND is_active = true
                ORDER BY created_at DESC
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Calculate metrics
            $loggingFrequency = calculateLoggingFrequency($weights);
            $goalProgress = calculateGoalProgress($weights, $user);
            $consistencyScore = ($loggingFrequency * 0.5) + ($goalProgress * 0.5);

            $nextCheckin = predictNextCheckin($weights);

            return [
                'consistency_score' => round($consistencyScore, 1),
                'logging_frequency' => $loggingFrequency,
                'goal_progress' => $goalProgress,
                'next_checkin_date' => $nextCheckin['date'],
                'days_until_checkin' => $nextCheckin['days_until'],
                'average_logging_interval' => $nextCheckin['avg_interval']
            ];

        } catch (Exception $e) {
            error_log("Quick look metrics error: " . $e->getMessage());
            return [
                'consistency_score' => null,
                'logging_frequency' => 0,
                'goal_progress' => 0,
                'next_checkin_date' => null,
                'days_until_checkin' => null,
                'average_logging_interval' => null
            ];
        }
    }

    /**
     * Calculate logging frequency score (0-100)
     * @param array $weights - Weight entries
     * @return float Score
     */
    function calculateLoggingFrequency($weights) {
        if (count($weights) < 2) {
            return 0;
        }

        // Calculate average interval between logs
        $intervals = [];
        for ($i = 0; $i < count($weights) - 1; $i++) {
            $date1 = new DateTime($weights[$i]['entry_date']);
            $date2 = new DateTime($weights[$i + 1]['entry_date']);
            $diff = $date1->diff($date2)->days;
            $intervals[] = $diff;
        }

        $avgInterval = array_sum($intervals) / count($intervals);

        // Score calculation (weekly logging = 100%, monthly = 50%, etc.)
        if ($avgInterval <= 7) {
            return 100; // Weekly or more frequent
        } elseif ($avgInterval <= 14) {
            return 80; // Bi-weekly
        } elseif ($avgInterval <= 30) {
            return 60; // Monthly
        } else {
            return 40; // Less frequent
        }
    }

    /**
     * Calculate goal progress score (0-100)
     * @param array $weights - Weight entries
     * @param array $user - User data with goal
     * @return float Score
     */
    function calculateGoalProgress($weights, $user) {
        if (empty($weights) || !isset($user['target_weight_kg']) || $user['target_weight_kg'] === null) {
            return 0;
        }

        // Get starting weight and current weight
        $currentWeight = floatval($weights[0]['weight_kg']);
        $startWeight = floatval($weights[count($weights) - 1]['weight_kg']);
        $targetWeight = floatval($user['target_weight_kg']);

        // Assuming weight loss goal (most common)
        $totalToLose = $startWeight - $targetWeight;
        if ($totalToLose <= 0) {
            return 100; // Already at or below target
        }

        $lostSoFar = $startWeight - $currentWeight;
        $progressPercent = ($lostSoFar / $totalToLose) * 100;

        return max(0, min(100, $progressPercent)); // Clamp 0-100
    }

    /**
     * Predict next check-in date based on logging pattern
     * @param array $weights - Weight entries
     * @return array ['date' => 'YYYY-MM-DD', 'days_until' => int, 'avg_interval' => float]
     */
    function predictNextCheckin($weights) {
        if (count($weights) < 2) {
            return ['date' => null, 'days_until' => null, 'avg_interval' => null];
        }

        // Calculate average interval
        $intervals = [];
        for ($i = 0; $i < min(5, count($weights) - 1); $i++) { // Use last 5 intervals
            $date1 = new DateTime($weights[$i]['entry_date']);
            $date2 = new DateTime($weights[$i + 1]['entry_date']);
            $diff = $date1->diff($date2)->days;
            $intervals[] = $diff;
        }

        $avgInterval = round(array_sum($intervals) / count($intervals));

        // Predict next date
        $lastDate = new DateTime($weights[0]['entry_date']);
        $nextDate = clone $lastDate;
        $nextDate->add(new DateInterval("P{$avgInterval}D"));

        // Days until
        $today = new DateTime();
        $daysUntil = $today->diff($nextDate)->days;
        if ($nextDate < $today) {
            $daysUntil = -$daysUntil; // Overdue (negative)
        }

        return [
            'date' => $nextDate->format('Y-m-d'),
            'days_until' => $daysUntil,
            'avg_interval' => $avgInterval
        ];
    }

    // ==================== End Quick Look Helper Functions ====================

    // ==================== Goals Achieved Helper Functions (Phase 2) ====================

    /**
     * Calculate enhanced goal progress metrics
     * @param int $userId - User ID
     * @param PDO $db - Database connection
     * @param string $schema - Schema name
     * @return array|null Progress data or null if no goal set
     */
    function calculateGoalProgressEnhanced($userId, $db, $schema) {
        COVERAGE_LOG('calculateGoalProgressEnhanced', 'ProfileController', __FILE__, __LINE__);

        try {
            // Get user's goal
            $stmt = $db->prepare("
                SELECT target_weight_kg, target_date
                FROM {$schema}.goals
                WHERE user_id = ?
                AND is_active = true
                ORDER BY created_at DESC
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || $user['target_weight_kg'] === null) {
                return null; // No goal set
            }

            // Get weight history
            $stmt = $db->prepare("
                SELECT entry_date, weight_kg
                FROM {$schema}.weight_entries
                WHERE user_id = ?
                ORDER BY entry_date DESC, id DESC
            ");
            $stmt->execute([$userId]);
            $weights = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($weights)) {
                return null; // No weight data
            }

            $currentWeight = floatval($weights[0]['weight_kg']);
            $startWeight = floatval($weights[count($weights) - 1]['weight_kg']);
            $targetWeight = floatval($user['target_weight_kg']);

            // Calculate progress percentage
            $totalToLose = $startWeight - $targetWeight;
            $lostSoFar = $startWeight - $currentWeight;
            $progressPercent = ($totalToLose > 0) ? ($lostSoFar / $totalToLose * 100) : 0;

            // Calculate weekly/monthly progress toward goal
            $weeklyProgress = calculateRecentProgressRate($weights, 7, $startWeight, $targetWeight);
            $monthlyProgress = calculateRecentProgressRate($weights, 30, $startWeight, $targetWeight);

            // Calculate ETA
            $eta = calculateGoalETA($weights, $currentWeight, $targetWeight);

            return [
                'current_weight' => $currentWeight,
                'start_weight' => $startWeight,
                'target_weight' => $targetWeight,
                'progress_percent' => round($progressPercent, 1),
                'weight_lost' => round($lostSoFar, 2),
                'weekly_progress' => $weeklyProgress,
                'monthly_progress' => $monthlyProgress,
                'eta_date' => $eta['date'],
                'weekly_loss_rate' => $eta['weekly_rate']
            ];

        } catch (Exception $e) {
            error_log("Goal progress calculation error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate progress rate over recent period toward goal
     * @param array $weights - Weight entries array
     * @param int $days - Period in days
     * @param float $startWeight - Starting weight (first entry)
     * @param float $targetWeight - Target goal weight
     * @return float Progress percentage toward goal
     */
    function calculateRecentProgressRate($weights, $days, $startWeight, $targetWeight) {
        COVERAGE_LOG('calculateRecentProgressRate', 'ProfileController', __FILE__, __LINE__);

        $cutoffDate = date('Y-m-d', strtotime("-{$days} days"));

        $recentWeights = array_filter($weights, function($w) use ($cutoffDate) {
            return $w['entry_date'] >= $cutoffDate;
        });

        if (count($recentWeights) < 2) {
            return 0;
        }

        $recentWeights = array_values($recentWeights);
        $periodStartWeight = floatval($recentWeights[count($recentWeights) - 1]['weight_kg']);
        $periodEndWeight = floatval($recentWeights[0]['weight_kg']);

        $lostInPeriod = $periodStartWeight - $periodEndWeight;

        // Calculate as percentage of total goal (not percentage of body weight)
        $totalToLose = $startWeight - $targetWeight;
        $percentTowardGoal = ($totalToLose > 0) ? ($lostInPeriod / $totalToLose * 100) : 0;

        return round($percentTowardGoal, 2);
    }

    /**
     * Calculate estimated goal achievement date
     * @param array $weights - Weight entries array
     * @param float $currentWeight - Current weight in kg
     * @param float $targetWeight - Target weight in kg
     * @return array ['date' => 'YYYY-MM-DD', 'weekly_rate' => float]
     */
    function calculateGoalETA($weights, $currentWeight, $targetWeight) {
        COVERAGE_LOG('calculateGoalETA', 'ProfileController', __FILE__, __LINE__);

        if (count($weights) < 3) {
            return ['date' => null, 'weekly_rate' => 0];
        }

        // Calculate average weekly loss over last 8 weeks
        $eightWeeksAgo = date('Y-m-d', strtotime('-56 days'));
        $recentWeights = array_filter($weights, function($w) use ($eightWeeksAgo) {
            return $w['entry_date'] >= $eightWeeksAgo;
        });

        if (count($recentWeights) < 2) {
            return ['date' => null, 'weekly_rate' => 0];
        }

        $recentWeights = array_values($recentWeights);
        $oldestRecent = floatval($recentWeights[count($recentWeights) - 1]['weight_kg']);
        $newestRecent = floatval($recentWeights[0]['weight_kg']);

        $oldestDate = new DateTime($recentWeights[count($recentWeights) - 1]['entry_date']);
        $newestDate = new DateTime($recentWeights[0]['entry_date']);
        $weeksPassed = $oldestDate->diff($newestDate)->days / 7;

        if ($weeksPassed == 0) {
            return ['date' => null, 'weekly_rate' => 0];
        }

        $totalLoss = $oldestRecent - $newestRecent;
        $weeklyLossRate = $totalLoss / $weeksPassed;

        if ($weeklyLossRate <= 0) {
            return ['date' => null, 'weekly_rate' => 0];
        }

        // Calculate weeks to goal
        $remainingToLose = $currentWeight - $targetWeight;
        $weeksToGoal = $remainingToLose / $weeklyLossRate;

        $etaDate = new DateTime();
        $etaDate->add(new DateInterval('P' . ceil($weeksToGoal * 7) . 'D'));

        return [
            'date' => $etaDate->format('Y-m-d'),
            'weekly_rate' => round($weeklyLossRate, 2)
        ];
    }

    // ==================== End Goals Achieved Helper Functions ====================

    // ==================== PHASE 3: STREAK COUNTER HELPER FUNCTIONS ====================

    /**
     * Calculate comprehensive streak data for dashboard
     * @param int $userId - User ID
     * @param PDO $db - Database connection
     * @param string $schema - Schema name
     * @return array Streak data including current/longest streak, missed weeks, timeline
     */
    function calculateStreakData($userId, $db, $schema) {
        COVERAGE_LOG('calculateStreakData', 'ProfileController', __FILE__, __LINE__);

        try {
            // Get weight entries for last 90 days (to calculate streaks)
            $stmt = $db->prepare("
                SELECT entry_date
                FROM {$schema}.weight_entries
                WHERE user_id = ?
                AND entry_date >= CURRENT_DATE - INTERVAL '90 days'
                ORDER BY entry_date DESC, id DESC
            ");
            $stmt->execute([$userId]);
            $entries = $stmt->fetchAll(PDO::FETCH_COLUMN);

            if (count($entries) < 2) {
                // Not enough data for streak calculation
                return null;
            }

            // Calculate streaks
            $currentStreak = calculateCurrentStreak($entries);
            $longestStreak = calculateLongestStreak($entries);
            $missedWeeksThisMonth = calculateMissedWeeksThisMonth($entries);

            // Generate 30-day timeline
            $timeline = generateStreakTimeline($entries);

            return [
                'current_streak' => $currentStreak,
                'longest_streak' => $longestStreak,
                'missed_weeks_this_month' => $missedWeeksThisMonth,
                'timeline' => $timeline
            ];

        } catch (Exception $e) {
            error_log("Streak data calculation error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate current weekly logging streak
     * @param array $entries - Array of entry dates (DESC order)
     * @return int Current streak in weeks
     */
    function calculateCurrentStreak($entries) {
        COVERAGE_LOG('calculateCurrentStreak', 'ProfileController', __FILE__, __LINE__);

        if (empty($entries)) {
            return 0;
        }

        $today = new DateTime();
        $currentWeekStart = (clone $today)->modify('monday this week');
        $streak = 0;

        // Group entries by week with last entry date
        $weeklyEntries = [];
        foreach ($entries as $dateStr) {
            $date = new DateTime($dateStr);
            $weekStart = (clone $date)->modify('monday this week')->format('Y-m-d');
            if (!isset($weeklyEntries[$weekStart]) || $dateStr > $weeklyEntries[$weekStart]) {
                $weeklyEntries[$weekStart] = $dateStr;
            }
        }

        // Determine starting point for streak counting
        // If current week has no entry, check if we're still within 7 days of last entry
        $checkWeek = clone $currentWeekStart;
        if (!isset($weeklyEntries[$checkWeek->format('Y-m-d')])) {
            // No entry this week - check if last entry was within 7 days
            if (!empty($entries)) {
                $lastEntryDate = new DateTime($entries[0]); // entries are DESC order
                $daysSinceLastEntry = $today->diff($lastEntryDate)->days;

                // If last entry was within 7 days, start counting from last week
                if ($daysSinceLastEntry <= 7) {
                    $checkWeek->modify('-1 week');
                }
            }
        }

        // Count consecutive weeks backwards from starting week
        while (true) {
            $weekKey = $checkWeek->format('Y-m-d');

            if (isset($weeklyEntries[$weekKey])) {
                $streak++;
                $checkWeek->modify('-1 week');
            } else {
                break;
            }

            // Safety: don't go back more than 52 weeks
            if ($streak >= 52) {
                break;
            }
        }

        return $streak;
    }

    /**
     * Calculate longest weekly logging streak ever
     * @param array $entries - Array of entry dates (DESC order)
     * @return int Longest streak in weeks
     */
    function calculateLongestStreak($entries) {
        COVERAGE_LOG('calculateLongestStreak', 'ProfileController', __FILE__, __LINE__);

        if (empty($entries)) {
            return 0;
        }

        // Group entries by week
        $weeklyEntries = [];
        foreach ($entries as $dateStr) {
            $date = new DateTime($dateStr);
            $weekStart = (clone $date)->modify('monday this week')->format('Y-m-d');
            $weeklyEntries[$weekStart] = true;
        }

        // Sort weeks chronologically
        $weeks = array_keys($weeklyEntries);
        sort($weeks);

        $longestStreak = 0;
        $currentStreak = 1;

        for ($i = 1; $i < count($weeks); $i++) {
            $prevWeek = new DateTime($weeks[$i - 1]);
            $thisWeek = new DateTime($weeks[$i]);

            $daysDiff = $prevWeek->diff($thisWeek)->days;

            if ($daysDiff <= 7) {
                // Consecutive weeks
                $currentStreak++;
            } else {
                // Gap found, reset streak
                $longestStreak = max($longestStreak, $currentStreak);
                $currentStreak = 1;
            }
        }

        $longestStreak = max($longestStreak, $currentStreak);

        return $longestStreak;
    }

    /**
     * Calculate number of weeks missed in last 28 days (4 weeks)
     * @param array $entries - Array of entry dates (DESC order)
     * @return int Number of weeks missed in last 28 days
     */
    function calculateMissedWeeksThisMonth($entries) {
        COVERAGE_LOG('calculateMissedWeeksThisMonth', 'ProfileController', __FILE__, __LINE__);

        $today = new DateTime();
        $twentyEightDaysAgo = (clone $today)->modify('-28 days');

        // Create lookup set for faster checking
        $entryDates = array_flip($entries);

        // Generate 28 days and group by week
        $weekGroups = [];
        for ($i = 27; $i >= 0; $i--) {
            $date = (clone $today)->modify("-{$i} days");

            // Skip if before 28 days ago
            if ($date < $twentyEightDaysAgo) continue;

            $dateStr = $date->format('Y-m-d');
            $weekStart = (clone $date)->modify('monday this week')->format('Y-m-d');

            // Initialize week if not exists
            if (!isset($weekGroups[$weekStart])) {
                $weekGroups[$weekStart] = ['has_entry' => false, 'days' => []];
            }

            // Mark if this day has an entry
            $hasEntry = isset($entryDates[$dateStr]);
            if ($hasEntry) {
                $weekGroups[$weekStart]['has_entry'] = true;
            }

            $weekGroups[$weekStart]['days'][] = $dateStr;
        }

        // Count weeks with NO entries at all (completely missed weeks)
        $missedWeeks = 0;
        foreach ($weekGroups as $weekData) {
            if (!$weekData['has_entry']) {
                $missedWeeks++;
            }
        }

        return $missedWeeks;
    }

    /**
     * Generate 28-day visual timeline data (4 weeks)
     * @param array $entries - Array of entry dates (DESC order)
     * @return array Array of 28 day objects: {date, logged, is_today}
     */
    function generateStreakTimeline($entries) {
        COVERAGE_LOG('generateStreakTimeline', 'ProfileController', __FILE__, __LINE__);

        $timeline = [];
        $today = new DateTime();

        // Create lookup set for faster checking
        $entryDates = array_flip($entries);

        // Generate 28 days backwards from today (4 weeks)
        for ($i = 27; $i >= 0; $i--) {
            $date = (clone $today)->modify("-{$i} days");
            $dateStr = $date->format('Y-m-d');

            $timeline[] = [
                'date' => $dateStr,
                'logged' => isset($entryDates[$dateStr]),
                'is_today' => ($i === 0)
            ];
        }

        return $timeline;
    }

    // ==================== End Streak Counter Helper Functions ====================

    function EmailController() {
        COVERAGE_LOG('EmailController', 'Router', __FILE__, __LINE__);
        header('Content-Type: application/json');
        
        $request = $_POST;
        if (!isset($request['action'])) {
            $raw = file_get_contents('php://input');
            if ($raw) {
                $json = json_decode($raw, true);
                if (is_array($json)) { $request = array_merge($request, $json); }
            }
        }
        
        $action = $request['action'] ?? '';
        
        try {
            if ($action === 'get_sandbox_status') {
                $sandboxMode = $_ENV['EMAIL_SANDBOX_MODE'] ?? 'false';
                echo json_encode([
                    'success' => true,
                    'sandbox_enabled' => strtolower($sandboxMode) === 'true' || $sandboxMode === '1'
                ]);
                return;
            }
            
            if ($action === 'set_sandbox_mode') {
                $enabled = $request['enabled'] ?? false;
                
                // Update the .env file
                $envFile = '/var/app/.env';
                $envContent = file_exists($envFile) ? file_get_contents($envFile) : '';
                
                $newValue = $enabled ? 'true' : 'false';
                
                if (strpos($envContent, 'EMAIL_SANDBOX_MODE=') !== false) {
                    // Update existing line
                    $envContent = preg_replace('/EMAIL_SANDBOX_MODE=.*/m', "EMAIL_SANDBOX_MODE=$newValue", $envContent);
                } else {
                    // Add new line
                    $envContent .= "\nEMAIL_SANDBOX_MODE=$newValue\n";
                }
                
                file_put_contents($envFile, $envContent);
                $_ENV['EMAIL_SANDBOX_MODE'] = $newValue;
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Sandbox mode ' . ($enabled ? 'enabled' : 'disabled'),
                    'sandbox_enabled' => $enabled
                ]);
                return;
            }
            
            if ($action === 'clear_rate_limits') {
                // Test only (APP_ENV=test): clear throttle state for one email or everything
                $email = $request['email'] ?? null;
                if ($email) {
                    $email = strtolower(trim($email));
                    foreach (['send:login_code', 'send:signup_code', 'send_block:login_code', 'send_block:signup_code', 'verify_lock'] as $kind) {
                        Security::throttleClear($kind, $email);
                    }
                    echo json_encode(['success' => true, 'message' => 'Rate limits cleared for email']);
                } else {
                    Security::throttleClearAll();
                    echo json_encode(['success' => true, 'message' => 'All rate limits cleared']);
                }
                return;
            }

            if ($action === 'get_rate_limits') {
                // Test only (APP_ENV=test): send counts for one email in the last minute
                $email = strtolower(trim($request['email'] ?? ''));
                echo json_encode([
                    'success' => true,
                    'rate_limits' => $email === '' ? [] : [
                        'login_code_last_minute' => Security::throttleCount('send:login_code', $email, 60),
                        'signup_code_last_minute' => Security::throttleCount('send:signup_code', $email, 60),
                    ]
                ]);
                return;
            }

            if ($action === 'test_notifications') {
                // TEST ONLY: Trigger notification scheduler with time override
                require_once '/var/app/backend/NotificationScheduler.php';

                $currentDay = $request['current_day'] ?? null;
                $currentTime = $request['current_time'] ?? null;
                $userId = $request['user_id'] ?? null;

                // Use test mode to suppress console output
                $scheduler = new NotificationScheduler(true, null);
                $result = $scheduler->processNotifications($currentDay, $currentTime, $userId);

                echo json_encode([
                    'success' => true,
                    'message' => 'Notification processing completed',
                    'result' => $result
                ]);
                return;
            }

            echo json_encode(['success' => false, 'message' => 'Invalid action']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
    }

    function CoverageController() {
        COVERAGE_LOG('CoverageController', 'Router', __FILE__, __LINE__);
        require_once '/var/app/backend/CoverageLogger.php';
        
        header('Content-Type: application/json');
        
        // Only allow in development environment
        if (!Security::isTestEnv()) {
            echo json_encode(['success' => false, 'message' => 'Coverage API not available']);
            return;
        }
        
        $action = $_POST['action'] ?? $_GET['action'] ?? '';
        
        try {
            if ($action === 'get_report') {
                $coverageLogger = CoverageLogger::getInstance();
                $report = $coverageLogger->getReport();
                
                echo json_encode([
                    'success' => true,
                    'coverage' => $report
                ]);
                return;
            }
            
            if ($action === 'clear') {
                // Clear coverage data for fresh test runs
                $coverageLogger = CoverageLogger::getInstance();
                $coverageLogger->clearCoverage();
                echo json_encode([
                    'success' => true,
                    'message' => 'Coverage data cleared'
                ]);
                return;
            }
            
            echo json_encode(['success' => false, 'message' => 'Invalid coverage action']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Coverage error: ' . $e->getMessage()]);
        }
    }

    function SeederTesterController() {
        COVERAGE_LOG('SeederTesterController', 'Router', __FILE__, __LINE__);
        require_once '/var/app/backend/DatabaseSeederTester.php';

        header('Content-Type: application/json');
        echo json_encode(DatabaseSeederTester::handleRequest());
    }

    // ==================== PHASE 4: TOTAL PROGRESS HELPER FUNCTIONS ====================

    /**
     * Calculate comprehensive total progress data
     * @param int $userId
     * @param PDO $db
     * @param string $schema
     * @return array|null Progress data with charts
     */
    function calculateTotalProgress($userId, $db, $schema) {
        COVERAGE_LOG('calculateTotalProgress', 'Router', __FILE__, __LINE__);

        try {
            // Get weight history
            $stmt = $db->prepare("
                SELECT entry_date, weight_kg
                FROM {$schema}.weight_entries
                WHERE user_id = ?
                ORDER BY entry_date ASC, id ASC
            ");
            $stmt->execute([$userId]);
            $weights = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get user data (goal, height, age)
            $stmt = $db->prepare("
                SELECT g.target_weight_kg, up.height_cm, up.age
                FROM {$schema}.user_profiles up
                LEFT JOIN {$schema}.goals g ON g.user_id = up.user_id AND g.is_active = true
                WHERE up.user_id = ?
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Calculate body fat for each weight entry using Deurenberg formula
            $bodyFatData = [];
            if (isset($user['height_cm']) && isset($user['age']) && count($weights) > 0) {
                $heightM = floatval($user['height_cm']) / 100.0;
                $age = intval($user['age']);

                foreach ($weights as $weight) {
                    $weightKg = floatval($weight['weight_kg']);
                    $bmi = $weightKg / ($heightM * $heightM);

                    // Deurenberg formula - use average of male/female
                    $bfpMale = 1.2 * $bmi + 0.23 * $age - 16.2;
                    $bfpFemale = 1.2 * $bmi + 0.23 * $age - 5.4;
                    $bodyFatPercent = ($bfpMale + $bfpFemale) / 2.0;

                    $bodyFatData[] = [
                        'entry_date' => $weight['entry_date'],
                        'body_fat_percent' => round($bodyFatPercent, 1)
                    ];
                }
            }

            // Calculate metrics
            $weeklyLossData = calculateWeeklyLossData($weights);
            $projectionData = calculateProjectionData($weights);
            $goalData = calculateGoalChartData($weights, $user);
            $idealWeightData = calculateIdealWeightData($weights, $user);
            $totalLostKg = count($weights) > 0 ? (floatval($weights[0]['weight_kg']) - floatval($weights[count($weights) - 1]['weight_kg'])) : 0;

            return [
                'weekly_loss_data' => $weeklyLossData,
                'projection_data' => $projectionData,
                'goal_data' => $goalData,
                'ideal_weight_data' => $idealWeightData,
                'body_fat_data' => $bodyFatData,
                'total_lost_kg' => $totalLostKg
            ];

        } catch (Exception $e) {
            error_log("Total progress calculation error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate weekly loss data for chart
     * Returns last 26 weeks, filling gaps with 0 loss
     */
    function calculateWeeklyLossData($weights) {
        if (count($weights) < 1) return [];

        // Get the last 26 weeks from today
        $today = new DateTime();
        $weeksToShow = [];

        for ($i = 25; $i >= 0; $i--) {
            $date = clone $today;
            $date->modify("-$i weeks");
            $weekNum = (int)$date->format('W');
            $year = $date->format('Y');
            $weekKey = $year . '-W' . sprintf('%02d', $weekNum);

            $weeksToShow[$weekKey] = [
                'week_num' => $weekNum,
                'year' => $year,
                'week_key' => $weekKey,
                'avg_weight' => null
            ];
        }

        // Group weights by ISO week number
        foreach ($weights as $entry) {
            $date = new DateTime($entry['entry_date']);
            $weekNum = (int)$date->format('W');
            $year = $date->format('Y');
            $weekKey = $year . '-W' . sprintf('%02d', $weekNum);

            // Only include if it's in our 26-week range
            if (isset($weeksToShow[$weekKey])) {
                if (!isset($weeksToShow[$weekKey]['weights'])) {
                    $weeksToShow[$weekKey]['weights'] = [];
                }
                $weeksToShow[$weekKey]['weights'][] = floatval($entry['weight_kg']);
            }
        }

        // Calculate average weight per week
        foreach ($weeksToShow as $weekKey => &$weekData) {
            if (isset($weekData['weights']) && count($weekData['weights']) > 0) {
                $weekData['avg_weight'] = array_sum($weekData['weights']) / count($weekData['weights']);
                unset($weekData['weights']);
            }
        }

        // Sort by week chronologically
        ksort($weeksToShow);
        $weeksToShow = array_values($weeksToShow);

        // Calculate week-to-week loss, filling gaps with 0
        $weeklyData = [];
        $lastKnownWeight = null;

        for ($i = 0; $i < count($weeksToShow); $i++) {
            $currWeek = $weeksToShow[$i];

            if ($currWeek['avg_weight'] !== null) {
                // We have data for this week
                if ($lastKnownWeight !== null) {
                    $loss = $lastKnownWeight - $currWeek['avg_weight'];
                    $weeklyData[] = [
                        'week' => $currWeek['week_num'],
                        'year' => $currWeek['year'],
                        'avg_loss' => round($loss, 2)
                    ];
                } else {
                    // First week with data - no loss to show yet
                    $weeklyData[] = [
                        'week' => $currWeek['week_num'],
                        'year' => $currWeek['year'],
                        'avg_loss' => 0
                    ];
                }
                $lastKnownWeight = $currWeek['avg_weight'];
            } else {
                // No data for this week - show 0 loss
                $weeklyData[] = [
                    'week' => $currWeek['week_num'],
                    'year' => $currWeek['year'],
                    'avg_loss' => 0
                ];
            }
        }

        return $weeklyData;
    }

    /**
     * Calculate 6-month projection data
     */
    function calculateProjectionData($weights) {
        if (count($weights) < 3) {
            return ['historical' => ['labels' => [], 'data' => []], 'projected' => ['labels' => [], 'data' => []]];
        }

        // Simple linear regression
        $n = count($weights);
        $sumX = 0;
        $sumY = 0;
        $sumXY = 0;
        $sumX2 = 0;

        foreach ($weights as $i => $entry) {
            $x = $i;
            $y = floatval($entry['weight_kg']);
            $sumX += $x;
            $sumY += $y;
            $sumXY += $x * $y;
            $sumX2 += $x * $x;
        }

        $slope = ($n * $sumXY - $sumX * $sumY) / ($n * $sumX2 - $sumX * $sumX);
        $intercept = ($sumY - $slope * $sumX) / $n;

        // Historical data
        $historicalLabels = [];
        $historicalData = [];
        foreach ($weights as $entry) {
            $historicalLabels[] = date('M j', strtotime($entry['entry_date']));
            $historicalData[] = round(floatval($entry['weight_kg']), 1);
        }

        // Projected data (6 months = ~26 weeks)
        $projectedLabels = [];
        $projectedData = [];
        $lastWeight = floatval($weights[$n - 1]['weight_kg']);
        $lastDate = strtotime($weights[$n - 1]['entry_date']);

        for ($week = 1; $week <= 26; $week++) {
            $futureDate = $lastDate + ($week * 7 * 24 * 60 * 60);
            $projectedLabels[] = date('M j', $futureDate);
            $projectedWeight = $slope * ($n + $week - 1) + $intercept;
            $projectedData[] = round(max($projectedWeight, 40), 1); // Don't project below 40kg
        }

        return [
            'historical' => ['labels' => $historicalLabels, 'data' => $historicalData],
            'projected' => ['labels' => $projectedLabels, 'data' => $projectedData]
        ];
    }

    /**
     * Calculate goal completion chart data
     */
    function calculateGoalChartData($weights, $user) {
        if (count($weights) === 0 || !isset($user['target_weight_kg'])) {
            return null;
        }

        $startWeight = floatval($weights[0]['weight_kg']);
        $currentWeight = floatval($weights[count($weights) - 1]['weight_kg']);
        $targetWeight = floatval($user['target_weight_kg']);

        $totalToLose = $startWeight - $targetWeight;
        $lostSoFar = $startWeight - $currentWeight;
        $remaining = max(0, $totalToLose - $lostSoFar);

        return [
            'completed_kg' => round($lostSoFar, 1),
            'remaining_kg' => round($remaining, 1),
            'total_kg' => round($totalToLose, 1)
        ];
    }

    /**
     * Calculate ideal weight progress
     */
    function calculateIdealWeightData($weights, $user) {
        if (count($weights) === 0 || !isset($user['height_cm'])) {
            return null;
        }

        $startWeight = floatval($weights[0]['weight_kg']);
        $currentWeight = floatval($weights[count($weights) - 1]['weight_kg']);
        $heightM = floatval($user['height_cm']) / 100.0;

        // Ideal BMI range 18.5-24.9, use max as target
        $idealMaxWeight = 24.9 * ($heightM * $heightM);
        $idealMinWeight = 18.5 * ($heightM * $heightM);

        // If already in range
        if ($currentWeight <= $idealMaxWeight && $currentWeight >= $idealMinWeight) {
            $totalLost = $startWeight - $currentWeight;
            return ['in_range' => true, 'achieved_kg' => round($totalLost, 1), 'remaining_kg' => 0];
        }

        // Calculate progress towards ideal range
        $totalToLose = max(0, $startWeight - $idealMaxWeight);
        $lostSoFar = $startWeight - $currentWeight;
        $remaining = max(0, $currentWeight - $idealMaxWeight);

        return [
            'in_range' => false,
            'achieved_kg' => round($lostSoFar, 1),
            'remaining_kg' => round($remaining, 1)
        ];
    }

    /**
     * Log body fat percentage
     * @param int $userId
     * @param float $bodyFat
     * @param PDO $db
     * @param string $schema
     * @return bool Success
     */
    function logBodyFat($userId, $bodyFat, $db, $schema) {
        try {
            $stmt = $db->prepare("
                INSERT INTO {$schema}.body_fat_entries (user_id, body_fat_percent, entry_date)
                VALUES (?, ?, CURRENT_DATE)
                ON CONFLICT (user_id, entry_date)
                DO UPDATE SET body_fat_percent = ?
            ");
            $stmt->execute([$userId, $bodyFat, $bodyFat]);

            return true;

        } catch (Exception $e) {
            error_log("Body fat logging error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Automatically calculate and store body fat % using Deurenberg formula
     * Called when weight is added
     * @param int $userId
     * @param float $weightKg
     * @param string $date
     * @param PDO $db
     * @param string $schema
     */
    function autoCalculateAndStoreBodyFat($userId, $weightKg, $date, $db, $schema) {
        // Errors go to syncBodyFatForDate (the only caller), which logs them and, inside a transaction, rolls
        // back to its savepoint so the weight entry is not lost.
        // Get user height and age
        $stmt = $db->prepare("SELECT height_cm, age FROM {$schema}.user_profiles WHERE user_id = ?");
        $stmt->execute([$userId]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$profile || !$profile['height_cm'] || !$profile['age']) {
            // Can't calculate without height and age
            return;
        }

        $heightCm = floatval($profile['height_cm']);
        $age = intval($profile['age']);

        // Calculate BMI
        $heightM = $heightCm / 100.0;
        $bmi = $weightKg / ($heightM * $heightM);

        // Deurenberg formula - use average of male/female estimates
        $bfpMale = 1.2 * $bmi + 0.23 * $age - 16.2;
        $bfpFemale = 1.2 * $bmi + 0.23 * $age - 5.4;
        $bodyFatPercent = ($bfpMale + $bfpFemale) / 2.0; // Average

        // Outside what the table allows (0-60%): keep no estimate for that day rather than fail
        $bodyFatPercent = round($bodyFatPercent, 1);
        if ($bodyFatPercent <= 0 || $bodyFatPercent > 60) {
            $db->prepare("DELETE FROM {$schema}.body_fat_entries WHERE user_id = ? AND entry_date = ?")->execute([$userId, $date]);
            return;
        }

        // Store it
        $stmt = $db->prepare("
            INSERT INTO {$schema}.body_fat_entries (user_id, body_fat_percent, entry_date)
            VALUES (?, ?, ?)
            ON CONFLICT (user_id, entry_date)
            DO UPDATE SET body_fat_percent = ?
        ");
        $stmt->execute([$userId, round($bodyFatPercent, 1), $date, round($bodyFatPercent, 1)]);
    }

    // ==================== END PHASE 4 ====================

    ?>
