<?php

namespace Database\Factories;

use App\Models\Room;
use App\Models\Seat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Seat>
 */
class SeatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'number' => Seat::max('number') + 1 ,
            'type' => 'normal' ,
            'room_id' => fake()->randomElement(Room::all()->pluck('id')) 
        ];
    }
}
