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

            'attachment.max' =>
                'PDF file size cannot exceed 10 MB.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validatePdf($validator, 'attachment');
        });
    }

    protected function validatePdf($validator, string $field): void
    {
        $file = $this->file($field);

        if (!$file) {
            return;
        }

        // 1. Extension check
        if (strtolower($file->getClientOriginalExtension()) !== 'pdf') {
            $validator->errors()->add($field, 'Only PDF files are allowed.');
            return;
        }

        // 2. Magic-byte check — real PDFs contain "%PDF-" near the start of the file
        $handle = fopen($file->getRealPath(), 'rb');
        $chunk = fread($handle, 1024);
        fclose($handle);

        if (strpos($chunk, '%PDF-') === false) {
            $validator->errors()->add($field, 'Only PDF files are allowed.');
            return;
        }

        // 3. Optional: check the file actually ends with a valid PDF trailer
        $size = $file->getSize();
        $handle = fopen($file->getRealPath(), 'rb');
        fseek($handle, max(0, $size - 1024));
        $tail = fread($handle, 1024);
        fclose($handle);

        if (strpos($tail, '%%EOF') === false) {
            $validator->errors()->add($field, 'Only PDF files are allowed.');
        }
    }
}