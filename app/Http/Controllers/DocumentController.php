<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentRequest;
use App\Models\DateType;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\PartyMaster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    /**
     * Display documents.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();

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
            ->when(
                $status,
                fn ($q) => $q->where('status', $status)
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
            ->get([
                'dateTypeId',
                'dateTypeName',
            ]);

        $parties = PartyMaster::query()
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

        return Inertia::render('Documents/Index', [
            'documents' => $documents,

            'filters' => [
                'search' => $search,
                'status' => $status,
            ],

            'dateTypes' => $dateTypes,
            'parties' => $parties,
            'documentTypes' => $documentTypes,
        ]);
    }

    /**
     * Store document.
     */
    public function store(
        DocumentRequest $request
    ): RedirectResponse {
        $data = $request->validated();

        /*
         * Upload PDF attachment.
         */
        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request
                ->file('attachment')
                ->store('documents', 'public');
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
     * Update document.
     */
    public function update(
        DocumentRequest $request,
        Document $document
    ): RedirectResponse {
        $data = $request->validated();

        /*
         * Keep the old attachment path.
         */
        $oldAttachment = $document->attachment;

        /*
         * Upload new PDF if one was selected.
         */
        if ($request->hasFile('attachment')) {
            $newPath = $request
                ->file('attachment')
                ->store('documents', 'public');

            /*
             * Make sure upload succeeded.
             */
            if (!$newPath) {
                return redirect()
                    ->route('documents.index')
                    ->with(
                        'error',
                        'PDF attachment could not be uploaded.'
                    );
            }

            /*
             * Replace the attachment path in the database data.
             */
            $data['attachment'] = $newPath;
        }

        /*
         * Update the document.
         */
        $document->fill($data);
        $document->save();

        /*
         * Delete the previous PDF only after
         * the database update succeeded.
         */
        if (
            $oldAttachment &&
            isset($data['attachment']) &&
            $oldAttachment !== $data['attachment'] &&
            Storage::disk('public')->exists($oldAttachment)
        ) {
            Storage::disk('public')->delete($oldAttachment);
        }

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
    public function viewAttachment(Document $document)
    {
        /*
         * Make sure the document has an attachment.
         */
        if (!$document->attachment) {
            abort(404, 'Attachment not found.');
        }

        /*
         * Check that the actual file exists.
         */
        if (
            !Storage::disk('public')->exists(
                $document->attachment
            )
        ) {
            abort(404, 'Attachment file not found.');
        }

        /*
         * Get the actual physical file path.
         */
        $path = Storage::disk('public')->path(
            $document->attachment
        );

        /*
         * Return the current PDF.
         *
         * The cache headers are intentionally aggressive
         * so the browser does not reuse an old PDF.
         */
        return response()->file(
            $path,
            [
                'Content-Type' => 'application/pdf',

                'Content-Disposition' =>
                    'inline; filename="' .
                    basename($path) .
                    '"',

                'Cache-Control' =>
                    'no-store, no-cache, must-revalidate, max-age=0, private',

                'Pragma' => 'no-cache',

                'Expires' => '0',
            ]
        );
    }
}