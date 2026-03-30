<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSeatRequest;
use App\Http\Requests\UpdateSeatRequest;
use App\Models\Seat;

class SeatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $seats = Seat::all();
        return response()->json(['data' => $seats], 200);
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
    public function store(StoreSeatRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Seat $seat)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Seat $seat)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSeatRequest $request, Seat $seat)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Seat $seat)
    {
        //
    }

    public function getSeatsBySession($sessionId)
    {
        $seats = Seat::with(['reservations' => function ($query) use ($sessionId) {
            $query->where('room_session_id', $sessionId)
                ->whereIn('status', ['pending', 'paid']);
        }])->get();

        $seats = $seats->map(function ($seat) {
            return [
                'id',
                $seat->id,
                'number',
                $seat->number,
                'type',
                $seat->type,
                'status',
                $seat->reservations->count() > 0 ? 'reserved' : 'available',
            ];
        });
        return response()->json($seats);
    }
}
