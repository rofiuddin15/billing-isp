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
        $autoPaidCount = 0;

        foreach ($customers as $customer) {
            $exists = Payment::where('customer_id', $customer->id)
                ->where('period', $period)
                ->exists();

            if (!$exists) {
                $invoiceAmount = (float)$customer->monthlyPackage->price;
                $payment = Payment::create([
                    'customer_id' => $customer->id,
                    'invoice_number' => 'INV-' . strtoupper(Str::random(10)),
                    'period' => $period,
                    'amount' => $invoiceAmount,
                    'status' => 'unpaid',
                ]);
                $count++;

                // Automatically apply balance if customer balance can cover the full invoice price
                if ((float)$customer->balance >= $invoiceAmount) {
                    \Illuminate\Support\Facades\DB::transaction(function() use ($customer, $payment, $invoiceAmount, &$autoPaidCount) {
                        $customer->balance = (float)$customer->balance - $invoiceAmount;
                        $customer->save();

                        $payment->update([
                            'status' => 'paid',
                            'confirmed_by' => null, // null indicates system auto-deducted
                        ]);

                        // Record to CashFlow with 0 income cash received (since it's a balance transfer)
                        $category = \App\Models\TransactionCategory::firstOrCreate(['name' => 'Bulanan']);
                        \App\Models\CashFlow::create([
                            'transaction_date' => now()->toDateString(),
                            'type' => 'income',
                            'category_id' => $category->id,
                            'amount' => 0,
                            'description' => "Auto-payment via Saldo for {$customer->name} ({$payment->period})",
                            'reference_id' => $payment->id,
                            'created_by' => null,
                        ]);

                        $autoPaidCount++;
                    });
                }
            }
        }

        if ($count > 0) {
            $logMsg = "Sistem menghasilkan {$count} tagihan baru untuk periode {$period} via Artisan Console.";
            if ($autoPaidCount > 0) {
                $logMsg .= " Sebanyak {$autoPaidCount} tagihan otomatis terbayar menggunakan saldo aktif pelanggan.";
            }
            \App\Models\ActivityLog::log(
                "Generasi Tagihan Bulanan", 
                "Pembayaran", 
                $logMsg
            );
        }

        $this->info("Successfully generated {$count} invoices. {$autoPaidCount} were automatically paid using customer balance.");
    }
}
