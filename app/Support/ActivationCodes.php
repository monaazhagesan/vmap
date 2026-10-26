<?php

namespace App\Support;

/**
 * Activation codes look like VM-030-AB12C-XYZ90: the number of days, a random
 * part, and a check part derived from both with a secret. This is the same
 * scheme as the original Vmap Scrap web app, so codes are interchangeable.
 */
class ActivationCodes
{
    /**
     * Parse and verify a code. Returns the number of days it grants, or null if it is invalid.
     */
    public static function days(string $code): ?int
    {
        $code = strtoupper(preg_replace('/\s+/', '', $code) ?? '');

        // Without a secret anyone could compute valid codes, so accept none.
        if (blank(config('vmap.activation_secret'))) {
            return null;
        }

        if (! preg_match('/^VM-(\d{3})-([A-Z0-9]{5})-([A-Z0-9]{5})$/', $code, $m)) {
            return null;
        }

        if (! hash_equals(self::check($m[1].$m[2]), $m[3]) || (int) $m[1] === 0) {
            return null;
        }

        return (int) $m[1];
    }

    /**
     * Generate a fresh code granting the given number of days.
     */
    public static function generate(int $days): string
    {
        if (blank(config('vmap.activation_secret'))) {
            throw new \RuntimeException('Set VMAP_ACTIVATION_SECRET in .env before generating activation codes.');
        }

        $alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $random = '';

        for ($i = 0; $i < 5; $i++) {
            $random .= $alphabet[random_int(0, 35)];
        }

        $prefix = str_pad((string) $days, 3, '0', STR_PAD_LEFT);

        return "VM-{$prefix}-{$random}-".self::check($prefix.$random);
    }

    /**
     * Normalise a code for storage, so the same code can't be used twice with different spacing or case.
     */
    public static function normalise(string $code): string
    {
        return strtoupper(preg_replace('/\s+/', '', $code) ?? '');
    }

    private static function check(string $payload): string
    {
        $hash = self::cyrb53($payload.config('vmap.activation_secret'));

        return str_pad(substr(strtoupper(self::base36($hash)), -5), 5, '0', STR_PAD_LEFT);
    }

    /**
     * The cyrb53 string hash, matching JavaScript's 32-bit Math.imul arithmetic.
     */
    private static function cyrb53(string $str): int
    {
        $h1 = 0xDEADBEEF;
        $h2 = 0x41C6CE57;

        // JavaScript iterates UTF-16 code units; codes and the secret are ASCII, so bytes match.
        foreach (str_split($str) as $char) {
            $c = ord($char);
            $h1 = self::imul($h1 ^ $c, 2654435761);
            $h2 = self::imul($h2 ^ $c, 1597334677);
        }

        $h1 = self::imul($h1 ^ self::ushr($h1, 16), 2246822507) ^ self::imul($h2 ^ self::ushr($h2, 13), 3266489909);
        $h2 = self::imul($h2 ^ self::ushr($h2, 16), 2246822507) ^ self::imul($h1 ^ self::ushr($h1, 13), 3266489909);

        return 4294967296 * (2097151 & $h2) + ($h1 & 0xFFFFFFFF);
    }

    /**
     * 32-bit integer multiply, kept as an unsigned 32-bit value.
     */
    private static function imul(int $a, int $b): int
    {
        $a &= 0xFFFFFFFF;
        $b &= 0xFFFFFFFF;

        $low = ($a & 0xFFFF) * $b;
        $high = (($a >> 16) * $b) & 0xFFFF;

        return ($low + ($high << 16)) & 0xFFFFFFFF;
    }

    private static function ushr(int $value, int $bits): int
    {
        return ($value & 0xFFFFFFFF) >> $bits;
    }

    private static function base36(int $value): string
    {
        $digits = '0123456789abcdefghijklmnopqrstuvwxyz';
        $out = '';

        do {
            $out = $digits[$value % 36].$out;
            $value = intdiv($value, 36);
        } while ($value > 0);

        return $out;
    }
}
