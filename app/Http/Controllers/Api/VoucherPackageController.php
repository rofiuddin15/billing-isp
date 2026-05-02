<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VoucherPackage;
use Illuminate\Http\Request;

class VoucherPackageController extends Controller
{
    public function index()
    {
        return VoucherPackage::withCount(['vouchers as ready_count' => function($query) {
            $query->where('status', 'ready');
        }, 'vouchers as sold_count' => function($query) {
            $query->where('status', 'sold');
        }])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'duration_minutes' => 'required|integer',
            'price' => 'required|numeric',
            'active_period_days' => 'required|integer',
        ]);

        $package = VoucherPackage::create($validated);
        return response()->json($package, 201);
    }

    public function show(VoucherPackage $voucherPackage)
    {
        return $voucherPackage->loadCount(['vouchers as ready_count' => function($query) {
            $query->where('status', 'ready');
        }, 'vouchers as sold_count' => function($query) {
            $query->where('status', 'sold');
        }]);
    }

    public function update(Request $request, VoucherPackage $voucherPackage)
    {
        $validated = $request->validate([
            'name' => 'required',
            'duration_minutes' => 'required|integer',
            'price' => 'required|numeric',
            'active_period_days' => 'required|integer',
        ]);

        $voucherPackage->update($validated);
        return response()->json($voucherPackage);
    }

    public function destroy(VoucherPackage $voucherPackage)
    {
        $voucherPackage->delete();
        return response()->json(null, 204);
    }
}
