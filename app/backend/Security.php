<?php
/**
 * Small security helpers shared by the routers and AuthManager.
 *
 * - isTestEnv(): test-only behaviour (fixed codes, peek_code, seeders, schema switching,
 *   test cookies) is allowed ONLY when the server environment variable APP_ENV=test is set.
 *   Production never sets it. The Host header is never trusted for this.
 * - Throttle: counts events per bucket in the database table <schema>.security_throttle
 *   (created on first use). If the table cannot be used, falls back to a private file.
 * - CSRF: one random token per session, sent by the frontend as the X-CSRF-Token header
 *   (or a csrf_token POST field) on state-changing requests.
 * - Cookies: one place that sets auth cookies with Secure/HttpOnly/SameSite.
 */

class Security
{
    /**
     * Version of the dashboard's JavaScript/API contract. dashboard.php puts it in <meta name="app-version">,
     * js/global.js sends it as X-App-Version and the API sends it back. Raise it when an older open tab
     * would save data wrongly (2: caliper readings saved under their real site names, Nov 2026).
     */
    const CLIENT_VERSION = 2;

    /** The X-App-Version an open dashboard sent (0 for pages loaded before the header existed). */
    public static function clientVersion(): int
    {
        $v = $_SERVER['HTTP_X_APP_VERSION'] ?? '';
        return (is_string($v) && ctype_digit($v)) ? (int)$v : 0;
    }

    private static $throttleReady = [];
    private const FALLBACK_FILE = '/var/app/data/throttle.json';

    public static function isTestEnv(): bool
    {
        $value = getenv('APP_ENV');
        if ($value === false || $value === '') {
            $value = $_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? '';
        }
        return strtolower((string)$value) === 'test';
    }

    /** Test cookie (e.g. cypress_testing) - honoured only when APP_ENV=test. */
    public static function testCookie(string $name): bool
    {
        return self::isTestEnv() && (($_COOKIE[$name] ?? '') === 'true');
    }

    /** True when outgoing email is switched off by server config (local smoke tests). */
    public static function mailDisabled(): bool
    {
        $value = getenv('MAIL_DISABLED');
        if ($value === false || $value === '') {
            $value = $_ENV['MAIL_DISABLED'] ?? '';
        }
        return self::isTestEnv() || strtolower((string)$value) === 'true';
    }

