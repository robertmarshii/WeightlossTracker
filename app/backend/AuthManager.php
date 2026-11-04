<?php

require_once '/var/app/project/vendor/autoload.php';
require_once '/var/app/backend/CoverageLogger.php';
require_once '/var/app/backend/Config.php';
require_once '/var/app/backend/Security.php';

use SparkPost\SparkPost;
use GuzzleHttp\Client;
use Http\Adapter\Guzzle7\Client as GuzzleAdapter;

class AuthManager {
    // Login/sign-up code limits
    private const CODE_MAX_ATTEMPTS = 5;         // wrong guesses allowed per code, then the code is deleted
    private const CODE_LIFETIME_SECONDS = 900;   // codes are valid for 15 minutes
    private const VERIFY_IP_MAX_FAILS = 20;      // wrong guesses per IP ...
    private const VERIFY_IP_WINDOW = 900;        // ... per 15 minutes
    private const SEND_IP_MAX = 20;              // code emails per IP ...
    private const SEND_IP_WINDOW = 3600;         // ... per hour

    private static function generateCode() {
        COVERAGE_LOG('generateCode', __CLASS__, __FILE__, __LINE__);
        return str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private static function maskEmail($email) {
        $parts = explode('@', (string)$email, 2);
        return substr($parts[0], 0, 1) . '***@' . ($parts[1] ?? '');
    }

    public static function sendEmail($to, $subject, $message, $htmlContent = null) {
        COVERAGE_LOG('sendEmail', __CLASS__, __FILE__, __LINE__);

        // Email is never skipped because of anything the browser sends. It is only switched off by
        // server configuration: APP_ENV=test (local test runs) or MAIL_DISABLED=true.
        if (Security::mailDisabled()) {
            error_log("Email sending disabled by server config - not sending to " . self::maskEmail($to));
            return true;
        }

        try {
            // Prepare email data
            $fromEmail = $_ENV['SPARKPOST_FROM_EMAIL'] ?? 'noreply@weightlosstracker.com';
            $fromName = $_ENV['SPARKPOST_FROM_NAME'] ?? 'Weightloss Tracker';
            $apiKey = $_ENV['SPARKPOST_API_KEY'] ?? '';
            $host = $_ENV['SPARKPOST_HOST'] ?? 'api.sparkpost.com';

            // Use cURL directly to avoid SDK compatibility issues
            $url = "https://" . $host . "/api/v1/transmissions";

            // Build content - if HTML is provided, use both HTML and text, otherwise just text
            $content = [
                'from' => [
                    'email' => $fromEmail,
                    'name' => $fromName
                ],
                'subject' => $subject,
                'text' => $message
            ];

            // Add HTML content if provided
            if ($htmlContent !== null) {
                $content['html'] = $htmlContent;
            }

            $payload = [
                'recipients' => [
                    ['address' => ['email' => $to]]
                ],
                'content' => $content,
                'options' => [
                    'click_tracking' => false,  // Disable link tracking/wrapping
                    'open_tracking' => false    // Disable open tracking
                ]
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: ' . $apiKey,
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                throw new Exception("cURL error: " . $curlError);
            }

            if ($httpCode !== 200) {
                throw new Exception("HTTP $httpCode");
            }

            return true;

        } catch (Exception $e) {
            error_log("Failed to send email via SparkPost to " . self::maskEmail($to) . ": " . $e->getMessage());
            return false;
        }
    }

    /**
     * Rate limit for sending code emails: max 3 per minute per email (then blocked for 30 minutes),
     * and max SEND_IP_MAX per hour per IP. State is kept in the database (Security::throttle*).
     */
    private static function checkRateLimit($email, $action) {
        COVERAGE_LOG('checkRateLimit', __CLASS__, __FILE__, __LINE__);
        // Test runs only (APP_ENV=test): the cypress_testing cookie turns the limit off
        if (Security::testCookie('cypress_testing')) {
            return ['allowed' => true];
        }

        $email = strtolower(trim($email));
        $ip = Security::clientIp();
        $blockMessage = 'Too many requests. Please wait 30 minutes before requesting another code.';

        if (Security::throttleCount('send_block:' . $action, $email, 1800) > 0) {
            return ['allowed' => false, 'message' => $blockMessage];
        }
        if (Security::throttleCount('send_ip', $ip, self::SEND_IP_WINDOW) >= self::SEND_IP_MAX) {
            return ['allowed' => false, 'message' => 'Too many requests. Please try again later.'];
        }
        if (Security::throttleCount('send:' . $action, $email, 60) >= 3) {
            Security::throttleHit('send_block:' . $action, $email);
            return ['allowed' => false, 'message' => 'Too many login code requests. Account temporarily blocked for 30 minutes.'];
        }

        Security::throttleHit('send:' . $action, $email);
        Security::throttleHit('send_ip', $ip);
        return ['allowed' => true];
    }

    /** Fixed code 111111 for test addresses - only when the server runs with APP_ENV=test. */
    private static function codeFor($email) {
        $isTestEmail = ($email === 'test@dev.com') || preg_match('/^(e2e|cypress)\+.+@/i', $email) || preg_match('/@example\.test$/i', $email);
        if (Security::isTestEnv() && $isTestEmail) {
            return '111111';
        }
        return self::generateCode();
    }

    private static function storeCode($db, $schema, $email, $type) {
        $code = self::codeFor($email);
        $expiresAt = date('Y-m-d H:i:s', time() + self::CODE_LIFETIME_SECONDS);
        // One active code per email
        $stmt = $db->prepare("DELETE FROM {$schema}.auth_codes WHERE email = ?");
        $stmt->execute([$email]);
        $stmt = $db->prepare("INSERT INTO {$schema}.auth_codes (email, code, code_type, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$email, $code, $type, $expiresAt]);
        Security::throttleClear('verify_lock', $email);
        return $code;
    }

    private static function sendLoginCodeEmail($email, $code) {
        $subject = "Your Weightloss Tracker Login Code: $code";

        $htmlContent = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #4A5568;'>Your Login Code</h2>

                <div style='background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;'>
                    <p style='font-size: 16px; color: #4A5568; margin-bottom: 15px;'>Your login code is:</p>
                    <div style='background: #4299E1; color: white; padding: 20px; border-radius: 6px; font-size: 32px; font-weight: bold; letter-spacing: 8px;'>
                        $code
                    </div>
                    <p style='font-size: 14px; color: #718096; margin-top: 15px;'>This code will expire in 15 minutes.</p>
                </div>

                <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #718096; font-size: 14px;'>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            </div>
            ";

        $message = "Your login code is: $code\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.";

        return self::sendEmail($email, $subject, $message, $htmlContent);
    }

    public static function sendLoginCode($email) {
        COVERAGE_LOG('sendLoginCode', __CLASS__, __FILE__, __LINE__);
        // Same answer whether or not the email has an account
        $sentMessage = 'If an account exists for this email, a login code has been sent.';
        try {
            // Rate limiting check
            $rateLimitResult = self::checkRateLimit($email, 'login_code');
            if (!$rateLimitResult['allowed']) {
                return ['success' => false, 'message' => $rateLimitResult['message']];
            }
            require_once('/var/app/backend/Config.php');
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();

            // Check if user exists
            $stmt = $db->prepare("SELECT id FROM {$schema}.users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                return ['success' => true, 'message' => $sentMessage];
            }

            $code = self::storeCode($db, $schema, $email, 'login');

            if (self::sendLoginCodeEmail($email, $code)) {
                return ['success' => true, 'message' => $sentMessage];
            } else {
                return ['success' => false, 'message' => 'Failed to send email'];
            }

        } catch (Exception $e) {
            error_log("AuthManager::sendLoginCode error: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred while sending login code'];
        }
    }

    public static function createAccount($email) {
        COVERAGE_LOG('createAccount', __CLASS__, __FILE__, __LINE__);
        $createdMessage = 'Account created successfully. Check your email for verification code.';
        try {
            // Rate limiting check
            $rateLimitResult = self::checkRateLimit($email, 'signup_code');
            if (!$rateLimitResult['allowed']) {
                return ['success' => false, 'message' => $rateLimitResult['message']];
            }
            require_once('/var/app/backend/Config.php');
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();

            // If the account already exists, email a normal login code and give the same answer,
            // so this form cannot be used to find out which emails have accounts.
            $stmt = $db->prepare("SELECT id FROM {$schema}.users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $code = self::storeCode($db, $schema, $email, 'login');
                if (self::sendLoginCodeEmail($email, $code)) {
                    return ['success' => true, 'message' => $createdMessage];
                }
                return ['success' => false, 'message' => 'Failed to send email'];
            }

            // Create user account with empty first_name and last_name
            $stmt = $db->prepare("INSERT INTO {$schema}.users (email, first_name, last_name, created_at) VALUES (?, '', '', NOW())");
            $stmt->execute([$email]);

            $code = self::storeCode($db, $schema, $email, 'signup');

            // Send welcome email with verification code
            $subject = "Welcome to Weightloss Tracker - Verify Your Account: $code";

            $htmlContent = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #4A5568;'>Welcome to Weightloss Tracker! 🎉</h2>

                <div style='background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                    <p style='font-size: 16px; color: #4A5568; margin-bottom: 15px;'>Thank you for signing up! To complete your account setup, please enter this verification code:</p>
                    <div style='background: #48BB78; color: white; padding: 20px; border-radius: 6px; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;'>
                        $code
                    </div>
                    <p style='font-size: 14px; color: #718096; margin-top: 15px; text-align: center;'>This code will expire in 15 minutes.</p>
                </div>

                <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #718096; font-size: 14px;'>
                    <p>If you didn't create this account, please ignore this email.</p>
                </div>
            </div>
            ";

            $message = "Welcome to Weightloss Tracker!\n\nYour verification code is: $code\n\nThis code will expire in 15 minutes.\n\nPlease enter this code to complete your account setup.";

            if (self::sendEmail($email, $subject, $message, $htmlContent)) {
                return ['success' => true, 'message' => $createdMessage];
            } else {
                return ['success' => false, 'message' => 'Account created but failed to send verification email'];
            }

        } catch (Exception $e) {
            error_log("AuthManager::createAccount error: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred while creating account'];
        }
    }

    /** Start a fresh session id for a newly signed-in user (prevents session fixation). */
    public static function startUserSession($userId, $email, $firstName, $lastName) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['email'] = $email;
        $_SESSION['first_name'] = $firstName;
        $_SESSION['last_name'] = $lastName;
        $_SESSION['login_time'] = time();
        unset($_SESSION['csrf_token']);
    }

    public static function verifyLoginCode($email, $code) {
        COVERAGE_LOG('verifyLoginCode', __CLASS__, __FILE__, __LINE__);
        $invalid = ['success' => false, 'message' => 'Invalid or expired code'];
        $locked = ['success' => false, 'message' => 'Too many incorrect attempts. Please request a new code.'];
        try {
            require_once('/var/app/backend/Config.php');
            $email = (string)$email;
            $code = trim((string)$code);
            $ip = Security::clientIp();

            // Per-IP throttle on wrong guesses
            if (Security::throttleCount('verify_ip', $ip, self::VERIFY_IP_WINDOW) >= self::VERIFY_IP_MAX_FAILS) {
                return ['success' => false, 'message' => 'Too many attempts. Please wait a few minutes and try again.'];
            }

            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();

            // Active codes for this email (normally exactly one)
            $stmt = $db->prepare("
                SELECT ac.id, ac.code, u.id as user_id, u.first_name, u.last_name
                FROM {$schema}.auth_codes ac
                JOIN {$schema}.users u ON u.email = ac.email
                WHERE ac.email = ? AND ac.expires_at > NOW()
                ORDER BY ac.id DESC
            ");
            $stmt->execute([$email]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!$rows) {
                Security::throttleHit('verify_ip', $ip);
                // The code was deleted after too many wrong guesses: keep saying so until a new one is requested
                if (Security::throttleCount('verify_lock', $email, self::CODE_LIFETIME_SECONDS) > 0) {
                    return $locked;
                }
                return $invalid;
            }

            $match = null;
            foreach ($rows as $row) {
                if (preg_match('/^\d{6}$/', $code) && hash_equals((string)$row['code'], $code)) {
                    $match = $row;
                    break;
                }
            }

            if (!$match) {
                Security::throttleHit('verify_ip', $ip);
                $tooMany = false;
                foreach ($rows as $row) {
                    Security::throttleHit('verify_code', (string)$row['id']);
                    if (Security::throttleCount('verify_code', (string)$row['id'], self::CODE_LIFETIME_SECONDS) >= self::CODE_MAX_ATTEMPTS) {
                        $tooMany = true;
                    }
                }
                if ($tooMany) {
                    $stmt = $db->prepare("DELETE FROM {$schema}.auth_codes WHERE email = ?");
                    $stmt->execute([$email]);
                    Security::throttleHit('verify_lock', $email);
                    error_log("Login code for " . self::maskEmail($email) . " deleted after too many wrong attempts");
                    return $locked;
                }
                return $invalid;
            }

            // Delete the used code (and any other code for this email)
            $stmt = $db->prepare("DELETE FROM {$schema}.auth_codes WHERE email = ?");
            $stmt->execute([$email]);

            // Create a fresh session
            self::startUserSession($match['user_id'], $email, $match['first_name'], $match['last_name']);

            // Set remember me token for 30 days
            self::setRememberToken($match['user_id']);

            return ['success' => true, 'message' => 'Login successful'];

        } catch (Exception $e) {
            error_log("AuthManager::verifyLoginCode error: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred during verification'];
        }
    }

    public static function verifySignupCode($email, $code) {
        COVERAGE_LOG('verifySignupCode', __CLASS__, __FILE__, __LINE__);
        return self::verifyLoginCode($email, $code);
    }

    public static function logout() {
        COVERAGE_LOG('logout', __CLASS__, __FILE__, __LINE__);
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Clear remember me token
        self::clearRememberToken();

        $_SESSION = [];
        session_destroy();
        return ['success' => true, 'message' => 'Logged out successfully'];
    }

    public static function isLoggedIn() {
        COVERAGE_LOG('isLoggedIn', __CLASS__, __FILE__, __LINE__);

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // First check active session
        if (isset($_SESSION['user_id']) && isset($_SESSION['login_time'])) {
            $session_age = time() - $_SESSION['login_time'];
            // Sessions last 24 hours; after that fall back to the remember-me token
            if ($session_age > 86400) {
                $_SESSION = [];
                session_destroy();
                session_start();
            } else {
                return true;
            }
        }

        // Check remember me token if no active session
        if (isset($_COOKIE['remember_token']) && isset($_COOKIE['user_id'])
            && is_string($_COOKIE['remember_token']) && is_string($_COOKIE['user_id'])
            && ctype_digit($_COOKIE['user_id']) && strlen($_COOKIE['remember_token']) === 64) {
            try {
                set_time_limit(5); // Max 5 seconds for this operation
                $db = Database::getInstance()->getDbConnection();
                $schema = Database::getSchema();

                $stmt = $db->prepare("SELECT * FROM {$schema}.users WHERE id = ? AND remember_token = ? AND remember_token_expires > NOW()");
                $stmt->execute([$_COOKIE['user_id'], $_COOKIE['remember_token']]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user) {
                    // Restore session from remember token (new session id)
                    self::startUserSession($user['id'], $user['email'], $user['first_name'], $user['last_name']);

                    // Extend the same token for another 30 days. The token is not rotated here: the
                    // nginx auth check (auth_gatekeeper.php) runs this too and nginx drops the cookies
                    // it sets, so a rotated token would never reach the browser and the page itself
                    // would then see an invalid token.
                    self::extendRememberToken($user['id'], $_COOKIE['remember_token']);
                    return true;
                } else {
                    Security::clearAuthCookies();
                }
            } catch (Exception $e) {
                error_log("AuthManager::isLoggedIn remember token check error: " . $e->getMessage());
                Security::clearAuthCookies();
            }
        }

        return false;
    }

    private static function setRememberToken($userId) {
        COVERAGE_LOG('setRememberToken', __CLASS__, __FILE__, __LINE__);

        try {
            // Generate secure random token
            $token = bin2hex(random_bytes(32));
            $expiresTs = time() + (30 * 24 * 60 * 60); // 30 days
            $expires = date('Y-m-d H:i:s', $expiresTs);

            // Store token in database
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();
            $stmt = $db->prepare("UPDATE {$schema}.users SET remember_token = ?, remember_token_expires = ? WHERE id = ?");
            $stmt->execute([$token, $expires, $userId]);

            // Set cookies (30 days): Secure, HttpOnly, SameSite=Lax
            Security::setAuthCookie('remember_token', $token, $expiresTs);
            Security::setAuthCookie('user_id', (string)$userId, $expiresTs);
        } catch (Exception $e) {
            // Don't fail the login if remember token fails, just log the error
            error_log("AuthManager::setRememberToken error: " . $e->getMessage());
        }
    }

    private static function extendRememberToken($userId, $token) {
        try {
            $expiresTs = time() + (30 * 24 * 60 * 60); // 30 days
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();
            $stmt = $db->prepare("UPDATE {$schema}.users SET remember_token_expires = ? WHERE id = ? AND remember_token = ?");
            $stmt->execute([date('Y-m-d H:i:s', $expiresTs), $userId, $token]);
            Security::setAuthCookie('remember_token', $token, $expiresTs);
            Security::setAuthCookie('user_id', (string)$userId, $expiresTs);
        } catch (Exception $e) {
            error_log("AuthManager::extendRememberToken error: " . $e->getMessage());
        }
    }

    public static function clearRememberToken($userId = null) {
        COVERAGE_LOG('clearRememberToken', __CLASS__, __FILE__, __LINE__);

        if (!$userId && isset($_SESSION['user_id'])) {
            $userId = $_SESSION['user_id'];
        }

        if ($userId) {
            try {
                // Clear token from database
                $db = Database::getInstance()->getDbConnection();
                $schema = Database::getSchema();
                $stmt = $db->prepare("UPDATE {$schema}.users SET remember_token = NULL, remember_token_expires = NULL WHERE id = ?");
                $stmt->execute([$userId]);
            } catch (Exception $e) {
                error_log("AuthManager::clearRememberToken error: " . $e->getMessage());
            }
        }

        // Clear cookies
        Security::clearAuthCookies();
    }
}
