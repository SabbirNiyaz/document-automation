<?php

namespace App\Http\Controllers;

use App\Http\Requests\DateDetailRequest;
use App\Models\DateDetail;
use App\Models\DateType;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DateDetailController extends Controller
{
    /**
     * Display a listing of date details.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $dateDetails = DateDetail::with([
            'dateType:dateTypeId,dateTypeName',
            'document:docId,title',
            'createdBy:id,name',
            'updatedBy:id,name',
        ])
            ->when(
                $search,
                fn ($q) => $q->where(function ($query) use ($search) {
                    $query
                        ->whereHas(
                            'dateType',
                            fn ($dateTypeQuery) =>
                                $dateTypeQuery->where(
                                    'dateTypeName',
                                    'like',
                                    "%{$search}%"
                                )
                        )
                        ->orWhereHas(
                            'document',
                            fn ($documentQuery) =>
                                $documentQuery->where(
                                    'title',
                                    'like',
                                    "%{$search}%"
                                )
                        );
                })
            )
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        $dateDetails->through(
            fn (DateDetail $dateDetail) => [
                'id' => $dateDetail->id,

                'dateTypeId' =>
                    $dateDetail->dateTypeId,

                'dateType' => $dateDetail->dateType
                    ? [
                        'dateTypeId' =>
                            $dateDetail->dateType->dateTypeId,

                        'dateTypeName' =>
                            $dateDetail->dateType->dateTypeName,
                    ]
                    : null,

                'docId' => $dateDetail->docId,

                'document' => $dateDetail->document
                    ? [
                        'docId' =>
                            $dateDetail->document->docId,

                        'title' =>
                            $dateDetail->document->title,
                    ]
                    : null,

                'date_value' =>
                    $dateDetail->date_value?->format('Y-m-d'),

                'status' =>
                    $dateDetail->status,

                'created_at' =>
                    $dateDetail->created_at,

                'created_by' =>
                    $dateDetail->createdBy,

                'updated_at' =>
                    $dateDetail->updated_at,

                'updated_by' =>
                    $dateDetail->updatedBy,
            ]
        );

        return Inertia::render('DateDetails/Index', [
            'dateDetails' => $dateDetails,

            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new date detail.
     */
    public function create(): Response
    {
        $dateTypes = DateType::query()
            ->where('status', 'Active')
            ->orderBy('dateTypeName')
            ->get([
                'dateTypeId',
                'dateTypeName',
            ]);

        $documents = Document::query()
            ->where('status', 'Active')
            ->orderBy('title')
            ->get([
                'docId',
                'title',
            ]);

        return Inertia::render('DateDetails/Create', [
            'dateTypes' => $dateTypes,
            'documents' => $documents,
        ]);
    }

    /**
     * Store a newly created date detail.
     */
    public function store(
        DateDetailRequest $request
    ): RedirectResponse {
        DateDetail::create(
            $request->validated()
        );

        if ($request->boolean('stay')) {
            return back()->with(
                'success',
                'Date detail created.'
            );
        }

        return redirect()
            ->route('date-details.index')
            ->with(
                'success',
                'Date detail created.'
            );
    }

    /**
     * Show the form for editing the specified date detail.
     */
    public function edit(
        DateDetail $date_detail
    ): Response {
        $dateTypes = DateType::query()
            ->where('status', 'Active')
            ->orWhere(
                'dateTypeId',
                $date_detail->dateTypeId
            )
            ->orderBy('dateTypeName')
            ->get([
                'dateTypeId',
                'dateTypeName',
            ]);

        $documents = Document::query()
            ->where('status', 'Active')
            ->orWhere(
                'docId',
                $date_detail->docId
            )
            ->orderBy('title')
            ->get([
                'docId',
                'title',
            ]);

        return Inertia::render('DateDetails/Edit', [
            'dateDetail' => [
                'id' =>
                    $date_detail->id,

                'dateTypeId' =>
                    $date_detail->dateTypeId,

                'docId' =>
                    $date_detail->docId,

                'date_value' =>
                    $date_detail->date_value?->format('Y-m-d'),

                'status' =>
                    $date_detail->status,
            ],

            'dateTypes' => $dateTypes,

            'documents' => $documents,
        ]);
    }

    /**
     * Update the specified date detail.
     */
    public function update(
        DateDetailRequest $request,
        DateDetail $date_detail
    ): RedirectResponse {
        $date_detail->update(
            $request->validated()
        );

        if ($request->boolean('stay')) {
            return back()->with(
                'success',
                'Date detail updated.'
            );
        }
        
        return redirect()
            ->route('date-details.index')
            ->with(
                'success',
                'Date detail updated.'
            );
        return back()->with(
            'success',
            'Date detail updated.'
        );
    }

    /**
     * Remove the specified date detail.
     */
    public function destroy(
        DateDetail $date_detail
    ): RedirectResponse {
        $date_detail->delete();

        return redirect()
            ->route('date-details.index')
            ->with(
                'success',
                'Date detail deleted.'
            );
    }
}