<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Seat;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reservations = Reservation::get();

        return response()->json([
            'data' => $reservations
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
    public function store(StoreReservationRequest $request)
    {

        // 1.récupérer tous les sièges sélectionnés
        $seatIds = $request->seat_ids;

        // récupérer les sièges du DB
        $seats = Seat::whereIn('id', $seatIds)->get();

        // 2.ajouter automatiquement les partenaires des sièges couple
        foreach ($seats as $seat) {
            if ($seat->type === 'couple' && $seat->seat_id) {
                if (!in_array($seat->seat_id, $seatIds)) {
                    $seatIds[] = $seat->seat_id;
                    $seats->push(Seat::find($seat->seat_id)); //  objet pour le prix
                }
            }
        }
        
        // 3.Vérifier si sièges deja réservés
        $alreadyReserved = Seat::whereIn('id', $seatIds)
            ->whereHas('reservations', function ($query) use ($request) {
                $query->where('room_session_id', $request->room_session_id)
                ->whereIn('status', ['pending', 'paid']);
            })
            ->exists();

        if ($alreadyReserved) {
            return response()->json([
                'message' => 'One or more seats already reserved'
            ], 400);
        }

        // 4.calcul du prix total
        $totalPrice = 0;
        foreach($seats as $seat){
            if ($seat->type === 'VIP') {
                $totalPrice += 100;
            }
            elseif ($seat->type === 'couple') {
                $totalPrice += 150;
            }
            else {
                $totalPrice += 50;
            }
        }

        // 4.Créer une réservation 
        $reservation = Reservation::create([
            'room_session_id' => $request->room_session_id,
            'user_id' => Auth::user()->id,
            'status' => 'pending',
            'expires_at' => Carbon::now()->addMinutes(15),
            'total_price' => $totalPrice
        ]);

        // 5.lier les sièges
        $reservation->seats()->attach($seatIds);

        return response()->json([
            'message' => 'Reservation created',
            'data' => $reservation
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Reservation $reservation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reservation $reservation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReservationRequest $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        if (in_array($reservation->status, ['paid', 'expired'])) {
            return response()->json([
                'message' => 'Cannot modify this reservation'
            ], 403);
        }

        // 1.récupérer tous les sièges sélectionnés
        $seatIds = $request->seat_ids;

        // 2.récupérer les sièges du DB
        $seats = Seat::whereIn('id', $seatIds)->get();

        // 3.ajouter automatiquement les partenaires des sièges couple
        foreach ($seats as $seat) {
            if ($seat->type === 'couple' && $seat->seat_id) {
                if (!in_array($seat->seat_id, $seatIds)) {
                    $seatIds[] = $seat->seat_id;
                    $seats->push(Seat::find($seat->seat_id)); //  objet pour le prix
                }
            }
        }
        

        // 4.Vérifier que les sièges sont disponibles
        $alreadyReserved = Seat::whereIn('id', $seatIds)
            ->whereHas('reservations', function ($query) use ($reservation) {
                $query->where('room_session_id', $reservation->room_session_id)
                      ->whereIn('status', ['pending', 'paid'])
                      ->where('reservations.id', '!=', $reservation->id); // ignorer cette réservation
            })
            ->exists();

        if ($alreadyReserved) {
            return response()->json([
                'message' => 'One or more seats are already reserved'
            ], 400);
        }

        // 5.Calculer automatiquement le prix
        $totalPrice = 0;
        foreach ($seats as $seat) {
            if ($seat->type === 'VIP') {
                $totalPrice += 100;
            } elseif ($seat->type === 'couple') {
                $totalPrice += 150; 
            } else {
                $totalPrice += 50;
            }
        }

        // 6.Mettre à jour la réservation
        $reservation->update([
            'total_price' => $totalPrice
            ]);
        
        // 7.Mettre à jour les sièges
        $reservation->seats()->sync($seatIds);

        return response()->json([
            'message' => 'Reservation update',
            'data' => $reservation->load('seats')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reservation $reservation)
    {
        //
    }

    //Annuler une réservation
    public function cancel($id)
    {
        $reservation = Reservation::findOrFail($id);

        if ($reservation->status === 'paid') {
            return response()->json([
                'message' => 'Cannot cancel a paid reservation'
            ]);
        }

        if ($reservation->status === 'expired') {
            return response()->json([
                'message' => 'Reservation already expired'
            ], 400);
        }

        $reservation->update([
            'status' => 'cancelled'
        ]);

        return response()->json([
            'message' => 'Reservation cancelled'
        ]);
    }
    
    public function updateAfterPayment(Reservation $reservation)
    {
        if ($reservation->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'You are not allowed to update this reservation.',
            ], 403);
        }

        $payment = $reservation->payment()->latest('id')->first();

        if (!$payment instanceof Payment) {
            return response()->json([
                'message' => 'No payment found for this reservation.',
            ], 404);
        }

        $reservation->syncStatusFromPayment($payment);

        return response()->json([
            'message' => 'Reservation status updated successfully.',
            'reservation' => $reservation->load('payment'),
        ], 200);
    }
}
