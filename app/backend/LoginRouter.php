<?php
// Backend authentication router - handles all auth-related endpoints
session_start();

if(isset($_GET["controller"])) {
    $controller = htmlspecialchars($_GET["controller"]);
    if($controller === "auth") { AuthController(); }
}

function AuthController() {
    require_once ('/var/app/backend/AuthManager.php');
    
    if (isset($_POST['action'])) {
        $action = htmlspecialchars($_POST['action']);
        
        if ($action === 'send_login_code' && isset($_POST['email'])) {
            $email = htmlspecialchars($_POST['email']);
            $result = AuthManager::sendLoginCode($email);
            echo json_encode($result);
        } elseif ($action === 'create_account' && isset($_POST['email'], $_POST['first_name'], $_POST['last_name'])) {
            $email = htmlspecialchars($_POST['email']);
            $firstName = htmlspecialchars($_POST['first_name']);
            $lastName = htmlspecialchars($_POST['last_name']);
            $result = AuthManager::createAccount($email, $firstName, $lastName);
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
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid action or missing parameters']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No action specified']);
    }
}
?>