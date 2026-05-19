<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technician_performance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('performance_id')->constrained('technician_performances')->onDelete('cascade');
            $table->enum('status', ['open', 'proses', 'selesai']);
            $table->text('notes')->nullable();
            $table->string('operator_name');
            $table->string('photo_path')->nullable(); // photo uploaded at this specific status transition (e.g. proof of completion)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technician_performance_logs');
    }
};
