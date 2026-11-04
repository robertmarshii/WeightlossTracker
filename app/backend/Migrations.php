<?php
/**
 * One-off data fixes. Each runs exactly once per schema: its name is written to {schema}.app_migrations
 * in the same transaction as the fix (the primary key stops a second run, even two at the same time).
 *
 * Run at container start by supervisord (run-migrations.php) and, as a safety net, on the first
 * signed-in request (ProfileController). A marker file makes the later calls a cheap file check.
 */
class Migrations
{
    const MARKER_DIR = '/var/app/data';

    /** name => function (PDO $db, string $schema): string (details, kept in app_migrations) */
    private static function all(): array
    {
        return [
            '2026-11-04-caliper-metric-names' => [self::class, 'fixCaliperNames'],
        ];
    }

    /** Runs any fix not yet applied. Never throws; problems go to the error log. Returns lines for a log. */
    public static function run($db, string $schema): array
    {
        $out = [];
        if (!$db instanceof PDO || !preg_match('/^[a-z_][a-z0-9_]*$/', $schema)) {
            return ['skipped: no database connection or bad schema name'];
        }
        $marker = self::MARKER_DIR . '/migrations-' . $schema . '-' . count(self::all()) . '.done';
        if (is_file($marker)) {
            return ['all applied (marker file)'];
        }
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS {$schema}.app_migrations (
                name VARCHAR(100) PRIMARY KEY,
                applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
                details TEXT
            )");
        } catch (Throwable $e) {
            error_log('Migrations: cannot create app_migrations: ' . $e->getMessage());
            return ['failed: cannot create app_migrations'];
        }
        $allDone = true;
        foreach (self::all() as $name => $fix) {
            $stmt = $db->prepare("SELECT 1 FROM {$schema}.app_migrations WHERE name = ?");
            $stmt->execute([$name]);
            if ($stmt->fetchColumn()) {
                $out[] = "{$name}: already applied";
                continue;
            }
            try {
                $db->beginTransaction();
                $db->prepare("INSERT INTO {$schema}.app_migrations (name) VALUES (?)")->execute([$name]);
                $details = call_user_func($fix, $db, $schema);
                $db->prepare("UPDATE {$schema}.app_migrations SET details = ? WHERE name = ?")->execute([$details, $name]);
                $db->commit();
                $out[] = "{$name}: applied ({$details})";
                error_log("Migrations: {$name} applied in {$schema} ({$details})");
            } catch (Throwable $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                $allDone = false;
                $out[] = "{$name}: not applied: " . $e->getMessage();
                error_log("Migrations: {$name} not applied in {$schema}: " . $e->getMessage());
            }
        }
        if ($allDone && is_dir(self::MARKER_DIR) && is_writable(self::MARKER_DIR)) {
            @file_put_contents($marker, date('c') . "\n");
        }
        return $out;
    }

    /**
     * Caliper readings were saved under the wrong metric names (since the Body page was added, Oct 2025):
     *   armpit card -> caliper_abdomen, belly card -> caliper_thigh, thigh card -> caliper_tricep.
     * The app never had a triceps site and always used this same mapping, so every row with those
     * three names came from it and can be renamed safely:
     *   caliper_abdomen -> caliper_midaxillary, caliper_thigh -> caliper_abdomen, caliper_tricep -> caliper_thigh.
     * caliper_chest and caliper_suprailiac (hip) were already right. Renamed through temporary names so the
     * (user_id, metric_type, entry_date) unique key never clashes part-way.
     */
    public static function fixCaliperNames(PDO $db, string $schema): string
    {
        $t = "{$schema}.body_data_entries";
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
