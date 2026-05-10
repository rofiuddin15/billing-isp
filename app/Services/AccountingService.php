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

        if (!$cashAccount || !$categoryAccount) {
            // Log or handle error: Cannot record journal without mapped account
            return null; 
        }

        $entries = [];

        if ($cashFlow->type === 'income') {
            // Debit Cash (+Asset), Credit Revenue (+Revenue)
            $entries[] = ['account_id' => $cashAccount->id, 'debit' => $cashFlow->amount];
            $entries[] = ['account_id' => $categoryAccount->id, 'credit' => $cashFlow->amount];
        } else {
            // Debit Expense (+Expense), Credit Cash (-Asset)
            $entries[] = ['account_id' => $categoryAccount->id, 'debit' => $cashFlow->amount];
            $entries[] = ['account_id' => $cashAccount->id, 'credit' => $cashFlow->amount];
        }

        return $this->createJournal(
            $cashFlow->transaction_date,
            "Cash Flow: " . $cashFlow->description,
            $entries,
            $cashFlow
        );
    }
}
