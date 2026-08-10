<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DateTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dateTypeName' => [
                'required',
                'string',
                'max:255',
                Rule::unique('date_types', 'dateTypeName')
                ->ignore($this->route('date_type'))
                ->whereNull('deleted_at'), // so a soft-deleted row doesn't block reuse of the name
            ],

            'status' => [
                'required',
                Rule::in(['Active', 'Inactive']),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'dateTypeName.required' => 'Date type name is required.',
            'dateTypeName.max' =>
                'Date type name cannot exceed 255 characters.',
            'dateTypeName.unique' => 'A date type with this name already exists.',

            'status.required' => 'Status is required.',
            'status.in' =>
                'Status must be either Active or Inactive.',
        ];
    }
}