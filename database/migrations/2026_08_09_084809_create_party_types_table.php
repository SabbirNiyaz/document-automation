<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('party_types', function (Blueprint $table) {
            $table->increments('partyTypeId');
            $table->string('partyTypeName', 255);
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->integer('created_by')->nullable();
            $table->integer('modified_by')->nullable();
            $table->timestamps();   // created_at, updated_at
            $table->softDeletes();  // deleted_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('party_types');
    }
};