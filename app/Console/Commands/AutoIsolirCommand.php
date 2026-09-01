<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Customer;
use App\Models\AppSetting;
use App\Services\MikrotikService;

class AutoIsolirCommand extends Command
{
    protected $signature = 'billing:cutoff';
    protected $description = 'Auto isolir pelanggan yang menunggak dan auto aktifkan yang lunas';

    public function handle()
    {
        $dueDateDay = (int)AppSetting::get('due_date_day', 10);
        $todayDay = now()->day;
        $currentPeriod = now()->format('Y-m');

        // Check if today is past the due date for the current period
        $isPastDueDate = $todayDay > $dueDateDay;

        $customers = Customer::with(['payments' => function ($q) {
            $q->where('status', 'unpaid');
        }, 'router'])->get();

        $countIsolir = 0;
        $countAktif = 0;

        foreach ($customers as $customer) {
            if (!$customer->router) continue;

            $hasArrears = false;
            foreach ($customer->payments as $payment) {
                if ($payment->period < $currentPeriod) {
                    $hasArrears = true;
                    break;
                }
                if ($payment->period === $currentPeriod && $isPastDueDate) {
                    $hasArrears = true;
                    break;
                }
            }

            $service = new MikrotikService($customer->router);

            if ($hasArrears && $customer->status !== 'isolir') {
                $this->info("Mengisolir: {$customer->name}");
                $customer->update(['status' => 'isolir']);
                if ($customer->customer_code) {
                    $service->disablePppoeSecret($customer->customer_code);
                }
                $countIsolir++;
            } elseif (!$hasArrears && $customer->status === 'isolir') {
                $this->info("Mengaktifkan: {$customer->name}");
                $customer->update(['status' => 'active']);
                
                // Re-sync secret to enable it
                if ($customer->customer_code && $customer->monthlyPackage && $customer->monthlyPackage->mikrotik_profile_name) {
                    $service->syncPppoeSecret(
                        $customer->customer_code,
                        $customer->pppoe_password ?? '123456',
                        $customer->monthlyPackage->mikrotik_profile_name,
                        $customer->name,
                        'pppoe',
                        'no' // Enable
                    );
                }
                $countAktif++;
            }
        }

        $this->info("Selesai. Isolir: {$countIsolir}, Aktif: {$countAktif}");
    }
}
