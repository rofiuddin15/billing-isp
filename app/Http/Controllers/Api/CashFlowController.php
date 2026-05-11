<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CashFlowController extends Controller
{
    protected $accounting;

    public function __construct(\App\Services\AccountingService $accounting)
    {
        $this->accounting = $accounting;
    }

    public function index(Request $request)
    {
        $query = CashFlow::with(['creator', 'category']);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
        }

        if ($request->filled('search')) {
            $query->where('description', 'like', "%{$request->search}%");
        }

        return $query->latest('transaction_date')->paginate($request->get('per_page', 10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'transaction_date' => 'required|date',
            'type' => 'required|in:income,expense',
            'category_id' => 'required|exists:transaction_categories,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        $validated['created_by'] = auth('api')->id();

        return DB::transaction(function () use ($validated) {
            $cashFlow = CashFlow::create($validated);
            

            ActivityLog::log(
                $cashFlow->type === 'income' ? "Catat Pendapatan" : "Catat Pengeluaran", 
                "Kas", 
                "Staff mencatat " . ($cashFlow->type === 'income' ? 'pendapatan' : 'pengeluaran') . " baru senilai Rp " . number_format($cashFlow->amount) . " untuk: {$cashFlow->description}."
            );

            return response()->json($cashFlow->load('category'), 201);
        });
    }

    public function stats()
    {
        $stats = CashFlow::select('type', DB::raw('SUM(amount) as total'))
            ->groupBy('type')
            ->get();

        $income = $stats->where('type', 'income')->first()->total ?? 0;
        $expense = $stats->where('type', 'expense')->first()->total ?? 0;

        return response()->json([
            'total_income' => (float)$income,
            'total_expense' => (float)$expense,
            'balance' => (float)($income - $expense)
        ]);
    }

    public function destroy(CashFlow $cashFlow)
    {
        $desc = $cashFlow->description;
        $amount = $cashFlow->amount;
        $type = $cashFlow->type;
        $cashFlow->delete();

        ActivityLog::log(
            "Hapus Transaksi Kas", 
            "Kas", 
            "Staff menghapus transaksi " . ($type === 'income' ? 'pendapatan' : 'pengeluaran') . " senilai Rp " . number_format($amount) . " ({$desc})."
        );

        return response()->json(null, 204);
    }
}
