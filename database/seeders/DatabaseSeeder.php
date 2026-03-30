<?php

namespace Database\Seeders;

use App\Models\Film;
use App\Models\Room;
use App\Models\Seat;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        // $this->call([
        //     FilmSeeder::class,
        //     SessionSeeder::class
        // ]);

        // $this->call(FilmSeeder::class);
        
        // User::factory()->create([
            //     'name' => 'Test User',
            //     'email' => 'test@example.com',
            // ]);
            
        User::factory()->create();
        Film::factory()->create();
        Room::factory(2)->create();
        Seat::factory(20)->create();
    }
}
