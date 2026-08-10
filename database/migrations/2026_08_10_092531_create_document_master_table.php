<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_master', function (Blueprint $table) {

            $table->increments('docId');

            $table->string('title', 255);

            $table->text('description')->nullable();

            // FK → party_master.partyId
            $table->unsignedInteger('partyName');

            // FK → document_type.document_id
            $table->unsignedInteger('docType');

            $table->date('date');

            $table->text('soft_copy')->nullable();

            $table->enum('status', ['Active', 'Inactive'])
                ->default('Active');

            // PDF file path
            $table->string('attachment')->nullable();

            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();

            $table->timestamps();

            $table->softDeletes();

            // Foreign keys
            $table->foreign('partyName')
                ->references('partyId')
                ->on('party_master')
                ->restrictOnDelete();

            $table->foreign('docType')
                ->references('document_id')
                ->on('document_type')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_master');
    }
};