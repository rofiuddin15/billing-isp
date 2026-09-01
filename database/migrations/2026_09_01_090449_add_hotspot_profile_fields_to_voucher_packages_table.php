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
        Schema::table('voucher_packages', function (Blueprint $table) {
            $table->string('mikrotik_rate_limit')->nullable();
            $table->integer('mikrotik_shared_users')->default(1);
            $table->string('mikrotik_address_pool')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher_packages', function (Blueprint $table) {
            $table->dropColumn(['mikrotik_rate_limit', 'mikrotik_shared_users', 'mikrotik_address_pool']);
        });
    }
};
