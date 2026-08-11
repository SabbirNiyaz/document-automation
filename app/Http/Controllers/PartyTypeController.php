<?php

namespace App\Http\Controllers;

use App\Http\Requests\PartyTypeRequest;
use App\Models\PartyType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartyTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString(); // '', 'Active', or 'Inactive'

        $partyTypes = PartyType::with([
                'createdBy:id,name',
                'modifiedBy:id,name',
            ])
            ->when(
                $search,
                fn ($q) => $q->where(
                    'partyTypeName',
                    'like',
                    "%{$search}%"
                )
            )
            ->when(
                $status && in_array($status, ['Active', 'Inactive']),
                fn ($q) => $q->where('status', $status)
            )
            ->orderByDesc('partyTypeId')
            ->paginate(10)
            ->withQueryString();

        $partyTypes->through(fn (PartyType $partyType) => [
            'partyTypeId'   => $partyType->partyTypeId,
            'partyTypeName' => $partyType->partyTypeName,
            'status'        => $partyType->status,
            'created_at'    => $partyType->created_at,
            'updated_at'    => $partyType->updated_at,
            'created_by'    => $partyType->createdBy,
            'updated_by'    => $partyType->modifiedBy,
        ]);

        return Inertia::render('PartyTypes/Index', [
            'partyTypes' => $partyTypes,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function store(PartyTypeRequest $request): RedirectResponse
    {
        PartyType::create($request->validated());

        return back()
            ->with('success', 'Party type created.');
    }

    public function update(PartyTypeRequest $request, PartyType $party_type): RedirectResponse
    {
        $party_type->update($request->validated());

        return back()
            ->with('success', 'Party type updated.');
    }

    public function destroy(PartyType $party_type): RedirectResponse
    {
        $party_type->delete(); // soft delete — sets deleted_at

        return back()
            ->with('success', 'Party type deleted.');
    }
}