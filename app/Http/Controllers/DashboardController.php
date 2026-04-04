<?php

namespace App\Http\Controllers;

use App\Models\Film;
use App\Models\Reservation;
use App\Models\Session;
use Illuminate\Support\Facades\DB;

use function Laravel\Prompts\table;

class DashboardController extends Controller
{
    public function show()
    {

        // Taux d'occupation des séances
        // Nombre de tickets vendus et revenus générés par film
        // Classement des films populaires
        // Gestion des utilisateurs
        // Nombre de tickets vendus et revenus générés par film

        //session with the total of it's reserved seats and total seats
        $sessions = DB::table('room_sessions')
            ->join('rooms', 'room_sessions.room_id', '=', 'rooms.id')
            ->select(
                'room_sessions.id as session_id',
                'rooms.capacity',
                DB::raw("(SELECT COUNT(*) FROM reservation_seat 
                  JOIN reservations ON reservation_seat.reservation_id = reservations.id 
                  WHERE reservations.room_session_id = room_sessions.id) as reserved_seats")
            )
            ->get();

        foreach ($sessions as $session) {
            $total = $session->capacity ?: 1;
            $session->occupation_percentage = round(($session->reserved_seats * 100) / $total, 2);
        }

        // select all films with total revenue and total ticket
        $films = DB::table('films')
            ->leftJoin('room_sessions', 'films.id', '=', 'room_sessions.film_id')
            ->leftJoin('reservations', 'room_sessions.id', '=', 'reservations.room_session_id')
            ->select(
                'films.title',

                DB::raw('COALESCE(SUM(reservations.total_price), 0) as total_revenue'),

                DB::raw("(SELECT COUNT(*) FROM tickets 
                  JOIN reservations AS r ON tickets.resevation_id = r.id 
                  JOIN room_sessions AS rs ON r.room_session_id = rs.id 
                  WHERE rs.film_id = films.id) as total_ticket")
            )
            ->groupBy('films.id', 'films.title')
            ->orderBy("total_ticket", "desc")
            ->get();


        return response()->json([
            "total_films" => Film::count(),
            "total_session" => Session::count(),
            "total_reservation" => Reservation::count(),
            "films" => $films,
            "sessions" => $sessions,
        ]);
    }
}
