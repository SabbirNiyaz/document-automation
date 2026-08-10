<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('date_details', function (Blueprint $table) {
            $table->id();

            // FK → date_types.dateTypeId
            $table->unsignedInteger('dateTypeId');

            // FK → document_master.docId
            $table->unsignedInteger('docId');

            $table->date('date_value');

            $table->enum('status', ['Active', 'Inactive'])
                ->default('Active');

            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();

            $table->timestamps();

            $table->softDeletes();

            // Foreign keys
            $table->foreign('dateTypeId')
                ->references('dateTypeId')
                ->on('date_types')
                ->restrictOnDelete();

            $table->foreign('docId')
                ->references('docId')
                ->on('document_master')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('date_details');
    }
};