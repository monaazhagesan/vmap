<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    /**
     * All vendors with what was purchased from them, paid to them, and the balance.
     */
    public function index(): Response
    {
        $vendors = Vendor::query()->withTotals()->orderBy('name')->get();

        return Inertia::render('vendors/index', [
            'vendors' => $vendors,
            'totals' => [
                'purchased' => (float) $vendors->sum('purchased_total'),
                'paid' => (float) $vendors->sum('paid_total'),
            ],
        ]);
    }

    /**
     * Create a vendor.
     */
    public function store(Request $request): RedirectResponse
    {
        $vendor = Vendor::create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Vendor created.')]);

        return to_route('vendors.show', $vendor);
    }

    /**
     * A vendor's date-wise ledger, details and bill photos.
     */
    public function show(Vendor $vendor): Response
    {
        $balance = 0.0;
        $ledger = $vendor->entries()
            ->orderBy('date')
            ->orderBy('id')
            ->get()
            ->map(function (VendorEntry $entry) use (&$balance) {
                $balance += $entry->type === VendorEntry::PURCHASE ? (float) $entry->amount : -(float) $entry->amount;

                return [...$entry->only(['id', 'type', 'amount']), 'date' => $entry->date->toDateString(), 'balance' => round($balance, 2)];
            });

        return Inertia::render('vendors/show', [
            'vendor' => $vendor->loadSum(['entries as purchased_total' => fn ($q) => $q->where('type', VendorEntry::PURCHASE)], 'amount')
                ->loadSum(['entries as paid_total' => fn ($q) => $q->where('type', VendorEntry::PAID)], 'amount'),
            'ledger' => $ledger,
            'photos' => $vendor->photos()->latest('id')->get(),
            'today' => now()->toDateString(),
        ]);
    }

    /**
     * Update a vendor's details.
     */
    public function update(Request $request, Vendor $vendor): RedirectResponse
    {
        $vendor->update($this->validated($request, $vendor));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Vendor updated.')]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Vendor $vendor = null): array
    {
        return $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('vendors')->where('company_id', $request->user()->company_id)->ignore($vendor),
            ],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'place' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.unique' => __('This vendor already exists.'),
        ]);
    }
}
