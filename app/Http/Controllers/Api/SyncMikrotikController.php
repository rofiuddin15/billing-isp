<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Router;
use App\Models\Customer;
use App\Models\MonthlyPackage;
use App\Models\VoucherPackage;
use App\Models\Voucher;
use App\Services\MikrotikService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SyncMikrotikController extends Controller
{
    public function syncPppProfiles(Request $request)
    {
        $request->validate(['router_id' => 'required|exists:routers,id']);
        $router = Router::findOrFail($request->router_id);
        $service = new MikrotikService($router);

        $profiles = $service->getPppProfiles();
        if (empty($profiles) && !$service->connect()) {
            return response()->json(['message' => 'Gagal terhubung ke router'], 400);
        }

        $synced = 0;
        foreach ($profiles as $profile) {
            $name = $profile['name'] ?? null;
            if (!$name || $name === 'default' || $name === 'default-encryption') continue;

            $package = MonthlyPackage::where('mikrotik_profile_name', $name)->first();
            if (!$package) {
                MonthlyPackage::create([
                    'name' => $name,
                    'mikrotik_profile_name' => $name,
                    'price' => 0,
                    'speed' => $profile['rate-limit'] ?? '1M/1M',
                    'is_active' => true,
                ]);
                $synced++;
            }
        }

        return response()->json(['message' => "Berhasil sinkronisasi $synced profile PPPoE baru."]);
    }

    public function syncPppUsers(Request $request)
    {
        $request->validate(['router_id' => 'required|exists:routers,id']);
        $router = Router::findOrFail($request->router_id);
        $service = new MikrotikService($router);

        $secrets = $service->getPppSecrets();
        if (empty($secrets) && !$service->connect()) {
            return response()->json(['message' => 'Gagal terhubung ke router'], 400);
        }

        $synced = 0;
        $updated = 0;
        
        DB::beginTransaction();
        try {
            foreach ($secrets as $secret) {
                $name = $secret['name'] ?? null;
                $profileName = $secret['profile'] ?? null;
                if (!$name) continue;

                $package = MonthlyPackage::where('mikrotik_profile_name', $profileName)->first();
                $packageId = $package ? $package->id : null;

                $customer = Customer::where('username', $name)->orWhere('mikrotik_id', $secret['.id'] ?? '')->first();

                $data = [
                    'name' => $secret['comment'] ?? $name,
                    'username' => $name,
                    'pppoe_password' => $secret['password'] ?? '',
                    'router_id' => $router->id,
                    'mikrotik_id' => $secret['.id'] ?? null,
                    'status' => (isset($secret['disabled']) && $secret['disabled'] === 'true') ? 'inactive' : 'active',
                ];

                if ($packageId) {
                    $data['monthly_package_id'] = $packageId;
                }

                if ($customer) {
                    $customer->update($data);
                    $updated++;
                } else {
                    $data['phone'] = '-';
                    $data['address'] = '-';
                    Customer::create($data);
                    $synced++;
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => "Berhasil menarik $synced pelanggan baru, mengupdate $updated pelanggan lama."]);
    }

    public function syncHotspotProfiles(Request $request)
    {
        $request->validate(['router_id' => 'required|exists:routers,id']);
        $router = Router::findOrFail($request->router_id);
        $service = new MikrotikService($router);

        $profiles = $service->getHotspotProfiles();
        if (empty($profiles) && !$service->connect()) {
            return response()->json(['message' => 'Gagal terhubung ke router'], 400);
        }

        $synced = 0;
        $updated = 0;

        foreach ($profiles as $profile) {
            $name = $profile['name'] ?? null;
            if (!$name || $name === 'default') continue;

            $package = VoucherPackage::where('mikrotik_profile_name', $name)->first();
            
            $data = [
                'name' => $name,
                'mikrotik_profile_name' => $name,
                'mikrotik_rate_limit' => $profile['rate-limit'] ?? '',
                'mikrotik_shared_users' => (int)($profile['shared-users'] ?? 1),
                'mikrotik_address_pool' => $profile['address-pool'] ?? '',
                'router_id' => $router->id,
            ];

            if ($package) {
                $package->update($data);
                $updated++;
            } else {
                $data['price'] = 0;
                $data['duration_minutes'] = 60;
                $data['active_period_days'] = 1;
                VoucherPackage::create($data);
                $synced++;
            }
        }

        return response()->json(['message' => "Berhasil sinkronisasi $synced profile Hotspot baru, update $updated lama."]);
    }

    public function syncHotspotUsers(Request $request)
    {
        $request->validate(['router_id' => 'required|exists:routers,id']);
        $router = Router::findOrFail($request->router_id);
        $service = new MikrotikService($router);

        $users = $service->getHotspotUsers();
        if (empty($users) && !$service->connect()) {
            return response()->json(['message' => 'Gagal terhubung ke router'], 400);
        }

        $synced = 0;
        $updated = 0;

        DB::beginTransaction();
        try {
            foreach ($users as $user) {
                $code = $user['name'] ?? null;
                $profileName = $user['profile'] ?? null;
                if (!$code || $code === 'default-trial') continue;

                $package = VoucherPackage::where('mikrotik_profile_name', $profileName)->first();
                $packageId = $package ? $package->id : null;

                $voucher = Voucher::where('code', $code)->first();

                if ($voucher) {
                    if ($packageId) {
                        $voucher->update(['package_id' => $packageId]);
                    }
                    $updated++;
                } else {
                    if ($packageId) {
                        Voucher::create([
                            'code' => $code,
                            'package_id' => $packageId,
                            'status' => 'available',
                        ]);
                        $synced++;
                    }
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => "Berhasil menarik $synced voucher baru, mengupdate $updated voucher lama."]);
    }
}
