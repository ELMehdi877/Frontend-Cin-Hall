<?php

namespace Tests\Unit;

use App\Models\Film;
use App\Models\Room;
use App\Models\Session;
use App\QueryBuilders\SessionQuery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionQueryTest extends TestCase
{
    use RefreshDatabase;

    public function test_apply_filters_returns_only_matching_type(): void
    {
        $film = Film::create([
            'title' => 'Interstellar',
            'description' => 'Space travel.',
            'genre' => 'Sci-Fi',
            'actor' => 'Matthew McConaughey',
            'duration_seconds' => 10140,
            'min_age' => 13,
            'trailer_url' => 'https://example.com/interstellar',
        ]);

        $normalRoom = Room::create([
            'name' => 'Room A',
            'type' => 'normal',
            'capacity' => 40,
        ]);

        $vipRoom = Room::create([
            'name' => 'Room B',
            'type' => 'VIP',
            'capacity' => 20,
        ]);

        $vipSession = Session::create([
            'language' => 'English',
            'price' => 120,
            'start_time' => '2026-03-20 20:00:00',
            'type' => 'VIP',
            'film_id' => $film->id,
            'room_id' => $vipRoom->id,
        ]);

        Session::create([
            'language' => 'French',
            'price' => 90,
            'start_time' => '2026-03-21 20:00:00',
            'type' => 'normal',
            'film_id' => $film->id,
            'room_id' => $normalRoom->id,
        ]);

        $sessions = SessionQuery::applyFilters(SessionQuery::base(), 'VIP')->get();

        $this->assertCount(1, $sessions);
        $this->assertTrue($sessions->first()->is($vipSession));
    }
}
