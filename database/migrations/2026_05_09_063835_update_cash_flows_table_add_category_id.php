<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cash_flows', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('type')->constrained('transaction_categories')->onDelete('set null');
        });

        // Migrate data
        $categories = [
            'monthly_bill' => 'Monthly Bill',
            'voucher' => 'Voucher',
            'hardware' => 'Hardware',
            'operational' => 'Operational'
        ];
        
        foreach ($categories as $old => $new) {
            $newCat = \App\Models\TransactionCategory::firstOrCreate(['name' => $new]);
            \DB::table('cash_flows')->where('category', $old)->update(['category_id' => $newCat->id]);
        }

        Schema::table('cash_flows', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_flows', function (Blueprint $table) {
            $table->enum('category', ['monthly_bill', 'voucher', 'hardware', 'operational'])->nullable()->after('type');
        });

        Schema::table('cash_flows', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });
    }
};
