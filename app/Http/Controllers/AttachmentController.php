<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttachmentRequest;
use App\Models\Attachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    /**
     * Store a new attachment for a document.
     */
    public function store(
        AttachmentRequest $request
    ): RedirectResponse {
        $data = $request->validated();

        $file = $request->file('attachment');

        $path = $file->store('documents', 'public');

        if (!$path) {
            return redirect()
                ->route('documents.index')
                ->with(
                    'error',
                    'PDF attachment could not be uploaded.'
                );
        }

        Attachment::create([
            'docId' => $data['docId'],
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return redirect()
            ->route('documents.index')
            ->with(
                'success',
                'Attachment uploaded successfully.'
            );
    }

    /**
     * Delete an attachment.
     */
    public function destroy(
        Attachment $attachment
    ): RedirectResponse {
        $attachment->delete();

        return redirect()
            ->route('documents.index')
            ->with(
                'success',
                'Attachment deleted successfully.'
            );
    }

    /**
     * View / stream a PDF attachment inline.
     */
    public function view(Attachment $attachment)
    {
        if (
            !Storage::disk('public')->exists(
                $attachment->file_path
            )
        ) {
            abort(404, 'Attachment file not found.');
        }

        $path = Storage::disk('public')->path(
            $attachment->file_path
        );

        return response()->file(
            $path,
            [
                'Content-Type' =>
                    $attachment->file_type ?? 'application/pdf',

                'Content-Disposition' =>
                    'inline; filename="' .
                    $attachment->file_name .
                    '"',

                'Cache-Control' =>
                    'no-store, no-cache, must-revalidate, max-age=0, private',

                'Pragma' => 'no-cache',

                'Expires' => '0',
            ]
        );
    }
}