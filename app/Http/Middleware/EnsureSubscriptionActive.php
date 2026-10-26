<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * Once the plan has expired, the owner is sent to renew it and admins see a notice.
 */
class EnsureSubscriptionActive
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->company?->subscriptionActive()) {
            return $next($request);
        }

        if ($user?->isOwner()) {
            return to_route('subscription.show');
        }

        return Inertia::render('subscription/expired')->toResponse($request);
    }
}
