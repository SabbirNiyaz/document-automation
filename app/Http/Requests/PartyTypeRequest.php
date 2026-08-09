<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PartyTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $partyTypeId = $this->route('party_type')?->partyTypeId;

        return [
            'partyTypeName' => [
                'required',
                'string',
                'max:255',
                Rule::unique('party_types', 'partyTypeName')->ignore($partyTypeId, 'partyTypeId'),
            ],
            'status' => ['required', Rule::in(['Active', 'Inactive'])],
        ];
    }
}