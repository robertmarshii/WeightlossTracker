<?php
// Backend authentication router - handles all auth-related endpoints
session_start();

if(isset($_GET["controller"])) {
    $controller = htmlspecialchars($_GET["controller"]);
    if($controller === "auth") { AuthController(); }
}

function AuthController() {
    require_once ('/var/app/backend/AuthManager.php');
    require_once ('/var/app/backend/Config.php');
    
    if (isset($_POST['action'])) {
        $action = htmlspecialchars($_POST['action']);
        
        if ($action === 'send_login_code' && isset($_POST['email'])) {
            $email = htmlspecialchars($_POST['email']);
            $result = AuthManager::sendLoginCode($email);
            echo json_encode($result);
        } elseif ($action === 'create_account' && isset($_POST['email'])) {
            $email = htmlspecialchars($_POST['email']);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'message' => 'Invalid email address']);
                return;
            }
            $result = AuthManager::createAccount($email);
            echo json_encode($result);
        } elseif ($action === 'verify_login' && isset($_POST['email'], $_POST['code'])) {
            $email = htmlspecialchars($_POST['email']);
            $code = htmlspecialchars($_POST['code']);
            $result = AuthManager::verifyLoginCode($email, $code);
            echo json_encode($result);
        } elseif ($action === 'verify_signup' && isset($_POST['email'], $_POST['code'])) {
            $email = htmlspecialchars($_POST['email']);
            $code = htmlspecialchars($_POST['code']);
            $result = AuthManager::verifySignupCode($email, $code);
            echo json_encode($result);
        } elseif ($action === 'logout') {
            $result = AuthManager::logout();
            echo json_encode($result);
        } elseif ($action === 'peek_code' && isset($_POST['email'])) {
            // Test-only: expose latest code in local/test environment for the given email
            $httpHost = $_SERVER['HTTP_HOST'] ?? '';
            $isLocal = ($httpHost === '127.0.0.1:8111' || strpos($httpHost, 'localhost') === 0);
            if (!$isLocal) {
                echo json_encode(['success' => false, 'message' => 'Not available']);
                return;
            }
            $email = htmlspecialchars($_POST['email']);
            try {
                $db = Database::getInstance()->getDbConnection();
                $schema = Database::getSchema();
                $stmt = $db->prepare("SELECT code, code_type, expires_at FROM {$schema}.auth_codes WHERE email = ? ORDER BY created_at DESC, id DESC LIMIT 1");
                $stmt->execute([$email]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode(['success' => (bool)$row, 'code' => $row['code'] ?? null, 'code_type' => $row['code_type'] ?? null]);
            } catch (Exception $e) {
                echo json_encode(['success' => false]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid action or missing parameters']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No action specified']);
    }
}
?>
