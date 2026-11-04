<?php
/**
 * Checks that reminder and monthly report emails show weights in the user's unit (kg, lbs, st).
 * Sends nothing and needs no database.
 *
 * Run in the app image (the backend expects /var/app/backend):
 *   docker run --rm -v "$PWD/scripts:/scripts:ro" <image> php /scripts/test-email-units.php [--print]
 * Exit code 1 if a check fails.
 */
require_once '/var/app/backend/NotificationScheduler.php';

$fails = 0;
function check($label, $actual, $expected)
{
    global $fails;
    if ($actual === $expected) {
        echo "ok   {$label}: {$actual}\n";
    } else {
        $fails++;
        echo "FAIL {$label}: got '{$actual}', expected '{$expected}'\n";
    }
}
function contains($label, $haystack, $needle)
{
    global $fails;
    if (strpos($haystack, $needle) !== false) {
        echo "ok   {$label} contains '{$needle}'\n";
    } else {
        $fails++;
        echo "FAIL {$label} does not contain '{$needle}'\n";
    }
}

// Unit codes as stored in user_settings.weight_unit
check('normalise lbs', WeightUnits::normalise('lbs'), 'lbs');
check('normalise lb', WeightUnits::normalise('lb'), 'lbs');
check('normalise st', WeightUnits::normalise('st'), 'st');
check('normalise null', WeightUnits::normalise(null), 'kg');

// 83.6 kg = 184.307 lb = 13 st 2.3 lb
check('kg', WeightUnits::format(83.6, 'kg'), '83.6 kg');
check('lbs', WeightUnits::format(83.6, 'lbs'), '184.3 lbs');
check('st', WeightUnits::format(83.6, 'st'), '13 st 2.3 lb');
check('st under one stone', WeightUnits::format(1.2, 'st'), '2.6 lb');
check('st exact stones', WeightUnits::format(63.5029, 'st'), '10 st 0.0 lb');
check('st rounding up to a whole stone', WeightUnits::format(6.3477, 'st'), '1 st 0.0 lb');
check('float noise', WeightUnits::format(105.3 - 104.1, 'kg'), '1.2 kg');

$weekly = ['current_weight' => '83.6', 'goal_weight' => '80.0', 'week_ago_weight' => '84.8', 'current_date' => '2026-11-03', 'goal_date' => null];
$monthly = [
    'weights' => [
        ['weight_kg' => '86.1', 'entry_date' => '2026-10-02'],
        ['weight_kg' => '85.0', 'entry_date' => '2026-10-16'],
        ['weight_kg' => '84.2', 'entry_date' => '2026-10-30'],
    ],
    'previous_month_weight' => '86.5',
    'entries_count' => 3,
    'month_name' => 'October 2026',
];

$expect = [
    'kg'  => ['83.6 kg', '80.0 kg', 'lost 1.2 kg', '86.1 kg', '84.2 kg', '-1.9 kg', 'Oct 16: 85.0 kg'],
    'lbs' => ['184.3 lbs', '176.4 lbs', 'lost 2.6 lbs', '189.8 lbs', '185.6 lbs', '-4.2 lbs', 'Oct 16: 187.4 lbs'],
    'st'  => ['13 st 2.3 lb', '12 st 8.4 lb', 'lost 2.6 lb', '13 st 7.8 lb', '13 st 3.6 lb', '-4.2 lb', 'Oct 16: 13 st 5.4 lb'],
];
$print = in_array('--print', $argv, true);
foreach ($expect as $unit => $e) {
    $r = NotificationScheduler::buildReminderEmail($unit, $weekly);
    contains("reminder[{$unit}] current", $r['text'], "Current Weight: {$e[0]}");
    contains("reminder[{$unit}] goal", $r['text'], "Goal Weight: {$e[1]}");
    contains("reminder[{$unit}] change", $r['text'], $e[2]);
    contains("reminder[{$unit}] html", $r['html'], "<strong>Current Weight:</strong> {$e[0]}");
    $m = NotificationScheduler::buildMonthlyReport($unit, $monthly);
    contains("monthly[{$unit}] start", $m['text'], "Starting weight: {$e[3]}");
    contains("monthly[{$unit}] end", $m['text'], "Ending weight: {$e[4]}");
    contains("monthly[{$unit}] change", $m['text'], "Monthly change: {$e[5]}");
    contains("monthly[{$unit}] entry", $m['text'], $e[6]);
    contains("monthly[{$unit}] html entry", $m['html'], "<strong>" . substr($e[6], 8) . "</strong>");
    if ($print) {
        echo "\n----- reminder ({$unit}) -----\n{$r['text']}\n----- monthly ({$unit}) -----\n{$m['text']}\n\n";
    }
}

echo $fails ? "\n{$fails} check(s) failed\n" : "\nAll checks passed\n";
exit($fails ? 1 : 0);
