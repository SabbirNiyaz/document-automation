<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'docId' => [
                'required',
                'integer',
                'exists:document_master,docId',
            ],

            'attachment' => [
                'required',
                'file',
                'mimes:pdf',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [

            'docId.required' =>
                'Document reference is required.',

            'docId.exists' =>
                'Selected document does not exist.',

            'attachment.required' =>
                'Please select a PDF file to upload.',

            'attachment.file' =>
                'Attachment must be a valid file.',

            'attachment.mimes' =>
                'Only PDF files are allowed.',

            'attachment.max' =>
                'PDF file size cannot exceed 10 MB.',
        ];
    }
}