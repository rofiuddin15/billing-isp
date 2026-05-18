<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\JournalEntry;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Generate Profit & Loss Statement (Laporan Laba Rugi)
     */
    public function profitLoss(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Fetch all revenue accounts (type = 'revenue')
        $revenueAccounts = Account::where('type', 'revenue')->orderBy('code')->get();
        $revenues = [];
        $totalRevenue = 0;

        foreach ($revenueAccounts as $account) {
            $query = JournalEntry::where('account_id', $account->id)
                ->join('journals', 'journal_entries.journal_id', '=', 'journals.id');

            if ($startDate && $endDate) {
                $query->whereBetween('journals.date', [$startDate, $endDate]);
            }

            // Revenue has natural Credit balance, so credit - debit
            $sumCredit = (float) $query->sum('credit');
            $sumDebit = (float) $query->sum('debit');
            $balance = $sumCredit - $sumDebit;

            if ($balance != 0) {
                $revenues[] = [
                    'code' => $account->code,
                    'name' => $account->name,
                    'balance' => $balance,
                ];
                $totalRevenue += $balance;
            }
        }

        // Fetch all expense accounts (type = 'expense')
        $expenseAccounts = Account::where('type', 'expense')->orderBy('code')->get();
        $expenses = [];
        $totalExpense = 0;

        foreach ($expenseAccounts as $account) {
            $query = JournalEntry::where('account_id', $account->id)
                ->join('journals', 'journal_entries.journal_id', '=', 'journals.id');

            if ($startDate && $endDate) {
                $query->whereBetween('journals.date', [$startDate, $endDate]);
            }

            // Expense has natural Debit balance, so debit - credit
            $sumDebit = (float) $query->sum('debit');
            $sumCredit = (float) $query->sum('credit');
            $balance = $sumDebit - $sumCredit;

            if ($balance != 0) {
                $expenses[] = [
                    'code' => $account->code,
                    'name' => $account->name,
                    'balance' => $balance,
                ];
                $totalExpense += $balance;
            }
        }

        $netIncome = $totalRevenue - $totalExpense;

        return response()->json([
            'revenues' => $revenues,
            'total_revenue' => $totalRevenue,
            'expenses' => $expenses,
            'total_expense' => $totalExpense,
            'net_income' => $netIncome,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
    }

    /**
     * Generate Trial Balance (Neraca Saldo)
     */
    public function trialBalance(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Fetch all accounts
        $accounts = Account::orderBy('code')->get();
        $trialBalance = [];
        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($accounts as $account) {
            $query = JournalEntry::where('account_id', $account->id)
                ->join('journals', 'journal_entries.journal_id', '=', 'journals.id');

            if ($startDate && $endDate) {
                $query->whereBetween('journals.date', [$startDate, $endDate]);
            }

            $debitSum = (float) $query->sum('debit');
            $creditSum = (float) $query->sum('credit');

            if ($debitSum == 0 && $creditSum == 0) {
                continue; // Skip accounts with absolutely no activity in the period
            }

            $netDebit = 0;
            $netCredit = 0;

            // Determine balance type
            $naturalType = in_array($account->type, ['asset', 'expense']) ? 'debit' : 'credit';

            if ($naturalType === 'debit') {
                $netBalance = $debitSum - $creditSum;
                if ($netBalance >= 0) {
                    $netDebit = $netBalance;
                } else {
                    $netCredit = abs($netBalance);
                }
            } else {
                $netBalance = $creditSum - $debitSum;
                if ($netBalance >= 0) {
                    $netCredit = $netBalance;
                } else {
                    $netDebit = abs($netBalance);
                }
            }

            $trialBalance[] = [
                'code' => $account->code,
                'name' => $account->name,
                'type' => $account->type,
                'debit' => $netDebit,
                'credit' => $netCredit,
            ];

            $totalDebit += $netDebit;
            $totalCredit += $netCredit;
        }

        return response()->json([
            'accounts' => $trialBalance,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'is_balanced' => abs($totalDebit - $totalCredit) < 0.01,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
    }
}
