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
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        \App\Models\TransactionCategory::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $categories = [
            // PEMASUKAN (INCOME)
            ['name' => 'Bulanan', 'type' => 'income', 'account_code' => '4101'],
            ['name' => 'Voucher', 'type' => 'income', 'account_code' => '4102'],
            ['name' => 'Biaya Pemasangan', 'type' => 'income', 'account_code' => '4103'],
            ['name' => 'Penjualan Perangkat', 'type' => 'income', 'account_code' => '4103'],
            
            // PENGELUARAN (EXPENSE)
            ['name' => 'Bandwidth (ISP)', 'type' => 'expense', 'account_code' => '5102'],
            ['name' => 'Listrik & Utilitas', 'type' => 'expense', 'account_code' => '5101'],
            ['name' => 'Gaji Teknisi', 'type' => 'expense', 'account_code' => '5104'],
            ['name' => 'Pemasaran & Iklan', 'type' => 'expense', 'account_code' => '5105'],
            ['name' => 'Pemeliharaan Alat', 'type' => 'expense', 'account_code' => '5103'],
            ['name' => 'Sewa Kantor', 'type' => 'expense', 'account_code' => '5105'],
            ['name' => 'Biaya Lain-lain', 'type' => 'both', 'account_code' => '5105'],
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
