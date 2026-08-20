{{-- resources/views/emails/date-notification.blade.php --}}
@component('mail::message')
Dear Concern,

I hope this email finds you well.

This is to notify you that the **{{ $dateTypeName }}** for
**{{ $documentTitle }}** ({{ $documentCode }})
@if($phase === 'before')
is scheduled for **{{ $dateValue }}**.
@else
was **{{ $dateValue }}**, which has now passed.
@endif

@if($phase === 'before')
Please take the necessary action ahead of this date to avoid any
disruption to your business operations.
@else
Please take the necessary action as soon as possible to maintain
compliance with the regulations.
@endif

If you have already addressed this matter, kindly disregard this notice.

Thank you for your attention to this matter.

Regards,<br>
Document Automation System, BRACNet Limited
@endcomponent