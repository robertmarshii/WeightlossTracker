<?php
// Password-protected status page: /status. HTTP Basic auth, any username.
// Only a bcrypt hash of the password is stored here. Prints no environment, config or secrets.
declare(strict_types=1);

const STATUS_PASSWORD_HASH = '$2y$12$jvH7lq./cZN8/MOQkDHG7Ocv6ap/iIpvEHB5EGDgqvDGUk0AX1hoq';
const STATUS_APP_NAME = 'WeightlossTracker';
const STATUS_VERSION_FILE = '/srv/git-sha';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
header('Content-Type: text/plain; charset=utf-8');

function status_given_password(): ?string
{
    if (isset($_SERVER['PHP_AUTH_PW']) && is_string($_SERVER['PHP_AUTH_PW'])) {
        return $_SERVER['PHP_AUTH_PW'];
    }
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (is_string($header) && stripos($header, 'Basic ') === 0) {
        $decoded = base64_decode(substr($header, 6), true);
        if ($decoded !== false && strpos($decoded, ':') !== false) {
            return explode(':', $decoded, 2)[1];
        }
    }
    return null;
}

$given = status_given_password();
// password_verify compares in constant time.
if ($given === null || !password_verify($given, STATUS_PASSWORD_HASH)) {
    http_response_code(401);
    header('WWW-Authenticate: Basic realm="status", charset="UTF-8"');
    echo "Unauthorized\n";
    exit;
}

$lines = [];
$allOk = true;
$add = function (string $check, bool $ok, string $why = '') use (&$lines, &$allOk): void {
    $lines[] = $check . '  Result: ' . ($ok ? 'OK' : 'FAIL, ' . $why);
    if (!$ok) {
        $allOk = false;
    }
};

$add('App: ' . STATUS_APP_NAME, true);

$sha = is_readable(STATUS_VERSION_FILE) ? trim((string) file_get_contents(STATUS_VERSION_FILE)) : '';
$shaOk = (bool) preg_match('/^[0-9a-f]{7,40}$/i', $sha);
$add('Version: ' . ($shaOk ? $sha : 'unknown'), $shaOk, 'the build did not record its git commit');

$patched = ['8.2' => '8.2.35', '8.3' => '8.3.36', '8.4' => '8.4.27', '8.5' => '8.5.12'];
$branch = PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION;
$phpOk = PHP_EXTRA_VERSION === ''
    && isset($patched[$branch])
    && version_compare(PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '.' . PHP_RELEASE_VERSION, $patched[$branch], '>=');
$add('PHP version: ' . PHP_VERSION, $phpOk, 'not patched');

// Database reachable: a read-only SELECT 1 through the app's own connection helper.
$dbOk = false;
ob_start(); // the helper echoes connection errors; never show them
try {
    require_once '/var/app/backend/Config.php';
    $pdo = Database::getInstance()->getdbConnection();
    if ($pdo instanceof PDO) {
        $stmt = $pdo->query('SELECT 1');
        $dbOk = $stmt !== false && (int) $stmt->fetchColumn() === 1;
    }
} catch (Throwable $e) {
    $dbOk = false;
}
ob_end_clean();
$add('Database reachable', $dbOk, 'could not run SELECT 1');

// Email settings: present, and the Scaleway key is accepted (a read-only call; no email is sent, no value is shown).
$envv = function (string $n): string { $v = $_ENV[$n] ?? getenv($n); return is_string($v) ? trim($v) : ''; };
$missing = array_values(array_filter(['SCW_SECRET_KEY', 'SCW_PROJECT_ID', 'MAIL_FROM_EMAIL'], fn ($n) => $envv($n) === ''));
$add('Email settings present', !$missing, 'missing ' . implode(', ', $missing));
if (!$missing) {
    $ch = curl_init('https://api.scaleway.com/transactional-email/v1alpha1/regions/fr-par/domains?project_id=' . rawurlencode($envv('SCW_PROJECT_ID')));
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_HTTPHEADER => ['X-Auth-Token: ' . $envv('SCW_SECRET_KEY')]]);
    $body = (string) curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $from = strtolower($envv('MAIL_FROM_EMAIL'));
    $domain = substr($from, strpos($from, '@') + 1);
    $found = '';
    foreach ((json_decode($body, true)['domains'] ?? []) as $d) {
        if (strtolower($d['name'] ?? '') === $domain) { $found = (string) ($d['status'] ?? ''); }
    }
    $add('Email service accepts the key', $code === 200, 'Scaleway answered HTTP ' . $code);
    if ($code === 200) {
        $add('Sender domain ' . $domain . ' verified', $found === 'checked', $found === '' ? 'domain not in this project' : 'status ' . $found);
    }
}

foreach ($lines as $line) {
    echo $line, "\n";
}
if ($allOk) {
    echo "All good.\n";
}
