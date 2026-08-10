<?php

namespace App\Http\Controllers;

use App\Http\Requests\DateTypeRequest;
use App\Models\DateType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DateTypeController extends Controller
{
    /**
     * Display a listing of date types.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $dateTypes = DateType::with([
                'createdBy:id,name',
                'updatedBy:id,name',
            ])
            ->when(
                $search,
                fn ($q) => $q->where(
                    'dateTypeName',
                    'like',
                    "%{$search}%"
                )
            )
            ->orderByDesc('dateTypeId')
            ->paginate(10)
            ->withQueryString();

        $dateTypes->through(
            fn (DateType $dateType) => [
                'dateTypeId' => $dateType->dateTypeId,
                'dateTypeName' => $dateType->dateTypeName,
                'status' => $dateType->status,

                'created_at' => $dateType->created_at,
                'created_by' => $dateType->createdBy,

                'updated_at' => $dateType->updated_at,
                'updated_by' => $dateType->updatedBy,
            ]
        );

        return Inertia::render('DateTypes/Index', [
            'dateTypes' => $dateTypes,

            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new date type.
     */
    public function create(): Response
    {
        return Inertia::render('DateTypes/Create');
    }

    /**
     * Store a newly created date type.
     */
    public function store(
        DateTypeRequest $request
    ): RedirectResponse {
        DateType::create($request->validated());

        return redirect()
            ->route('date-types.index')
            ->with(
                'success',
                'Date type created.'
            );
    }

    /**
     * Show the form for editing the specified date type.
     */
    public function edit(
        DateType $date_type
    ): Response {
        return Inertia::render(
            'DateTypes/Edit',
            [
                'dateType' => $date_type,
            ]
        );
    }

    /**
     * Update the specified date type.
     */
    public function update(
        DateTypeRequest $request,
        DateType $date_type
    ): RedirectResponse {
        $date_type->update(
            $request->validated()
        );

        return redirect()
            ->route('date-types.index')
            ->with(
                'success',
                'Date type updated.'
            );
    }

    /**
     * Remove the specified date type.
     */
    public function destroy(
        DateType $date_type
    ): RedirectResponse {
        $date_type->delete();

        return redirect()
            ->route('date-types.index')
            ->with(
                'success',
                'Date type deleted.'
            );
    }
}