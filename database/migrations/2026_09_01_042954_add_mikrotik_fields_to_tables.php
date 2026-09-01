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
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('router_id')->nullable()->constrained('routers')->nullOnDelete();
            $table->string('pppoe_password')->nullable();
            $table->string('mikrotik_id')->nullable(); // the internal .id in mikrotik
        });

        Schema::table('monthly_packages', function (Blueprint $table) {
            $table->string('mikrotik_profile_name')->nullable();
        });

        Schema::table('voucher_packages', function (Blueprint $table) {
            $table->foreignId('router_id')->nullable()->constrained('routers')->nullOnDelete();
            $table->string('mikrotik_profile_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
