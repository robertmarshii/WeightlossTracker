<?php
/**
 * Counts body fat estimates that could not be updated after a weight was added, changed or deleted
 * (Router.php syncBodyFatForDate). The weight is still saved; that day's estimate may then be out of date.
 * Keeps only times (no user ids, dates or values) in a small file, so /status can show a warning count.
 */
class BodyFatSyncLog
{
    const DIR = '/var/app/data';
    const KEEP_SECONDS = 86400 * 7;
    const MAX_LINES = 1000;

    private static function file(): string
    {
        $dir = (is_dir(self::DIR) && is_writable(self::DIR)) ? self::DIR : sys_get_temp_dir();
        return $dir . '/bodyfat-sync-failures.log';
    }

    /** Record one failure now. Never throws. */
    public static function record(): void
    {
        try {
            $fh = @fopen(self::file(), 'c+');
            if (!$fh) {
                return;
            }
            if (flock($fh, LOCK_EX)) {
                $since = time() - self::KEEP_SECONDS;
                $times = array_filter(array_map('intval', preg_split('/\s+/', (string)stream_get_contents($fh), -1, PREG_SPLIT_NO_EMPTY)),
                    fn ($t) => $t > $since);
                $times[] = time();
                $times = array_slice($times, -self::MAX_LINES);
                ftruncate($fh, 0);
                rewind($fh);
                fwrite($fh, implode("\n", $times) . "\n");
                flock($fh, LOCK_UN);
            }
            fclose($fh);
        } catch (Throwable $e) {
        }
    }

    /** Failures in the last $seconds (0 if none recorded). */
    public static function countSince(int $seconds): int
    {
        $text = @file_get_contents(self::file());
        if ($text === false) {
            return 0;
        }
        $since = time() - $seconds;
        return count(array_filter(preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY), fn ($t) => (int)$t > $since));
    }
}
