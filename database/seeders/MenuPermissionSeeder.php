<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class MenuPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define Menu Permissions
        $menus = [
            'menu.dashboard' => 'Akses Dashboard',
            'menu.customers' => 'Akses Menu Pelanggan',
            'menu.packages' => 'Akses Menu Paket Bulanan',
            'menu.vouchers' => 'Akses Menu Voucher',
            'menu.finance' => 'Akses Menu Arus Kas',
            'menu.coa' => 'Akses Menu Bagan Akun',
            'menu.ledger' => 'Akses Menu Buku Besar',
            'menu.finance_settings' => 'Akses Pengaturan Biaya Pendaftaran',
            'menu.master_vouchers' => 'Akses Data Master Paket Voucher',
            'menu.master_categories' => 'Akses Data Master Kategori Transaksi',
            'menu.complaints' => 'Akses Menu Aduan',
            'menu.settings' => 'Akses Menu Pengaturan',
            'menu.roles' => 'Akses Manajemen Role & Akses',
            'menu.users' => 'Akses Manajemen Staff'
        ];

        $guards = ['api', 'web'];

        foreach ($guards as $guard) {
            // Delete obsolete permissions
            Permission::where('guard_name', $guard)
                ->whereNotIn('name', array_keys($menus))
                ->delete();

            foreach ($menus as $name => $description) {
                Permission::firstOrCreate([
                    'name' => $name, 
                    'guard_name' => $guard
                ]);
            }
        }

        // Ensure roles use 'api' guard for consistency with our JWT auth
        $rolesToUpdate = Role::where('guard_name', 'web')->get();
        foreach ($rolesToUpdate as $role) {
            $role->guard_name = 'api';
            $role->save();
        }

        // Create or Update Admin Role
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        
        // Sync all permissions to Admin
        $adminRole->syncPermissions(array_keys($menus));

        // Assign Admin role to the first user if any
        $user = User::first();
        if ($user) {
            $user->assignRole($adminRole);
        }

        // Customer Role
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'api']);
        $customerRole->syncPermissions(['menu.complaints', 'menu.dashboard']);
    }
}
