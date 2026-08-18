<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PartyTypeController;
use App\Http\Controllers\DateTypeController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\PartyMasterController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DateDetailController;
use App\Http\Controllers\AttachmentController;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('documents.index');
    } else {
        return redirect()->route('login');
    }
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

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

    // Document Routes
    Route::resource('documents', DocumentController::class)
        ->parameters(['documents' => 'document'])
        ->except(['show']);
    
    // Attachment Routes
    Route::post('attachments', [AttachmentController::class, 'store'])
        ->name('attachments.store');
    
    Route::put('attachments/{attachment}', [AttachmentController::class, 'update'])
        ->name('attachments.update');

    Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy'])
        ->name('attachments.destroy');

    Route::get('attachments/{attachment}/view', [AttachmentController::class, 'view'])
        ->name('attachments.view');

    // Date Details Routes
    Route::resource('date-details', DateDetailController::class)
        ->parameters(['date-details' => 'date_detail'])
        ->except(['show']);
});

require __DIR__.'/settings.php';
