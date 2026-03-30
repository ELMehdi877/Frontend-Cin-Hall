<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

// use Spatie\LaravelPdf\Facades\Pdf;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{

    public function index()
    {
        $payments = Payment::all();
        return response()->json(['data' => $payments]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'payment_model' => 'required|in:Paypal,Stripe',
            'amount' => 'required|numeric|min:0',
        ]);

        $reservation = Reservation::findOrFail($validated['reservation_id']);

        if ($reservation->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'You are not allowed to pay for this reservation.',
            ], 403);
        }

        if ($reservation->status !== 'pending') {
            return response()->json([
                'message' => 'This reservation cannot be paid.',
            ], 422);
        }

        if (Carbon::now()->greaterThan($reservation->expires_at)) {
            $reservation->update([
                'status' => 'expired',
            ]);

            return response()->json([
                'message' => 'This reservation has expired.',
            ], 422);
        }

        if ((float) $validated['amount'] !== (float) $reservation->total_price) {
            return response()->json([
                'message' => 'The payment amount does not match the reservation total price.',
            ], 422);
        }

        $alreadyPaid = Payment::where('reservation_id', $reservation->id)
            ->where('payment_status', 'payed')
            ->exists();

        if ($alreadyPaid) {
            return response()->json([
                'message' => 'This reservation has already been paid.',
            ], 422);
        }

        $payment = DB::transaction(function () use ($validated, $reservation) {
            $payment = Payment::create([
                'payment_model' => $validated['payment_model'],
                'amount' => $validated['amount'],
                'payment_status' => 'payed',
                'reservation_id' => $reservation->id,
            ]);

            $reservation->syncStatusFromPayment($payment);

            return $payment;
        });

        $reservation->refresh();

        $this->createTickets($reservation);

        return response()->json([
            'message' => 'Payment completed successfully.',
            'payment' => $payment,
            'reservation' => $reservation->fresh(),
        ], 201);
    }

    public function show(Payment $payment)
    {
        $payment->load('reservation');

        if (
            $payment->reservation &&
            $payment->reservation->user_id !== Auth::id() &&
            !Auth::user()->is_admin
        ) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        return response()->json($payment, 200);
    }



    public function createTickets(Reservation $reservation)
    {
        if ($reservation->status == "paid")
            foreach ($reservation->seats as $seat) {

                $session = $reservation->session;
                $room = $session?->room;
                $film = $session?->film;

                $fileName = 'ticket_' . $reservation->id . '_' . $seat->id . '.pdf';
                $filePath = 'pdf/' . $fileName;

                //fisrt try

                // Pdf::view('Pdf.ticket', compact('reservation', 'session', 'seat', 'room', 'film'))
                //     ->withBrowsershot(function ($browsershot) {
                //         $browsershot->noSandbox();
                //     })->disk('public')
                //     ->save($filePath);

                //second try

                // $template = view('Pdf.ticket', compact('reservation', 'session', 'seat', 'room', 'film'))->render() ;
                // Browsershot::html($template)->disk('public')->save($filePath);

                // therd try

                // Pdf::view('Pdf.ticket', compact('reservation', 'seat', 'session', 'room', 'film'))
                //     ->withBrowsershot(function ($browsershot) {
                //         $browsershot
                //             ->setChromePath('/usr/bin/chromium-browser') // use the snap-less path
                //             ->noSandbox();
                //     })
                //     ->disk('public')
                //     ->save($filePath);

                // 4th try

                $pdf = Pdf::loadView('Pdf.ticket', compact('reservation', 'seat', 'session', 'room', 'film'));
                $pdf->save(storage_path('app/public/' . $filePath));


                Ticket::create([
                    'qr_code' => '...',
                    'pdf_path' => $filePath,
                    'reservation_id' => $reservation->id,
                    'payment_id' => $reservation->payment?->id
                ]);
            }
    }
}
