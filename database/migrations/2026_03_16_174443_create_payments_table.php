m<?php

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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->enum('payment_model', ['Paypal' , 'Stripe']) ;
            $table->float('amount');
            $table->enum('payment_status', ['pending' , 'payed']) ;
            $table->foreignId('reservation_id')->constrained('reservations')->nullOnDelete() ;

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
