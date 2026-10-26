<?php

use App\Http\Controllers\Settings\CompanyController;
use App\Http\Controllers\Settings\MaterialController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\UserController;
/* @chisel-password-confirmation */
use Illuminate\Auth\Middleware\RequirePassword;
/* @end-chisel-password-confirmation */
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        /* @chisel-password-confirmation */
        ->middleware(RequirePassword::class)
        /* @end-chisel-password-confirmation */
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

Route::middleware(['auth', 'owner'])->group(function () {
    Route::get('settings/company', [CompanyController::class, 'edit'])->name('company.edit');
    Route::patch('settings/company', [CompanyController::class, 'update'])->name('company.update');

    Route::get('settings/materials', [MaterialController::class, 'index'])->name('materials.index');
    Route::post('settings/materials', [MaterialController::class, 'store'])->name('materials.store');
    Route::delete('settings/materials/{material}', [MaterialController::class, 'destroy'])->name('materials.destroy');

    Route::get('settings/users', [UserController::class, 'index'])->name('users.index');
    Route::post('settings/users', [UserController::class, 'store'])->name('users.store');
    Route::put('settings/users/{user}/password', [UserController::class, 'updatePassword'])->name('users.password');
    Route::delete('settings/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

/* @chisel-passkeys */
Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
/* @end-chisel-passkeys */
