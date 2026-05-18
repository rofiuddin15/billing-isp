<?php

namespace App\Imports;

use App\Models\Customer;
use App\Models\MonthlyPackage;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CustomerImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Try to find package dynamically:
        // 1. By ID if the value in 'paket' is numeric
        // 2. By Name if the value in 'paket' is text
        // 3. Fallback to package_id column
        $package = null;
        if (isset($row['paket'])) {
            $paketVal = trim($row['paket']);
            if (is_numeric($paketVal)) {
                $package = MonthlyPackage::find($paketVal);
            }
            if (!$package) {
                $package = MonthlyPackage::where('name', 'like', '%' . $paketVal . '%')->first();
            }
        }

        if (!$package && isset($row['package_id'])) {
            $package = MonthlyPackage::find($row['package_id']);
        }

        $customerCode = $row['kode_pelanggan'] ?? $this->generateCode();
        $email = $row['email'] ?? ($customerCode . '@minisp.net');
        $name = $row['nama'];
        $phone = $row['telepon'] ?? null;

        // Check if user already exists
        $user = \App\Models\User::where('email', $email)->first();
        if (!$user) {
            $user = \App\Models\User::create([
                'name' => $name,
                'email' => $email,
                'password' => \Illuminate\Support\Facades\Hash::make($phone ?? '123456'),
            ]);
            
            $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'api']);
            $user->assignRole($role);
        }

        $packagePrice = $package ? (float) $package->price : 0;
        $cashPaid = isset($row['jumlah_bayar']) ? (float)$row['jumlah_bayar'] : null;
        
        $excess = 0;
        if (isset($row['saldo'])) {
            $excess = (float)$row['saldo'];
        } elseif (isset($row['balance'])) {
            $excess = (float)$row['balance'];
        } elseif ($cashPaid !== null && $cashPaid > $packagePrice) {
            $excess = $cashPaid - $packagePrice;
        }

        // Direct Customer insertion so we have the ID instantly
        $customer = Customer::create([
            'user_id'            => $user->id,
            'customer_code'      => $customerCode,
            'name'               => $name,
            'email'              => $row['email'] ?? null,
            'address'            => $row['alamat'] ?? null,
            'phone'              => $phone,
            'pppoe_user'         => $row['pppoe_user'] ?? null,
            'monthly_package_id' => $package ? $package->id : null,
            'status'             => $this->mapStatus($row['status'] ?? 'active'),
            'latitude'           => $row['latitude'] ?? null,
            'longitude'          => $row['longitude'] ?? null,
            'balance'            => $excess,
        ]);

        // If Cash Paid is recorded, write the historical invoice & cashflow
        if ($cashPaid !== null) {
            $period = now()->subMonth()->format('Y-m'); // e.g. 2026-04 if current is 2026-05
            
            $payment = \App\Models\Payment::create([
                'customer_id' => $customer->id,
                'invoice_number' => 'INV-MIG-' . strtoupper(uniqid()),
                'period' => $period,
                'amount' => $packagePrice,
                'status' => 'paid',
                'confirmed_by' => null // system migrated
            ]);

            $category = \App\Models\TransactionCategory::firstOrCreate(['name' => 'Bulanan']);
            \App\Models\CashFlow::create([
                'transaction_date' => now()->subMonth()->toDateString(),
                'type' => 'income',
                'category_id' => $category->id,
                'amount' => $cashPaid,
                'description' => "Migrated Payment for {$customer->name} ({$period}) - Cash: Rp " . number_format($cashPaid),
                'reference_id' => $payment->id,
                'created_by' => null,
            ]);
        }

        return null;
    }

    public function rules(): array
    {
        return [
            'nama' => 'required|string|max:255',
            'kode_pelanggan' => 'nullable|unique:customers,customer_code',
            'email' => 'nullable|email',
            'telepon' => 'nullable|string|max:20',
            'paket' => [
                'required_without:package_id',
                function ($attribute, $value, $fail) {
                    if (!empty($value)) {
                        $value = trim($value);
                        $exists = false;
                        if (is_numeric($value)) {
                            $exists = \App\Models\MonthlyPackage::where('id', $value)->exists();
                        }
                        if (!$exists) {
                            $exists = \App\Models\MonthlyPackage::where('name', 'like', '%' . $value . '%')->exists();
                        }
                        if (!$exists) {
                            $fail("Paket internet dengan ID atau nama '{$value}' tidak ditemukan di database.");
                        }
                    }
                }
            ],
            'package_id' => [
                'required_without:paket',
                'nullable',
                'exists:monthly_packages,id'
            ],
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nama.required' => 'Kolom nama wajib diisi.',
            'kode_pelanggan.unique' => 'Kode pelanggan :value sudah terdaftar di database.',
            'email.email' => 'Format email tidak valid.',
            'paket.required_without' => 'Kolom paket atau ID paket wajib diisi.',
            'package_id.required_without' => 'Kolom paket atau ID paket wajib diisi.',
            'package_id.exists' => 'ID paket yang dipilih tidak valid atau tidak ditemukan.',
        ];
    }

    private function mapStatus($status)
    {
        $status = strtolower($status);
        if (in_array($status, ['aktif', 'active'])) return 'active';
        if (in_array($status, ['isolir'])) return 'isolir';
        if (in_array($status, ['non-aktif', 'non-active', 'nonaktif'])) return 'non-active';
        return 'active';
    }

    private function generateCode()
    {
        $latest = Customer::latest()->first();
        $num = $latest ? intval(substr($latest->customer_code, 2)) + 1 : 1;
        return 'MP' . str_pad($num, 5, '0', STR_PAD_LEFT);
    }
}

