<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VoucherPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            ['name' => '2 Jam / 2.000', 'duration_minutes' => 120, 'price' => 2000, 'active_period_days' => 1],
            ['name' => '6 Jam / 5.000', 'duration_minutes' => 360, 'price' => 5000, 'active_period_days' => 2],
            ['name' => '24 Jam / 10.000', 'duration_minutes' => 1440, 'price' => 10000, 'active_period_days' => 3],
        ];

        foreach ($packages as $package) {
            \App\Models\VoucherPackage::firstOrCreate($package);
        }
    }
}