    /**
     * Client IP. Behind the hosting proxy REMOTE_ADDR is the proxy's private address, so in that
     * case use the right-most X-Forwarded-For entry (the one the proxy appended itself); entries
     * further left are client-supplied and could be forged.
     */
    public static function clientIp(): string
    {
        $remote = $_SERVER['REMOTE_ADDR'] ?? '';
        $isPrivate = $remote !== '' && filter_var(
            $remote,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) === false;
        if ($isPrivate && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $parts = array_map('trim', explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']));
            $last = end($parts);
            if (filter_var($last, FILTER_VALIDATE_IP)) {
                return $last;
            }
        }
        return $remote !== '' ? $remote : 'unknown';
    }

    private static function bucketKey(string $kind, string $subject): string
    {
        return $kind . ':' . hash('sha256', strtolower(trim($subject)));
    }

    /**
     * Record one event for (kind, subject). Returns the row id (database store) so a caller that
     * records an attempt before checking it can take it back with throttleRemove(); null for the file store.
     */
    public static function throttleHit(string $kind, string $subject): ?int
    {
        $bucket = self::bucketKey($kind, $subject);
        try {
            [$db, $table] = self::throttleTable();
            $stmt = $db->prepare("INSERT INTO {$table} (bucket, created_at) VALUES (?, NOW()) RETURNING id");
            $stmt->execute([$bucket]);
            $id = (int)$stmt->fetchColumn();
            if (random_int(1, 100) === 1) {
                // Keep 2 days: the longest window in use is 24 hours
                $db->exec("DELETE FROM {$table} WHERE created_at < NOW() - INTERVAL '2 days'");
            }
            return $id;
        } catch (Throwable $e) {
            error_log('Security throttle (db) unavailable, using file store: ' . $e->getMessage());
            self::fileUpdate(function (array $data) use ($bucket) {
                $data[$bucket][] = time();
                return $data;
            });
            return null;
        }
    }

    /** Take back one event recorded by throttleHit(). */
    public static function throttleRemove(?int $id): void
    {
        if (!$id) {
            return;
        }
        try {
            [$db, $table] = self::throttleTable();
            $db->prepare("DELETE FROM {$table} WHERE id = ?")->execute([$id]);
        } catch (Throwable $e) {
            error_log('Security throttle remove failed: ' . $e->getMessage());
        }
    }

    /**
     * Record an attempt first, then count, so parallel requests cannot all pass a check that each
     * made before the others were recorded. $limits maps window seconds => max events allowed in it.
     * Returns [allowed, rowId]. When not allowed the attempt is not kept.
     */
    public static function throttleTake(string $kind, string $subject, array $limits): array
    {
        $id = self::throttleHit($kind, $subject);
        foreach ($limits as $seconds => $max) {
            if (self::throttleCount($kind, $subject, (int)$seconds) > $max) {
                self::throttleRemove($id);
                return [false, null];
            }
        }
        return [true, $id];
    }

    /** Number of events for (kind, subject) in the last $seconds. */
    public static function throttleCount(string $kind, string $subject, int $seconds): int
    {
        $bucket = self::bucketKey($kind, $subject);
        try {
            [$db, $table] = self::throttleTable();
            $stmt = $db->prepare("SELECT COUNT(*) FROM {$table} WHERE bucket = ? AND created_at > NOW() - (? * INTERVAL '1 second')");
            $stmt->execute([$bucket, $seconds]);
            return (int)$stmt->fetchColumn();
        } catch (Throwable $e) {
            error_log('Security throttle (db) unavailable, using file store: ' . $e->getMessage());
            $data = self::fileRead();
            $since = time() - $seconds;
            return count(array_filter($data[$bucket] ?? [], function ($t) use ($since) { return $t > $since; }));
        }
    }

    /** Remove all events for (kind, subject). */
    public static function throttleClear(string $kind, string $subject): void
    {
        $bucket = self::bucketKey($kind, $subject);
        try {
            [$db, $table] = self::throttleTable();
            $db->prepare("DELETE FROM {$table} WHERE bucket = ?")->execute([$bucket]);
        } catch (Throwable $e) {
            self::fileUpdate(function (array $data) use ($bucket) {
                unset($data[$bucket]);
                return $data;
            });
        }
    }

    /** Remove every throttle event (test helper only). */
    public static function throttleClearAll(): void
    {
        try {
            [$db, $table] = self::throttleTable();
            $db->exec("DELETE FROM {$table}");
        } catch (Throwable $e) {
            self::fileUpdate(function () { return []; });
        }
    }

    private static function throttleTable(): array
    {
        require_once('/var/app/backend/Config.php');
        $db = Database::getInstance()->getdbConnection();
        if (!$db) {
            throw new RuntimeException('no database connection');
        }
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $schema = Database::getSchema();
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $schema)) {
            throw new RuntimeException('bad schema name');
        }
        $table = $schema . '.security_throttle';
        if (empty(self::$throttleReady[$schema])) {
            $exists = $db->query("SELECT to_regclass('{$table}') IS NOT NULL")->fetchColumn();
            if (!$exists) {
                $db->exec("CREATE TABLE IF NOT EXISTS {$table} (
                    id BIGSERIAL PRIMARY KEY,
                    bucket VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                )");
                $db->exec("CREATE INDEX IF NOT EXISTS security_throttle_bucket_idx ON {$table} (bucket, created_at)");
            }
            self::$throttleReady[$schema] = true;
        }
        return [$db, $table];
    }

    private static function fileRead(): array
    {
        if (!is_file(self::FALLBACK_FILE)) {
            return [];
        }
        $data = json_decode((string)@file_get_contents(self::FALLBACK_FILE), true);
        return is_array($data) ? $data : [];
    }

    private static function fileUpdate(callable $change): void
    {
        $dir = dirname(self::FALLBACK_FILE);
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        $fh = @fopen(self::FALLBACK_FILE, 'c+');
        if (!$fh) {
            error_log('Security throttle: file store not writable');
            return;
        }
        @chmod(self::FALLBACK_FILE, 0600);
        flock($fh, LOCK_EX);
        $raw = stream_get_contents($fh);
        $data = json_decode((string)$raw, true);
        $data = is_array($data) ? $data : [];
        $data = $change($data);
        $cutoff = time() - 2 * 86400;
        foreach ($data as $bucket => $times) {
            $data[$bucket] = array_values(array_filter((array)$times, function ($t) use ($cutoff) { return $t > $cutoff; }));
            if (!$data[$bucket]) {
                unset($data[$bucket]);
            }
        }
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($data));
        fflush($fh);
        flock($fh, LOCK_UN);
        fclose($fh);
    }

    // ---------------- Same-origin check (login CSRF) ----------------

    /** Origins allowed to POST to the login router. Extra local origins can be added with ALLOWED_ORIGINS (comma separated). */
    public static function allowedOrigins(): array
    {
        $origins = [
            'https://weightloss-tracker.com',
            'http://localhost:8111',
            'http://127.0.0.1:8111',
        ];
        $extra = getenv('ALLOWED_ORIGINS');
        if ($extra === false || $extra === '') {
            $extra = $_ENV['ALLOWED_ORIGINS'] ?? '';
        }
        foreach (explode(',', (string)$extra) as $o) {
            $o = rtrim(trim($o), '/');
            if ($o !== '') {
                $origins[] = $o;
            }
        }
        return $origins;
    }

    /**
     * True when a POST comes from one of our own pages: the Origin header is one of ours, or, when the
     * browser sent no Origin, Sec-Fetch-Site says same-origin. Requests with neither are refused.
     */
    public static function sameOriginRequest(): bool
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
        if (is_string($origin) && $origin !== '') {
            return in_array(rtrim($origin, '/'), self::allowedOrigins(), true);
        }
        return strtolower((string)($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '')) === 'same-origin';
    }

    // ---------------- CSRF ----------------

    public static function csrfToken(): string
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public static function csrfValid(): bool
    {
        $expected = $_SESSION['csrf_token'] ?? '';
        $given = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['csrf_token'] ?? '');
        return is_string($expected) && $expected !== '' && is_string($given) && hash_equals($expected, $given);
    }

    // ---------------- Cookies ----------------

    public static function isHttps(): bool
    {
        if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
            return true;
        }
        return strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    }

    public static function setAuthCookie(string $name, string $value, int $expires): void
    {
        setcookie($name, $value, [
            'expires' => $expires,
            'path' => '/',
            // Secure everywhere except plain-http local test runs (APP_ENV=test)
            'secure' => !self::isTestEnv() || self::isHttps(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    public static function clearAuthCookies(): void
    {
        self::setAuthCookie('remember_token', '', time() - 3600);
        self::setAuthCookie('user_id', '', time() - 3600);
    }
}
