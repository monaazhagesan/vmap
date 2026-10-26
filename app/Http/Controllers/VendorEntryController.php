<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VendorEntryController extends Controller
{
    /**
     * Add a purchase or a payment to a vendor's ledger.
     */
    public function store(Request $request, Vendor $vendor): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in([VendorEntry::PURCHASE, VendorEntry::PAID])],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999'],
            'date' => ['required', 'date', 'before_or_equal:today'],
        ], [
            'amount.gt' => __('Enter the amount.'),
            'amount.required' => __('Enter the amount.'),
        ]);

        $vendor->entries()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => $data['type'] === VendorEntry::PAID ? __('Payment added.') : __('Purchase added.')]);

        return back();
    }

    /**
     * Remove a ledger entry.
     */
    public function destroy(Vendor $vendor, VendorEntry $entry): RedirectResponse
    {
        abort_unless($entry->vendor_id === $vendor->id, 404);

        $entry->delete();

        return back();
    }
}
