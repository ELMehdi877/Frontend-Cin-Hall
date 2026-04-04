<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Room;
use App\Models\Session;

class Film extends Model
{
    /** @use HasFactory<\Database\Factories\FilmFactory> */
    use HasFactory;
    protected $fillable = ['title', 'description', 'genre', 'actors', 'duration_minutes', 'minimum_age', 'trailer_url'];

    public function rooms()
    {
        return $this->belongsToMany(Room::class, "room_sessions", 'film_id', 'room_id')
            ->using(Session::class)
            ->withPivot(["language", "price", "start_time"])
            ->withTimestamps() ;
    }
}
