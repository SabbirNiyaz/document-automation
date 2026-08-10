<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('party_master', function (Blueprint $table) {

            // Primary Key
            $table->increments('partyId');

            // Party Information
            $table->string('partyName', 255);
            $table->string('address', 255)->nullable();

            // Foreign Key
            $table->unsignedInteger('partyTypeId');

            $table->string('contactPerson', 255)->nullable();
            $table->string('phone', 255)->nullable();
            $table->string('email', 255)->nullable();

            // Audit fields
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();

            // Timestamps
            $table->timestamps();

            // Soft delete
            $table->softDeletes();

            // Foreign key
            $table->foreign('partyTypeId')
                ->references('partyTypeId')
                ->on('party_types')
                ->restrictOnDelete();

            // Optional indexes
            $table->index('partyName');
            $table->index('partyTypeId');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('party_master');
    }
};

