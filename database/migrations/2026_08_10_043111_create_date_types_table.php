<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('date_types', function (Blueprint $table) {
            $table->increments('dateTypeId');
            $table->string('dateTypeName', 255);
            $table->enum('status', ['Active', 'Inactive'])
                ->default('Active');

            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('date_types');
    }
};