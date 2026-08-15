<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttachmentUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

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

            'attachment.file' =>
                'Attachment must be a valid file.',

            'attachment.mimes' =>
                'Only PDF files are allowed.',

            'attachment.max' =>
                'PDF file size cannot exceed 10 MB.',
        ];
    }
}