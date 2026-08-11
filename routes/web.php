<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PartyTypeController;
use App\Http\Controllers\DateTypeController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\PartyMasterController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DateDetailController;

// Route::inertia('/', 'welcome')->name('home');
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('documents.index');
    } else {
        return redirect()->route('login');
    }
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Party Types Routes
    Route::resource('party-types', PartyTypeController::class)
        ->parameters(['party-types' => 'party_type'])
        ->except(['show']);

    // Date Types Routes
    Route::resource('date-types', DateTypeController::class)
        ->parameters(['date-types' => 'date_type'])
        ->except(['show']);

    // Document Types Routes
    Route::resource('document-types', DocumentTypeController::class)
        ->parameters(['document-types' => 'document_type'])
        ->except(['show']);

    // Party Masters Routes
    Route::resource('party-masters', PartyMasterController::class)
        ->parameters(['party-masters' => 'party_master'])
        ->except(['show']);
    
    // Document Attachment Route (must come before the resource route)
    Route::get('documents/{document}/attachment', [DocumentController::class, 'viewAttachment'])
        ->name('documents.attachment');

    // Document Routes
    Route::resource('documents', DocumentController::class)
        ->parameters(['documents' => 'document'])
        ->except(['show']);

    // Date Details Routes
    Route::resource('date-details', DateDetailController::class)
        ->parameters(['date-details' => 'date_detail'])
        ->except(['show']);
});

require __DIR__.'/settings.php';
