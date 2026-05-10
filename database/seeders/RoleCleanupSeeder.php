<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RoleCleanupSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get the 'admin' role we want to keep (guard_name: api)
        $targetRole = Role::where('name', 'admin')->where('guard_name', 'api')->first();
        
        if (!$targetRole) {
            $targetRole = Role::create(['name' => 'admin', 'guard_name' => 'api']);
        }

        // 2. Identify duplicate/old admin roles
        $oldRoles = Role::whereIn('name', ['Admin', 'admin'])
            ->where('id', '!=', $targetRole->id)
            ->get();

        foreach ($oldRoles as $oldRole) {
            // Find users who have BOTH roles
            $usersWithBoth = DB::table('model_has_roles')
                ->where('role_id', $oldRole->id)
                ->whereIn('model_id', function($query) use ($targetRole) {
                    $query->select('model_id')
                          ->from('model_has_roles')
                          ->where('role_id', $targetRole->id);
                })
                ->get();

            // Delete the old assignment for users who already have the target role
            foreach ($usersWithBoth as $assignment) {
                DB::table('model_has_roles')
                    ->where('role_id', $oldRole->id)
                    ->where('model_id', $assignment->model_id)
                    ->where('model_type', $assignment->model_type)
                    ->delete();
            }

            // For the rest, move them to the target role
            DB::table('model_has_roles')
                ->where('role_id', $oldRole->id)
                ->update(['role_id' => $targetRole->id]);
            
            // Delete the old role
            $oldRole->delete();
        }

        // 3. Ensure all permissions are synced to the target role
        $permissions = Permission::where('guard_name', 'api')->get();
        $targetRole->syncPermissions($permissions);

        // 4. Ensure other roles (Staff, Teknisi) use 'api' guard and lowercase
        $rolesToStandardize = ['Staff', 'Teknisi', 'staff', 'teknisi'];
        foreach ($rolesToStandardize as $roleName) {
            $roles = Role::whereRaw('LOWER(name) = ?', [strtolower($roleName)])->get();
            if ($roles->count() > 1) {
                // Keep the first one, merge others
                $keep = $roles->first();
                $keep->name = strtolower($roleName);
                $keep->guard_name = 'api';
                $keep->save();

                foreach ($roles->skip(1) as $dup) {
                    DB::table('model_has_roles')->where('role_id', $dup->id)->update(['role_id' => $keep->id]);
                    $dup->delete();
                }
            } elseif ($roles->count() == 1) {
                $role = $roles->first();
                $role->name = strtolower($roleName);
                $role->guard_name = 'api';
                $role->save();
            }
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
