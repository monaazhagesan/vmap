<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Support\Ledger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public const REPORTS = [
        'purchase' => ['title' => 'Iron Purchase Report', 'description' => 'Total iron purchased'],
        'sales' => ['title' => 'Iron Sales Report', 'description' => 'Total iron sold'],
        'expense' => ['title' => 'Total Expense Report', 'description' => 'Purchases + immediate + salary'],
        'immediate' => ['title' => 'Immediate Expense Report', 'description' => 'Today by default, choose any dates'],
    ];

    /**
     * The list of reports.
     */
    public function index(): Response
    {
        return Inertia::render('reports/index', ['reports' => self::REPORTS]);
    }

    /**
     * One report over a date range, grouped by day, week, month or year.
     */
    public function show(Request $request, string $report): Response
    {
        abort_unless(isset(self::REPORTS[$report]), 404);

        $today = now()->toDateString();
        $from = $request->date('from')?->toDateString() ?? ($report === 'immediate' ? $today : now()->startOfMonth()->toDateString());
        $to = $request->date('to')?->toDateString() ?? $today;
        $group = in_array($request->query('group'), ['day', 'week', 'month', 'year'], true) ? $request->query('group') : 'day';
        $ledger = new Ledger($from, $to);

        // Each source line: [date, summary values to add up, detail cells].
        [$columns, $detailColumns, $lines] = match ($report) {
            'purchase', 'sales' => [
                ['Bills', 'Net kg', 'Amount (₹)'],
                ['Date', 'Name', 'Material', 'Net kg', 'Amount (₹)'],
                $ledger->bills($report === 'purchase' ? Bill::PURCHASE : Bill::SALES)->map(fn ($bill) => [
                    $bill->date->toDateString(),
                    [1, (float) $bill->net_weight, (float) $bill->amount],
                    [$bill->date->format('d/m/Y')."\n".$bill->bill_no, $bill->party_name."\n".$bill->vehicle_number, $bill->material, self::num($bill->net_weight), self::num($bill->amount)],
                ]),
            ],
            'expense' => [
                ['Purchases (₹)', 'Immediate (₹)', 'Salary (₹)', 'Total (₹)'],
                ['Date', 'Type', 'Details', 'Amount (₹)'],
                $ledger->bills(Bill::PURCHASE)->map(fn ($bill) => [
                    $bill->date->toDateString(),
                    [(float) $bill->amount, 0, 0, (float) $bill->amount],
                    [$bill->date->format('d/m/Y'), 'Purchase', "{$bill->party_name} · {$bill->material} · ".self::num($bill->net_weight).' kg', self::num($bill->amount)],
                ])->concat($ledger->expenses()->map(fn ($expense) => [
                    $expense->date->toDateString(),
                    [0, (float) $expense->amount, 0, (float) $expense->amount],
                    [$expense->date->format('d/m/Y'), 'Immediate', $expense->item, self::num($expense->amount)],
                ]))->concat($ledger->salaries()->map(fn ($entry) => [
                    $entry->date->toDateString(),
                    [0, 0, Ledger::salaryAmount($entry), Ledger::salaryAmount($entry)],
                    [$entry->date->format('d/m/Y'), 'Salary', "{$entry->name} · ".self::num($entry->days).' day × '.self::num($entry->rate), self::num(Ledger::salaryAmount($entry))],
                ]))->sortBy(fn ($line) => $line[0])->values(),
            ],
            default => [
                ['Entries', 'Amount (₹)'],
                ['Date', 'Item', 'Amount (₹)'],
                $ledger->expenses()->map(fn ($expense) => [
                    $expense->date->toDateString(),
                    [1, (float) $expense->amount],
                    [$expense->date->format('d/m/Y'), $expense->item, self::num($expense->amount)],
                ]),
            ],
        };

        $groups = [];
        foreach ($lines as [$date, $values]) {
            $key = Ledger::periodKey($date, $group);
            $groups[$key] ??= array_fill(0, count($values), 0.0);
            foreach ($values as $i => $value) {
                $groups[$key][$i] += $value;
            }
        }
        ksort($groups);

        $totals = array_fill(0, count($columns), 0.0);
        foreach ($groups as $values) {
            foreach ($values as $i => $value) {
                $totals[$i] += $value;
            }
        }

        return Inertia::render('reports/show', [
            'report' => ['key' => $report, ...self::REPORTS[$report]],
            'columns' => $columns,
            'rows' => collect($groups)->map(fn ($values, $key) => [Ledger::periodLabel((string) $key, $group), ...array_map(self::num(...), $values)])->values(),
            'totals' => array_map(self::num(...), $totals),
            'detailColumns' => $detailColumns,
            'details' => $lines->map(fn ($line) => $line[2])->values(),
            'filters' => ['from' => $from, 'to' => $to, 'group' => $group],
            'company' => $request->user()->company?->only(['name', 'address']),
            'generatedOn' => now()->format('d/m/Y'),
        ]);
    }

    /**
     * Format a number the Indian way (12,34,567.5), without needing the intl extension.
     */
    private static function num(float|int|string $value): string
    {
        $value = round((float) $value, 2);
        [$whole, $fraction] = array_pad(explode('.', rtrim(rtrim(number_format(abs($value), 2, '.', ''), '0'), '.')), 2, '');

        $grouped = strlen($whole) > 3
            ? preg_replace('/\B(?=(\d{2})+(?!\d))/', ',', substr($whole, 0, -3)).','.substr($whole, -3)
            : $whole;

        return ($value < 0 ? '-' : '').$grouped.($fraction !== '' ? '.'.$fraction : '');
    }
}
