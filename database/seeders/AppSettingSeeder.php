<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'company_name' => 'MinISP Networks',
            'company_address' => 'Jl. Raya Digital No. 101, Indonesia',
            'company_phone' => '0812-3456-7890',
            'due_date_day' => '10',
        ];

        foreach ($settings as $key => $value) {
            AppSetting::set($key, $value);
        }
    }
}
