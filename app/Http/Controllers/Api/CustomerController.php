<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\ActivityLog;
use App\Services\MikrotikService;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $dueDateDay = (int)\App\Models\AppSetting::get('due_date_day', 10);
        $todayDay = now()->day;
        $currentPeriod = now()->format('Y-m');

        $query = Customer::with(['monthlyPackage', 'payments' => function($q) {
            $q->orderBy('period', 'desc');
        }])->withSum(['payments as total_arrears' => function($q) use ($dueDateDay, $todayDay, $currentPeriod) {
            $q->where('status', 'unpaid')
              ->where(function($sub) use ($dueDateDay, $todayDay, $currentPeriod) {
                  $sub->where('period', '<', $currentPeriod);
                  if ($todayDay > $dueDateDay) {
                      $sub->orWhere('period', $currentPeriod);
                  }
              });
        }], \Illuminate\Support\Facades\DB::raw('amount - discount - paid_amount'));

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('monthly_package_id')) {
            $query->where('monthly_package_id', $request->monthly_package_id);
        }

        if ($request->filled('has_arrears')) {
            if ($request->has_arrears === 'yes') {
                $query->whereHas('payments', function($q) use ($dueDateDay, $todayDay, $currentPeriod) {
                    $q->where('status', 'unpaid')
                      ->where(function($sub) use ($dueDateDay, $todayDay, $currentPeriod) {
                          $sub->where('period', '<', $currentPeriod);
                          if ($todayDay > $dueDateDay) {
                              $sub->orWhere('period', $currentPeriod);
                          }
                      });
                });
            } else {
                $query->whereDoesntHave('payments', function($q) use ($dueDateDay, $todayDay, $currentPeriod) {
                    $q->where('status', 'unpaid')
                      ->where(function($sub) use ($dueDateDay, $todayDay, $currentPeriod) {
                          $sub->where('period', '<', $currentPeriod);
                          if ($todayDay > $dueDateDay) {
                              $sub->orWhere('period', $currentPeriod);
                          }
                      });
                });
            }
        }

        if ($request->filled('billing_status')) {
            if ($request->billing_status === 'paid') {
                $query->whereHas('payments', function($q) use ($currentPeriod) {
                    $q->where('period', $currentPeriod)->where('status', 'paid');
                });
            } elseif ($request->billing_status === 'unpaid') {
                $query->whereHas('payments', function($q) use ($currentPeriod) {
                    $q->where('period', $currentPeriod)->where('status', 'unpaid');
                });
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('customer_code', 'like', "%{$search}%");
            });
        }

        return $query->paginate($request->get('per_page', 10));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'nullable|email',
            'monthly_package_id' => 'required|exists:monthly_packages,id',
            'status' => 'required|in:active,isolir,non-active',
            'router_id' => 'nullable|exists:routers,id',
            'pppoe_password' => 'nullable|string',
        ]);

        $datePrefix = now()->format('Ymd');
        $lastCustomer = Customer::where('customer_code', 'like', "%{$datePrefix}")
            ->orderBy('id', 'desc')
            ->first();
        
        $nextNumber = 1;
        if ($lastCustomer) {
            $lastNumber = (int) substr($lastCustomer->customer_code, 0, 3);
            $nextNumber = $lastNumber + 1;
        }

        $customerCode = str_pad($nextNumber, 3, '0', STR_PAD_LEFT) . $datePrefix;

        return \Illuminate\Support\Facades\DB::transaction(function() use ($request, $customerCode) {
            // Create User first for login access
            $email = $request->email ?? ($customerCode . '@minisp.net');
            
            $user = \App\Models\User::create([
                'name' => $request->name,
                'email' => $email,
                'password' => \Illuminate\Support\Facades\Hash::make($request->phone ?? '123456'),
            ]);

            // Assign customer role
            $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'api']);
            $user->assignRole($role);

            $data = $request->all();
            $data['customer_code'] = $customerCode;
            $data['user_id'] = $user->id;

            $customer = Customer::create($data);

            // Get Finance Settings
            $package = \App\Models\MonthlyPackage::find($customer->monthly_package_id);
            $installationFee = (float) \App\Models\AppSetting::get('registration_installation_fee', 0);
            $taxRate = (float) \App\Models\AppSetting::get('registration_tax_rate', 0);
            $adminFee = (float) \App\Models\AppSetting::get('registration_admin_fee', 0);
            $discount = (float) \App\Models\AppSetting::get('registration_discount', 0);

            $subtotal = $installationFee + $adminFee - $discount;
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

            // Sync to Mikrotik if active and router selected
            if ($customer->router_id && $customer->status === 'active') {
                try {
                    $customer->load('router', 'monthlyPackage');
                    if ($customer->monthlyPackage && $customer->monthlyPackage->mikrotik_profile_name) {
                        $service = new MikrotikService($customer->router);
                        $service->syncPppoeSecret(
                            $customer->customer_code,
                            $customer->pppoe_password ?? '123456',
                            $customer->monthlyPackage->mikrotik_profile_name,
                            $customer->name
                        );
                    }
                } catch (\Exception $e) {
                    \Log::error('Mikrotik Sync Error: ' . $e->getMessage());
                }
            }

            ActivityLog::log(
                "Pendaftaran Pelanggan", 
                "Pelanggan", 
                "Staff mendaftarkan pelanggan baru: {$customer->name} ({$customer->customer_code})."
            );

            return $customer;
        });

        return response()->json($customer, 201);
    }

    public function show(Customer $customer)
    {
        $dueDateDay = (int)\App\Models\AppSetting::get('due_date_day', 10);
        $todayDay = now()->day;
        $currentPeriod = now()->format('Y-m');

        return $customer->load(['monthlyPackage', 'payments'])
            ->loadSum(['payments as total_arrears' => function($q) use ($dueDateDay, $todayDay, $currentPeriod) {
                $q->where('status', 'unpaid')
                  ->where(function($sub) use ($dueDateDay, $todayDay, $currentPeriod) {
                      $sub->where('period', '<', $currentPeriod);
                      if ($todayDay > $dueDateDay) {
                          $sub->orWhere('period', $currentPeriod);
                      }
                  });
            }], \Illuminate\Support\Facades\DB::raw('amount - discount - paid_amount'));
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'customer_code' => 'required|unique:customers,customer_code,' . $customer->id,
            'name' => 'required',
            'address' => 'nullable',
            'phone' => 'nullable',
            'pppoe_user' => 'nullable',
            'monthly_package_id' => 'required|exists:monthly_packages,id',
            'status' => 'required|in:active,isolir,non-active',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'router_id' => 'nullable|exists:routers,id',
            'pppoe_password' => 'nullable|string',
        ]);

        $customer->update($validated);

        // Sync to Mikrotik
        if ($customer->router_id) {
            try {
                $customer->load('router', 'monthlyPackage');
                $service = new MikrotikService($customer->router);
                if ($customer->status === 'active' && $customer->monthlyPackage && $customer->monthlyPackage->mikrotik_profile_name) {
                    $service->syncPppoeSecret(
                        $customer->customer_code,
                        $customer->pppoe_password ?? '123456',
                        $customer->monthlyPackage->mikrotik_profile_name,
                        $customer->name
                    );
                } elseif ($customer->status === 'isolir') {
                    $service->disablePppoeSecret($customer->customer_code);
                } elseif ($customer->status === 'non-active') {
                    $service->removePppoeSecret($customer->customer_code);
                }
            } catch (\Exception $e) {
                \Log::error('Mikrotik Sync Error: ' . $e->getMessage());
            }
        }

        ActivityLog::log(
            "Pembaruan Data Pelanggan", 
            "Pelanggan", 
            "Staff memperbarui data pelanggan: {$customer->name} ({$customer->customer_code})."
        );

        return response()->json($customer);
    }

    public function destroy(Customer $customer)
    {
        $customerName = $customer->name;
        $customerCode = $customer->customer_code;
        
        if ($customer->router_id) {
            try {
                $customer->load('router');
                $service = new MikrotikService($customer->router);
                $service->removePppoeSecret($customerCode);
            } catch (\Exception $e) {
                \Log::error('Mikrotik Sync Error: ' . $e->getMessage());
            }
        }
        
        $customer->delete();

        ActivityLog::log(
            "Penghapusan Pelanggan", 
            "Pelanggan", 
            "Staff menghapus data pelanggan: {$customerName} ({$customerCode})."
        );

        return response()->json(null, 204);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,txt'
        ]);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\CustomerImport, $request->file('file'));
            
            ActivityLog::log(
                "Import Data Pelanggan", 
                "Pelanggan", 
                "Staff melakukan import data pelanggan secara massal melalui file."
            );

            return response()->json(['message' => 'Data pelanggan berhasil diimport']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengimport data: ' . $e->getMessage()], 422);
        }
    }

    public function downloadTemplate()
    {
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\CustomerTemplateExport, 'template_pelanggan.xlsx');
    }
}
