<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    use ApiResponse;

    public function index(Course $course)
    {
        $lessons = $course->lessons()->withCount('progress')->get();

        return $this->success($lessons);
    }

    public function show(Lesson $lesson)
    {
        $lesson->load('course:id,title');
        $lesson->loadCount('quizzes');

        return $this->success($lesson);
    }

    public function store(Request $request, Course $course)
    {
        if ($request->user()->id !== $course->user_id && !$request->user()->isAdmin()) {
            return $this->error('Unauthorized', 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'video_url' => 'nullable|string|max:255',
            'duration' => 'nullable|integer|min:0',
            'order' => 'nullable|integer|min:0',
        ]);

        $validated['course_id'] = $course->id;

        if (!isset($validated['order'])) {
            $maxOrder = $course->lessons()->max('order');
            $validated['order'] = ($maxOrder ?? 0) + 1;
        }

        $lesson = Lesson::create($validated);

        return $this->created($lesson, 'Lesson created successfully');
    }

    public function update(Request $request, Lesson $lesson)
    {
        $course = $lesson->course;

        if ($request->user()->id !== $course->user_id && !$request->user()->isAdmin()) {
            return $this->error('Unauthorized', 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'nullable|string',
            'video_url' => 'nullable|string|max:255',
            'duration' => 'nullable|integer|min:0',
            'order' => 'nullable|integer|min:0',
        ]);

        $lesson->update($validated);

        return $this->success($lesson, 'Lesson updated successfully');
    }

    public function destroy(Request $request, Lesson $lesson)
    {
        $course = $lesson->course;

        if ($request->user()->id !== $course->user_id && !$request->user()->isAdmin()) {
            return $this->error('Unauthorized', 403);
        }

        $lesson->delete();

        return $this->noContent('Lesson deleted successfully');
    }
}
