<?php

namespace App\Http\Controllers;

use App\Http\Requests\PartyMasterRequest;
use App\Models\PartyMaster;
use App\Models\PartyType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartyMasterController extends Controller
{
    /**
     * Display a listing of parties.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $partyMasters = PartyMaster::with([
                'partyType:partyTypeId,partyTypeName',
                'createdBy:id,name',
                'updatedBy:id,name',
            ])
            ->when(
                $search,
                fn ($q) => $q->where(
                    'partyName',
                    'like',
                    "%{$search}%"
                )
            )
            ->orderByDesc('partyId')
            ->paginate(15)
            ->withQueryString();

        $partyMasters->through(
            fn (PartyMaster $party) => [
                'partyId' => $party->partyId,
                'partyName' => $party->partyName,
                'address' => $party->address,

                'partyTypeId' => $party->partyTypeId,

                'partyType' => $party->partyType,

                'contactPerson' => $party->contactPerson,
                'phone' => $party->phone,
                'email' => $party->email,

                'status' => $party->status,

                'created_at' => $party->created_at,
                'created_by' => $party->createdBy,

                'updated_at' => $party->updated_at,
                'updated_by' => $party->updatedBy,
            ]
        );

        $partyTypes = PartyType::query()
            ->where('status', 'Active')
            ->orderBy('partyTypeName')
            ->get([
                'partyTypeId',
                'partyTypeName',
            ]);

        return Inertia::render('PartyMasters/Index', [
            'partyMasters' => $partyMasters,
            'partyTypes' => $partyTypes,

            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created party.
     */
    public function store(
        PartyMasterRequest $request
    ): RedirectResponse {
        PartyMaster::create(
            $request->validated()
        );

        return redirect()
            ->route('party-masters.index')
            ->with(
                'success',
                'Party created successfully.'
            );
    }

    /**
     * Update party.
     */
    public function update(
        PartyMasterRequest $request,
        PartyMaster $party_master
    ): RedirectResponse {
        $party_master->update(
            $request->validated()
        );

        return back()
            ->with(
                'success',
                'Party updated successfully.'
            );
    }

    /**
     * Delete party.
     */
    public function destroy(
        PartyMaster $party_master
    ): RedirectResponse {
        $party_master->delete();

        return back()
            ->with(
                'success',
                'Party deleted successfully.'
            );
    }
}