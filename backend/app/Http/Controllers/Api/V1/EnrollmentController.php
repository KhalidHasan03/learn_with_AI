<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Services\GamificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    use ApiResponse;

    public function enroll(Request $request, Course $course)
    {
        $existing = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existing) {
            return $this->error('Already enrolled in this course', 409);
        }

        $enrollment = Enrollment::create([
            'user_id' => $request->user()->id,
            'course_id' => $course->id,
        ]);

        return $this->created($enrollment, 'Enrolled successfully');
    }

    public function myCourses(Request $request)
    {
        $enrollments = Enrollment::with([
            'course' => function ($q) {
                $q->withCount('lessons');
            },
            'course.user:id,name',
        ])
        ->where('user_id', $request->user()->id)
        ->latest()
        ->get();

        return $this->success($enrollments);
    }

    public function markComplete(Request $request, \App\Models\Lesson $lesson)
    {
        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $lesson->course_id)
            ->firstOrFail();

        $progress = LessonProgress::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'completed' => true,
                'completed_at' => now(),
            ]
        );

        $totalLessons = $lesson->course->lessons()->count();
        $completedLessons = LessonProgress::where('user_id', $request->user()->id)
            ->whereHas('lesson', function ($q) use ($lesson) {
                $q->where('course_id', $lesson->course_id);
            })
            ->where('completed', true)
            ->count();

        $percentage = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;

        $enrollment->update(['progress_percentage' => $percentage]);

        $gamification = app(GamificationService::class);
        $gamification->awardLessonComplete($request->user());

        if ($percentage === 100) {
            $gamification->awardCourseComplete($request->user());
        }

        return $this->success([
            'progress' => $progress,
            'course_progress' => $percentage,
        ], 'Lesson marked as complete');
    }

    public function continueLearning(Request $request)
    {
        $enrollments = Enrollment::with([
            'course' => function ($q) {
                $q->with('lessons');
            },
        ])
        ->where('user_id', $request->user()->id)
        ->where('progress_percentage', '<', 100)
        ->latest()
        ->take(5)
        ->get();

        return $this->success($enrollments);
    }
}
