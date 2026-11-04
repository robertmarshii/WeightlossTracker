<?php
/**
 * One-off data fixes. Each runs exactly once per schema: its name is written to {schema}.app_migrations
 * in the same transaction as the fix.
 *
 * Main path: run-migrations.php, started once by supervisord when the container starts (MODE_STARTUP).
 * Safety net: the first signed-in requests (ProfileController, MODE_REQUEST). There it is a cheap check:
 *   - a marker file says everything is applied -> nothing else happens;
 *   - after a failure it waits RETRY_AFTER_SECONDS before trying again, so a broken fix is tried (and
 *     logged) at most once every few minutes instead of on every request;
 *   - it waits at most REQUEST_LOCK_WAIT for another process that is applying a fix, then gives up quietly.
 *
 * Concurrency: every fix runs inside a transaction holding a per-schema advisory lock
 * (pg_advisory_xact_lock), so two processes never apply fixes at the same time; the second one sees the
 * first one's app_migrations row once it gets the lock and does nothing.
 */
class Migrations
{
    const MARKER_DIR = '/var/app/data';
    const MODE_STARTUP = 'startup';
    const MODE_REQUEST = 'request';
    const RETRY_AFTER_SECONDS = 300;
    const REQUEST_LOCK_WAIT = '2s';
    const STARTUP_LOCK_WAIT = '60s';

    /** name => function (PDO $db, string $schema): string (details, kept in app_migrations) */
    private static function all(): array
    {
        return [
            '2026-11-04-caliper-metric-names' => [self::class, 'fixCaliperNames'],
        ];
    }

    /** Folder for the marker and back-off files: /var/app/data in the image, else the temp folder. */
    private static function stateDir(): string
    {
        return (is_dir(self::MARKER_DIR) && is_writable(self::MARKER_DIR)) ? self::MARKER_DIR : sys_get_temp_dir();
    }

    public static function markerFile(string $schema): string
    {
        return self::stateDir() . '/migrations-' . $schema . '-' . count(self::all()) . '.done';
    }

    public static function backoffFile(string $schema): string
    {
        return self::stateDir() . '/migrations-' . $schema . '.failed';
    }

    /** Same number for the same schema in every process (fits PostgreSQL's bigint advisory lock key). */
    private static function lockKey(string $schema): int
    {
        return crc32('weightloss-tracker-migrations:' . $schema);
    }

    /**
     * Runs any fix not yet applied. Never throws; problems go to the error log (one line per attempt).
     * Returns lines for a log.
     */
    public static function run($db, string $schema, string $mode = self::MODE_REQUEST): array
    {
        if (!$db instanceof PDO || !preg_match('/^[a-z_][a-z0-9_]*$/', $schema)) {
            return ['skipped: no database connection or bad schema name'];
        }
        $marker = self::markerFile($schema);
        if (is_file($marker)) {
            return ['all applied (marker file)'];
        }
        $backoff = self::backoffFile($schema);
        if ($mode === self::MODE_REQUEST && is_file($backoff) && time() - (int)@filemtime($backoff) < self::RETRY_AFTER_SECONDS) {
            return ['waiting before trying again (last attempt failed)'];
        }

        $prevErrMode = $db->getAttribute(PDO::ATTR_ERRMODE);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $wait = $mode === self::MODE_STARTUP ? self::STARTUP_LOCK_WAIT : self::REQUEST_LOCK_WAIT;
        $out = [];
        $allDone = true;
        $failed = null;
        foreach (self::all() as $name => $fix) {
            try {
                $db->beginTransaction();
                $db->exec("SET LOCAL lock_timeout = '{$wait}'");
                $db->query('SELECT pg_advisory_xact_lock(' . self::lockKey($schema) . ')');
                $db->exec("CREATE TABLE IF NOT EXISTS {$schema}.app_migrations (
                    name VARCHAR(100) PRIMARY KEY,
                    applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    details TEXT
                )");
                $stmt = $db->prepare("SELECT 1 FROM {$schema}.app_migrations WHERE name = ?");
                $stmt->execute([$name]);
                if ($stmt->fetchColumn()) {
                    $db->commit();
                    $out[] = "{$name}: already applied";
                    continue;
                }
                $details = call_user_func($fix, $db, $schema);
                $db->prepare("INSERT INTO {$schema}.app_migrations (name, details) VALUES (?, ?)")->execute([$name, $details]);
                $db->commit();
                $out[] = "{$name}: applied ({$details})";
                error_log("Migrations: {$name} applied in {$schema} ({$details})");
            } catch (Throwable $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                $allDone = false;
                // 55P03 = lock_not_available: another process is applying fixes right now. Not a failure.
                if ($e instanceof PDOException && ($e->getCode() === '55P03' || strpos($e->getMessage(), '55P03') !== false)) {
                    $out[] = "{$name}: busy (another process is applying fixes)";
                    break;
                }
                $failed = "{$name}: " . $e->getMessage();
                $out[] = "{$name}: not applied: " . $e->getMessage();
                break;
            }
        }
        $db->setAttribute(PDO::ATTR_ERRMODE, $prevErrMode);

        if ($failed !== null) {
            // One log line per attempt; the back-off file keeps request-time attempts to one every few minutes
            error_log("Migrations: not applied in {$schema}, next try in " . self::RETRY_AFTER_SECONDS . "s: {$failed}");
            // Keep the reason (counts and SQL errors only, no user data) so /status can show it
            $reason = preg_replace('/\s+/', ' ', substr($failed, 0, 300));
            if (@file_put_contents($backoff, date('c') . ' ' . $reason . "\n") === false) {
                @touch($backoff);
            }
        }
        // Last result of any attempt (startup or request), for /status. No user data in these lines.
        @file_put_contents(self::stateDir() . '/migrations-' . $schema . '.last',
            date('c') . ' ' . $mode . ': ' . preg_replace('/\s+/', ' ', substr(implode('; ', $out), 0, 400)) . "\n");
        if ($allDone) {
            @file_put_contents($marker, date('c') . "\n");
            @unlink($backoff);
        }
        return $out;
    }

