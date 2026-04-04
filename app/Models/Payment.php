<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentFactory> */
    use HasFactory;

    protected $fillable = ['payment_model', 'amount', 'payment_status', 'reservation_id'];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    public function ticket()
    {
        return $this->hasOne(Ticket::class);
    }
}
