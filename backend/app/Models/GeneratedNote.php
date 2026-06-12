<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneratedNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'summary',
        'key_points',
        'interview_questions',
        'vocabulary',
        'exam_questions',
    ];

    protected $casts = [
        'key_points' => 'array',
        'interview_questions' => 'array',
        'vocabulary' => 'array',
        'exam_questions' => 'array',
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
