<?php

namespace App\Mail;

use App\Models\DateDetail;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DateNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public DateDetail $dateDetail,
        public string $phase // 'before' or 'after'
    ) {}

    public function build()
    {
        $document = $this->dateDetail->document;
        $dateType = $this->dateDetail->dateType;

        $subject = $this->phase === 'before'
            ? "Reminder: {$dateType->dateTypeName} — {$document->title} ({$document->short_code})"
            : "Overdue: {$dateType->dateTypeName} — {$document->title} ({$document->short_code})";

        return $this->subject($subject)
            ->markdown('emails.date-notification', [
                'documentTitle' => $document->title,
                'documentCode' => $document->short_code,
                'dateTypeName' => $dateType->dateTypeName,
                'dateValue' => $this->dateDetail->date_value->format('Y-m-d'),
                'phase' => $this->phase,
            ]);
    }
}