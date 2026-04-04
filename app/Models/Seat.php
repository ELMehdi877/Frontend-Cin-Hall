<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seat extends Model
{
    /** @use HasFactory<\Database\Factories\SeatFactory> */
    use HasFactory;

    protected $fillable = [ 'number' , 'type' ,'room_id', 'seat_id' ] ;

    public function reservations(){
        return $this->belongsToMany(Reservation::class , 'reservation_seat' , 'seat_id' , 'reservation_id')
        ->withTimestamps() ;
    }

    public function room(){
        return $this->belongsTo(Room::class) ;
    }

    public function seat(){
        return $this->belongsTo(Seat::class) ;
    }
}

