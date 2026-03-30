<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    /** @use HasFactory<\Database\Factories\TicketFactory> */
    use HasFactory;

    protected $fillable = ['qr_code' , 'pdf_path' , 'reservation_id' , 'payment_id' ];

    public function reservation(){
        return $this->belongsTo(Reservation::class) ;
    }
    
    public function payment(){
        return $this->belongsTo(Payment::class) ;
    }

}
