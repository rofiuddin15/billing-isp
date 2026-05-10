<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Voucher;
use App\Models\CashFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalCustomers = Customer::count();
        $activeCustomers = Customer::where('status', 'active')->count();
        
        $totalVouchersReady = Voucher::where('status', 'ready')->count();
        
        $currentMonthIncome = CashFlow::where('type', 'income')
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->sum('amount');

        $currentMonthExpense = CashFlow::where('type', 'expense')
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->sum('amount');

        $dueDateDay = (int)\App\Models\AppSetting::get('due_date_day', 10);
        $todayDay = now()->day;
        $currentPeriod = now()->format('Y-m');

        $totalArrears = \App\Models\Payment::where('status', 'unpaid')
            ->where(function($q) use ($dueDateDay, $todayDay, $currentPeriod) {
                $q->where('period', '<', $currentPeriod);
                if ($todayDay > $dueDateDay) {
                    $q->orWhere('period', $currentPeriod);
                }
            })->sum('amount');

        // Recent Activity (Mixed)
        $recentTransactions = CashFlow::latest()->take(5)->get();
        $recentCustomers = Customer::latest()->take(5)->get();

        // Monthly Stats for Chart (Last 6 months)
        $isSqlite = DB::connection()->getDriverName() === 'sqlite';
        $dateFormat = $isSqlite 
            ? 'strftime("%Y-%m", transaction_date) as month' 
            : 'DATE_FORMAT(transaction_date, "%Y-%m") as month';

        $monthlyStats = CashFlow::select(
            DB::raw($dateFormat),
            DB::raw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income'),
            DB::raw('SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense')
        )
        ->groupBy('month')
        ->orderBy('month', 'desc')
        ->take(6)
        ->get()
        ->reverse()
        ->values();

        return response()->json([
            'stats' => [
                'total_customers' => $totalCustomers,
                'active_customers' => $activeCustomers,
                'vouchers_ready' => $totalVouchersReady,
                'month_income' => (float)$currentMonthIncome,
                'month_expense' => (float)$currentMonthExpense,
                'balance' => (float)($currentMonthIncome - $currentMonthExpense),
                'total_arrears' => (float)$totalArrears
            ],
            'monthly_chart' => $monthlyStats,
            'recent_transactions' => $recentTransactions,
            'recent_customers' => $recentCustomers
        ]);
    }
}
