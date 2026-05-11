<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MonthlyPackageController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\VoucherPackageController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\CashFlowController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TransactionCategoryController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\JournalController;

Route::group([
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('me', [AuthController::class, 'me'])->middleware('auth:api');
});

Route::group(['middleware' => 'auth:api'], function() {
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::apiResource('monthly-packages', MonthlyPackageController::class);
    Route::post('customers/import', [CustomerController::class, 'import']);
    Route::get('customers/template', [CustomerController::class, 'downloadTemplate']);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('voucher-packages', VoucherPackageController::class);
    Route::apiResource('transaction-categories', TransactionCategoryController::class);
    
    Route::get('accounts/all', [AccountController::class, 'all']);
    Route::apiResource('accounts', AccountController::class);
    Route::get('journals', [JournalController::class, 'index']);
    Route::get('journals/{journal}', [JournalController::class, 'show']);
    
    Route::get('vouchers', [VoucherController::class, 'index']);
    Route::post('vouchers/generate', [VoucherController::class, 'generate']);
    Route::post('vouchers/{voucher}/sell', [VoucherController::class, 'sell']);
    Route::delete('vouchers/{voucher}', [VoucherController::class, 'destroy']);

    Route::get('cash-flow/stats', [CashFlowController::class, 'stats']);
    Route::apiResource('cash-flow', CashFlowController::class);

    Route::get('roles', [\App\Http\Controllers\Api\RoleController::class, 'index']);
    Route::post('roles', [\App\Http\Controllers\Api\RoleController::class, 'store']);
    Route::delete('roles/{role}', [\App\Http\Controllers\Api\RoleController::class, 'destroy']);
    Route::get('permissions', [\App\Http\Controllers\Api\RoleController::class, 'permissions']);
    Route::post('roles/{role}/permissions', [\App\Http\Controllers\Api\RoleController::class, 'updatePermissions']);
    
    Route::apiResource('users', UserController::class);

    Route::post('payments/generate', [PaymentController::class, 'generateMonthlyBills']);
    Route::post('payments/{payment}/pay', [PaymentController::class, 'pay']);
    Route::apiResource('payments', PaymentController::class);

    Route::get('settings', [\App\Http\Controllers\Api\AppSettingController::class, 'index']);
    Route::post('settings', [\App\Http\Controllers\Api\AppSettingController::class, 'store']);

    Route::get('activity-logs', [\App\Http\Controllers\Api\ActivityLogController::class, 'index']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
