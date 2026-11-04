<?php
/**
 * Weights are stored in kg. This shows them in the unit the user picked in Settings:
 * 'kg', 'lbs' (the value the app stores; 'lb' is accepted too) or 'st' (stone and pounds).
 */
class WeightUnits
{
    const LB_PER_KG = 2.20462;

    /** The app's unit code for a stored setting: 'kg', 'lbs' or 'st'. Unknown values fall back to kg. */
    public static function normalise($unit): string
    {
        $u = strtolower(trim((string)$unit));
        if (in_array($u, ['lb', 'lbs', 'pound', 'pounds'], true)) {
            return 'lbs';
        }
        if (in_array($u, ['st', 'stone', 'stones'], true)) {
            return 'st';
        }
        return 'kg';
    }

    /** e.g. "83.6 kg", "184.3 lbs", "13 st 2.3 lb". Negative values keep their minus sign. */
    public static function format($kg, $unit): string
    {
        $kg = (float)$kg;
        $sign = $kg < 0 ? '-' : '';
        $kg = abs($kg);
        switch (self::normalise($unit)) {
            case 'lbs':
                return $sign . self::number($kg * self::LB_PER_KG) . ' lbs';
            case 'st':
                // Round to 0.1 lb first, then split into whole stones and the pounds left over
                $tenthsOfLb = (int)round($kg * self::LB_PER_KG * 10);
                $stones = intdiv($tenthsOfLb, 140);
                $pounds = ($tenthsOfLb - $stones * 140) / 10;
                if ($stones === 0) {
                    return $sign . self::number($pounds) . ' lb';
                }
                return $sign . $stones . ' st ' . self::number($pounds) . ' lb';
            default:
                return $sign . self::number($kg) . ' kg';
        }
    }

    /** One decimal place, without a trailing ".0" noise problem from floats (e.g. 1.2000000000000028 -> "1.2"). */
    private static function number(float $value): string
    {
        return number_format(round($value, 1), 1, '.', '');
    }
}
