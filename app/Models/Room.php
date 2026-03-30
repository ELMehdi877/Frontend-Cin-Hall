<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    /** @use HasFactory<\Database\Factories\RoomFactory> */
    use HasFactory;
    protected $fillable = ['name', 'type', 'capacity'];


    public function films()
    {
        return $this->belongsToMany(Film::class, "room_sessions", 'room_id', 'film_id')
            ->using(Session::class)
            ->withPivot(["language", "price", "start_time"])
            ->withTimestamps() ;
    }

    public function roomSessions()
    {
        return $this->hasMany(Session::class);
    }

    public function seats()
    {
        return $this->hasMany(Seat::class) ;
    }
}
