<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ExpireReservation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:expire-reservations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Reservation::where('status', 'pending')
        ->where('expires_at', '<=', Carbon::now())
        ->update(['status' => 'expired']);

        return 0;
    }
}
