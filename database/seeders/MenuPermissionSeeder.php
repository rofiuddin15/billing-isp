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

        // Define Menu Names
        $menuNames = [
            'dashboard',
            'customers',
            'packages',
            'vouchers',
            'finance',
            'coa',
            'ledger',
            'reports',
            'finance_settings',
            'master_vouchers',
            'master_categories',
            'complaints',
            'users',
            'roles',
            'settings'
        ];

        $actions = ['menu', 'create', 'edit', 'delete'];
        $permissionsToSeed = [];

        foreach ($menuNames as $name) {
            foreach ($actions as $action) {
                $permissionsToSeed["{$action}.{$name}"] = true;
            }
        }

        $guards = ['api', 'web'];

        foreach ($guards as $guard) {
            // Delete obsolete permissions that are not in our list
            Permission::where('guard_name', $guard)
                ->whereNotIn('name', array_keys($permissionsToSeed))
                ->delete();

            foreach (array_keys($permissionsToSeed) as $permName) {
                Permission::firstOrCreate([
                    'name' => $permName, 
                    'guard_name' => $guard
                ]);
            }
        }

        // Standardize existing roles
        $rolesToUpdate = Role::where('guard_name', 'web')->get();
        foreach ($rolesToUpdate as $role) {
            $role->guard_name = 'api';
            $role->save();
        }

        // Create or Update Admin Role
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        
        // Sync all permissions to Admin
        $allPermissions = Permission::where('guard_name', 'api')->pluck('name')->toArray();
        $adminRole->syncPermissions($allPermissions);

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
