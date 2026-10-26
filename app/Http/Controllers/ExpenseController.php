<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    /**
     * Immediate expenses (diesel, labour, tea…) with their bill photos.
     */
    public function index(Request $request): Response
    {
        $from = $request->date('from')?->toDateString();
        $to = $request->date('to')?->toDateString();

        $query = Expense::query()
            ->when($from, fn ($query) => $query->whereDate('date', '>=', $from))
            ->when($to, fn ($query) => $query->whereDate('date', '<=', $to));

        return Inertia::render('expenses/index', [
            'expenses' => (clone $query)->with('photos')->latest('date')->latest('id')->paginate(30)->withQueryString(),
            'total' => (float) (clone $query)->sum('amount'),
            'filters' => ['from' => $from, 'to' => $to],
            'today' => now()->toDateString(),
        ]);
    }

    /**
     * Add an expense, with an optional bill photo.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'item' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999'],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'photo' => ['nullable', 'image', 'max:10240'],
        ], [
            'amount.gt' => __('Enter the amount.'),
        ]);

        DB::transaction(function () use ($data, $request) {
            $expense = Expense::create($data);

            if ($request->hasFile('photo')) {
                BillPhotoController::attach($expense, $request->file('photo'));
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Expense added.')]);

        return back();
    }

    /**
     * Delete an expense and its bill photos.
     */
    public function destroy(Expense $expense): RedirectResponse
    {
        DB::transaction(function () use ($expense) {
            $expense->photos->each->delete();
            $expense->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Expense deleted.')]);

        return back();
    }
}
