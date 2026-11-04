<?php

require_once '/var/app/project/vendor/autoload.php';
require_once '/var/app/backend/CoverageLogger.php';
require_once '/var/app/backend/Config.php';
require_once '/var/app/backend/Security.php';


class AuthManager {
    // Login/sign-up code limits
    private const CODE_MAX_ATTEMPTS = 5;         // wrong guesses allowed per code, then the code is deleted
    private const CODE_LIFETIME_SECONDS = 900;   // codes are valid for 15 minutes
    private const VERIFY_IP_MAX_FAILS = 20;      // wrong guesses per IP ...
    private const VERIFY_IP_WINDOW = 900;        // ... per 15 minutes
    private const SEND_IP_MAX = 20;              // code emails per IP ...
    private const SEND_IP_WINDOW = 3600;         // ... per hour
    private const SEND_ACCT_IP_MAX_15M = 3;      // code emails per account from one IP per 15 minutes
    private const SEND_ACCT_IP_MAX_DAY = 10;     // code emails per account from one IP per day
    private const SEND_ACCT_MAX_DAY = 20;        // code emails per account per day, all IPs together
    private const VERIFY_ACCT_MAX_HOUR = 10;     // wrong guesses against live codes per account from one IP per hour
    private const VERIFY_ACCT_MAX_DAY = 20;      // ... and per day (new codes do not reset this)
    private const SCHEMA_RETRY_SECONDS = 300;    // when the auth-table upgrade failed, try it again after this long
    private const REMEMBER_DAYS = 30;            // remember-me lasts 30 days from the last visit ...
    private const REMEMBER_MAX_DAYS = 90;        // ... and never more than 90 days after sign-in

    /** Work to do after the answer has been sent to the browser (see runDeferred). */
    private static $deferred = [];

    /** Per process: schema => true once the auth columns are known to exist. */
    private static $schemaReady = [];
    /** Per process: schema => time of the last failed upgrade attempt. */
    private static $schemaFailedAt = [];

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

