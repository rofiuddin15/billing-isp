<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Router;
use App\Services\MikrotikService;
use Illuminate\Http\Request;

class RouterController extends Controller
{
    public function index()
    {
        return Router::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'ip_address' => 'required|ip',
            'port' => 'required|integer',
            'username' => 'required|string',
            'password' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $router = Router::create($validated);
        return response()->json($router, 201);
    }

    public function testConnection(Request $request)
    {
        $validated = $request->validate([
            'ip_address' => 'required|ip',
            'port' => 'required|integer',
            'username' => 'required|string',
            'password' => 'nullable|string',
        ]);

        $router = new Router($validated);
        $service = new MikrotikService($router);

        if ($service->connect()) {
            return response()->json(['message' => 'Connected successfully']);
        }

        return response()->json(['message' => 'Connection failed'], 400);
    }

    public function show(Router $router)
    {
        return $router;
    }

    public function update(Request $request, Router $router)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'ip_address' => 'required|ip',
            'port' => 'required|integer',
            'username' => 'required|string',
            'password' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $router->update($validated);
        return response()->json($router);
    }

    public function destroy(Router $router)
    {
        $router->delete();
        return response()->json(null, 204);
    }
}
