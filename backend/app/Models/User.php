<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    public const XP_LESSON_COMPLETE = 10;
    public const XP_QUIZ_PERFECT = 50;
    public const XP_QUIZ_PASS = 20;
    public const XP_COURSE_COMPLETE = 100;
    public const XP_LOGIN_STREAK_3 = 15;
    public const XP_LOGIN_STREAK_7 = 30;
    public const XP_LOGIN_STREAK_30 = 100;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'xp_points',
        'level',
        'last_activity_at',
        'streak_count',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'last_activity_at' => 'datetime',
    ];

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function lessonProgress()
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function aiConversations()
    {
        return $this->hasMany(AiConversation::class);
    }

    public function generatedNotes()
    {
        return $this->hasMany(GeneratedNote::class);
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function studyPlans()
    {
        return $this->hasMany(StudyPlan::class);
    }

    public function roadmaps()
    {
        return $this->hasMany(Roadmap::class);
    }

    public function vocabulary()
    {
        return $this->hasMany(Vocabulary::class);
    }

    public function writingSubmissions()
    {
        return $this->hasMany(WritingSubmission::class);
    }

    public function speakingPractices()
    {
        return $this->hasMany(SpeakingPractice::class);
    }

    public function badges()
    {
        return $this->hasMany(Badge::class);
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class);
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function awardXp(int $points): void
    {
        $this->increment('xp_points', $points);
        $this->recalculateLevel();
    }

    public function recalculateLevel(): void
    {
        $xp = $this->xp_points;
        $level = 1;
        if ($xp >= 1000) $level = 10;
        elseif ($xp >= 500) $level = 8;
        elseif ($xp >= 250) $level = 5;
        elseif ($xp >= 100) $level = 3;
        elseif ($xp >= 50) $level = 2;
        $this->update(['level' => $level]);
    }

    public function trackActivity(): void
    {
        $now = now();
        $last = $this->last_activity_at;

        if ($last && $last->isYesterday()) {
            $this->streak_count++;
        } elseif (!$last || !$last->isToday()) {
            $this->streak_count = 1;
        }

        $this->last_activity_at = $now;
        $this->save();
    }
}
