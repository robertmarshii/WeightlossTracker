<?php
/**
 * Applies pending one-off data fixes (see Migrations.php). Started once by supervisord when the
 * container starts; safe to run again by hand: php /var/app/backend/run-migrations.php
 */
if (php_sapi_name() !== 'cli') {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Migrations.php';

$db = Database::getInstance()->getdbConnection();
$schema = Database::getSchema();
// If this fails (e.g. the database is not reachable yet), the first signed-in request retries it
foreach (Migrations::run($db, $schema) as $line) {
    echo "[migrations] {$schema}: {$line}\n";
}
