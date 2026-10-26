<?php

namespace App\Support;

use App\Models\Attendance;
use App\Models\Bill;
use App\Models\Expense;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Money in and out of the yard over a date range, for the current company.
 */
class Ledger
{
    public function __construct(public readonly string $from, public readonly string $to)
    {
        //
    }

    /**
     * @return Collection<int, Bill>
     */
    public function bills(string $type): Collection
    {
        return Bill::query()
            ->where('type', $type)
            ->whereBetween('date', [$this->from, $this->to])
            ->orderBy('date')
            ->orderBy('id')
            ->get();
    }

    /**
     * @return Collection<int, Expense>
     */
    public function expenses(): Collection
    {
        return Expense::query()->whereBetween('date', [$this->from, $this->to])->orderBy('date')->orderBy('id')->get();
    }

    /**
     * @return Collection<int, Attendance>
     */
    public function salaries(): Collection
    {
        return Attendance::query()->whereBetween('date', [$this->from, $this->to])->orderBy('date')->orderBy('id')->get();
    }

    public static function salaryAmount(Attendance $entry): float
    {
        return round((float) $entry->days * (float) $entry->rate, 2);
    }

    /**
     * The key a date falls under when grouping by day, week (starting Monday), month or year.
     */
    public static function periodKey(string $date, string $group): string
    {
        return match ($group) {
            'week' => Carbon::parse($date)->startOfWeek(Carbon::MONDAY)->toDateString(),
            'month' => substr($date, 0, 7),
            'year' => substr($date, 0, 4),
            default => $date,
        };
    }

    public static function periodLabel(string $key, string $group): string
    {
        return match ($group) {
            'week' => 'Week of '.Carbon::parse($key)->format('d/m/Y'),
            'month' => Carbon::parse($key.'-01')->format('M Y'),
            'year' => $key,
            default => Carbon::parse($key)->format('d/m/Y'),
        };
    }
}
