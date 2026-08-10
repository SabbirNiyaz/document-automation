<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PartyMasterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'partyName' => [
                'required',
                'string',
                'max:255',
                Rule::unique('party_master', 'partyName')
                    ->ignore($this->route('party_master'))
                    ->whereNull('deleted_at'),
            ],

            'address' => [
                'required',
                'string',
                'max:255',
            ],

            'partyTypeId' => [
                'required',
                'integer',
                'exists:party_types,partyTypeId',
            ],

            'contactPerson' => [
                'required',
                'string',
                'max:255',
            ],

            'phone' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'partyName.required' =>
                'Party name is required.',

            'partyName.unique' =>
                'A party with this name already exists.',

            'partyName.max' =>
                'Party name cannot exceed 255 characters.',

            'address.required' =>
                'Address is required.',

            'address.max' =>
                'Address cannot exceed 255 characters.',

            'partyTypeId.required' =>
                'Party type is required.',

            'partyTypeId.exists' =>
                'Selected party type is invalid.',

            'contactPerson.required' =>
                'Contact person is required.',

            'contactPerson.max' =>
                'Contact person cannot exceed 255 characters.',

            'phone.required' =>
                'Phone number is required.',

            'phone.max' =>
                'Phone number cannot exceed 255 characters.',

            'email.required' =>
                'Email is required.',

            'email.email' =>
                'Please enter a valid email address.',

            'email.max' =>
                'Email cannot exceed 255 characters.',

            'status.required' =>
                'Status is required.',

            'status.in' =>
                'Status must be either Active or Inactive.',
        ];
    }
}