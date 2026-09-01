<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Router;
use App\Services\MikrotikService;
use Illuminate\Http\Request;

class MikrotikSyncController extends Controller
{
    public function getActiveUsers(Router $router)
    {
        $service = new MikrotikService($router);
        $pppoe = $service->getActivePppoe();
        return response()->json($pppoe);
    }

    public function getProfiles(Router $router)
    {
        $service = new MikrotikService($router);
        $pppProfiles = $service->getPppProfiles();
        $hotspotProfiles = $service->getHotspotProfiles();
        
        return response()->json([
            'ppp' => $pppProfiles,
            'hotspot' => $hotspotProfiles
        ]);
    }
}
