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

        if ($count > 0) {
            ActivityLog::log(
                "Generasi Tagihan Bulanan", 
                "Pembayaran", 
                "Sistem menghasilkan {$count} tagihan baru untuk periode {$period}."
            );
        }

        return response()->json(['message' => "Successfully generated {$count} invoices for {$period}."]);
    }

    public function pay(Request $request, Payment $payment)
    {
        if ($payment->status === 'paid') {
            return response()->json(['error' => 'Invoice already paid.'], 400);
        }

        return DB::transaction(function () use ($payment) {
            $payment->update([
                'status' => 'paid',
                'confirmed_by' => auth('api')->id(),
            ]);

            // Record to CashFlow
            $category = \App\Models\TransactionCategory::firstOrCreate(['name' => 'Bulanan']);
            CashFlow::create([
                'transaction_date' => now()->toDateString(),
                'type' => 'income',
                'category_id' => $category->id,
                'amount' => $payment->amount,
                'description' => "Payment for {$payment->customer->name} ({$payment->period})",
                'reference_id' => $payment->id,
                'created_by' => auth('api')->id(),
            ]);

            ActivityLog::log(
                "Pembayaran Tagihan", 
                "Pembayaran", 
                "Staff mengkonfirmasi pembayaran tagihan {$payment->invoice_number} senilai Rp " . number_format($payment->amount) . " untuk pelanggan {$payment->customer->name}."
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
