<?php

namespace App\Services;

use App\Models\Journal;
use App\Models\JournalEntry;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    /**
     * Create a balancing journal entry.
     */
    public function createJournal($date, $description, $entries, $reference = null)
    {
        return DB::transaction(function () use ($date, $description, $entries, $reference) {
            $journal = Journal::create([
                'date' => $date,
                'description' => $description,
                'reference_id' => $reference ? $reference->id : null,
                'reference_type' => $reference ? get_class($reference) : null,
            ]);

            $totalDebit = 0;
            $totalCredit = 0;

            foreach ($entries as $entry) {
                JournalEntry::create([
                    'journal_id' => $journal->id,
                    'account_id' => $entry['account_id'],
                    'debit' => $entry['debit'] ?? 0,
                    'credit' => $entry['credit'] ?? 0,
                ]);

                $totalDebit += ($entry['debit'] ?? 0);
                $totalCredit += ($entry['credit'] ?? 0);
            }

            // Optional: Validate balance
            if (abs($totalDebit - $totalCredit) > 0.01) {
                throw new \Exception("Journal entries do not balance! Debits: $totalDebit, Credits: $totalCredit");
            }

            return $journal;
        });
    }

    /**
     * Record a transaction from a Cash Flow entry.
     */
    public function recordCashFlow($cashFlow)
    {
        $cashAccount = Account::where('code', '1101')->first(); // Cash
        
        $category = \App\Models\TransactionCategory::find($cashFlow->category_id);
        $categoryAccount = $category ? $category->account : null;

        if (!$categoryAccount) {
            // Fallback to default accounts based on type
            if ($cashFlow->type === 'income') {
                // If it is monthly subscription payment, prefer 4101, otherwise fallback to 4100
                if (str_contains(strtolower($cashFlow->description), 'payment')) {
                    $categoryAccount = Account::where('code', '4101')->first() ?? Account::where('code', '4100')->first();
                } else {
                    $categoryAccount = Account::where('code', '4100')->first(); // Sales Revenue
                }
            } else {
                $categoryAccount = Account::where('code', '5105')->first(); // Operational Expense
            }
        }

        if (!$cashAccount || !$categoryAccount) {
            return null; 
        }

        $entries = [];

        // Check if CashFlow is associated with a customer monthly subscription Payment
        $payment = null;
        if ($cashFlow->reference_id && str_contains(strtolower($cashFlow->description), 'payment')) {
            $payment = \App\Models\Payment::find($cashFlow->reference_id);
        }

        if ($payment && $cashFlow->type === 'income') {
            // Find or create the Deferred Revenue account (Pendapatan Diterima di Muka) under current liabilities
            $deferredAccount = Account::firstOrCreate(
                ['code' => '2102'],
                [
                    'name' => 'Pendapatan Diterima di Muka',
                    'type' => 'liability',
                    'parent_id' => 6 // parent LIABILITIES
                ]
            );

            $cashAmt = (float)$cashFlow->amount;

            // Extract dynamic cash, balance used, and excess values from description text
            $deductedFromBalance = 0;
            if (preg_match('/Saldo:\s*Rp\s*([0-9.,]+)/i', $cashFlow->description, $matches)) {
                $deductedFromBalance = (float)str_replace(',', '', $matches[1]);
            }

            $excess = 0;
            if (preg_match('/Lebih:\s*Rp\s*([0-9.,]+)/i', $cashFlow->description, $matches)) {
                $excess = (float)str_replace(',', '', $matches[1]);
            }

            $settledInvoiceAmt = max(0, $cashAmt - $excess + $deductedFromBalance);

            // 1. Debit Cash (only for actual cash received physically)
            if ($cashAmt > 0) {
                $entries[] = ['account_id' => $cashAccount->id, 'debit' => $cashAmt];
            }

            // 2. Credit Sales Revenue (credit exactly the settled amount on the invoice)
            if ($settledInvoiceAmt > 0) {
                $entries[] = ['account_id' => $categoryAccount->id, 'credit' => $settledInvoiceAmt];
            }

            // 3. Balance Adjustments (using Deferred Revenue)
            if ($excess > 0) {
                // Excess payment: Credit Deferred Revenue (increases liability)
                $entries[] = ['account_id' => $deferredAccount->id, 'credit' => $excess];
            }
            if ($deductedFromBalance > 0) {
                // Balance used: Debit Deferred Revenue (decreases liability)
                $entries[] = ['account_id' => $deferredAccount->id, 'debit' => $deductedFromBalance];
            }
        } else {
            // Normal fallback transaction
            if ($cashFlow->type === 'income') {
                // Debit Cash (+Asset), Credit Revenue (+Revenue)
                $entries[] = ['account_id' => $cashAccount->id, 'debit' => $cashFlow->amount];
                $entries[] = ['account_id' => $categoryAccount->id, 'credit' => $cashFlow->amount];
            } else {
                // Debit Expense (+Expense), Credit Cash (-Asset)
                $entries[] = ['account_id' => $categoryAccount->id, 'debit' => $cashFlow->amount];
                $entries[] = ['account_id' => $cashAccount->id, 'credit' => $cashFlow->amount];
            }
        }

        if (empty($entries)) {
            return null;
        }

        return $this->createJournal(
            $cashFlow->transaction_date,
            "Cash Flow: " . $cashFlow->description,
            $entries,
            $cashFlow
        );
    }
}
