<?php

namespace Tests\Feature;

use App\Models\Film;
use App\Models\Room;
use App\Models\Session;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class SessionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'jwt.secret' => 'testing-secret',
            'auth.defaults.guard' => 'api',
        ]);
    }

    public function test_non_admin_cannot_access_session_routes(): void
    {
        $user = User::factory()->create([
            'is_admin' => false,
        ]);

        $response = $this->getJson('/api/sessions', $this->authHeadersFor($user));

        $response->assertForbidden()
            ->assertJson([
                'error' => 'Forbidden',
            ]);
    }

    public function test_admin_can_create_and_show_a_session(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $film = $this->createFilm();
        $room = $this->createRoom();

        $payload = [
            'language' => 'English',
            'price' => 120,
            'start_time' => '2026-03-20 20:00:00',
            'type' => 'VIP',
            'film_id' => $film->id,
            'room_id' => $room->id,
        ];

        $createResponse = $this->postJson('/api/sessions', $payload, $this->authHeadersFor($admin));

        $createResponse->assertCreated()
            ->assertJsonPath('message', 'Session created successfully')
            ->assertJsonPath('session.language', 'English')
            ->assertJsonPath('session.type', 'VIP');

        $sessionId = $createResponse->json('session.id');

        $this->assertDatabaseHas('room_sessions', [
            'id' => $sessionId,
            'language' => 'English',
            'type' => 'VIP',
            'film_id' => $film->id,
            'room_id' => $room->id,
        ]);

        $this->getJson("/api/sessions/{$sessionId}", $this->authHeadersFor($admin))
            ->assertOk()
            ->assertJsonPath('id', $sessionId)
            ->assertJsonPath('type', 'VIP');
    }

    public function test_admin_can_update_a_session(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $session = $this->createSession();

        $response = $this->putJson(
            "/api/sessions/{$session->id}",
            [
                'language' => 'French',
                'price' => 180,
                'type' => 'normal',
            ],
            $this->authHeadersFor($admin)
        );

        $response->assertOk()
            ->assertJsonPath('message', 'Session updated successfully')
            ->assertJsonPath('session.language', 'French')
            ->assertJsonPath('session.price', 180)
            ->assertJsonPath('session.type', 'normal');

        $this->assertDatabaseHas('room_sessions', [
            'id' => $session->id,
            'language' => 'French',
            'price' => 180,
            'type' => 'normal',
        ]);
    }

    public function test_admin_can_filter_sessions_by_type(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $vipSession = $this->createSession([
            'type' => 'VIP',
        ]);

        $normalSession = $this->createSession([
            'type' => 'normal',
        ]);

        $response = $this->getJson('/api/sessions/filter?type=VIP', $this->authHeadersFor($admin));

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $vipSession->id)
            ->assertJsonMissing([
                'id' => $normalSession->id,
            ]);
    }

    public function test_admin_can_delete_a_session(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $session = $this->createSession();

        $this->deleteJson("/api/sessions/{$session->id}", [], $this->authHeadersFor($admin))
            ->assertOk()
            ->assertJson([
                'message' => 'Session deleted successfully',
            ]);

        $this->assertDatabaseMissing('room_sessions', [
            'id' => $session->id,
        ]);
    }

    private function authHeadersFor(User $user): array
    {
        $token = JWTAuth::fromUser($user);

        return [
            'Authorization' => "Bearer {$token}",
        ];
    }

    private function createFilm(array $attributes = []): Film
    {
        return Film::create(array_merge([
            'title' => 'Interstellar',
            'description' => 'Space travel.',
            'genre' => 'Sci-Fi',
            'actor' => 'Matthew McConaughey',
            'duration_seconds' => 10140,
            'min_age' => 13,
            'trailer_url' => 'https://example.com/interstellar',
        ], $attributes));
    }

    private function createRoom(array $attributes = []): Room
    {
        return Room::create(array_merge([
            'name' => 'Room A',
            'type' => 'normal',
            'capacity' => 40,
        ], $attributes));
    }

    private function createSession(array $attributes = []): Session
    {
        $film = $this->createFilm();
        $room = $this->createRoom();

        return Session::create(array_merge([
            'language' => 'English',
            'price' => 120,
            'start_time' => '2026-03-20 20:00:00',
            'type' => 'VIP',
            'film_id' => $film->id,
            'room_id' => $room->id,
        ], $attributes));
    }
}