        // Sent through Scaleway Transactional Email (fr-par). Settings come from the server environment:
        // SCW_SECRET_KEY, SCW_PROJECT_ID, MAIL_FROM_EMAIL (e.g. noreply@mail.weightloss-tracker.com), MAIL_FROM_NAME.
        try {
            $env = function ($name, $default = '') {
                $v = $_ENV[$name] ?? getenv($name);
                return ($v === false || $v === null || $v === '') ? $default : $v;
            };
            $apiKey = $env('SCW_SECRET_KEY');
            $projectId = $env('SCW_PROJECT_ID');
            $fromEmail = $env('MAIL_FROM_EMAIL', 'noreply@mail.weightloss-tracker.com');
            $fromName = $env('MAIL_FROM_NAME', 'Weightloss Tracker');
            $region = $env('SCW_REGION', 'fr-par');
            if ($apiKey === '' || $projectId === '') {
                throw new Exception("SCW_SECRET_KEY or SCW_PROJECT_ID is not set");
            }

            $payload = [
                'from' => ['email' => $fromEmail, 'name' => $fromName],
                'to' => [['email' => $to]],
                'subject' => $subject,
                'text' => $message,
                'project_id' => $projectId,
            ];
            if ($htmlContent !== null) {
                $payload['html'] = $htmlContent;
            }

            $ch = curl_init("https://api.scaleway.com/transactional-email/v1alpha1/regions/" . rawurlencode($region) . "/emails");
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => ['X-Auth-Token: ' . $apiKey, 'Content-Type: application/json'],
                CURLOPT_TIMEOUT => 30,
            ]);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                throw new Exception("cURL error: " . $curlError);
            }
            if ($httpCode < 200 || $httpCode >= 300) {
                // The body holds Scaleway's error message, never the key.
                throw new Exception("HTTP $httpCode " . substr((string)$response, 0, 300));
            }
            return true;

        } catch (Exception $e) {
            error_log("Failed to send email via Scaleway to " . self::maskEmail($to) . ": " . $e->getMessage());
            return false;
        }
    }

    /**
     * Rate limit for sending code emails, for login and sign-up codes together. State is kept in the
     * database (Security::throttle*; emails are stored hashed). Applies the same way whether or not the
     * email has an account.
     * - Per IP: SEND_IP_MAX per hour.
     * - Per account and IP: SEND_ACCT_IP_MAX_15M per 15 minutes and SEND_ACCT_IP_MAX_DAY per day.
     * - Per account, all IPs together: SEND_ACCT_MAX_DAY per day.
     * Trade-off: keying the tight limit on (account, IP) means one attacker IP cannot stop the owner
     * asking for codes from their own connection. The price is that someone with many IPs can send
     * more code emails to one address than before (up to SEND_ACCT_MAX_DAY a day), and someone with
     * enough IPs can still use up that daily cap and block the address for the rest of the day.
     */
    private static function checkRateLimit($email, $action) {
        COVERAGE_LOG('checkRateLimit', __CLASS__, __FILE__, __LINE__);
        // Test runs only (APP_ENV=test): the cypress_testing cookie turns the limit off
        if (Security::testCookie('cypress_testing')) {
            return ['allowed' => true];
        }

        $email = Security::foldKey((string)$email);
        $ip = Security::clientIp();
        $tooMany = ['allowed' => false, 'message' => 'Too many requests. Please try again later.'];

        [$ipOk, $ipHit] = Security::throttleTake('send_ip', $ip, [self::SEND_IP_WINDOW => self::SEND_IP_MAX]);
        if (!$ipOk) {
            return $tooMany;
        }
        [$acctIpOk, $acctIpHit] = Security::throttleTake('send_acct_ip', $email . '|' . $ip, [
            900 => self::SEND_ACCT_IP_MAX_15M,
            86400 => self::SEND_ACCT_IP_MAX_DAY,
        ]);
        if (!$acctIpOk) {
            Security::throttleRemove($ipHit);
            return $tooMany;
        }
        [$acctOk] = Security::throttleTake('send_acct', $email, [86400 => self::SEND_ACCT_MAX_DAY]);
        if (!$acctOk) {
            Security::throttleRemove($ipHit);
            Security::throttleRemove($acctIpHit);
            return $tooMany;
        }
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
        $upgraded = self::ensureSchema($db, $schema);
        $code = self::codeFor($email);
        $expiresAt = date('Y-m-d H:i:s', time() + self::CODE_LIFETIME_SECONDS);
        // One active code per email
        $stmt = $db->prepare("DELETE FROM {$schema}.auth_codes WHERE email = ?");
        $stmt->execute([$email]);
        $stmt = $upgraded
            ? $db->prepare("INSERT INTO {$schema}.auth_codes (email, code, code_type, expires_at, created_at, attempts) VALUES (?, ?, ?, ?, NOW(), 0)")
            : $db->prepare("INSERT INTO {$schema}.auth_codes (email, code, code_type, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$email, $code, $type, $expiresAt]);
        // Codes that expired over an hour ago are of no further use (this also removes the unsent
        // codes kept for emails without an account, see deliverLoginCode)
        if (random_int(1, 20) === 1) {
            $db->exec("DELETE FROM {$schema}.auth_codes WHERE expires_at < NOW() - INTERVAL '1 hour'");
        }
        self::resetCodeLocks($email);
        return $code;
    }

    /** A new code starts with a clean slate for "too many incorrect attempts". */
    private static function resetCodeLocks($email) {
        Security::throttleClear('verify_lock', $email);
        Security::throttleClear('verify_nocode', $email);
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

    /**
     * Run queued work after the answer has gone to the browser. The answer is the same, and is sent
     * at the same speed, whether or not the email has an account: the account lookup, the code and
     * the email all happen here. Called by LoginRouter after it has printed the answer.
     */
    public static function runDeferred() {
        if (!self::$deferred) {
            return;
        }
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close(); // don't hold the session lock while the email is sent
        }
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        }
        ignore_user_abort(true);
        $jobs = self::$deferred;
        self::$deferred = [];
        foreach ($jobs as $job) {
            try {
                $job();
            } catch (Throwable $e) {
                error_log("AuthManager deferred job error: " . $e->getMessage());
            }
        }
    }

    private static function defer(callable $job) {
        self::$deferred[] = $job;
    }

    /** Log the result of sending a code email (never the code, and only a masked address). */
    private static function logSend($what, $email, $ok) {
        error_log("AuthManager: $what email " . ($ok ? 'sent' : 'FAILED') . " for " . self::maskEmail($email));
    }

    public static function sendLoginCode($email) {
        COVERAGE_LOG('sendLoginCode', __CLASS__, __FILE__, __LINE__);
        // Same answer whether or not the email has an account, and whether or not the email goes out
        $sentMessage = 'If an account exists for this email, a login code has been sent.';
        $rateLimitResult = self::checkRateLimit($email, 'login_code');
        if (!$rateLimitResult['allowed']) {
            return ['success' => false, 'message' => $rateLimitResult['message']];
        }
        self::defer(function () use ($email) {
            self::deliverLoginCode($email);
        });
        return ['success' => true, 'message' => $sentMessage];
    }

    private static function deliverLoginCode($email) {
        try {
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();
            $stmt = $db->prepare("SELECT id FROM {$schema}.users WHERE email = ?");
            $stmt->execute([$email]);
            if (!$stmt->fetch()) {
                // No account: keep a code that is never sent, so checking codes for this email behaves
                // exactly as it would for an account (same answers, same limits), and the answers
                // cannot be used to find out which emails have accounts.
                if (strlen($email) <= 100) {
                    self::storeCode($db, $schema, $email, 'login');
                }
                return;
            }
            $code = self::storeCode($db, $schema, $email, 'login');
            self::logSend('login code', $email, self::sendLoginCodeEmail($email, $code));
        } catch (Throwable $e) {
            error_log("AuthManager::sendLoginCode error: " . $e->getMessage());
        }
    }

    public static function createAccount($email) {
        COVERAGE_LOG('createAccount', __CLASS__, __FILE__, __LINE__);
        $createdMessage = 'Account created successfully. Check your email for verification code.';
        $rateLimitResult = self::checkRateLimit($email, 'signup_code');
        if (!$rateLimitResult['allowed']) {
            return ['success' => false, 'message' => $rateLimitResult['message']];
        }
        self::defer(function () use ($email) {
            self::deliverSignup($email);
        });
        return ['success' => true, 'message' => $createdMessage];
    }

    private static function deliverSignup($email) {
        try {
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();

            // If the account already exists, email a normal login code (same answer to the browser),
            // so this form cannot be used to find out which emails have accounts.
            $stmt = $db->prepare("SELECT id FROM {$schema}.users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $code = self::storeCode($db, $schema, $email, 'login');
                self::logSend('login code (sign-up form)', $email, self::sendLoginCodeEmail($email, $code));
                return;
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

            self::logSend('sign-up code', $email, self::sendEmail($email, $subject, $message, $htmlContent));
        } catch (Throwable $e) {
            error_log("AuthManager::createAccount error: " . $e->getMessage());
        }
    }

    /**
     * Bring the auth tables up to date once per schema:
     * - users.session_version: bumped on sign-out so sessions on other devices end too
     * - users.remember_token_issued_at: remember-me never lasts more than 90 days after sign-in
     * - users.remember_token now holds sha256(token), never the token; existing tokens are hashed
     *   in the same transaction, so people who are signed in stay signed in
     * - auth_codes.attempts: wrong guesses per code, counted atomically
     * The same SQL is in seeders/add_auth_hardening.sql for running by hand.
     *
     * Returns true when the new columns are in place. Returns false ("older mode") when they are
     * missing and could not be added, for example because the database user may not ALTER the
     * tables: sign-in then keeps working the way it did before these columns (see the callers),
     * the failure is logged, and /status shows it. Nothing is locked unless the columns are missing:
     * the check is a plain information_schema read, and its result is remembered per process.
     */
    public static function ensureSchema($db, $schema): bool {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', (string)$schema)) {
            throw new RuntimeException('bad schema name');
        }
        if (!empty(self::$schemaReady[$schema])) {
            return true;
        }
        $flag = '/var/app/data/auth-schema-v2-' . $schema;
        if (is_file($flag) || self::authColumnsPresent($db, $schema)) {
            self::$schemaReady[$schema] = true;
            if (!is_file($flag)) {
                @file_put_contents($flag, date('c') . "\n");
            }
            return true;
        }
        // The upgrade failed recently in this process: stay in the older mode until it is worth trying again
        if (isset(self::$schemaFailedAt[$schema]) && time() - self::$schemaFailedAt[$schema] < self::SCHEMA_RETRY_SECONDS) {
            return false;
        }

        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->beginTransaction();
        try {
            // Never hold up sign-in for long behind other work on the users table
            $db->exec("SET LOCAL lock_timeout = '3s'");
            // Serialise concurrent first requests; the check below runs after the lock is held
            $db->exec("LOCK TABLE {$schema}.users IN SHARE ROW EXCLUSIVE MODE");
            $stmt = $db->prepare("SELECT 1 FROM information_schema.columns WHERE table_schema = ? AND table_name = 'users' AND column_name = 'session_version'");
            $stmt->execute([$schema]);
            if (!$stmt->fetchColumn()) {
                $db->exec("ALTER TABLE {$schema}.users
                    ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0,
                    ADD COLUMN remember_token_issued_at TIMESTAMP NULL");
                $db->exec("UPDATE {$schema}.users
                    SET remember_token = encode(sha256(convert_to(remember_token, 'UTF8')), 'hex'),
                        remember_token_issued_at = NOW()
                    WHERE remember_token IS NOT NULL");
                error_log("AuthManager: upgraded {$schema}.users (hashed remember tokens, session_version)");
            }
            $db->exec("ALTER TABLE {$schema}.auth_codes ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0");
            $db->commit();
        } catch (Throwable $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            self::$schemaFailedAt[$schema] = time();
            error_log("AuthManager: SIGN-IN TABLE UPGRADE FAILED for schema {$schema}: " . $e->getMessage()
                . " -- sign-in keeps working in the OLDER MODE (remember-me tokens stored as before, no 90-day cap,"
                . " sign-out does not end other devices' sessions). Fix: let the database user ALTER the tables,"
                . " or run seeders/add_auth_hardening.sql by hand. /status shows this as a FAIL.");
            return false;
        }
        self::$schemaReady[$schema] = true;
        @file_put_contents($flag, date('c') . "\n");
        return true;
    }

    /** True when every column the upgrade adds is there (a read of information_schema; takes no lock). */
    private static function authColumnsPresent($db, $schema): bool {
        $stmt = $db->prepare("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = ?
            AND ((table_name = 'users' AND column_name IN ('session_version', 'remember_token_issued_at'))
              OR (table_name = 'auth_codes' AND column_name = 'attempts'))");
        $stmt->execute([$schema]);
        return (int)$stmt->fetchColumn() === 3;
    }

    private static function hashToken($token) {
        return hash('sha256', (string)$token);
    }

    private static function sessionVersion($userId) {
        $db = Database::getInstance()->getDbConnection();
        $schema = Database::getSchema();
        // Older mode (no session_version column): every session counts as current, as before
        $stmt = self::ensureSchema($db, $schema)
            ? $db->prepare("SELECT session_version FROM {$schema}.users WHERE id = ?")
            : $db->prepare("SELECT 0 FROM {$schema}.users WHERE id = ?");
        $stmt->execute([$userId]);
        $v = $stmt->fetchColumn();
        return $v === false ? null : (int)$v;
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
        try {
            $_SESSION['session_version'] = self::sessionVersion($userId) ?? 0;
        } catch (Throwable $e) {
            error_log("AuthManager::startUserSession session_version error: " . $e->getMessage());
            $_SESSION['session_version'] = 0;
        }
        unset($_SESSION['csrf_token']);
    }

    /**
     * Check a login or sign-up code. Limits:
     * - per code: CODE_MAX_ATTEMPTS guesses, then the code is deleted ("request a new code");
     * - per IP: VERIFY_IP_MAX_FAILS wrong guesses per 15 minutes ("wait a few minutes");
     * - per account and IP: VERIFY_ACCT_MAX_HOUR / VERIFY_ACCT_MAX_DAY wrong guesses against live
     *   codes. Guesses when no code is live do not count, and other IPs are not affected, so nobody
     *   can lock an address out from their own connection. Once reached, every guess from that IP for
     *   that account gets the "please wait" answer before it is counted against the code or compared,
     *   so a guesser who has hit the limit can't use up (and so delete) the owner's fresh code. The
     *   trade-off: a correct code typed from that IP also has to wait until the limit has passed.
     * Every answer is the same whether or not the email has an account or a code: emails without an
     * account get an unsent code too (deliverLoginCode), and when no code is live at all the
     * CODE_MAX_ATTEMPTS-th wrong guess gives the same "request a new code" answer as a used-up code.
     */
    public static function verifyLoginCode($email, $code) {
        COVERAGE_LOG('verifyLoginCode', __CLASS__, __FILE__, __LINE__);
        $invalid = ['success' => false, 'message' => 'Invalid or expired code'];
        $locked = ['success' => false, 'message' => 'Too many incorrect attempts. Please request a new code.'];
        $wait = ['success' => false, 'message' => 'Too many attempts. Please wait a few minutes and try again.'];
        try {
            require_once('/var/app/backend/Config.php');
            $email = (string)$email;
            $code = trim((string)$code);
            $ip = Security::clientIp();

            // Each attempt is recorded before it is checked (so parallel requests can't all slip under
            // the limit) and taken back if the code turns out to be right.
            // Per IP: VERIFY_IP_MAX_FAILS per 15 minutes.
            [$ipOk, $ipHit] = Security::throttleTake('verify_ip', $ip, [self::VERIFY_IP_WINDOW => self::VERIFY_IP_MAX_FAILS]);
            if (!$ipOk) {
                return $wait;
            }

            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();
            $upgraded = self::ensureSchema($db, $schema);

            // Per account and IP: over the limit, answer "please wait" before this guess is counted against
            // the code or compared, so it can't use up the owner's code. Checked the same way whether or not
            // the email has an account (those without one have an unsent code, see deliverLoginCode).
            $acctKey = Security::foldKey($email) . '|' . $ip;
            if (Security::throttleCount('verify_acct', $acctKey, 3600) >= self::VERIFY_ACCT_MAX_HOUR
                || Security::throttleCount('verify_acct', $acctKey, 86400) >= self::VERIFY_ACCT_MAX_DAY) {
                return $wait;
            }

            // Count this guess against the live code(s) before comparing. A code that already had
            // CODE_MAX_ATTEMPTS guesses is not compared at all.
            $rows = $upgraded ? self::countGuess($db, $schema, $email) : self::countGuessOlderMode($db, $schema, $email);

            if (!$rows) {
                // No live code (never requested, expired, or its guesses are used up)
                if (Security::throttleCount('verify_lock', $email, self::CODE_LIFETIME_SECONDS) > 0) {
                    return $locked;
                }
                if ($upgraded) {
                    $exhausted = $db->prepare("SELECT 1 FROM {$schema}.auth_codes WHERE email = ? AND expires_at > NOW() LIMIT 1");
                    $exhausted->execute([$email]);
                    if ($exhausted->fetchColumn()) {
                        return $locked;
                    }
                }
                // Same as a code: the CODE_MAX_ATTEMPTS-th wrong guess gives "request a new code"
                Security::throttleHit('verify_nocode', $email);
                if (Security::throttleCount('verify_nocode', $email, self::CODE_LIFETIME_SECONDS) >= self::CODE_MAX_ATTEMPTS) {
                    Security::throttleClear('verify_nocode', $email);
                    Security::throttleHit('verify_lock', $email);
                    return $locked;
                }
                return $invalid;
            }

            // Per account and IP; only guesses against a live code count. (Normally the check above already
            // stopped an IP over the limit; this catches parallel requests that passed it together.)
            [$acctOk, $acctHit] = Security::throttleTake('verify_acct', $acctKey, [
                3600 => self::VERIFY_ACCT_MAX_HOUR,
                86400 => self::VERIFY_ACCT_MAX_DAY,
            ]);

            $match = null;
            foreach ($rows as $row) {
                Security::throttleHit('verify_code', (string)$row['id']); // record of guesses compared (monitoring)
                if ($match === null && preg_match('/^\d{6}$/', $code) && hash_equals((string)$row['code'], $code)) {
                    $match = $row;
                }
            }

            if ($match) {
                // Single use: only the request that deletes the code signs in
                $del = $db->prepare("DELETE FROM {$schema}.auth_codes WHERE id = ? RETURNING id");
                $del->execute([$match['id']]);
                if (!$del->fetchColumn()) {
                    return $invalid;
                }
                $db->prepare("DELETE FROM {$schema}.auth_codes WHERE email = ?")->execute([$email]);
                Security::throttleRemove($ipHit);
                Security::throttleRemove($acctHit);

                $stmt = $db->prepare("SELECT id, first_name, last_name FROM {$schema}.users WHERE email = ?");
                $stmt->execute([$email]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$user) {
                    return $invalid;
                }

                self::startUserSession($user['id'], $email, $user['first_name'], $user['last_name']);
                self::setRememberToken($user['id']);
                return ['success' => true, 'message' => 'Login successful'];
            }

            // Wrong code. Delete it once it has had CODE_MAX_ATTEMPTS guesses.
            $usedUp = false;
            foreach ($rows as $row) {
                if ((int)$row['attempts'] >= self::CODE_MAX_ATTEMPTS) {
                    $usedUp = true;
                }
            }
            if ($usedUp) {
                $db->prepare("DELETE FROM {$schema}.auth_codes WHERE email = ?")->execute([$email]);
                Security::throttleHit('verify_lock', $email);
                error_log("Login code for " . self::maskEmail($email) . " deleted after too many wrong attempts");
                return $locked;
            }
            // Too many wrong guesses for this account from this IP: tell this IP to wait, but keep the code
            // (deleting it here would let anyone who reached the limit wipe the owner's fresh code)
            if (!$acctOk) {
                return $wait;
            }
            return $invalid;

        } catch (Exception $e) {
            error_log("AuthManager::verifyLoginCode error: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred during verification'];
        }
    }

    /** Add one guess to each live code for this email, atomically; returns the codes still allowed a guess. */
    private static function countGuess($db, $schema, $email) {
        $stmt = $db->prepare("
            UPDATE {$schema}.auth_codes SET attempts = attempts + 1
            WHERE email = ? AND expires_at > NOW() AND attempts < ?
            RETURNING id, code, attempts
        ");
        $stmt->execute([$email, self::CODE_MAX_ATTEMPTS]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Older mode (no auth_codes.attempts column): the guesses per code are counted in the throttle store. */
    private static function countGuessOlderMode($db, $schema, $email) {
        $stmt = $db->prepare("SELECT id, code FROM {$schema}.auth_codes WHERE email = ? AND expires_at > NOW()");
        $stmt->execute([$email]);
        $rows = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            [$ok] = Security::throttleTake('code_guess', (string)$row['id'], [self::CODE_LIFETIME_SECONDS => self::CODE_MAX_ATTEMPTS]);
            if ($ok) {
                $row['attempts'] = Security::throttleCount('code_guess', (string)$row['id'], self::CODE_LIFETIME_SECONDS);
                $rows[] = $row;
            } else {
                $db->prepare("DELETE FROM {$schema}.auth_codes WHERE id = ?")->execute([$row['id']]);
            }
        }
        return $rows;
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

        $userId = $_SESSION['user_id'] ?? null;
        // Clear remember me token (database and cookies)
        self::clearRememberToken();

        // End sessions on every other device too
        if ($userId) {
            try {
                $db = Database::getInstance()->getDbConnection();
                $schema = Database::getSchema();
                if (self::ensureSchema($db, $schema)) {
                    $db->prepare("UPDATE {$schema}.users SET session_version = session_version + 1 WHERE id = ?")->execute([$userId]);
                } else {
                    error_log("AuthManager::logout: older mode (sign-in tables not upgraded), sessions on other devices are not ended");
                }
            } catch (Throwable $e) {
                error_log("AuthManager::logout session_version error: " . $e->getMessage());
            }
        }

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
            $valid = $session_age <= 86400; // Sessions last 24 hours; then fall back to the remember-me token
            if ($valid) {
                // Signed out elsewhere (or account gone): the session's version no longer matches
                try {
                    $current = self::sessionVersion($_SESSION['user_id']);
                    if ($current === null || $current !== (int)($_SESSION['session_version'] ?? 0)) {
                        $valid = false;
                    }
                } catch (Throwable $e) {
                    // Database trouble: keep the existing server-side session rather than sign everyone out
                    error_log("AuthManager::isLoggedIn session_version check error: " . $e->getMessage());
                }
            }
            if ($valid) {
                return true;
            }
            $_SESSION = [];
            session_destroy();
            session_start();
        }

        // Check remember me token if no active session
        if (isset($_COOKIE['remember_token']) && isset($_COOKIE['user_id'])
            && is_string($_COOKIE['remember_token']) && is_string($_COOKIE['user_id'])
            && ctype_digit($_COOKIE['user_id']) && strlen($_COOKIE['remember_token']) === 64) {
            try {
                set_time_limit(5); // Max 5 seconds for this operation
                $db = Database::getInstance()->getDbConnection();
                $schema = Database::getSchema();
                if (self::ensureSchema($db, $schema)) {
                    // Only a hash of the token is stored. Valid for 30 days from the last visit, and
                    // never more than REMEMBER_MAX_DAYS after it was issued at sign-in.
                    $stmt = $db->prepare("SELECT id, email, first_name, last_name FROM {$schema}.users
                        WHERE id = ? AND remember_token = ? AND remember_token_expires > NOW()
                          AND remember_token_issued_at > NOW() - (? * INTERVAL '1 day')");
                    $stmt->execute([$_COOKIE['user_id'], self::hashToken($_COOKIE['remember_token']), self::REMEMBER_MAX_DAYS]);
                } else {
                    // Older mode: the token is stored as it was before the upgrade (see ensureSchema)
                    $stmt = $db->prepare("SELECT id, email, first_name, last_name FROM {$schema}.users
                        WHERE id = ? AND remember_token = ? AND remember_token_expires > NOW()");
                    $stmt->execute([$_COOKIE['user_id'], $_COOKIE['remember_token']]);
                }
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user) {
                    // Restore session from remember token (new session id)
                    self::startUserSession($user['id'], $user['email'], $user['first_name'], $user['last_name']);

                    // Extend the same token for another 30 days (up to the 90-day cap). The token is not
                    // rotated here: the nginx auth check (auth_gatekeeper.php) runs this too and nginx drops
                    // the cookies it sets, so a rotated token would never reach the browser and the page
                    // itself would then see an invalid token.
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

    /**
     * Issue a new remember-me token at sign-in. One token per user: signing in on another device
     * replaces it. The database keeps only sha256(token).
     */
    public static function setRememberToken($userId) {
        COVERAGE_LOG('setRememberToken', __CLASS__, __FILE__, __LINE__);

        try {
            $token = bin2hex(random_bytes(32));
            $expiresTs = time() + self::REMEMBER_DAYS * 86400;

            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();
            if (self::ensureSchema($db, $schema)) {
                $stmt = $db->prepare("UPDATE {$schema}.users SET remember_token = ?, remember_token_expires = ?, remember_token_issued_at = NOW() WHERE id = ?");
                $stmt->execute([self::hashToken($token), date('Y-m-d H:i:s', $expiresTs), $userId]);
            } else {
                // Older mode: stored as before the upgrade, so the upgrade can still hash it later
                $stmt = $db->prepare("UPDATE {$schema}.users SET remember_token = ?, remember_token_expires = ? WHERE id = ?");
                $stmt->execute([$token, date('Y-m-d H:i:s', $expiresTs), $userId]);
            }

            // Set cookies (30 days): Secure, HttpOnly, SameSite=Lax
            Security::setAuthCookie('remember_token', $token, $expiresTs);
            Security::setAuthCookie('user_id', (string)$userId, $expiresTs);
            return true;
        } catch (Exception $e) {
            // Don't fail the login if remember token fails, just log the error
            error_log("AuthManager::setRememberToken error: " . $e->getMessage());
            return false;
        }
    }

    private static function extendRememberToken($userId, $token) {
        try {
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();
            if (self::ensureSchema($db, $schema)) {
                $stmt = $db->prepare("UPDATE {$schema}.users
                    SET remember_token_expires = LEAST(NOW() + (? * INTERVAL '1 day'), remember_token_issued_at + (? * INTERVAL '1 day'))
                    WHERE id = ? AND remember_token = ?
                    RETURNING EXTRACT(EPOCH FROM remember_token_expires - NOW())::bigint");
                $stmt->execute([self::REMEMBER_DAYS, self::REMEMBER_MAX_DAYS, $userId, self::hashToken($token)]);
            } else {
                $stmt = $db->prepare("UPDATE {$schema}.users
                    SET remember_token_expires = NOW() + (? * INTERVAL '1 day')
                    WHERE id = ? AND remember_token = ?
                    RETURNING EXTRACT(EPOCH FROM remember_token_expires - NOW())::bigint");
                $stmt->execute([self::REMEMBER_DAYS, $userId, $token]);
            }
            $left = $stmt->fetchColumn();
            if ($left !== false && (int)$left > 0) {
                $expiresTs = time() + (int)$left;
                Security::setAuthCookie('remember_token', $token, $expiresTs);
                Security::setAuthCookie('user_id', (string)$userId, $expiresTs);
            }
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
