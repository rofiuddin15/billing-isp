<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    private function ensureMatrixPermissionsExist()
    {
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
        $guards = ['api', 'web'];

        $existingCount = Permission::where('guard_name', 'api')->count();
        if ($existingCount < count($menuNames) * count($actions)) {
            foreach ($menuNames as $name) {
                foreach ($actions as $action) {
                    $permName = "{$action}.{$name}";
                    foreach ($guards as $guard) {
                        Permission::firstOrCreate([
                            'name' => $permName,
                            'guard_name' => $guard
                        ]);
                    }
                }
            }
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        }
    }

    public function index()
    {
        $this->ensureMatrixPermissionsExist();
        return Role::with('permissions')->get();
    }

    public function permissions()
    {
        $this->ensureMatrixPermissionsExist();
        return Permission::where('guard_name', 'api')->get();
    }

    public function updatePermissions(Request $request, Role $role)
    {
        $this->ensureMatrixPermissionsExist();
        
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        $role->syncPermissions($validated['permissions']);

        return response()->json([
            'message' => 'Permissions updated successfully',
            'role' => $role->load('permissions')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
        ]);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'api']);

        return response()->json([
            'message' => 'Role created successfully',
            'role' => $role
        ], 201);
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'admin') {
            return response()->json(['message' => 'Cannot delete admin role'], 422);
        }

        $role->delete();
        return response()->json(['message' => 'Role deleted successfully']);
    }
}
