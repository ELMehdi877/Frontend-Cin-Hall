<?php

namespace Database\Factories;

use App\Models\Film;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Film>
 */
class FilmFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'genre' => $this->faker->randomElement(['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi']),
            'actors' => $this->faker->name() . ', ' . $this->faker->name(),
            'duration_minutes' => $this->faker->numberBetween(80, 180),
            'minimum_age' => $this->faker->randomElement([0, 7, 13, 16, 18]),
            'trailer_url' => $this->faker->url(),
        ];
    }
}
