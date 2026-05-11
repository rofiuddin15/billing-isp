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
        // Try to find package by name (Indonesian 'paket' column)
        $package = null;
        if (isset($row['paket'])) {
            $package = MonthlyPackage::where('name', 'like', '%' . $row['paket'] . '%')->first();
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

        return new Customer([
            'user_id'            => $user->id,
            'customer_code'      => $customerCode,
            'name'               => $name,
            'email'              => $row['email'] ?? null,
            'address'            => $row['alamat'] ?? null,
            'phone'              => $phone,
            'pppoe_user'         => $row['pppoe_user'] ?? null,
            'monthly_package_id' => $package ? $package->id : ($row['package_id'] ?? null),
            'installation_fee'   => $row['biaya_pemasangan'] ?? 0,
            'status'             => $this->mapStatus($row['status'] ?? 'active'),
            'latitude'           => $row['latitude'] ?? null,
            'longitude'          => $row['longitude'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'nama' => 'required|string|max:255',
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
