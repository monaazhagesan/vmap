<?php

use App\Support\ActivationCodes;
use Illuminate\Support\Facades\Artisan;

Artisan::command('vmap:code {days : Days the code adds, e.g. 30 or 365} {--count=1 : How many codes to generate}', function (int $days) {
    if ($days < 1 || $days > 999) {
        $this->error('Days must be between 1 and 999.');

        return 1;
    }

    for ($i = 0; $i < (int) $this->option('count'); $i++) {
        $this->line(ActivationCodes::generate($days));
    }

    return 0;
})->purpose('Generate subscription activation codes to send to paying customers');
