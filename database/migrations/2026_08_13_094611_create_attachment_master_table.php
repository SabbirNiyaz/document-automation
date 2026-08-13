<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attachment_master', function (Blueprint $table) {

            $table->increments('attachmentId');

            // FK → document_master.docId
            $table->unsignedInteger('docId');

            // Original file name
            $table->string('file_name', 255);

            // Storage path
            $table->string('file_path', 500);

            // MIME type, e.g. application/pdf
            $table->string('file_type', 100)->nullable();

            // File size in bytes
            $table->unsignedBigInteger('file_size')->nullable();

            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();

            $table->timestamps();

            $table->softDeletes();

            // Foreign key
            $table->foreign('docId')
                ->references('docId')
                ->on('document_master')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachment_master');
    }
};