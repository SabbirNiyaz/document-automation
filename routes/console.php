<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('notifications:send-dates')->everyMinute();

// Schedule::command('notifications:send-dates')
//     ->dailyAt('17:35')
//     ->timezone('Asia/Dhaka'); // set your timezone
