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
        Schema::create('room_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('language')->default('ta3rabt');
            $table->integer('price')->default(100);
            $table->timestamp('start_time');
            $table->enum('type' , ['normal' , 'VIP'])->default('normal');

            $table->foreignId('film_id')->constrained('films')->nullOnDelete() ;
            $table->foreignId('room_id')->constrained('rooms')->nullOnDelete() ;

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
