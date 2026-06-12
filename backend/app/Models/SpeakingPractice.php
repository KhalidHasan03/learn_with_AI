<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpeakingPractice extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'part',
        'prompt',
        'response',
        'ai_feedback',
        'band_score',
        'prep_time_used',
        'speaking_time_used',
    ];

    protected $casts = [
        'ai_feedback' => 'array',
        'band_score' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
