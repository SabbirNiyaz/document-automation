<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PartyTypeController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Party Types Routes
    Route::resource('party-types', PartyTypeController::class)
        ->parameters(['party-types' => 'party_type'])
        ->except(['show']);
});

require __DIR__.'/settings.php';
