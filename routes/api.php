<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SeatController;
use App\Http\Controllers\SessionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FilmController;
use Illuminate\Http\Request;
use App\Http\Controllers\PaymentController;

Route::get('/', function (Request $request) {
    return response()->json('hellow world');
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('films', [FilmController::class, 'index']);
Route::get('films/{film}', [FilmController::class, 'show']);

Route::middleware('jwt')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'show'])->middleware('admin');
    Route::get('/user', [AuthController::class, 'show']);
    Route::put('/user', [AuthController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::patch('/reservations/{reservation}/payment-status', [ReservationController::class, 'updateAfterPayment']);

    // testing ...
    Route::apiResource('seats', SeatController::class);

    // ...


    Route::middleware('admin')->group(function () {
        Route::post('films', [FilmController::class, 'store']);
        Route::put('films/{film}', [FilmController::class, 'update']);
        Route::delete('films/{film}', [FilmController::class, 'destroy']);

        Route::get('/sessions/filter', [SessionController::class, 'filter']);
    });
    Route::apiResource('sessions', SessionController::class);

    //create the Room
    Route::post('/rooms', [RoomController::class, 'store']);

    //Lister les salles
    Route::get('/rooms', [RoomController::class, 'index']);

    //Voir une salle
    Route::get('/rooms/{id}', [RoomController::class, 'show']);

    //Modifier une salle
    Route::put('/rooms/{id}', [RoomController::class, 'update']);

    //Supprimer une salle
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

    //Voir les sièges réservés en temps réel
    Route::get('/sessions/{session}/seats', [SeatController::class, 'getSeatsBySession']);

    //Réserver un siège
    Route::post('/reservations', [ReservationController::class, 'store']);

    //voir les réservations
    Route::get('reservations', [ReservationController::class, 'index']);

    //Annuler une réservation
    Route::patch('reservations/{id}/cancel', [ReservationController::class, 'cancel']);

    //Modifier une réservation
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
});
