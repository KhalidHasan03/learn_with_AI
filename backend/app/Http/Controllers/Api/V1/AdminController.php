<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\AiConversation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    use ApiResponse;

    public function dashboard()
    {
        $data = [
            'total_students' => User::where('role', 'student')->count(),
            'total_courses' => Course::count(),
            'total_enrollments' => Enrollment::count(),
            'total_ai_requests' => AiConversation::count(),
            'published_courses' => Course::where('status', 'published')->count(),
            'active_users_today' => User::whereDate('created_at', today())->count(),
        ];

        return $this->success($data);
    }

    public function users()
    {
        $users = User::withCount('enrollments', 'aiConversations')
            ->latest()
            ->paginate(20);

        return $this->success($users);
    }

    public function analytics()
    {
        $courses = Course::withCount('enrollments', 'lessons')
            ->orderBy('enrollments_count', 'desc')
            ->take(10)
            ->get();

        $recentEnrollments = Enrollment::with(['user:id,name', 'course:id,title'])
            ->latest()
            ->take(10)
            ->get();

        $data = [
            'popular_courses' => $courses,
            'recent_enrollments' => $recentEnrollments,
        ];

        return $this->success($data);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'sometimes|in:student,admin',
            'name' => 'sometimes|string|max:255',
        ]);

        $user->update($validated);
        return $this->success($user, 'User updated');
    }

    public function deleteUser(User $user)
    {
        $user->delete();
        return $this->noContent('User deleted');
    }
}
