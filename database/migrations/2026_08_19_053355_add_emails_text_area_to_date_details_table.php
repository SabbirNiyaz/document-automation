<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('date_details', function (Blueprint $table) {
            $table->text('emails_text_area')
                ->nullable()
                ->after('notify_sms');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('date_details', function (Blueprint $table) {
            $table->dropColumn('emails_text_area');
        });
    }
};
