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
use App\Http\Controllers\Api\AppSettingController;
use App\Http\Controllers\Api\FinanceSettingController;

Route::group([
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    Route::get('app-settings', [AppSettingController::class, 'index']);
    Route::post('app-settings', [AppSettingController::class, 'update']);
    
    Route::get('finance-settings', [FinanceSettingController::class, 'index']);
    Route::post('finance-settings', [FinanceSettingController::class, 'update']);

    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('me', [AuthController::class, 'me'])->middleware('auth:api');
});

Route::get('packages/public', [MonthlyPackageController::class, 'index']);

Route::group(['middleware' => 'auth:api'], function() {
    // 1. Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->middleware('permission:menu.dashboard');

    // 2. Monthly Packages
    Route::group(['middleware' => 'permission:menu.packages'], function() {
        Route::get('monthly-packages', [MonthlyPackageController::class, 'index']);
        Route::get('monthly-packages/{monthly_package}', [MonthlyPackageController::class, 'show']);
        Route::post('monthly-packages', [MonthlyPackageController::class, 'store'])->middleware('permission:create.packages');
        Route::put('monthly-packages/{monthly_package}', [MonthlyPackageController::class, 'update'])->middleware('permission:edit.packages');
        Route::delete('monthly-packages/{monthly_package}', [MonthlyPackageController::class, 'destroy'])->middleware('permission:delete.packages');
    });

    // 3. Customers & Bills (Payments)
    Route::group(['middleware' => 'permission:menu.customers'], function() {
        Route::get('customers', [CustomerController::class, 'index']);
        Route::get('customers/template', [CustomerController::class, 'downloadTemplate'])->middleware('permission:create.customers');
        Route::get('customers/{customer}', [CustomerController::class, 'show']);
        Route::post('customers', [CustomerController::class, 'store'])->middleware('permission:create.customers');
        Route::post('customers/import', [CustomerController::class, 'import'])->middleware('permission:create.customers');
        Route::put('customers/{customer}', [CustomerController::class, 'update'])->middleware('permission:edit.customers');
        Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->middleware('permission:delete.customers');
        
        // Payments / Billing inside Customers
        Route::get('payments', [PaymentController::class, 'index']);
        Route::get('payments/{payment}', [PaymentController::class, 'show']);
        Route::post('payments', [PaymentController::class, 'store'])->middleware('permission:create.customers');
        Route::post('payments/generate', [PaymentController::class, 'generateMonthlyBills'])->middleware('permission:create.customers');
        Route::post('payments/batch-pay', [PaymentController::class, 'batchPay'])->middleware('permission:edit.customers');
        Route::post('payments/{payment}/pay', [PaymentController::class, 'pay'])->middleware('permission:edit.customers');
        Route::put('payments/{payment}', [PaymentController::class, 'update'])->middleware('permission:edit.customers');
        Route::delete('payments/{payment}', [PaymentController::class, 'destroy'])->middleware('permission:delete.customers');
    });

    // 4. Voucher (Selling Vouchers)
    Route::group(['middleware' => 'permission:menu.vouchers'], function() {
        Route::get('vouchers', [VoucherController::class, 'index']);
        Route::post('vouchers/generate', [VoucherController::class, 'generate'])->middleware('permission:create.vouchers');
        Route::post('vouchers/{voucher}/sell', [VoucherController::class, 'sell'])->middleware('permission:edit.vouchers');
        Route::delete('vouchers/{voucher}', [VoucherController::class, 'destroy'])->middleware('permission:delete.vouchers');
    });

    // 5. Arus Kas (Finance)
    Route::group(['middleware' => 'permission:menu.finance'], function() {
        Route::get('cash-flow', [CashFlowController::class, 'index']);
        Route::get('cash-flow/stats', [CashFlowController::class, 'stats']);
        Route::get('cash-flow/{cash_flow}', [CashFlowController::class, 'show']);
        Route::post('cash-flow', [CashFlowController::class, 'store'])->middleware('permission:create.finance');
        Route::put('cash-flow/{cash_flow}', [CashFlowController::class, 'update'])->middleware('permission:edit.finance');
        Route::delete('cash-flow/{cash_flow}', [CashFlowController::class, 'destroy'])->middleware('permission:delete.finance');
    });

    // 6. Bagan Akun (COA)
    Route::group(['middleware' => 'permission:menu.coa'], function() {
        Route::get('accounts', [AccountController::class, 'index']);
        Route::get('accounts/all', [AccountController::class, 'all']);
        Route::get('accounts/{account}', [AccountController::class, 'show']);
        Route::post('accounts', [AccountController::class, 'store'])->middleware('permission:create.coa');
        Route::put('accounts/{account}', [AccountController::class, 'update'])->middleware('permission:edit.coa');
        Route::delete('accounts/{account}', [AccountController::class, 'destroy'])->middleware('permission:delete.coa');
    });

    // 7. Buku Besar (Ledger)
    Route::group(['middleware' => 'permission:menu.ledger'], function() {
        Route::get('journals', [JournalController::class, 'index']);
        Route::get('journals/{journal}', [JournalController::class, 'show']);
    });

    // 8. Laporan Keuangan (Reports)
    Route::group(['middleware' => 'permission:menu.reports'], function() {
        Route::get('reports/profit-loss', [\App\Http\Controllers\Api\ReportController::class, 'profitLoss']);
        Route::get('reports/trial-balance', [\App\Http\Controllers\Api\ReportController::class, 'trialBalance']);
        Route::get('reports/balance-sheet', [\App\Http\Controllers\Api\ReportController::class, 'balanceSheet']);
    });

    // 9. Pengaturan Biaya (Finance Settings)
    Route::group(['middleware' => 'permission:menu.finance_settings'], function() {
        Route::get('finance-settings', [FinanceSettingController::class, 'index']);
        Route::post('finance-settings', [FinanceSettingController::class, 'update'])->middleware('permission:edit.finance_settings');
    });

    // 10. Master Voucher (Master Vouchers)
    Route::group(['middleware' => 'permission:menu.master_vouchers'], function() {
        Route::get('voucher-packages', [VoucherPackageController::class, 'index']);
        Route::get('voucher-packages/{voucher_package}', [VoucherPackageController::class, 'show']);
        Route::post('voucher-packages', [VoucherPackageController::class, 'store'])->middleware('permission:create.master_vouchers');
        Route::put('voucher-packages/{voucher_package}', [VoucherPackageController::class, 'update'])->middleware('permission:edit.master_vouchers');
        Route::delete('voucher-packages/{voucher_package}', [VoucherPackageController::class, 'destroy'])->middleware('permission:delete.master_vouchers');
    });

    // 11. Master Kategori (Master Categories)
    Route::group(['middleware' => 'permission:menu.master_categories'], function() {
        Route::get('transaction-categories', [TransactionCategoryController::class, 'index']);
        Route::get('transaction-categories/{transaction_category}', [TransactionCategoryController::class, 'show']);
        Route::post('transaction-categories', [TransactionCategoryController::class, 'store'])->middleware('permission:create.master_categories');
        Route::put('transaction-categories/{transaction_category}', [TransactionCategoryController::class, 'update'])->middleware('permission:edit.master_categories');
        Route::delete('transaction-categories/{transaction_category}', [TransactionCategoryController::class, 'destroy'])->middleware('permission:delete.master_categories');
    });

    // 12. Aduan Pelanggan (Complaints)
    Route::group(['middleware' => 'permission:menu.complaints'], function() {
        Route::get('complaints', [\App\Http\Controllers\Api\ComplaintController::class, 'index']);
        Route::get('complaints/{complaint}', [\App\Http\Controllers\Api\ComplaintController::class, 'show']);
        Route::post('complaints', [\App\Http\Controllers\Api\ComplaintController::class, 'store'])->middleware('permission:create.complaints');
        Route::put('complaints/{complaint}', [\App\Http\Controllers\Api\ComplaintController::class, 'update'])->middleware('permission:edit.complaints');
        Route::delete('complaints/{complaint}', [\App\Http\Controllers\Api\ComplaintController::class, 'destroy'])->middleware('permission:delete.complaints');
    });

    // 12b. Kinerja Teknisi (Technician Performance)
    Route::group(['middleware' => 'permission:menu.technician_performances'], function() {
        Route::get('technician-performances', [\App\Http\Controllers\Api\TechnicianPerformanceController::class, 'index']);
        Route::get('technician-performances/stats', [\App\Http\Controllers\Api\TechnicianPerformanceController::class, 'stats']);
        Route::get('technician-performances/technicians', [\App\Http\Controllers\Api\TechnicianPerformanceController::class, 'getTechnicians']);
        Route::post('technician-performances', [\App\Http\Controllers\Api\TechnicianPerformanceController::class, 'store'])->middleware('permission:create.technician_performances');
        Route::post('technician-performances/{performance}', [\App\Http\Controllers\Api\TechnicianPerformanceController::class, 'update'])->middleware('permission:edit.technician_performances');
        Route::delete('technician-performances/{performance}', [\App\Http\Controllers\Api\TechnicianPerformanceController::class, 'destroy'])->middleware('permission:delete.technician_performances');
    });

    // 13. Pengaturan Sistem (Settings)
    Route::group(['middleware' => 'permission:menu.settings'], function() {
        Route::get('settings', [\App\Http\Controllers\Api\AppSettingController::class, 'index']);
        Route::post('settings', [\App\Http\Controllers\Api\AppSettingController::class, 'update'])->middleware('permission:edit.settings');
        Route::get('activity-logs', [\App\Http\Controllers\Api\ActivityLogController::class, 'index']);
    });

    // 14. Manajemen Staff (Users)
    Route::group(['middleware' => 'permission:menu.users'], function() {
        Route::get('users', [UserController::class, 'index']);
        Route::get('users/{user}', [UserController::class, 'show']);
        Route::post('users', [UserController::class, 'store'])->middleware('permission:create.users');
        Route::put('users/{user}', [UserController::class, 'update'])->middleware('permission:edit.users');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('permission:delete.users');
    });

    // 15. Akses & Role (Roles)
    Route::group(['middleware' => 'permission:menu.roles'], function() {
        Route::get('roles', [\App\Http\Controllers\Api\RoleController::class, 'index']);
        Route::get('permissions', [\App\Http\Controllers\Api\RoleController::class, 'permissions']);
        Route::post('roles', [\App\Http\Controllers\Api\RoleController::class, 'store'])->middleware('permission:create.roles');
        Route::post('roles/{role}/permissions', [\App\Http\Controllers\Api\RoleController::class, 'updatePermissions'])->middleware('permission:edit.roles');
        Route::delete('roles/{role}', [\App\Http\Controllers\Api\RoleController::class, 'destroy'])->middleware('permission:delete.roles');
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
