<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('date_details', function (Blueprint $table) {

            // Notification channels
            $table->boolean('notify_email')
                ->default(false)
                ->after('date_value');

            $table->boolean('notify_sms')
                ->default(false)
                ->after('notify_email');

            // Notification timing in days
            $table->unsignedInteger('notification_before_days')
                ->nullable()
                ->after('notify_sms');

            $table->unsignedInteger('notification_after_days')
                ->nullable()
                ->after('notification_before_days');

            // Track notification sending
            $table->dateTime('before_sent_at')
                ->nullable()
                ->after('notification_after_days');

            $table->dateTime('after_sent_at')
                ->nullable()
                ->after('before_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('date_details', function (Blueprint $table) {
            $table->dropColumn([
                'notify_email',
                'notify_sms',
                'notification_before_days',
                'notification_after_days',
                'before_sent_at',
                'after_sent_at',
            ]);
        });
    }
};