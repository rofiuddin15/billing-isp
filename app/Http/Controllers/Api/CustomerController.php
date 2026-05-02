<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::with('monthlyPackage');

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
        $validated = $request->validate([
            'customer_code' => 'required|unique:customers',
            'name' => 'required',
            'address' => 'nullable',
            'phone' => 'nullable',
            'pppoe_user' => 'nullable',
            'monthly_package_id' => 'required|exists:monthly_packages,id',
            'status' => 'required|in:active,isolir,non-active',
        ]);

        $customer = Customer::create($validated);
        return response()->json($customer, 201);
    }

    public function show(Customer $customer)
    {
        return $customer->load('monthlyPackage', 'payments');
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
        ]);

        $customer->update($validated);
        return response()->json($customer);
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->json(null, 204);
    }
}
