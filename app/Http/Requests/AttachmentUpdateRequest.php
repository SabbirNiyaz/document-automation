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
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [

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

        if (strtolower($file->getClientOriginalExtension()) !== 'pdf') {
            $validator->errors()->add($field, 'Only PDF files are allowed.');
            return;
        }

        $handle = fopen($file->getRealPath(), 'rb');
        $chunk = fread($handle, 1024);
        fclose($handle);

        if (strpos($chunk, '%PDF-') === false) {
            $validator->errors()->add($field, 'Only PDF files are allowed.');
            return;
        }

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