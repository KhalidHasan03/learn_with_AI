<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('speaking_practices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('part'); // part1, part2, part3
            $table->text('prompt');
            $table->text('response');
            $table->json('ai_feedback')->nullable();
            $table->decimal('band_score', 3, 1)->nullable();
            $table->integer('prep_time_used')->nullable();
            $table->integer('speaking_time_used')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('speaking_practices');
    }
};
