<?php
   session_start();

    if(isset($_GET["controller"])) {
        $controller = htmlspecialchars($_GET["controller"]);
        if($controller === "get1") { Get1(); }
        if($controller === "schema") { SchemaController(); }
        if($controller === "seeder") { SeederController(); }
        if($controller === "profile") { ProfileController(); }
    }

    function Get1() {
        if(!isset($_POST["page"])) { $_POST["page"] = 1; }
        $page = htmlspecialchars($_POST["page"]);
        require_once ('/var/app/backend/Get1.php'); //load the dataset model
        $data = new Get1(); //set the variable to a new instance of the dataset
        $response = $data->Get($page); 
        echo $response;  
    }

    function SchemaController() {
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
        require_once ('/var/app/backend/DatabaseSeeder.php');
        
        if (isset($_POST['action'])) {
            $action = htmlspecialchars($_POST['action']);
            
            if ($action === 'reset_all') {
                $result = DatabaseSeeder::resetSchemas(['wt_test', 'wt_dev']);
                echo json_encode($result);
            } elseif ($action === 'reset_schema' && isset($_POST['schema'])) {
                $schema = htmlspecialchars($_POST['schema']);
                $result = DatabaseSeeder::seedSchema($schema);
                echo json_encode($result);
            } elseif ($action === 'migrate_live') {
                $result = DatabaseSeeder::migrateLive();
                echo json_encode($result);
            }
        }
    }

    function ProfileController() {
        require_once ('/var/app/backend/Config.php');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            return;
        }

        $userId = (int)$_SESSION['user_id'];
        $db = Database::getInstance()->getdbConnection();
        $schema = Database::getSchema();

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
                if (!isset($_POST['weight_kg'])) { echo json_encode(['success'=>false,'message'=>'weight_kg required']); return; }
                $w = (float)$_POST['weight_kg'];
                $date = isset($_POST['entry_date']) ? $_POST['entry_date'] : date('Y-m-d');
                $stmt = $db->prepare("INSERT INTO {$schema}.weight_entries (user_id, weight_kg, entry_date, notes) VALUES (?, ?, ?, NULL)");
                $stmt->execute([$userId, $w, $date]);
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
                if (!isset($_POST['target_weight_kg'])) { echo json_encode(['success'=>false,'message'=>'target_weight_kg required']); return; }
                $tw = (float)$_POST['target_weight_kg'];
                $td = isset($_POST['target_date']) ? $_POST['target_date'] : null;
                // Deactivate existing active goals
                $db->prepare("UPDATE {$schema}.goals SET is_active = false WHERE user_id = ? AND is_active = true")->execute([$userId]);
                // Insert new active goal
                $stmt = $db->prepare("INSERT INTO {$schema}.goals (user_id, target_weight_kg, target_date, is_active, created_at) VALUES (?, ?, ?, true, NOW())");
                $stmt->execute([$userId, $tw, $td]);
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
                    $bfpNotes[] = 'Body fat estimated via Deurenberg formula (BMI, age). Range spans male–female.';
                } else {
                    $bfpNotes[] = 'Add your age in profile to estimate body fat percentage.';
                }

                // Simple cardiovascular risk impression (non-diagnostic)
                $riskScore = 0;
                if ($category === 'overweight') $riskScore += 1;
                if ($category === 'obese') $riskScore += 2;
                if ($activity === 'sedentary') $riskScore += 1;
                if ($activity === 'very' || $activity === 'athlete') $riskScore -= 1;
                if ($age !== null) {
                    if ($age >= 65) $riskScore += 2; elseif ($age >= 55) $riskScore += 1;
                }
                if ($riskScore < -1) $riskScore = -1; if ($riskScore > 3) $riskScore = 3;
                $riskLabel = 'baseline';
                if ($riskScore <= -1) $riskLabel = 'below baseline';
                elseif ($riskScore === 0) $riskLabel = 'baseline';
                elseif ($riskScore === 1) $riskLabel = 'moderately increased';
                elseif ($riskScore === 2) $riskLabel = 'highly increased';
                else $riskLabel = 'very high';
                $riskNotes = [
                    'This is a general, non-diagnostic impression based on BMI, age and activity.',
                    'For cardiovascular risk, clinical calculators (e.g., Framingham, ASCVD) require blood pressure and lab values.'
                ];

                echo json_encode([
                    'success' => true,
                    'bmi' => round($bmi, 1),
                    'category' => $category,
                    'adjusted_bmi' => round($adjBmi, 1),
                    'adjusted_category' => $adjCategory,
                    'estimated_body_fat_range' => $bfpRange, // [min%, max%] or null
                    'body_fat_notes' => $bfpNotes,
                    'cvd_risk_label' => $riskLabel,
                    'cvd_risk_notes' => $riskNotes,
                ]);
                return;
            }

            echo json_encode(['success' => false, 'message' => 'Invalid action']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
    }

    ?>
