<?php

namespace App\Services;

use App\Models\User;
use App\Models\Badge;
use App\Models\Achievement;

class GamificationService
{
    public function awardLessonComplete(User $user): void
    {
        $user->awardXp(User::XP_LESSON_COMPLETE);
        $user->trackActivity();

        $completedCount = $user->lessonProgress()->where('completed', true)->count();

        if ($completedCount === 1) {
            $this->awardBadge($user, 'first_lesson', 'First Steps', 'Completed your first lesson');
        }

        if ($completedCount >= 10) {
            $this->awardBadge($user, 'ten_lessons', 'Dedicated Learner', 'Completed 10 lessons');
        }

        if ($completedCount >= 25) {
            $this->awardBadge($user, 'twenty_five_lessons', 'Knowledge Seeker', 'Completed 25 lessons');
        }
    }

    public function awardQuizPass(User $user, int $score, int $total): void
    {
        $percentage = $total > 0 ? ($score / $total) * 100 : 0;

        if ($percentage >= 100) {
            $user->awardXp(User::XP_QUIZ_PERFECT);
            $this->awardBadge($user, 'perfect_quiz', 'Perfect Score', 'Got 100% on a quiz');
        } else {
            $user->awardXp(User::XP_QUIZ_PASS);
        }

        $user->trackActivity();

        $attemptsCount = $user->quizAttempts()->count();
        if ($attemptsCount >= 5) {
            $this->awardBadge($user, 'five_quizzes', 'Quiz Master', 'Completed 5 quizzes');
        }
    }

    public function awardCourseComplete(User $user): void
    {
        $user->awardXp(User::XP_COURSE_COMPLETE);
        $user->trackActivity();

        $this->awardBadge($user, 'course_complete', 'Course Graduate', 'Completed a full course');

        $completedCourses = $user->enrollments()->where('progress_percentage', 100)->count();
        if ($completedCourses >= 3) {
            $this->awardBadge($user, 'three_courses', 'Multi-Disciplinary', 'Completed 3 courses');
        }
    }

    public function checkStreakBadges(User $user): void
    {
        $streak = $user->streak_count;

        if ($streak >= 3) {
            $this->awardBadge($user, 'streak_3', 'Consistent', '3-day learning streak');
            $user->awardXp(User::XP_LOGIN_STREAK_3);
        }

        if ($streak >= 7) {
            $this->awardBadge($user, 'streak_7', 'Committed', '7-day learning streak');
            $user->awardXp(User::XP_LOGIN_STREAK_7);
        }

        if ($streak >= 30) {
            $this->awardBadge($user, 'streak_30', 'Unstoppable', '30-day learning streak');
            $user->awardXp(User::XP_LOGIN_STREAK_30);
        }
    }

    public function awardBadge(User $user, string $type, string $name, string $description): void
    {
        $exists = Badge::where('user_id', $user->id)
            ->where('badge_type', $type)
            ->exists();

        if (!$exists) {
            Badge::create([
                'user_id' => $user->id,
                'badge_type' => $type,
                'badge_name' => $name,
                'description' => $description,
            ]);

            $this->awardAchievement($user, "badge_earned:{$type}", [
                'badge_name' => $name,
                'badge_type' => $type,
            ]);
        }
    }

    public function awardAchievement(User $user, string $type, array $metadata = []): void
    {
        Achievement::create([
            'user_id' => $user->id,
            'achievement_type' => $type,
            'metadata' => $metadata,
        ]);
    }
}
