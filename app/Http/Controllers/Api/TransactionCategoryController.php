<?php

namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\TransactionCategory;
use Illuminate\Http\Request;
 
class TransactionCategoryController extends Controller
{
    public function index()
    {
        return TransactionCategory::with('account')->get();
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense,both',
            'account_id' => 'required|exists:accounts,id',
        ]);
 
        $category = TransactionCategory::create($validated);
        return response()->json($category->load('account'), 201);
    }
 
    public function show(TransactionCategory $transactionCategory)
    {
        return $transactionCategory->load('account');
    }
 
    public function update(Request $request, TransactionCategory $transactionCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense,both',
            'account_id' => 'required|exists:accounts,id',
        ]);
 
        $transactionCategory->update($validated);
        return response()->json($transactionCategory->load('account'));
    }
 
    public function destroy(TransactionCategory $transactionCategory)
    {
        $transactionCategory->delete();
        return response()->json(null, 204);
    }
}
