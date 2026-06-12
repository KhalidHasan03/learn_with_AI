<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('ielts_type')->nullable()->after('status');
            $table->string('ielts_skill')->nullable()->after('ielts_type');
            $table->integer('ielts_band_required')->nullable()->after('ielts_skill');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['ielts_type', 'ielts_skill', 'ielts_band_required']);
        });
    }
};
