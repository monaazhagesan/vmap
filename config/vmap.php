<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Subscription
    |--------------------------------------------------------------------------
    |
    | New companies start with a free trial. After it ends they pay Vmap by
    | UPI or bank transfer, send the screenshot on WhatsApp, and receive an
    | activation code (generate one with `php artisan vmap:code {days}`).
    |
    */

    'trial_days' => (int) env('VMAP_TRIAL_DAYS', 1),

    // Codes are signed with this. Keep it only in .env, never in the repository.
    'activation_secret' => env('VMAP_ACTIVATION_SECRET'),

    'whatsapp' => env('VMAP_WHATSAPP', ''),

    'upi_id' => env('VMAP_UPI_ID', ''),

    'day_price' => 85,

    'plans' => [
        ['key' => 'day', 'name' => 'Per day', 'price' => 85, 'days' => 1, 'per' => '/ day'],
        ['key' => 'month', 'name' => 'Monthly', 'price' => 2499, 'days' => 30, 'per' => '/ month'],
        ['key' => 'year', 'name' => 'Yearly', 'price' => 29999, 'days' => 365, 'per' => '/ year'],
    ],

];
