<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Customer;
use App\Models\Payment;
use Illuminate\Support\Str;

class GenerateMonthlyInvoices extends Command
{
    protected $signature = 'billing:generate';
    protected $description = 'Generate monthly invoices for all active customers';

    public function handle()
    {
        $period = now()->format('Y-m');
        $this->info("Generating invoices for period: {$period}");

        $customers = Customer::where('status', 'active')->with('monthlyPackage')->get();
        $count = 0;

        foreach ($customers as $customer) {
            $exists = Payment::where('customer_id', $customer->id)
                ->where('period', $period)
                ->exists();

            if (!$exists) {
                Payment::create([
                    'customer_id' => $customer->id,
                    'invoice_number' => 'INV-' . strtoupper(Str::random(10)),
                    'period' => $period,
                    'amount' => $customer->monthlyPackage->price,
                    'status' => 'unpaid',
                ]);
                $count++;
            }
        }

        $this->info("Successfully generated {$count} invoices.");
    }
}
