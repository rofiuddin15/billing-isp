<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MonthlyPackageController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\VoucherPackageController;
use App\Http\Controllers\Api\VoucherController;

Route::group([
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('me', [AuthController::class, 'me'])->middleware('auth:api');
});

Route::group(['middleware' => 'auth:api'], function() {
    Route::apiResource('monthly-packages', MonthlyPackageController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('voucher-packages', VoucherPackageController::class);
    
    Route::get('vouchers', [VoucherController::class, 'index']);
    Route::post('vouchers/generate', [VoucherController::class, 'generate']);
    Route::post('vouchers/{voucher}/sell', [VoucherController::class, 'sell']);
    Route::delete('vouchers/{voucher}', [VoucherController::class, 'destroy']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
