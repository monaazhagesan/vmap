<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    /**
     * Company details printed on bills and reports.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/company', [
            'company' => $request->user()->company?->only(['name', 'registration_number', 'address', 'phone']),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->user()->company?->update($request->validate([
            'name' => ['required', 'string', 'max:255'],
            'registration_number' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Company details saved.')]);

        return back();
    }
}
