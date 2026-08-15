<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentRequest;
use App\Http\Requests\DateDetailRequest;
use App\Models\DateType;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\PartyMaster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
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
                $query
                    ->where('status', 'Active')
                    ->with('dateType:dateTypeId,dateTypeName')
                    ->orderBy('date_value');
            },
            'attachments' => function ($query) {
                $query->orderByDesc('created_at');
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
                            'notify_email' => $detail->notify_email,
                            'notify_sms' => $detail->notify_sms,
                            'notification_before_days' => $detail->notification_before_days,
                            'notification_after_days' => $detail->notification_after_days,
                            'status' => $detail->status,
                        ]
                    ),

                    'attachments' => $document->attachments->map(
                        fn ($attachment) => [
                            'attachmentId' => $attachment->attachmentId,
                            'file_name' => $attachment->file_name,
                            'file_type' => $attachment->file_type,
                            'file_size' => $attachment->file_size,
                            'created_at' => $attachment->created_at,
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

            'notificationDayOptions' =>
                DateDetailRequest::NOTIFICATION_DAY_OPTIONS,
        ]);
    }

    public function store(
        DocumentRequest $request
    ): RedirectResponse {
        Document::create($request->validated());

        return redirect()
            ->route('documents.index')
            ->with(
                'success',
                'Document created successfully.'
            );
    }

    public function update(
        DocumentRequest $request,
        Document $document
    ): RedirectResponse {
        $document->fill($request->validated());
        $document->save();

        return back()
            ->with(
                'success',
                'Document updated successfully.'
            );
    }

    public function destroy(
        Document $document
    ): RedirectResponse {
        $document->delete();

        return back()
            ->with(
                'success',
                'Document deleted successfully.'
            );
    }
}