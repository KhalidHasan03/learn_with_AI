<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Roadmap extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'career_path',
        'roadmap_content',
    ];

    protected $casts = [
        'roadmap_content' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
