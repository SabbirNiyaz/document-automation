<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_name' => [
                'required',
                'string',
                'max:255',

                Rule::unique(
                    'document_type',
                    'document_name'
                )
                    ->ignore($this->route('document_type'))
                    ->whereNull('deleted_at'),
            ],

            'status' => [
                'required',
                Rule::in([
                    'Active',
                    'Inactive',
                ]),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'document_name.required' =>
                'Document type name is required.',

            'document_name.max' =>
                'Document type name cannot exceed 255 characters.',

            'document_name.unique' =>
                'A document type with this name already exists.',

            'status.required' =>
                'Status is required.',

            'status.in' =>
                'Status must be either Active or Inactive.',
        ];
    }
}