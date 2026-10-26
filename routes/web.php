<?php

use App\Http\Controllers\BillController;
use App\Http\Controllers\BillPhotoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VendorEntryController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('auth')->group(function () {
    Route::middleware('owner')->group(function () {
        Route::get('subscription', [SubscriptionController::class, 'show'])->name('subscription.show');
        Route::post('subscription/activate', [SubscriptionController::class, 'activate'])
            ->middleware('throttle:10,1')
            ->name('subscription.activate');
    });

    Route::middleware('subscribed')->group(function () {
        // Owner and admins: day-to-day yard work.
        Route::get('weighment', [BillController::class, 'create'])->name('bills.create');
        Route::post('weighment/sales-vehicle-weight', [BillController::class, 'toggleSalesVehicleWeight'])->name('bills.sales-vehicle-weight');
        Route::get('bills/{type}', [BillController::class, 'index'])->whereIn('type', ['purchase', 'sales'])->name('bills.index');
        Route::post('bills', [BillController::class, 'store'])->name('bills.store');
        Route::get('bills/{bill}/print', [BillController::class, 'show'])->name('bills.show');
        Route::get('bills/{bill}/edit', [BillController::class, 'edit'])->name('bills.edit');
        Route::put('bills/{bill}', [BillController::class, 'update'])->name('bills.update');
        Route::delete('bills/{bill}', [BillController::class, 'destroy'])->name('bills.destroy');

        Route::resource('vendors', VendorController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('vendors/{vendor}/entries', [VendorEntryController::class, 'store'])->name('vendors.entries.store');
        Route::delete('vendors/{vendor}/entries/{entry}', [VendorEntryController::class, 'destroy'])->name('vendors.entries.destroy');
        Route::post('vendors/{vendor}/photos', [BillPhotoController::class, 'storeForVendor'])->name('vendors.photos.store');

        Route::resource('expenses', ExpenseController::class)->only(['index', 'store', 'destroy']);

        Route::get('photos/{photo}', [BillPhotoController::class, 'show'])->name('photos.show');
        Route::delete('photos/{photo}', [BillPhotoController::class, 'destroy'])->name('photos.destroy');

        // Owner only.
        Route::middleware('owner')->group(function () {
            Route::get('dashboard', DashboardController::class)->name('dashboard');

            Route::get('salary', [SalaryController::class, 'index'])->name('salary.index');
            Route::post('salary/roles', [SalaryController::class, 'storeRole'])->name('salary.roles.store');
            Route::put('salary/roles/{role}', [SalaryController::class, 'updateRole'])->name('salary.roles.update');
            Route::delete('salary/roles/{role}', [SalaryController::class, 'destroyRole'])->name('salary.roles.destroy');
            Route::post('salary/candidates', [SalaryController::class, 'storeCandidate'])->name('salary.candidates.store');
            Route::put('salary/candidates/{candidate}', [SalaryController::class, 'updateCandidate'])->name('salary.candidates.update');
            Route::delete('salary/candidates/{candidate}', [SalaryController::class, 'destroyCandidate'])->name('salary.candidates.destroy');
            Route::post('salary/attendance', [SalaryController::class, 'storeAttendance'])->name('salary.attendance.store');
            Route::delete('salary/attendance/{attendance}', [SalaryController::class, 'destroyAttendance'])->name('salary.attendance.destroy');

            Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
            Route::get('reports/{report}', [ReportController::class, 'show'])->name('reports.show');
        });
    });
});

require __DIR__.'/settings.php';
