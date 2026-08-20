<?php

namespace App\Console\Commands;

use App\Mail\DateNotificationMail;
use App\Models\DateDetail;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendDateNotifications extends Command
{
    protected $signature = 'notifications:send-dates';
    protected $description = 'Send email notifications for upcoming/overdue tracked dates';

    public function handle(): void
    {
        $today = Carbon::today();

        $this->processPhase('before', $today);
        $this->processPhase('after', $today);
    }

    protected function processPhase(string $phase, Carbon $today): void
    {
        $column = $phase === 'before' ? 'notification_before_days' : 'notification_after_days';
        $sentColumn = $phase === 'before' ? 'before_sent_at' : 'after_sent_at';

        DateDetail::query()
            ->where('status', 'Active')
            ->where('notify_email', true)
            ->whereNotNull($column)
            ->whereNull($sentColumn)
            ->with(['document', 'dateType'])
            ->get()
            ->each(function (DateDetail $detail) use ($phase, $column, $sentColumn, $today) {
                $notifyDate = $phase === 'before'
                    ? Carbon::parse($detail->date_value)->subDays($detail->$column)
                    : Carbon::parse($detail->date_value)->addDays($detail->$column);

                $shouldSend = $phase === 'before'
                    ? $today->betweenIncluded($notifyDate, $detail->date_value)
                    : $today->greaterThanOrEqualTo($notifyDate);

                if ($shouldSend) {
                    $this->send($detail, $phase, $sentColumn);
                }
            });
    }

    protected function send(DateDetail $detail, string $phase, string $sentColumn): void
    {
        $recipients = $detail->emails_array;

        if (empty($recipients)) {
            return;
        }

        foreach ($recipients as $email) {
            Mail::to($email)->queue(new DateNotificationMail($detail, $phase));
        }

        $detail->forceFill([$sentColumn => now()])->save();

        $this->info("Sent {$phase} notification for date_detail #{$detail->id} to " . implode(', ', $recipients));
    }
}