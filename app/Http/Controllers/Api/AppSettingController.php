<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;

class AppSettingController extends Controller
{
    public function index()
    {
        return response()->json(AppSetting::all()->pluck('value', 'key'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->settings as $key => $value) {
            AppSetting::set($key, $value);
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function getDueDate()
    {
        return response()->json([
            'due_date_day' => AppSetting::get('due_date_day', 10)
        ]);
    }
}
