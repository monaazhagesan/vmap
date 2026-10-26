<?php

namespace App\Http\Controllers;

use App\Models\ActivationCode;
use App\Support\ActivationCodes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Current plan, the plans on offer, and how to pay.
     */
    public function show(Request $request): Response
    {
        $company = $request->user()->company;

        return Inertia::render('subscription/show', [
            'subscription' => [
                'plan' => $company?->plan,
                'expiresAt' => $company?->subscription_expires_at?->toIso8601String(),
                'active' => (bool) $company?->subscriptionActive(),
            ],
            'plans' => config('vmap.plans'),
            'dayPrice' => config('vmap.day_price'),
            'whatsapp' => config('vmap.whatsapp'),
            'upiId' => config('vmap.upi_id'),
        ]);
    }

    /**
     * Redeem an activation code, adding its days to the plan.
     */
    public function activate(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string', 'max:40']]);

        $code = ActivationCodes::normalise($request->string('code')->value());
        $days = ActivationCodes::days($code);

        if ($days === null) {
            throw ValidationException::withMessages(['code' => __('Invalid activation code.')]);
        }

        if (ActivationCode::where('code', $code)->exists()) {
            throw ValidationException::withMessages(['code' => __('This code was already used.')]);
        }

        DB::transaction(function () use ($request, $code, $days) {
            $company = $request->user()->company()->lockForUpdate()->firstOrFail();

            $start = $company->subscriptionActive() ? $company->subscription_expires_at : now();

            $company->update([
                'subscription_expires_at' => $start->copy()->addDays($days),
                'plan' => match ($days) {
                    365 => 'Yearly',
                    30 => 'Monthly',
                    default => $days.' '.str('day')->plural($days),
                },
            ]);

            $company->activationCodes()->create(['code' => $code, 'days' => $days]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Activated. Thank you!')]);

        return back();
    }
}
