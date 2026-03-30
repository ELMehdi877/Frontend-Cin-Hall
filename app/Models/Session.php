<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    /** @use HasFactory<\Database\Factories\SessionFactory> */
    use HasFactory;


    protected $table = 'room_sessions';  
    protected $fillable = ['language', 'price', 'start_time', 'type', 'film_id', 'room_id'];

    public function users()
    {
        return $this->belongsToMany(User::class, "Reservation" , 'room_session_id' , 'user_id')
            ->using(Reservation::class)
            ->withPivot(["status", "expires_at", "total_price"])
            ->withTimestamps();
    }

    public function room(){
        return $this->belongsTo(Room::class , 'room_id') ;
    }

    public function film(){
        return $this->belongsTo(Film::class , 'film_id') ;
    }

    

    
}
