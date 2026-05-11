<?php
/* File Path: c:\Users\del\Music\MinISP\database\migrations\2026_05_11_043326_create_activity_logs_table.php */
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('activity'); // e.g., "Pendaftaran Pelanggan Baru"
            $table->string('module');   // e.g., "Pelanggan", "Pembayaran", "Kas"
            $table->text('description'); // e.g., "Staff Admin menambahkan pelanggan John Doe"
            $table->json('details')->nullable(); // JSON data for audit trail (old/new values)
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
