<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Customer;
use App\Models\MonthlyPackage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $login = $request->input('email'); // Label says email but we'll treat as 'login'
        $password = $request->input('password');

        // Try to find user by email or phone
        $user = User::where('email', $login)
            ->orWhereHas('customer', function($query) use ($login) {
                $query->where('phone', $login);
            })
            ->first();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $credentials = [
            'email' => $user->email,
            'password' => $password
        ];

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $this->respondWithToken($token);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
            'monthly_package_id' => 'required|exists:monthly_packages,id',
        ]);

        return DB::transaction(function() use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            // Assign customer role
            $role = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'api']);
            $user->assignRole($role);

            // Create Customer record
            $customer = Customer::create([
                'user_id' => $user->id,
                'customer_code' => 'CUST-' . strtoupper(bin2hex(random_bytes(3))),
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'monthly_package_id' => $validated['monthly_package_id'],
                'status' => 'active',
            ]);

            $package = MonthlyPackage::find($validated['monthly_package_id']);
            
            // Get Finance Settings
            $installationFee = (float) \App\Models\AppSetting::get('registration_installation_fee', 0);
            $taxRate = (float) \App\Models\AppSetting::get('registration_tax_rate', 0);
            $adminFee = (float) \App\Models\AppSetting::get('registration_admin_fee', 0);
            $discount = (float) \App\Models\AppSetting::get('registration_discount', 0);

            $subtotal = $package->price + $installationFee + $adminFee - $discount;
            $taxAmount = ($taxRate / 100) * $subtotal;
            $totalAmount = $subtotal + $taxAmount;

            if ($totalAmount > 0) {
                \App\Models\Payment::create([
                    'customer_id' => $customer->id,
                    'invoice_number' => 'INV-REG-' . strtoupper(\Illuminate\Support\Str::random(8)),
                    'period' => 'REGISTRATION',
                    'amount' => $totalAmount,
                    'status' => 'unpaid',
                ]);
            }

            // Return customer and package info for the receipt
            return response()->json([
                'message' => 'Registration successful',
                'customer' => $customer,
                'package' => $package,
                'user' => $user,
                'billing' => [
                    'package_price' => $package->price,
                    'installation_fee' => $installationFee,
                    'admin_fee' => $adminFee,
                    'discount' => $discount,
                    'tax_rate' => $taxRate,
                    'tax_amount' => $taxAmount,
                    'total' => $totalAmount
                ]
            ], 201);
        });
    }

    public function me()
    {
        $user = auth('api')->user();
        $user->load('customer.monthlyPackage'); // Load customer info if it exists
        
        return response()->json([
            'user' => $user,
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'roles' => $user->getRoleNames(),
        ]);
    }

    public function logout()
    {
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    protected function respondWithToken($token)
    {
        $user = auth('api')->user();
        $user->load('customer.monthlyPackage');
        
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $user,
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'roles' => $user->getRoleNames(),
        ]);
    }
}
