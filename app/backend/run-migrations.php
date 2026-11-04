<?php
/**
 * Applies pending one-off data fixes (see Migrations.php). Started once by supervisord when the
 * container starts; this is the main path. Safe to run again by hand: php /var/app/backend/run-migrations.php
 */
if (php_sapi_name() !== 'cli') {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Migrations.php';

$schema = Database::getSchema();
$db = Database::getInstance()->getdbConnection();
// The database may still be starting: try to connect for up to about a minute
for ($try = 1; !$db instanceof PDO && $try <= 12; $try++) {
    sleep(5);
    try {
        $db = new PDO(
            'pgsql:host=' . ($_ENV['PG_HOST'] ?? 'pgsql') . ';dbname=' . ($_ENV['PG_DATABASE'] ?? 'db') . ';port=' . ($_ENV['PG_PORT'] ?? '5432'),
            $_ENV['PG_USER'] ?? 'user',
            $_ENV['PG_PASSWORD'] ?? 'password'
        );
    } catch (Throwable $e) {
        $db = null;
        Migrations::$connectError = preg_replace('/\s+/', ' ', substr($e->getMessage(), 0, 200));
    }
}
// If this fails, signed-in requests try again, at most once every few minutes
foreach (Migrations::run($db, $schema, Migrations::MODE_STARTUP) as $line) {
    echo "[migrations] {$schema}: {$line}\n";
}