    /** Last recorded failure reason (from the back-off file), or null if none. For /status. */
    public static function lastFailure(string $schema): ?string
    {
        if (!preg_match('/^[a-z_][a-z0-9_]*$/', $schema)) {
            return null;
        }
        $text = @file_get_contents(self::backoffFile($schema));
        return ($text === false || trim($text) === '') ? null : trim($text);
    }

    /** Diagnostics for /status: last attempt, marker and table presence. */
    public static function diagnostics($db, string $schema): string
    {
        if (!preg_match('/^[a-z_][a-z0-9_]*$/', $schema)) {
            return 'bad schema name';
        }
        $last = @file_get_contents(self::stateDir() . '/migrations-' . $schema . '.last');
        $table = 'unknown';
        try {
            $q = $db->prepare("SELECT to_regclass(?) IS NOT NULL");
            $q->execute(["{$schema}.app_migrations"]);
            $table = $q->fetchColumn() ? 'yes' : 'no';
        } catch (Throwable $e) {
        }
        return 'last attempt: ' . ($last === false ? 'none recorded' : trim($last))
            . '; marker file: ' . (is_file(self::markerFile($schema)) ? 'yes' : 'no')
            . '; app_migrations table: ' . $table;
    }

    /** Names of fixes not applied yet (read-only, for /status). Null if the database can't be read. */
    public static function pending($db, string $schema): ?array
    {
        if (!$db instanceof PDO || !preg_match('/^[a-z_][a-z0-9_]*$/', $schema)) {
            return null;
        }
        try {
            $exists = $db->prepare("SELECT to_regclass(?) IS NOT NULL");
            $exists->execute(["{$schema}.app_migrations"]);
            $applied = $exists->fetchColumn()
                ? $db->query("SELECT name FROM {$schema}.app_migrations")->fetchAll(PDO::FETCH_COLUMN)
                : [];
        } catch (Throwable $e) {
            return null;
        }
        return array_values(array_diff(array_keys(self::all()), $applied));
    }

    /**
     * Caliper readings were saved under the wrong metric names (since the Body page was added, Oct 2025):
     *   armpit card -> caliper_abdomen, belly card -> caliper_thigh, thigh card -> caliper_tricep.
     * The app never had a triceps site and always used this same mapping, so every row with those
     * three names came from it and can be renamed safely:
     *   caliper_abdomen -> caliper_midaxillary, caliper_thigh -> caliper_abdomen, caliper_tricep -> caliper_thigh.
     * caliper_chest and caliper_suprailiac (hip) were already right. Renamed through temporary names so the
     * (user_id, metric_type, entry_date) unique key never clashes part-way.
     *
     * Only safe while every caliper_abdomen / caliper_thigh row is old-style. If the fixed page has already
     * saved rows (caliper_midaxillary exists), old and new meanings are mixed: renaming would move new
     * readings to the wrong site, so it refuses and raises an alert in the log instead.
     */
    public static function fixCaliperNames(PDO $db, string $schema): string
    {
        $t = "{$schema}.body_data_entries";
        // Nobody can add or change readings until this transaction ends (reading is still allowed)
        $db->exec("LOCK TABLE {$t} IN SHARE ROW EXCLUSIVE MODE");
        $newStyle = (int)$db->query("SELECT COUNT(*) FROM {$t} WHERE metric_type = 'caliper_midaxillary'")->fetchColumn();
        if ($newStyle > 0) {
            // run() writes this to the error log (one line per attempt, at most every few minutes)
            throw new RuntimeException("ALERT caliper rename refused: {$newStyle} caliper_midaxillary rows already exist, "
                . "so caliper_abdomen/caliper_thigh rows may mix old and new meanings. Needs a manual check.");
        }
        $counts = $db->query("SELECT metric_type, COUNT(*) FROM {$t}
            WHERE metric_type IN ('caliper_abdomen', 'caliper_thigh', 'caliper_tricep') GROUP BY metric_type")
            ->fetchAll(PDO::FETCH_KEY_PAIR);
        $db->exec("UPDATE {$t} SET metric_type = CASE metric_type
                WHEN 'caliper_abdomen' THEN 'tmpfix_caliper_midaxillary'
                WHEN 'caliper_thigh' THEN 'tmpfix_caliper_abdomen'
                WHEN 'caliper_tricep' THEN 'tmpfix_caliper_thigh'
            END
            WHERE metric_type IN ('caliper_abdomen', 'caliper_thigh', 'caliper_tricep')");
        $db->exec("UPDATE {$t} SET metric_type = substr(metric_type, 8) WHERE metric_type LIKE 'tmpfix\\_caliper\\_%'");
        return sprintf('renamed %d armpit, %d belly, %d thigh rows',
            (int)($counts['caliper_abdomen'] ?? 0), (int)($counts['caliper_thigh'] ?? 0), (int)($counts['caliper_tricep'] ?? 0));
    }
}
