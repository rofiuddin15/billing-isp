<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            // ASSETS (1xxx)
            ['code' => '1000', 'name' => 'ASSETS', 'type' => 'asset', 'parent_id' => null],
            ['code' => '1100', 'name' => 'Current Assets', 'type' => 'asset', 'parent_id' => '1000'],
            ['code' => '1101', 'name' => 'Cash', 'type' => 'asset', 'parent_id' => '1100'],
            ['code' => '1102', 'name' => 'Bank', 'type' => 'asset', 'parent_id' => '1100'],
            ['code' => '1103', 'name' => 'Accounts Receivable', 'type' => 'asset', 'parent_id' => '1100'],
            
            // LIABILITIES (2xxx)
            ['code' => '2000', 'name' => 'LIABILITIES', 'type' => 'liability', 'parent_id' => null],
            ['code' => '2100', 'name' => 'Current Liabilities', 'type' => 'liability', 'parent_id' => '2000'],
            ['code' => '2101', 'name' => 'Accounts Payable', 'type' => 'liability', 'parent_id' => '2100'],

            // EQUITY (3xxx)
            ['code' => '3000', 'name' => 'EQUITY', 'type' => 'equity', 'parent_id' => null],
            ['code' => '3100', 'name' => 'Capital', 'type' => 'equity', 'parent_id' => '3000'],
            ['code' => '3101', 'name' => 'Owner\'s Equity', 'type' => 'equity', 'parent_id' => '3100'],

            // REVENUE (4xxx)
            ['code' => '4000', 'name' => 'REVENUE', 'type' => 'revenue', 'parent_id' => null],
            ['code' => '4100', 'name' => 'Sales Revenue', 'type' => 'revenue', 'parent_id' => '4000'],
            ['code' => '4101', 'name' => 'Monthly Subscription Revenue', 'type' => 'revenue', 'parent_id' => '4100'],
            ['code' => '4102', 'name' => 'Voucher Sales Revenue', 'type' => 'revenue', 'parent_id' => '4100'],
            ['code' => '4103', 'name' => 'Hardware Sales Revenue', 'type' => 'revenue', 'parent_id' => '4100'],

            // EXPENSES (5xxx)
            ['code' => '5000', 'name' => 'EXPENSES', 'type' => 'expense', 'parent_id' => null],
            ['code' => '5100', 'name' => 'Operating Expenses', 'type' => 'expense', 'parent_id' => '5000'],
            ['code' => '5101', 'name' => 'Electricity Expense', 'type' => 'expense', 'parent_id' => '5100'],
            ['code' => '5102', 'name' => 'Internet Bandwidth Expense', 'type' => 'expense', 'parent_id' => '5100'],
            ['code' => '5103', 'name' => 'Maintenance Expense', 'type' => 'expense', 'parent_id' => '5100'],
            ['code' => '5104', 'name' => 'Salary Expense', 'type' => 'expense', 'parent_id' => '5100'],
            ['code' => '5105', 'name' => 'Operational Expense', 'type' => 'expense', 'parent_id' => '5100'],
        ];

        $accountIds = [];

        foreach ($accounts as $acc) {
            $parentId = null;
            if ($acc['parent_id'] && isset($accountIds[$acc['parent_id']])) {
                $parentId = $accountIds[$acc['parent_id']];
            }

            $account = \App\Models\Account::create([
                'code' => $acc['code'],
                'name' => $acc['name'],
                'type' => $acc['type'],
                'parent_id' => $parentId
            ]);

            $accountIds[$acc['code']] = $account->id;
        }
    }
}
