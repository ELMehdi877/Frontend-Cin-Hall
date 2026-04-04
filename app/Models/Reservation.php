<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    /** @use HasFactory<\Database\Factories\ReservationFactory> */
    use HasFactory;

    protected $fillable = ['status', 'expires_at', 'total_price', 'room_session_id', 'user_id'];

    public function syncStatusFromPayment(?Payment $payment = null): self
    {
        $payment ??= $this->payment()->latest('id')->first();

        if (!$payment) {
            return $this;
        }

        $status = $payment->payment_status === 'payed' ? 'paid' : 'pending';

        if ($this->status !== $status) {
            $this->update([
                'status' => $status,
            ]);
        }

        return $this->refresh();
    }

    public function seats()
    {
        return $this->belongsToMany(Seat::class, 'reservation_seat', 'reservation_id', 'seat_id')
            ->withTimestamps();
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function ticket()
    {
        return $this->hasOne(Ticket::class);
    }

    public function session()
    {
        return $this->belongsTo(Session::class, 'room_session_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
