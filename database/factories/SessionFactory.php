<?php

namespace Database\Factories;

use App\Models\Film;
use App\Models\Room;
use App\Models\Session;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Session>
 */
class SessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition()
        {
            return [
                'language' => $this->faker->randomElement(['VO', 'VF', 'AR', 'EN']),
                'price' => $this->faker->randomElement([80, 100, 120, 150]),
                
                // Sessions in future (important for reservations)
                'start_time' => $this->faker->dateTimeBetween('now', '+10 days'),

                'type' => $this->faker->randomElement(['normal', 'VIP']),

                // Link to existing data OR auto-create
                'film_id' => Film::inRandomOrder()->first()?->id ?? Film::factory(),
                'room_id' => Room::inRandomOrder()->first()?->id ?? Room::factory(),
            ];
        }
}
