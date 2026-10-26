<?php

namespace App\Http\Controllers;

use App\Models\BillPhoto;
use App\Models\Expense;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BillPhotoController extends Controller
{
    /**
     * Attach a bill photo to a vendor.
     */
    public function storeForVendor(Request $request, Vendor $vendor): RedirectResponse
    {
        $data = $request->validate([
            'photo' => ['required', 'image', 'max:10240'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        self::attach($vendor, $data['photo'], $data['note'] ?? null);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Bill photo saved.')]);

        return back();
    }

    /**
     * Show a photo. The company scope on BillPhoto keeps other companies' photos out of reach.
     */
    public function show(BillPhoto $photo): StreamedResponse
    {
        return Storage::response($photo->path);
    }

    /**
     * Delete a photo and its file.
     */
    public function destroy(BillPhoto $photo): RedirectResponse
    {
        $photo->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Bill photo deleted.')]);

        return back();
    }

    /**
     * Store an uploaded photo on the private disk and link it to its owner.
     */
    public static function attach(Vendor|Expense $owner, UploadedFile $file, ?string $note = null): BillPhoto
    {
        $path = $file->store('bill-photos/'.$owner->company_id);

        return $owner->photos()->create([
            'path' => $path,
            'note' => $note,
            'date' => now()->toDateString(),
        ]);
    }
}
