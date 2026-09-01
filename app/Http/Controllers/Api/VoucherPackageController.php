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
        $validated = $this->validatePackage($request);
        $package = VoucherPackage::create($validated);
        $this->syncProfile($package);
        
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
        $validated = $this->validatePackage($request);
        $voucherPackage->update($validated);
        $this->syncProfile($voucherPackage);
        
        return response()->json($voucherPackage);
    }

    public function destroy(VoucherPackage $voucherPackage)
    {
        $voucherPackage->delete();
        return response()->json(null, 204);
    }
    
    private function validatePackage(Request $request)
    {
        return $request->validate([
            'name' => 'required',
            'duration_minutes' => 'required|integer',
            'price' => 'required|numeric',
            'active_period_days' => 'required|integer',
            'router_id' => 'nullable|integer',
            'mikrotik_profile_name' => 'nullable|string',
            'mikrotik_rate_limit' => 'nullable|string',
            'mikrotik_shared_users' => 'nullable|integer',
            'mikrotik_address_pool' => 'nullable|string',
        ]);
    }
    
    private function syncProfile(VoucherPackage $package)
    {
        if ($package->router_id && $package->mikrotik_profile_name) {
            try {
                $package->load('router');
                $service = new \App\Services\MikrotikService($package->router);
                $service->syncHotspotProfile(
                    $package->mikrotik_profile_name,
                    $package->mikrotik_rate_limit,
                    $package->mikrotik_shared_users ?? 1,
                    $package->mikrotik_address_pool,
                    $package->active_period_days
                );
            } catch (\Exception $e) {
                \Log::error('Mikrotik Profile Sync Error: ' . $e->getMessage());
            }
        }
    }
}
