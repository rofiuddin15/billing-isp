<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\CashFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

use App\Models\ActivityLog;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with('customer', 'confirmedBy');
        
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->latest()->paginate($request->get('per_page', 10));
    }

    public function generateMonthlyBills()
    {
        $period = now()->format('Y-m');
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
                    DB::transaction(function() use ($customer, $payment, $invoiceAmount, &$autoPaidCount) {
                        $customer->balance = (float)$customer->balance - $invoiceAmount;
                        $customer->save();

                        $payment->update([
                            'status' => 'paid',
                            'confirmed_by' => null, // null indicates system auto-deducted
                        ]);

                        // Record to CashFlow with 0 income cash received (since it's a balance transfer)
                        $category = \App\Models\TransactionCategory::firstOrCreate(['name' => 'Bulanan']);
                        CashFlow::create([
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
            $logMsg = "Sistem menghasilkan {$count} tagihan baru untuk periode {$period}.";
            if ($autoPaidCount > 0) {
                $logMsg .= " Sebanyak {$autoPaidCount} tagihan otomatis terbayar menggunakan saldo aktif pelanggan.";
            }
            ActivityLog::log(
                "Generasi Tagihan Bulanan", 
                "Pembayaran", 
                $logMsg
            );
        }

        return response()->json([
            'message' => "Successfully generated {$count} invoices for {$period}. {$autoPaidCount} were automatically paid using customer balance."
        ]);
    }

    public function pay(Request $request, Payment $payment)
    {
        if ($payment->status === 'paid') {
            return response()->json(['error' => 'Invoice already paid.'], 400);
        }

        $customer = $payment->customer;

        $request->validate([
            'amount_paid' => 'nullable|numeric|min:0',
            'use_balance' => 'nullable',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $useBalance = filter_var($request->input('use_balance'), FILTER_VALIDATE_BOOLEAN);
        $discount = $request->has('discount') ? (float)$request->input('discount') : 0;
        
        $invoiceAmount = (float) $payment->amount;
        $netInvoiceAmount = max(0, $invoiceAmount - $discount);
        $currentBalance = (float) $customer->balance;

        $deductedFromBalance = 0;
        if ($useBalance) {
            $deductedFromBalance = min($netInvoiceAmount, $currentBalance);
        }

        $remainingInvoiceAmount = max(0, $netInvoiceAmount - $deductedFromBalance);

        // Default amount paid to the remaining amount if not specified
        $cashPaid = $request->has('amount_paid') ? (float) $request->amount_paid : $remainingInvoiceAmount;

        if ($cashPaid < $remainingInvoiceAmount) {
            return response()->json([
                'message' => 'Jumlah uang tunai yang dibayar kurang dari sisa tagihan setelah diskon. Sisa tagihan setelah saldo: Rp ' . number_format($remainingInvoiceAmount)
            ], 422);
        }

        $excess = $cashPaid - $remainingInvoiceAmount;

        return DB::transaction(function () use ($payment, $customer, $deductedFromBalance, $cashPaid, $excess, $discount) {
            // Update customer's balance
            if ($deductedFromBalance > 0 || $excess > 0) {
                $customer->balance = (float)$customer->balance - $deductedFromBalance + $excess;
                $customer->save();
            }

            // Update payment status
            $payment->update([
                'status' => 'paid',
                'discount' => $discount,
                'confirmed_by' => auth('api')->id(),
            ]);

            // Record to CashFlow (logged even if cashPaid is 0 but balance is used)
            if ($cashPaid > 0 || $deductedFromBalance > 0) {
                $category = \App\Models\TransactionCategory::firstOrCreate(['name' => 'Bulanan']);
                
                $descParts = [];
                $descParts[] = "Cash: Rp " . number_format($cashPaid);
                if ($deductedFromBalance > 0) {
                    $descParts[] = "Saldo: Rp " . number_format($deductedFromBalance);
                }
                if ($discount > 0) {
                    $descParts[] = "Diskon: Rp " . number_format($discount);
                }
                
                CashFlow::create([
                    'transaction_date' => now()->toDateString(),
                    'type' => 'income',
                    'category_id' => $category->id,
                    'amount' => $cashPaid,
                    'description' => "Payment for {$customer->name} ({$payment->period}) - " . implode(', ', $descParts),
                    'reference_id' => $payment->id,
                    'created_by' => auth('api')->id(),
                ]);
            }

            // Log activity with details
            $logMsg = "Staff mengonfirmasi pembayaran tagihan {$payment->invoice_number} untuk pelanggan {$customer->name}.";
            if ($discount > 0) {
                $logMsg .= " Diskon: Rp " . number_format($discount) . ".";
            }
            if ($deductedFromBalance > 0) {
                $logMsg .= " Potong Saldo: Rp " . number_format($deductedFromBalance) . ".";
            }
            if ($cashPaid > 0) {
                $logMsg .= " Tunai: Rp " . number_format($cashPaid) . ".";
            }
            if ($excess > 0) {
                $logMsg .= " Lebih bayar Rp " . number_format($excess) . " masuk ke saldo pelanggan.";
            }

            ActivityLog::log(
                "Pembayaran Tagihan", 
                "Pembayaran", 
                $logMsg
            );

            return response()->json($payment->load(['customer', 'confirmedBy']));
        });
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();
        return response()->json(null, 204);
    }
}
