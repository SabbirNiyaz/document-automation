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

    /**
     * The allowed values (in days) for the before/after
     * notification select dropdowns.
     */
    public const NOTIFICATION_DAY_OPTIONS = [
        1,
        3,
        7,
        15,
        30,
        60,
        90,
    ];

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

            'notify_email' => [
                'sometimes',
                'boolean',
            ],

            'notify_sms' => [
                'sometimes',
                'boolean',
            ],

            'emails_text_area' => [
                'nullable',
                'string',
            ],

            'notification_before_days' => [
                'nullable',
                'integer',
                Rule::in(self::NOTIFICATION_DAY_OPTIONS),
            ],

            'notification_after_days' => [
                'nullable',
                'integer',
                Rule::in(self::NOTIFICATION_DAY_OPTIONS),
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

            'notify_email.boolean' =>
                'Notify by email must be true or false.',

            'notify_sms.boolean' =>
                'Notify by SMS must be true or false.',

            'notification_before_days.integer' =>
                'Notify before must be a number of days.',

            'notification_before_days.in' =>
                'Notify before must be one of the allowed day options.',

            'notification_after_days.integer' =>
                'Notify after must be a number of days.',

            'notification_after_days.in' =>
                'Notify after must be one of the allowed day options.',

            'status.required' =>
                'Status is required.',

            'status.in' =>
                'Status must be either Active or Inactive.',
        ];
    }
}