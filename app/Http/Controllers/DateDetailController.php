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
        $status = $request->string('status')->toString();

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
            ->when(
                $status,
                fn ($q) => $q->where('status', $status)
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

                'notify_email' =>
                    $dateDetail->notify_email,

                'notify_sms' =>
                    $dateDetail->notify_sms,

                'notification_before_days' =>
                    $dateDetail->notification_before_days,

                'notification_after_days' =>
                    $dateDetail->notification_after_days,

                'before_sent_at' =>
                    $dateDetail->before_sent_at?->toDateTimeString(),

                'after_sent_at' =>
                    $dateDetail->after_sent_at?->toDateTimeString(),

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

        return Inertia::render('DateDetails/Index', [
            'dateDetails' => $dateDetails,

            'dateTypes' => $dateTypes,
            'documents' => $documents,

            'notificationDayOptions' =>
                DateDetailRequest::NOTIFICATION_DAY_OPTIONS,

            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
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

        return back()
            ->with(
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

        return back()
            ->with(
                'success',
                'Date detail deleted.'
            );
    }
}