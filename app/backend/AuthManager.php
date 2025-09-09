<?php

class AuthManager {
    private static function generateCode() {
        return str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }
    
    private static function sendEmail($to, $subject, $message) {
        // For development, we'll log to a file instead of sending actual emails
        // In production, configure with SMTP settings
        $logMessage = "EMAIL TO: $to\nSUBJECT: $subject\nMESSAGE:\n$message\n" . str_repeat("-", 50) . "\n";
        self::appendToEmailLog($logMessage);
        
        // TODO: Implement actual email sending in production
        // mail($to, $subject, $message, $headers);
        
        return true;
    }

    private static function appendToEmailLog($text)
    {
        $path = '/var/app/backend/email_log.txt';
        // Prune the log if it grows too large
        self::pruneLog($path, 1048576, 2000); // 1MB or keep last 2000 lines
        file_put_contents($path, $text, FILE_APPEND | LOCK_EX);
    }

    private static function pruneLog($path, $maxBytes, $keepLines)
    {
        if (!file_exists($path)) { return; }
        $size = @filesize($path);
        if ($size === false) { return; }
        if ($size <= $maxBytes) { return; }
        // Keep only the last N lines
        $lines = @file($path, FILE_IGNORE_NEW_LINES);
        if ($lines === false) { return; }
        $total = count($lines);
        if ($total > $keepLines) {
            $tail = array_slice($lines, -$keepLines);
            @file_put_contents($path, implode(PHP_EOL, $tail) . PHP_EOL, LOCK_EX);
        }
    }
    
    public static function sendLoginCode($email) {
        try {
            require_once('/var/app/backend/Config.php');
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();
            
            // Check if user exists
            $stmt = $db->prepare("SELECT id FROM {$schema}.users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return ['success' => false, 'message' => 'Email not found. Please create an account first.'];
            }
            
            // Generate and store verification code
            $code = self::generateCode();
            // Deterministic code for E2E in local/test conditions
            $httpHost = $_SERVER['HTTP_HOST'] ?? '';
            $schemaNow = Database::getSchema();
            $isLocal = (strpos($httpHost, '127.0.0.1') === 0) || (strpos($httpHost, 'localhost') === 0);
            $isTestEmail = ($email === 'test@dev.com') || preg_match('/^(e2e|cypress)\+.+@/i', $email) || preg_match('/@example\.test$/i', $email);
            if (($isLocal || $schemaNow === 'wt_test') && $isTestEmail) {
                $code = '111111';
            }
            $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));
            
            // Remove any existing codes for this email
            $stmt = $db->prepare("DELETE FROM {$schema}.auth_codes WHERE email = ?");
            $stmt->execute([$email]);
            
            // Insert new code
            $stmt = $db->prepare("INSERT INTO {$schema}.auth_codes (email, code, code_type, expires_at, created_at) VALUES (?, ?, 'login', ?, NOW())");
            $stmt->execute([$email, $code, $expiresAt]);
            
            // Send email
            $subject = "Your Weight Loss Tracker Login Code";
            $message = "Your login code is: $code\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.";
            
            if (self::sendEmail($email, $subject, $message)) {
                return ['success' => true, 'message' => 'Login code sent successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to send email'];
            }
            
        } catch (Exception $e) {
            error_log("AuthManager::sendLoginCode error: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred while sending login code'];
        }
    }
    
    public static function createAccount($email, $firstName, $lastName) {
        try {
            require_once('/var/app/backend/Config.php');
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();
            
            // Check if user already exists
            $stmt = $db->prepare("SELECT id FROM {$schema}.users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                return ['success' => false, 'message' => 'An account with this email already exists'];
            }
            
            // Create user account
            $stmt = $db->prepare("INSERT INTO {$schema}.users (email, first_name, last_name, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->execute([$email, $firstName, $lastName]);
            
            // Generate and store verification code
            $code = self::generateCode();
            // For Cypress tests: allow deterministic code for specific addresses
            $httpHost = $_SERVER['HTTP_HOST'] ?? '';
            $schemaNow = Database::getSchema();
            $isLocal = (strpos($httpHost, '127.0.0.1') === 0) || (strpos($httpHost, 'localhost') === 0);
            $isTestEmail = ($email === 'test@dev.com') || preg_match('/^(e2e|cypress)\+.+@/i', $email) || preg_match('/@example\.test$/i', $email);
            if (($isLocal || $schemaNow === 'wt_test') && $isTestEmail) {
                $code = '111111';
            }
            $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));
            
            $stmt = $db->prepare("INSERT INTO {$schema}.auth_codes (email, code, code_type, expires_at, created_at) VALUES (?, ?, 'signup', ?, NOW())");
            $stmt->execute([$email, $code, $expiresAt]);
            
            // Send welcome email with verification code
            $subject = "Welcome to Weight Loss Tracker - Verify Your Account";
            $message = "Welcome to Weight Loss Tracker!\n\nYour verification code is: $code\n\nThis code will expire in 15 minutes.\n\nPlease enter this code to complete your account setup.";
            
            if (self::sendEmail($email, $subject, $message)) {
                return ['success' => true, 'message' => 'Account created successfully. Check your email for verification code.'];
            } else {
                return ['success' => false, 'message' => 'Account created but failed to send verification email'];
            }
            
        } catch (Exception $e) {
            error_log("AuthManager::createAccount error: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred while creating account'];
        }
    }
    
    public static function verifyLoginCode($email, $code) {
        try {
            require_once('/var/app/backend/Config.php');
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();
            
            // Check if code is valid and not expired
            $stmt = $db->prepare("
                SELECT ac.id, u.id as user_id, u.first_name, u.last_name 
                FROM {$schema}.auth_codes ac 
                JOIN {$schema}.users u ON u.email = ac.email 
                WHERE ac.email = ? AND ac.code = ? AND ac.expires_at > NOW()
            ");
            $stmt->execute([$email, $code]);
            $result = $stmt->fetch();
            
            if (!$result) {
                return ['success' => false, 'message' => 'Invalid or expired code'];
            }
            
            // Delete the used code
            $stmt = $db->prepare("DELETE FROM {$schema}.auth_codes WHERE id = ?");
            $stmt->execute([$result['id']]);
            
            // Create session
            session_start();
            $_SESSION['user_id'] = $result['user_id'];
            $_SESSION['email'] = $email;
            $_SESSION['first_name'] = $result['first_name'];
            $_SESSION['last_name'] = $result['last_name'];
            $_SESSION['login_time'] = time();
            
            return ['success' => true, 'message' => 'Login successful'];
            
        } catch (Exception $e) {
            error_log("AuthManager::verifyLoginCode error: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred during verification'];
        }
    }
    
    public static function verifySignupCode($email, $code) {
        return self::verifyLoginCode($email, $code);
    }
    
    public static function logout() {
        session_start();
        session_destroy();
        return ['success' => true, 'message' => 'Logged out successfully'];
    }
    
    public static function isLoggedIn() {
        session_start();
        
        if (!isset($_SESSION['user_id']) || !isset($_SESSION['login_time'])) {
            return false;
        }
        
        // Check if session is older than 24 hours
        if (time() - $_SESSION['login_time'] > 86400) {
            session_destroy();
            return false;
        }
        
        return true;
    }
}
