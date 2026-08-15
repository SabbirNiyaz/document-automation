<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentTypeRequest;
use App\Models\DocumentType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentTypeController extends Controller
{
    /**
     * Display a listing of document types.
     */
    public function index(Request $request): Response
    {
        $search = $request
            ->string('search')
            ->toString();

        $status = $request
            ->string('status')
            ->toString(); // '', 'Active', or 'Inactive'

        $documentTypes = DocumentType::with([
                'createdBy:id,name',
                'updatedBy:id,name',
            ])
            ->when(
                $search,
                fn ($q) => $q->where(
                    'document_name',
                    'like',
                    "%{$search}%"
                )
            )
            ->when(
                $status,
                fn ($q) => $q->where('status', $status)
            )
            ->orderByDesc('document_id')
            ->paginate(15)
            ->withQueryString();

        $documentTypes->through(
            fn (DocumentType $documentType) => [
                'document_id' =>
                    $documentType->document_id,

                'document_name' =>
                    $documentType->document_name,

                'status' =>
                    $documentType->status,

                'created_at' =>
                    $documentType->created_at,

                'created_by' =>
                    $documentType->createdBy,

                'updated_at' =>
                    $documentType->updated_at,

                'updated_by' =>
                    $documentType->updatedBy,
            ]
        );

        return Inertia::render(
            'DocumentTypes/Index',
            [
                'documentTypes' => $documentTypes,

                'filters' => [
                    'search' => $search,
                    'status' => $status,
                ],
            ]
        );
    }

    /**
     * Show the form for creating a new document type.
     */
    public function create(): Response
    {
        return Inertia::render(
            'DocumentTypes/Create'
        );
    }

    /**
     * Store a newly created document type.
     */
    public function store(
        DocumentTypeRequest $request
    ): RedirectResponse {
        DocumentType::create(
            $request->validated()
        );

        return redirect()
            ->route('document-types.index')
            ->with(
                'success',
                'Document type created.'
            );
    }

    /**
     * Show the form for editing the specified document type.
     */
    public function edit(
        DocumentType $document_type
    ): Response {
        return Inertia::render(
            'DocumentTypes/Edit',
            [
                'documentType' => $document_type,
            ]
        );
    }

    /**
     * Update the specified document type.
     */
    public function update(
        DocumentTypeRequest $request,
        DocumentType $document_type
    ): RedirectResponse {
        $document_type->update(
            $request->validated()
        );

        return back()
            ->with(
                'success',
                'Document type updated.'
            );
    }

    /**
     * Remove the specified document type.
     */
    public function destroy(
        DocumentType $document_type
    ): RedirectResponse {
        $document_type->delete();

        return back()
            ->with(
                'success',
                'Document type deleted.'
            );
    }
}