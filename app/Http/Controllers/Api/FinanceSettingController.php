<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;

class FinanceSettingController extends Controller
{
    public function index()
    {
        return response()->json([
            'installation_fee' => AppSetting::get('registration_installation_fee', 0),
            'tax_rate' => AppSetting::get('registration_tax_rate', 0),
            'admin_fee' => AppSetting::get('registration_admin_fee', 0),
            'discount' => AppSetting::get('registration_discount', 0),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'installation_fee' => 'required|numeric|min:0',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'admin_fee' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
        ]);

        AppSetting::set('registration_installation_fee', $validated['installation_fee']);
        AppSetting::set('registration_tax_rate', $validated['tax_rate']);
        AppSetting::set('registration_admin_fee', $validated['admin_fee']);
        AppSetting::set('registration_discount', $validated['discount']);

        return response()->json(['message' => 'Finance settings updated successfully']);
    }
}
