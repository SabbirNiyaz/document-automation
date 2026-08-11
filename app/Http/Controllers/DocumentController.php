<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentRequest;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\PartyMaster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\DateType;

class DocumentController extends Controller
{
    /**
     * Display documents.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $documents = Document::with([
            'party:partyId,partyName',
            'documentType:document_id,document_name',
            'createdBy:id,name',
            'updatedBy:id,name',
            'dateDetails' => function ($query) {
                $query->with('dateType:dateTypeId,dateTypeName')
                    ->orderBy('date_value');
            },
        ])
            ->when(
                $search,
                function ($query) use ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('title', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
                }
            )
            ->orderByDesc('docId')
            ->paginate(10)
            ->withQueryString();

        $documents->through(
            function (Document $document) {
                return [
                    'docId' => $document->docId,
                    'title' => $document->title,
                    'description' => $document->description,
                    'partyName' => $document->party,
                    'docType' => $document->documentType,
                    'date' => $document->date?->format('Y-m-d'),
                    'soft_copy' => $document->soft_copy,
                    'status' => $document->status,
                    'attachment' => $document->attachment,
                    'created_at' => $document->created_at,
                    'created_by' => $document->createdBy,
                    'updated_at' => $document->updated_at,
                    'updated_by' => $document->updatedBy,

                    'dateDetails' => $document->dateDetails->map(
                        fn ($detail) => [
                            'id' => $detail->id,
                            'dateTypeId' => $detail->dateTypeId,
                            'dateTypeName' => $detail->dateType?->dateTypeName,
                            'date_value' => $detail->date_value?->format('Y-m-d'),
                            'status' => $detail->status,
                        ]
                    ),
                ];
            }
        );

        $dateTypes = DateType::query()
            ->where('status', 'Active')
            ->orderBy('dateTypeName')
            ->get(['dateTypeId', 'dateTypeName']);

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'filters' => ['search' => $search],
            'dateTypes' => $dateTypes,
        ]);
    }

    /**
     * Show create form.
     */
    public function create(): Response
    {
        $parties = PartyMaster::query()
            // ->where('status', 'Active')
            ->orderBy('partyName')
            ->get([
                'partyId',
                'partyName',
            ]);

        $documentTypes = DocumentType::query()
            ->where('status', 'Active')
            ->orderBy('document_name')
            ->get([
                'document_id',
                'document_name',
            ]);

        return Inertia::render(
            'Documents/Create',
            [
                'parties' => $parties,
                'documentTypes' => $documentTypes,
            ]
        );
    }

    /**
     * Store document.
     */
    public function store(
        DocumentRequest $request
    ): RedirectResponse {

        $data = $request->validated();

        if ($request->hasFile('attachment')) {

            $data['attachment'] =
                $request->file('attachment')
                    ->store(
                        'documents',
                        'public'
                    );
        }

        Document::create($data);

        return redirect()
            ->route('documents.index')
            ->with(
                'success',
                'Document created successfully.'
            );
    }

    /**
     * Show edit form.
     */
    public function edit(
        Document $document
    ): Response {

        $parties = PartyMaster::query()
            // ->where('status', 'Active')
            ->orderBy('partyName')
            ->get([
                'partyId',
                'partyName',
            ]);

        $documentTypes = DocumentType::query()
            ->where('status', 'Active')
            ->orderBy('document_name')
            ->get([
                'document_id',
                'document_name',
            ]);

        return Inertia::render(
            'Documents/Edit',
            [
                'document' => [
                    'docId' =>
                        $document->docId,

                    'title' =>
                        $document->title,

                    'description' =>
                        $document->description,

                    'partyName' =>
                        $document->partyName,

                    'docType' =>
                        $document->docType,

                    'date' =>
                        $document->date?->format('Y-m-d'),

                    'soft_copy' =>
                        $document->soft_copy,

                    'status' =>
                        $document->status,

                    'attachment' =>
                        $document->attachment,
                ],

                'parties' => $parties,

                'documentTypes' => $documentTypes,
            ]
        );
    }

    /**
     * Update document.
     */
    public function update(
        DocumentRequest $request,
        Document $document
    ): RedirectResponse {

        $data = $request->validated();

        if ($request->hasFile('attachment')) {

            if (
                $document->attachment &&
                Storage::disk('public')->exists(
                    $document->attachment
                )
            ) {
                Storage::disk('public')->delete(
                    $document->attachment
                );
            }

            $data['attachment'] =
                $request->file('attachment')
                    ->store(
                        'documents',
                        'public'
                    );
        }

        $document->update($data);

        return redirect()
            ->route('documents.index')
            ->with(
                'success',
                'Document updated successfully.'
            );
    }

    /**
     * Delete document.
     */
    public function destroy(
        Document $document
    ): RedirectResponse {

        $document->delete();

        return redirect()
            ->route('documents.index')
            ->with(
                'success',
                'Document deleted successfully.'
            );
    }

    /**
     * View PDF attachment.
     */
    public function viewAttachment(
        Document $document
    ) {
        if (
            !$document->attachment ||
            !Storage::disk('public')->exists(
                $document->attachment
            )
        ) {
            abort(404, 'Attachment not found.');
        }

        return response()->file(
            Storage::disk('public')->path(
                $document->attachment
            )
        );
    }
}