<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\VendorEntry;
use App\Support\Ledger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Scrap accounting overview: sales, purchases, expenses, salary and net profit.
     */
    public function __invoke(Request $request): Response
    {
        $from = $request->date('from')?->toDateString() ?? now()->startOfMonth()->toDateString();
        $to = $request->date('to')?->toDateString() ?? now()->toDateString();
        $ledger = new Ledger($from, $to);

        $sales = $ledger->bills(Bill::SALES);
        $purchases = $ledger->bills(Bill::PURCHASE);
        $expenses = $ledger->expenses();
        $salaries = $ledger->salaries();

        $days = [];
        $add = function (string $date, string $key, float $value) use (&$days) {
            $days[$date] ??= ['sales' => 0.0, 'purchases' => 0.0, 'expenses' => 0.0];
            $days[$date][$key] += $value;
        };

        $sales->each(fn ($bill) => $add($bill->date->toDateString(), 'sales', (float) $bill->amount));
        $purchases->each(fn ($bill) => $add($bill->date->toDateString(), 'purchases', (float) $bill->amount));
        $expenses->each(fn ($expense) => $add($expense->date->toDateString(), 'expenses', (float) $expense->amount));
        $salaries->each(fn ($entry) => $add($entry->date->toDateString(), 'expenses', Ledger::salaryAmount($entry)));
        ksort($days);

        $cumulative = 0.0;
        $rows = [];
        foreach ($days as $date => $day) {
            $net = $day['sales'] - $day['purchases'] - $day['expenses'];
            $cumulative += $net;
            $rows[] = [...$day, 'date' => $date, 'net' => round($net, 2), 'cumulative' => round($cumulative, 2)];
        }

        $totals = [
            'sales' => (float) $sales->sum('amount'),
            'purchases' => (float) $purchases->sum('amount'),
            'expenses' => (float) $expenses->sum('amount'),
            'salary' => (float) $salaries->sum(fn ($entry) => Ledger::salaryAmount($entry)),
        ];
        $totals['net'] = $totals['sales'] - $totals['purchases'] - $totals['expenses'] - $totals['salary'];

        // Vendor balance is all-time, not limited to the date range.
        $vendorBalance = (float) VendorEntry::query()
            ->whereHas('vendor')
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'purchase' THEN amount ELSE -amount END), 0) as balance")
            ->value('balance');

        return Inertia::render('dashboard', [
            'totals' => $totals,
            'vendorBalance' => $vendorBalance,
            'rows' => $rows,
            'filters' => ['from' => $from, 'to' => $to],
        ]);
    }
}
