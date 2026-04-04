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
        Schema::create('films', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('genre')->nullable();
            $table->string('actors')->nullable();
            $table->integer('duration_minutes');
            $table->integer('minimum_age')->default(13);
            $table->string('trailer_url');
            $table->timestamps();
            // remove nullable from image and trailer url plz
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('films');
    }
};
