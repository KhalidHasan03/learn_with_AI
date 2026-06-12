<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\GamificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    use ApiResponse;

    public function show(Quiz $quiz)
    {
        $quiz->load('questions');

        $quiz->questions->makeHidden('correct_answer');

        return $this->success($quiz);
    }

    public function attempt(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.answer' => 'required|string',
        ]);

        $questions = $quiz->questions()->get()->keyBy('id');

        $score = 0;
        $total = count($validated['answers']);
        $results = [];

        $isMultipleAnswer = $quiz->ielts_question_type === 'multiple_answer';

        foreach ($validated['answers'] as $answer) {
            $question = $questions->get($answer['question_id']);

            if (!$question) continue;

            $userAns = $answer['answer'];
            $correctAns = $question->correct_answer;

            if ($isMultipleAnswer) {
                $userParts = explode(',', $userAns);
                $correctParts = explode(',', $correctAns);
                sort($userParts);
                sort($correctParts);
                $isCorrect = $userParts === $correctParts;
            } else {
                $isCorrect = $userAns === $correctAns;
            }

            if ($isCorrect) {
                $score++;
            }

            $results[] = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'your_answer' => $answer['answer'],
                'correct_answer' => $question->correct_answer,
                'is_correct' => $isCorrect,
                'explanation' => $question->explanation,
            ];
        }

        $attempt = QuizAttempt::create([
            'user_id' => $request->user()->id,
            'quiz_id' => $quiz->id,
            'score' => $score,
            'total' => $total,
            'answers' => $validated['answers'],
            'completed_at' => now(),
        ]);

        $gamification = app(GamificationService::class);
        $gamification->awardQuizPass($request->user(), $score, $total);

        return $this->success([
            'attempt_id' => $attempt->id,
            'score' => $score,
            'total' => $total,
            'percentage' => $total > 0 ? round(($score / $total) * 100) : 0,
            'results' => $results,
        ], 'Quiz submitted successfully');
    }

    public function myAttempts(Request $request, Quiz $quiz)
    {
        $attempts = QuizAttempt::where('user_id', $request->user()->id)
            ->where('quiz_id', $quiz->id)
            ->latest()
            ->get();

        return $this->success($attempts);
    }
}
