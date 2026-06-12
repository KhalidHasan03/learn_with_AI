<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WritingSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'task_type',
        'prompt',
        'essay',
        'ai_feedback',
        'band_score',
    ];

    protected $casts = [
        'ai_feedback' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
