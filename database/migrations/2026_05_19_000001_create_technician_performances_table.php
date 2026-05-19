<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technician_performances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technician_id')->constrained('users')->onDelete('cascade');
            $table->enum('task_type', ['installation', 'repair']);
            $table->unsignedBigInteger('reference_id')->nullable(); // references customer id (for installation) or complaint id (for repair)
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['open', 'proses', 'selesai'])->default('open');
            $table->dateTime('start_time')->nullable();
            $table->dateTime('end_time')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->integer('performance_rating')->nullable(); // rating 1 to 5
            $table->text('notes')->nullable(); // notes from customer evaluation or admin note
            $table->string('photo_path')->nullable(); // pointer to the webp work proof photo
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technician_performances');
    }
};
