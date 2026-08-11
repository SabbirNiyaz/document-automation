<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DateDetailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dateTypeId' => [
                'required',
                'integer',
                'exists:date_types,dateTypeId',
            ],

            'docId' => [
                'required',
                'integer',
                'exists:document_master,docId',
            ],

            'date_value' => [
                'required',
                'date',
            ],

            'status' => [
                'required',
                Rule::in(['Active', 'Inactive']),
            ],
            'stay' => [
                'sometimes',
                'boolean',
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'dateTypeId.required' =>
                'Date type is required.',

            'dateTypeId.exists' =>
                'The selected date type is invalid.',

            'docId.required' =>
                'Document title is required.',

            'docId.exists' =>
                'The selected document is invalid.',

            'date_value.required' =>
                'Date is required.',

            'date_value.date' =>
                'Please enter a valid date.',

            'status.required' =>
                'Status is required.',

            'status.in' =>
                'Status must be either Active or Inactive.',
        ];
    }
}