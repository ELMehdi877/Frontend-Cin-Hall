<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Models\Room;
use App\Models\Seat;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rooms = Room::with('seats')->get();

        return response()->json([
            'data' => $rooms
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    

    public function store(StoreRoomRequest $request)
    {
        // 1. Créer la salle
        $room = Room::create($request->validated());

        $coupleSeats = $request->couple_seats ?? [];
        $seats = []; // stocker les objets (pas seulement les ids)

        // 2. Créer les sièges
        for ($i = 1; $i <= $room->capacity; $i++) {

            if ($room->type === 'VIP') {
                $seatType = in_array($i, $coupleSeats) ? 'couple' : 'VIP';
            } else {
                $seatType = 'normal';
            }

            $seat = $room->seats()->create([
                'number' => $i,
                'type' => $seatType
            ]);

            $seats[$i] = $seat; // stocker objet complet
        }

        // 3. Lier les sièges couples
        if ($room->type === 'VIP' && !empty($request->seat_adjacent)) {

            foreach ($request->seat_adjacent as $seatNumber => $adjacentNumber) {

                // vérifier que les deux sièges existent
                if (isset($seats[$seatNumber]) && isset($seats[$adjacentNumber]) && $seats[$seatNumber]->type === 'couple') {

                    $seats[$seatNumber]->seat_id = $seats[$adjacentNumber]->id;
                    $seats[$seatNumber]->save();
                }
            }
        }

        return response()->json([
            'message' => 'Room created successfully',
            'data' => $room
        ],201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $room = Room::with('seats')->findOrFail($id);

        return response()->json([
            'data' => $room
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Room $room)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoomRequest $request, $id)
    {
        // 1.Trouver la salle et verifie si il une reservation dans cette salle
        $room = Room::findOrFail($id);

        $hasReservations = $room->seats()
            ->whereHas('reservations', function($query) {
                $query->whereIn('status', ['pending', 'paid']); // ou 'reserved' selon ton app
            })->exists();

        if ($hasReservations) {
            return response()->json([
                'message' => 'Cannot update room with existing reservations'
            ], 400);
        }
        
    
        $room->update($request->validated());

        // 2.supprimer tous les sieges
        $room->seats()->delete();

    
        $coupleSeats = $request->couple_seats ?? [];
        $seats = []; // stocker les objets (pas seulement les ids)

        // 3. Créer les sièges
        for ($i = 1; $i <= $room->capacity; $i++) {

            if ($room->type === 'VIP') {
                $seatType = in_array($i, $coupleSeats) ? 'couple' : 'VIP';
            } else {
                $seatType = 'normal';
            }

            $seat = $room->seats()->create([
                'number' => $i,
                'type' => $seatType
            ]);

            $seats[$i] = $seat; // stocker objet complet
        }

        // 4. Lier les sièges couples
        if ($room->type === 'VIP' && !empty($request->seat_adjacent)) {

            foreach ($request->seat_adjacent as $seatNumber => $adjacentNumber) {

                // vérifier que les deux sièges existent
                if (isset($seats[$seatNumber]) && isset($seats[$adjacentNumber]) && $seats[$seatNumber]->type === 'couple') {

                    $seats[$seatNumber]->seat_id = $seats[$adjacentNumber]->id;
                    $seats[$seatNumber]->save();
                }
            }
        }

        return response()->json([
            'message' => 'Room Updated',
            'data' => $room->load('seats')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $room = Room::findOrFail($id);

        if ($room->roomSessions()->exists()) {
            return response()->json([
                'message' => 'Cannot delete room with existing sessions'
            ], 400);
        }
        $room->delete();

        return response()->json([
            'message' => 'Room deleted'
        ]);
    }
}
