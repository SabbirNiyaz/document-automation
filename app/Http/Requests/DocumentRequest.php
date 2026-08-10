<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'partyName' => [
                'required',
                'integer',
                'exists:party_master,partyId',
            ],

            'docType' => [
                'required',
                'integer',
                'exists:document_type,document_id',
            ],

            'date' => [
                'required',
                'date',
            ],

            'soft_copy' => [
                'nullable',
                'string',
            ],

            'status' => [
                'required',
                Rule::in([
                    'Active',
                    'Inactive',
                ]),
            ],

            'attachment' => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [

            'title.required' =>
                'Document title is required.',

            'title.max' =>
                'Document title cannot exceed 255 characters.',

            'partyName.required' =>
                'Please select a party.',

            'partyName.exists' =>
                'Selected party does not exist.',

            'docType.required' =>
                'Please select a document type.',

            'docType.exists' =>
                'Selected document type does not exist.',

            'date.required' =>
                'Document date is required.',

            'date.date' =>
                'Please enter a valid date.',

            'status.required' =>
                'Status is required.',

            'status.in' =>
                'Status must be Active or Inactive.',

            'attachment.file' =>
                'Attachment must be a valid file.',

            'attachment.mimes' =>
                'Only PDF files are allowed.',

            'attachment.max' =>
                'PDF file size cannot exceed 10 MB.',
        ];
    }
}