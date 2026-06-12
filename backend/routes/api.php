<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AIController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\EnrollmentController;
use App\Http\Controllers\Api\V1\GamificationController;
use App\Http\Controllers\Api\V1\IeltsController;
use App\Http\Controllers\Api\V1\LessonController;
use App\Http\Controllers\Api\V1\QuizController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Auth
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{slug}', [CourseController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);

        // Courses (Admin/Instructor)
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

        // Lessons
        Route::get('/courses/{course}/lessons', [LessonController::class, 'index']);
        Route::get('/lessons/{lesson}', [LessonController::class, 'show']);
        Route::post('/courses/{course}/lessons', [LessonController::class, 'store']);
        Route::put('/lessons/{lesson}', [LessonController::class, 'update']);
        Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy']);

        // Enrollment
        Route::post('/enroll/{course}', [EnrollmentController::class, 'enroll']);
        Route::get('/my-courses', [EnrollmentController::class, 'myCourses']);
        Route::post('/lessons/{lesson}/complete', [EnrollmentController::class, 'markComplete']);
        Route::get('/continue-learning', [EnrollmentController::class, 'continueLearning']);

        // AI
        Route::post('/ai/chat', [AIController::class, 'chat']);
        Route::post('/ai/generate-notes', [AIController::class, 'generateNotes']);
        Route::post('/ai/generate-quiz', [AIController::class, 'generateQuiz']);
        Route::post('/ai/study-plan', [AIController::class, 'generateStudyPlan']);
        Route::post('/ai/roadmap', [AIController::class, 'generateRoadmap']);
        Route::get('/ai/conversations', [AIController::class, 'getConversations']);
        Route::get('/ai/conversations/{conversation}', [AIController::class, 'getConversationMessages']);

        // Quiz
        Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
        Route::post('/quizzes/{quiz}/attempt', [QuizController::class, 'attempt']);
        Route::get('/quizzes/{quiz}/attempts', [QuizController::class, 'myAttempts']);

        // Gamification
        Route::get('/user/points', [GamificationController::class, 'points']);
        Route::get('/user/badges', [GamificationController::class, 'badges']);
        Route::get('/user/achievements', [GamificationController::class, 'achievements']);
        Route::get('/leaderboard', [GamificationController::class, 'leaderboard']);

        // IELTS
        Route::get('/ielts/vocabulary', [IeltsController::class, 'vocabulary']);
        Route::post('/ielts/vocabulary/generate', [IeltsController::class, 'generateVocabulary']);
        Route::post('/ielts/vocabulary/add', [IeltsController::class, 'addVocabulary']);
        Route::post('/ielts/vocabulary/{vocabulary}/review', [IeltsController::class, 'reviewVocabulary']);
        Route::delete('/ielts/vocabulary/{vocabulary}', [IeltsController::class, 'deleteVocabulary']);
        Route::post('/ielts/writing/generate-prompt', [IeltsController::class, 'generateWritingPrompt']);
        Route::post('/ielts/writing/submit', [IeltsController::class, 'submitWriting']);
        Route::get('/ielts/writing/submissions', [IeltsController::class, 'writingSubmissions']);
        Route::get('/ielts/band-score', [IeltsController::class, 'bandScore']);
        Route::get('/ielts/topics', [IeltsController::class, 'topics']);
        Route::post('/ielts/speaking/generate-prompt', [IeltsController::class, 'generateSpeakingPrompt']);
        Route::post('/ielts/speaking/submit', [IeltsController::class, 'submitSpeaking']);
        Route::get('/ielts/speaking/history', [IeltsController::class, 'speakingHistory']);

        // Categories (admin)
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // Admin
        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/users', [AdminController::class, 'users']);
            Route::get('/analytics', [AdminController::class, 'analytics']);
            Route::put('/users/{user}', [AdminController::class, 'updateUser']);
            Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
            Route::get('/courses', [CourseController::class, 'adminIndex']);
            Route::get('/categories', [CategoryController::class, 'all']);
        });
    });
});
