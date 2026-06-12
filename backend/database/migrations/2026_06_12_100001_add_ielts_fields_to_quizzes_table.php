<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->string('ielts_question_type')->nullable()->after('type');
            $table->integer('band_score_estimated')->nullable()->after('ielts_question_type');
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn(['ielts_question_type', 'band_score_estimated']);
        });
    }
};
