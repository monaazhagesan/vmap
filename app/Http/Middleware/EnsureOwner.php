<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to the company owner. Admins are sent to the purchase bills page.
 */
class EnsureOwner
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isOwner()) {
            return to_route('bills.index', ['type' => 'purchase']);
        }

        return $next($request);
    }
}
