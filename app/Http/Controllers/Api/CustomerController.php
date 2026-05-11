<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\ActivityLog;
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
        }], 'amount');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
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
            'monthly_package_id' => 'required|exists:monthly_packages,id',
            'status' => 'required|in:active,isolir,non-active',
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

        $data = $request->all();
        $data['customer_code'] = $customerCode;

        $customer = Customer::create($data);

        // Generate installation invoice if fee > 0
        if ($customer->installation_fee > 0) {
            \App\Models\Payment::create([
                'customer_id' => $customer->id,
                'invoice_number' => 'INV-INST-' . strtoupper(\Illuminate\Support\Str::random(8)),
                'period' => 'INSTALLATION',
                'amount' => $customer->installation_fee,
                'status' => 'unpaid',
            ]);
        }

        ActivityLog::log(
            "Pendaftaran Pelanggan", 
            "Pelanggan", 
            "Staff mendaftarkan pelanggan baru: {$customer->name} ({$customer->customer_code})."
        );

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
            }], 'amount');
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
        ]);

        $customer->update($validated);

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
