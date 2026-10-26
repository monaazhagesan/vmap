<?php

namespace App\Http\Controllers;

use App\Http\Requests\BillRequest;
use App\Models\Bill;
use App\Models\Material;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BillController extends Controller
{
    /**
     * Purchase or sales bills, grouped by vendor / customer name.
     */
    public function index(Request $request, string $type): Response
    {
        abort_unless(in_array($type, Bill::TYPES, true), 404);

        $search = $request->string('search')->trim()->value();
        $from = $request->date('from')?->toDateString();
        $to = $request->date('to')?->toDateString();

        $bills = Bill::query()
            ->where('type', $type)
            ->when($search, fn ($query) => $query->where(fn ($query) => $query
                ->where('party_name', 'like', "%{$search}%")
                ->orWhere('vehicle_number', 'like', "%{$search}%")
                ->orWhere('bill_no', 'like', "%{$search}%")))
            ->when($from, fn ($query) => $query->whereDate('date', '>=', $from))
            ->when($to, fn ($query) => $query->whereDate('date', '<=', $to))
            ->latest('date')
            ->latest('id')
            ->get();

        $groups = $bills
            ->groupBy(fn (Bill $bill) => mb_strtolower($bill->party_name))
            ->map(fn ($group) => [
                'party' => $group->first()->party_name,
                'count' => $group->count(),
                'total' => (float) $group->sum('amount'),
                'bills' => $group->values(),
            ])
            ->values();

        return Inertia::render('bills/index', [
            'type' => $type,
            'groups' => $groups,
            'totals' => [
                'count' => $bills->count(),
                'weight' => (float) $bills->sum('net_weight'),
                'amount' => (float) $bills->sum('amount'),
            ],
            'filters' => ['search' => $search, 'from' => $from, 'to' => $to],
        ]);
    }

    /**
     * The new weighment form.
     */
    public function create(Request $request): Response
    {
        $type = in_array($request->query('type'), Bill::TYPES, true) ? $request->query('type') : Bill::PURCHASE;

        return $this->form(null, $type, $request->string('party')->value());
    }

    /**
     * Save a new weighment bill with the next bill number.
     */
    public function store(BillRequest $request): RedirectResponse
    {
        $bill = DB::transaction(function () use ($request) {
            $data = $request->billData();
            $prefix = $data['type'] === Bill::SALES ? 'S-' : 'P-';

            $last = Bill::query()
                ->where('type', $data['type'])
                ->lockForUpdate()
                ->latest('id')
                ->value('bill_no');

            $bill = new Bill($data);
            $bill->bill_no = $prefix.str_pad((string) ((int) substr((string) $last, 2) + 1), 4, '0', STR_PAD_LEFT);
            $bill->user_id = $request->user()->id;
            $bill->save();

            return $bill;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Bill :no saved.', ['no' => $bill->bill_no])]);

        return to_route('bills.index', ['type' => $bill->type]);
    }

    /**
     * The printable bill.
     */
    public function show(Request $request, Bill $bill): Response
    {
        return Inertia::render('bills/show', [
            'bill' => $bill,
            'company' => $request->user()->company?->only(['name', 'registration_number', 'address', 'phone']),
        ]);
    }

    /**
     * Edit a bill in the weighment form.
     */
    public function edit(Bill $bill): Response
    {
        return $this->form($bill, $bill->type);
    }

    /**
     * Update a bill. Its type and bill number never change.
     */
    public function update(BillRequest $request, Bill $bill): RedirectResponse
    {
        $bill->update([...$request->billData(), 'type' => $bill->type]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Bill :no updated.', ['no' => $bill->bill_no])]);

        return to_route('bills.index', ['type' => $bill->type]);
    }

    /**
     * Delete a bill.
     */
    public function destroy(Bill $bill): RedirectResponse
    {
        $bill->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Bill :no deleted.', ['no' => $bill->bill_no])]);

        return back();
    }

    /**
     * Turn vehicle (tare) weight on or off for sales weighments.
     */
    public function toggleSalesVehicleWeight(Request $request): RedirectResponse
    {
        $company = $request->user()->company;
        $company?->update(['sales_vehicle_weight' => ! $company->sales_vehicle_weight]);

        return back();
    }

    private function form(?Bill $bill, string $type, string $party = ''): Response
    {
        $materials = Material::orderBy('name')->pluck('name');

        // Keep a removed material selectable when editing an old bill.
        if ($bill && ! $materials->contains($bill->material)) {
            $materials->push($bill->material);
        }

        return Inertia::render('bills/form', [
            'bill' => $bill,
            'type' => $type,
            'party' => $party,
            'materials' => $materials,
            'parties' => Bill::query()->where('type', $type)->distinct()->orderBy('party_name')->limit(500)->pluck('party_name'),
            'salesVehicleWeight' => (bool) auth()->user()?->company?->sales_vehicle_weight,
            'today' => now()->toDateString(),
        ]);
    }
}
