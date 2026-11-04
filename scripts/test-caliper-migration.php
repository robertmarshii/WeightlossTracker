<?php
/**
 * Checks the one-off caliper name fix (app/backend/Migrations.php) on a throwaway schema
 * (wt_migration_test, dropped at the end). Needs a test database, never production:
 *   docker run --rm --network <net> -e PG_HOST=... -e PG_PORT=5432 -e PG_DATABASE=... -e PG_USER=... -e PG_PASSWORD=... \
 *     -v "$PWD/scripts:/scripts:ro" <image> php /scripts/test-caliper-migration.php
 * Exit code 1 if a check fails.
 */
require_once '/var/app/backend/Config.php';
require_once '/var/app/backend/Migrations.php';

$db = Database::getInstance()->getdbConnection();
if (!$db instanceof PDO) {
    fwrite(STDERR, "No database connection\n");
    exit(1);
}
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$s = 'wt_migration_test';
$fails = 0;
function check($label, $actual, $expected)
{
    global $fails;
    $a = json_encode($actual);
    $e = json_encode($expected);
    if ($a === $e) {
        echo "ok   {$label}\n";
    } else {
        $fails++;
        echo "FAIL {$label}: got {$a}, expected {$e}\n";
    }
}

$db->exec("DROP SCHEMA IF EXISTS {$s} CASCADE; CREATE SCHEMA {$s}");
$db->exec("CREATE TABLE {$s}.body_data_entries (
    id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(6,2) NOT NULL, unit VARCHAR(10) NOT NULL, entry_date DATE NOT NULL,
    CONSTRAINT unique_body_metric_per_day UNIQUE (user_id, metric_type, entry_date))");
// As the old page saved them: chest ok, armpit as abdomen, belly as thigh, thigh as tricep, hip as suprailiac
$rows = [
    [1, 'caliper_chest', 11, '2026-10-01'], [1, 'caliper_abdomen', 12, '2026-10-01'], [1, 'caliper_thigh', 13, '2026-10-01'],
    [1, 'caliper_tricep', 14, '2026-10-01'], [1, 'caliper_suprailiac', 15, '2026-10-01'],
    [1, 'caliper_thigh', 23, '2026-10-08'], [2, 'caliper_tricep', 34, '2026-10-01'], [2, 'measurement_thigh', 60, '2026-10-01'],
];
$ins = $db->prepare("INSERT INTO {$s}.body_data_entries (user_id, metric_type, value, unit, entry_date) VALUES (?, ?, ?, 'mm', ?)");
foreach ($rows as $r) {
    $ins->execute($r);
}

$first = Migrations::run($db, $s);
check('first run applies', $first, ['2026-11-04-caliper-metric-names: applied (renamed 1 armpit, 2 belly, 2 thigh rows)']);

$got = $db->query("SELECT user_id || ' ' || metric_type || ' ' || entry_date || ' ' || value::int FROM {$s}.body_data_entries ORDER BY user_id, entry_date, value")
    ->fetchAll(PDO::FETCH_COLUMN);
check('rows renamed by site', $got, [
    '1 caliper_chest 2026-10-01 11', '1 caliper_midaxillary 2026-10-01 12', '1 caliper_abdomen 2026-10-01 13',
    '1 caliper_thigh 2026-10-01 14', '1 caliper_suprailiac 2026-10-01 15', '1 caliper_abdomen 2026-10-08 23',
    '2 caliper_thigh 2026-10-01 34', '2 measurement_thigh 2026-10-01 60',
]);

// Runs once only: even without the marker file, a second run must not rename again
@unlink(Migrations::MARKER_DIR . "/migrations-{$s}-1.done");
$db->exec("INSERT INTO {$s}.body_data_entries (user_id, metric_type, value, unit, entry_date) VALUES (3, 'caliper_abdomen', 40, 'mm', '2026-11-05')");
$second = Migrations::run($db, $s);
check('second run does nothing', $second, ['2026-11-04-caliper-metric-names: already applied']);
check('new rows after the fix keep their name',
    $db->query("SELECT metric_type FROM {$s}.body_data_entries WHERE user_id = 3")->fetchColumn(), 'caliper_abdomen');

$db->exec("DROP SCHEMA {$s} CASCADE");
@unlink(Migrations::MARKER_DIR . "/migrations-{$s}-1.done");
echo $fails ? "\n{$fails} check(s) failed\n" : "\nAll checks passed\n";
exit($fails ? 1 : 0);
