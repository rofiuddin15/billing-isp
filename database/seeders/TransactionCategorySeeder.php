<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransactionCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // INCOME
            ['name' => 'Monthly Internet Fee', 'type' => 'income', 'account_code' => '4101'],
            ['name' => 'Voucher Sales', 'type' => 'income', 'account_code' => '4102'],
            ['name' => 'Installation Fee', 'type' => 'income', 'account_code' => '4103'],
            ['name' => 'Hardware Sales', 'type' => 'income', 'account_code' => '4103'],
            
            // EXPENSE
            ['name' => 'Bandwidth (Upstream)', 'type' => 'expense', 'account_code' => '5102'],
            ['name' => 'Electricity & Utilities', 'type' => 'expense', 'account_code' => '5101'],
            ['name' => 'Technician Salary', 'type' => 'expense', 'account_code' => '5104'],
            ['name' => 'Marketing & Ads', 'type' => 'expense', 'account_code' => '5105'],
            ['name' => 'Equipment Maintenance', 'type' => 'expense', 'account_code' => '5103'],
            ['name' => 'Office Rent', 'type' => 'expense', 'account_code' => '5105'],
            ['name' => 'Other Expenses', 'type' => 'both', 'account_code' => '5105'],
        ];

        foreach ($categories as $category) {
            $account = \App\Models\Account::where('code', $category['account_code'])->first();
            \App\Models\TransactionCategory::updateOrCreate(
                ['name' => $category['name']],
                [
                    'type' => $category['type'],
                    'account_id' => $account ? $account->id : null
                ]
            );
        }
    }
}
