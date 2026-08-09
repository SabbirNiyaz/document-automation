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

        $partyTypes = PartyType::query()
            ->when($search, fn ($q) => $q->where('partyTypeName', 'like', "%{$search}%"))
            ->orderByDesc('partyTypeId')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('PartyTypes/Index', [
            'partyTypes' => $partyTypes,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('PartyTypes/Create');
    }

    public function store(PartyTypeRequest $request): RedirectResponse
    {
        PartyType::create($request->validated());

        return redirect()->route('party-types.index')->with('success', 'Party type created.');
    }

    public function edit(PartyType $party_type): Response
    {
        return Inertia::render('PartyTypes/Edit', ['partyType' => $party_type]);
    }

    public function update(PartyTypeRequest $request, PartyType $party_type): RedirectResponse
    {
        $party_type->update($request->validated());

        return redirect()->route('party-types.index')->with('success', 'Party type updated.');
    }

    public function destroy(PartyType $party_type): RedirectResponse
    {
        $party_type->delete(); // soft delete — sets deleted_at

        return redirect()->route('party-types.index')->with('success', 'Party type deleted.');
    }
}