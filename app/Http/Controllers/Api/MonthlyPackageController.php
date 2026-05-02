<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonthlyPackage;
use Illuminate\Http\Request;

class MonthlyPackageController extends Controller
{
    public function index()
    {
        return MonthlyPackage::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'price' => 'required|numeric',
            'description' => 'nullable',
        ]);

        $package = MonthlyPackage::create($validated);
        return response()->json($package, 201);
    }

    public function show(MonthlyPackage $monthlyPackage)
    {
        return $monthlyPackage;
    }

    public function update(Request $request, MonthlyPackage $monthlyPackage)
    {
        $validated = $request->validate([
            'name' => 'required',
            'price' => 'required|numeric',
            'description' => 'nullable',
        ]);

        $monthlyPackage->update($validated);
        return response()->json($monthlyPackage);
    }

    public function destroy(MonthlyPackage $monthlyPackage)
    {
        $monthlyPackage->delete();
        return response()->json(null, 204);
    }
}
