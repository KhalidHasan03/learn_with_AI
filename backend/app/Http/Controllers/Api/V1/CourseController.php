<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Course::with(['user:id,name', 'category:id,name'])
            ->where('status', 'published');

        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty_level', $request->difficulty);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $courses = $query->withCount('lessons', 'enrollments')->latest()->paginate(12);

        return $this->success($courses);
    }

    public function show($slug)
    {
        $course = Course::with([
            'user:id,name',
            'category:id,name',
            'lessons' => function ($q) {
                $q->withCount('progress');
            },
        ])
        ->withCount('lessons', 'enrollments')
        ->where('slug', $slug)
        ->firstOrFail();

        return $this->success($course);
    }

    public function adminIndex(Request $request)
    {
        $courses = Course::with(['user:id,name', 'category:id,name'])
            ->withCount('lessons', 'enrollments')
            ->latest()
            ->paginate(20);

        return $this->success($courses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string|max:255',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'status' => 'required|in:draft,published',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);

        $course = Course::create($validated);

        return $this->created($course, 'Course created successfully');
    }

    public function update(Request $request, Course $course)
    {
        if ($request->user()->id !== $course->user_id && !$request->user()->isAdmin()) {
            return $this->error('Unauthorized', 403);
        }

        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string|max:255',
            'difficulty_level' => 'sometimes|in:beginner,intermediate,advanced',
            'status' => 'sometimes|in:draft,published',
        ]);

        $course->update($validated);

        return $this->success($course, 'Course updated successfully');
    }

    public function destroy(Request $request, Course $course)
    {
        if ($request->user()->id !== $course->user_id && !$request->user()->isAdmin()) {
            return $this->error('Unauthorized', 403);
        }

        $course->delete();

        return $this->noContent('Course deleted successfully');
    }
}
