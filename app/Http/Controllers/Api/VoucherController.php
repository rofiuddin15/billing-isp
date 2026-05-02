<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\VoucherPackage;
use App\Models\CashFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $query = Voucher::with('package');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('package_id')) {
            $query->where('package_id', $request->package_id);
        }

        if ($request->has('search')) {
            $query->where('code', 'like', "%{$request->search}%");
        }

        return $query->latest()->paginate($request->get('per_page', 10));
    }

    public function generate(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:voucher_packages,id',
            'count' => 'required|integer|min:1|max:1000',
        ]);

        $package = VoucherPackage::find($request->package_id);
        $vouchers = [];

        for ($i = 0; $i < $request->count; $i++) {
            $vouchers[] = [
                'package_id' => $package->id,
                'code' => strtoupper(Str::random(8)),
                'status' => 'ready',
                'created_by' => auth('api')->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        Voucher::insert($vouchers);

        return response()->json(['message' => "Successfully generated {$request->count} vouchers."]);
    }

    public function sell(Request $request, Voucher $voucher)
    {
        if ($voucher->status !== 'ready') {
            return response()->json(['error' => 'Voucher is not ready to be sold.'], 400);
        }

        $voucher->update([
            'status' => 'sold',
            'sold_at' => now(),
        ]);

        // Record to CashFlow
        CashFlow::create([
            'transaction_date' => now(),
            'type' => 'income',
            'category' => 'voucher',
            'amount' => $voucher->package->price,
            'description' => "Voucher sale: {$voucher->code}",
            'reference_id' => $voucher->id,
            'created_by' => auth('api')->id(),
        ]);

        return response()->json($voucher->load('package'));
    }

    public function destroy(Voucher $voucher)
    {
        $voucher->delete();
        return response()->json(null, 204);
    }
}
