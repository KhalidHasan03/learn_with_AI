<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Vocabulary;
use App\Models\WritingSubmission;
use App\Models\SpeakingPractice;
use App\Models\QuizAttempt;
use App\Models\Enrollment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IeltsController extends Controller
{
    use ApiResponse;

    public function vocabulary(Request $request)
    {
        $query = Vocabulary::where('user_id', $request->user()->id);

        if ($request->filled('topic')) {
            $query->where('topic', $request->topic);
        }
        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->filled('search')) {
            $query->where('word', 'like', "%{$request->search}%");
        }

        $vocabulary = $query->latest()->paginate(20);
        return $this->success($vocabulary);
    }

    public function generateVocabulary(Request $request)
    {
        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
        ]);

        $lesson = Lesson::with('course')->findOrFail($validated['lesson_id']);
        $existingCount = Vocabulary::where('user_id', $request->user()->id)
            ->where('course_id', $lesson->course_id)
            ->count();

        if ($existingCount >= 30) {
            return $this->success(['message' => 'Vocabulary already generated', 'count' => $existingCount]);
        }

        $prompt = "Extract 10 important English vocabulary words from the following lesson. For each word provide: word, definition (simple English), example sentence using the word in context, synonyms (comma-separated), topic category.\n\nTitle: {$lesson->title}\n\nContent: {$lesson->content}\n\nRespond in JSON format as an array of objects with keys: word, definition, example_sentence, synonyms, topic.";

        $response = $this->callOpenAI([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a vocabulary extraction assistant. Respond only with valid JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 2000,
        ]);

        $content = $response['choices'][0]['message']['content'] ?? '[]';
        $words = json_decode($content, true);

        if (!$words || !is_array($words)) {
            return $this->error('Failed to generate vocabulary', 500);
        }

        $created = [];
        foreach ($words as $w) {
            $vocab = Vocabulary::create([
                'user_id' => $request->user()->id,
                'course_id' => $lesson->course_id,
                'word' => $w['word'] ?? 'Unknown',
                'definition' => $w['definition'] ?? '',
                'example_sentence' => $w['example_sentence'] ?? '',
                'synonyms' => $w['synonyms'] ?? '',
                'topic' => $w['topic'] ?? 'general',
                'difficulty' => 'intermediate',
            ]);
            $created[] = $vocab;
        }

        return $this->created(['words' => $created, 'count' => count($created)], 'Vocabulary generated');
    }

    public function addVocabulary(Request $request)
    {
        $validated = $request->validate([
            'word' => 'required|string|max:255',
            'definition' => 'required|string',
            'example_sentence' => 'required|string',
            'synonyms' => 'nullable|string',
            'topic' => 'nullable|string|max:100',
            'course_id' => 'nullable|exists:courses,id',
            'difficulty' => 'nullable|in:basic,intermediate,advanced',
        ]);

        $vocab = Vocabulary::create([
            'user_id' => $request->user()->id,
            'course_id' => $validated['course_id'] ?? null,
            'word' => $validated['word'],
            'definition' => $validated['definition'],
            'example_sentence' => $validated['example_sentence'],
            'synonyms' => $validated['synonyms'] ?? '',
            'topic' => $validated['topic'] ?? 'general',
            'difficulty' => $validated['difficulty'] ?? 'intermediate',
        ]);

        return $this->created($vocab, 'Word added to vocabulary');
    }

    public function reviewVocabulary(Request $request, Vocabulary $vocabulary)
    {
        if ($vocabulary->user_id !== $request->user()->id) {
            return $this->error('Unauthorized', 403);
        }

        $vocabulary->increment('review_count');
        $vocabulary->update(['last_reviewed_at' => now()]);

        return $this->success($vocabulary, 'Word reviewed');
    }

    public function deleteVocabulary(Request $request, Vocabulary $vocabulary)
    {
        if ($vocabulary->user_id !== $request->user()->id) {
            return $this->error('Unauthorized', 403);
        }

        $vocabulary->delete();
        return $this->noContent('Word deleted');
    }

    public function generateWritingPrompt(Request $request)
    {
        $validated = $request->validate([
            'task_type' => 'required|in:task_1,task_2',
        ]);

        $taskDescriptions = [
            'task_1' => 'IELTS Writing Task 1: Describe visual information (chart, graph, table, diagram, or map).',
            'task_2' => 'IELTS Writing Task 2: Write an essay in response to a point of view, argument, or problem.',
        ];

        $prompt = "Generate an IELTS {$validated['task_type']} writing prompt. {$taskDescriptions[$validated['task_type']]}\n\nRespond in JSON format with keys: prompt (the question/task description), instructions (what the test taker should do), word_limit (recommended word count).";

        $response = $this->callOpenAI([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'You are an IELTS exam creator. Respond only with valid JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 1000,
        ]);

        $content = $response['choices'][0]['message']['content'] ?? '{}';
        $parsed = json_decode($content, true) ?? [
            'prompt' => 'Write about a common IELTS topic.',
            'instructions' => 'Write at least 150 words.',
            'word_limit' => $validated['task_type'] === 'task_1' ? 150 : 250,
        ];

        return $this->success($parsed);
    }

    public function submitWriting(Request $request)
    {
        $validated = $request->validate([
            'task_type' => 'required|in:task_1,task_2',
            'prompt' => 'required|string',
            'essay' => 'required|string|min:50',
            'lesson_id' => 'nullable|exists:lessons,id',
        ]);

        $evaluationPrompt = "Evaluate this IELTS Writing Task {$validated['task_type']} essay and provide detailed feedback.\n\nTask: {$validated['prompt']}\n\nEssay: {$validated['essay']}\n\nEvaluate on these criteria (each scored 0-9):\n1. Task Achievement (for Task 1) / Task Response (for Task 2)\n2. Coherence and Cohesion\n3. Lexical Resource\n4. Grammatical Range and Accuracy\n\nProvide:\n- band_score (overall average, float)\n- criteria_breakdown (object with 4 scores)\n- strengths (array of strings)\n- areas_for_improvement (array of strings)\n- suggested_band (the IELTS band level this essay would score)\n\nRespond in JSON format.";

        $response = $this->callOpenAI([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'You are an IELTS writing examiner. Respond only with valid JSON.'],
                ['role' => 'user', 'content' => $evaluationPrompt],
            ],
            'max_tokens' => 2000,
        ]);

        $content = $response['choices'][0]['message']['content'] ?? '{}';
        $feedback = json_decode($content, true) ?? [
            'band_score' => 5.5,
            'criteria_breakdown' => ['task_achievement' => 5.5, 'coherence' => 5.5, 'lexical_resource' => 5.5, 'grammar' => 5.5],
            'strengths' => ['Good effort'],
            'areas_for_improvement' => ['Keep practicing'],
        ];

        $submission = WritingSubmission::create([
            'user_id' => $request->user()->id,
            'lesson_id' => $validated['lesson_id'] ?? null,
            'task_type' => $validated['task_type'],
            'prompt' => $validated['prompt'],
            'essay' => $validated['essay'],
            'ai_feedback' => $feedback,
            'band_score' => $feedback['band_score'] ?? null,
        ]);

        $submission->load('lesson:id,title');

        return $this->created($submission, 'Essay evaluated');
    }

    public function writingSubmissions(Request $request)
    {
        $submissions = WritingSubmission::with('lesson:id,title')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return $this->success($submissions);
    }

    public function bandScore(Request $request)
    {
        $userId = $request->user()->id;

        $quizAttempts = QuizAttempt::where('user_id', $userId)
            ->whereHas('quiz', fn($q) => $q->where('type', 'ai'))
            ->get();

        $quizBand = 0;
        if ($quizAttempts->count() > 0) {
            $avgPercent = $quizAttempts->avg(fn($a) => $a->total > 0 ? ($a->score / $a->total) * 100 : 0);
            $quizBand = round(($avgPercent / 100) * 9, 1);
        }

        $writingSubmissions = WritingSubmission::where('user_id', $userId)->get();
        $avgWritingBand = $writingSubmissions->avg('band_score') ?? 0;

        $speakingPractices = SpeakingPractice::where('user_id', $userId)->get();
        $avgSpeakingBand = $speakingPractices->avg('band_score') ?? 0;

        $enrollments = Enrollment::where('user_id', $userId)
            ->with('course')
            ->get();

        $courseProgress = $enrollments->map(fn($e) => [
            'course_title' => $e->course->title ?? 'Unknown',
            'progress' => $e->progress_percentage,
            'ielts_skill' => $e->course->ielts_skill,
        ]);

        $vocabCount = Vocabulary::where('user_id', $userId)->count();
        $vocabReviewed = Vocabulary::where('user_id', $userId)->where('review_count', '>', 0)->count();

        $overallBand = 0;
        $count = 0;
        if ($quizBand > 0) { $overallBand += $quizBand; $count++; }
        if ($avgWritingBand > 0) { $overallBand += $avgWritingBand; $count++; }
        if ($avgSpeakingBand > 0) { $overallBand += $avgSpeakingBand; $count++; }
        $overallBand = $count > 0 ? round($overallBand / $count, 1) : 0;

        return $this->success([
            'overall_band' => $overallBand,
            'quiz_band' => $quizBand,
            'writing_band' => round($avgWritingBand, 1),
            'speaking_band' => round($avgSpeakingBand, 1),
            'quizzes_taken' => $quizAttempts->count(),
            'essays_written' => $writingSubmissions->count(),
            'speaking_practices' => $speakingPractices->count(),
            'vocabulary_words' => $vocabCount,
            'vocabulary_reviewed' => $vocabReviewed,
            'course_progress' => $courseProgress,
        ]);
    }

    public function topics()
    {
        $topics = Vocabulary::select('topic')
            ->whereNotNull('topic')
            ->distinct()
            ->pluck('topic');

        $ieltsTopics = [
            'education', 'environment', 'technology', 'health', 'travel',
            'culture', 'work', 'society', 'science', 'economy',
        ];

        $all = collect($ieltsTopics)->merge($topics)->unique()->sort()->values();
        return $this->success($all);
    }

    public function generateSpeakingPrompt(Request $request)
    {
        $validated = $request->validate([
            'part' => 'required|in:part1,part2,part3',
        ]);

        $partDescriptions = [
            'part1' => 'IELTS Speaking Part 1: Introduction and interview. The examiner asks general questions about familiar topics like home, work, studies, hobbies, food, travel, and daily routines.',
            'part2' => 'IELTS Speaking Part 2: Individual long turn (Cue Card). The candidate receives a task card with a topic and must speak for 1-2 minutes after 1 minute of preparation.',
            'part3' => 'IELTS Speaking Part 3: Two-way discussion. The examiner asks abstract questions related to the Part 2 topic, discussing broader issues and concepts.',
        ];

        $prompt = "Generate an {$validated['part']} speaking prompt. {$partDescriptions[$validated['part']]}\n\nRespond in JSON format with keys: prompt (the question or cue card topic), instructions (what the test taker should do), follow_up_questions (array of related questions, empty for Part 2), preparation_time (seconds, 60 for Part 2, 0 for others), speaking_time (seconds, 60 for Part 1, 120 for Part 2, 60 for Part 3).";

        $response = $this->callOpenAI([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'You are an IELTS speaking examiner. Respond only with valid JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 1500,
        ]);

        $content = $response['choices'][0]['message']['content'] ?? '{}';
        $parsed = json_decode($content, true) ?? [];

        $defaults = [
            'part1' => [
                'prompt' => 'Let\'s talk about your hometown. Where is your hometown? What do you like about it? Has it changed much since you were a child?',
                'follow_up_questions' => ['What kind of place is your hometown?', 'What is the most interesting part of your hometown?', 'Would you recommend visiting your hometown?'],
                'preparation_time' => 0,
                'speaking_time' => 60,
            ],
            'part2' => [
                'prompt' => 'Describe a memorable event from your childhood. You should say: when it happened, where it happened, who was with you, and explain why it was memorable.',
                'follow_up_questions' => [],
                'preparation_time' => 60,
                'speaking_time' => 120,
            ],
            'part3' => [
                'prompt' => 'Let\'s discuss childhood and memory. How important are childhood memories for personal development? Do you think children today will have different memories compared to past generations?',
                'follow_up_questions' => ['How has technology changed childhood experiences?', 'What role do family traditions play in creating memories?', 'Do you think people remember events better as they get older?'],
                'preparation_time' => 0,
                'speaking_time' => 60,
            ],
        ];

        return $this->success([
            'part' => $validated['part'],
            'prompt' => $parsed['prompt'] ?? $defaults[$validated['part']]['prompt'],
            'instructions' => $parsed['instructions'] ?? ($validated['part'] === 'part2' ? 'You will have 1 minute to prepare. Then speak for up to 2 minutes.' : 'Answer the questions naturally.'),
            'follow_up_questions' => $parsed['follow_up_questions'] ?? $defaults[$validated['part']]['follow_up_questions'],
            'preparation_time' => $parsed['preparation_time'] ?? $defaults[$validated['part']]['preparation_time'],
            'speaking_time' => $parsed['speaking_time'] ?? $defaults[$validated['part']]['speaking_time'],
        ]);
    }

    public function submitSpeaking(Request $request)
    {
        $validated = $request->validate([
            'part' => 'required|in:part1,part2,part3',
            'prompt' => 'required|string',
            'response' => 'required|string|min:20',
            'prep_time_used' => 'nullable|integer',
            'speaking_time_used' => 'nullable|integer',
        ]);

        $evaluationPrompt = "Evaluate this IELTS Speaking {$validated['part']} response and provide detailed feedback following IELTS criteria.\n\nPrompt/Topic: {$validated['prompt']}\n\nResponse: {$validated['response']}\n\nEvaluate on these criteria (each scored 0-9):\n1. Fluency and Coherence\n2. Lexical Resource\n3. Grammatical Range and Accuracy\n4. Pronunciation (based on written response quality)\n\nProvide:\n- band_score (overall average, float)\n- criteria_breakdown (object with scores for fluency, lexical_resource, grammar, pronunciation)\n- strengths (array of 3 strings)\n- areas_for_improvement (array of 3 strings)\n- suggested_band (the IELTS band level this response would score)\n- vocabulary_suggestions (array of 3 alternative words/phrases the speaker could have used)\n\nRespond in JSON format.";

        $response = $this->callOpenAI([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'You are an IELTS speaking examiner. Respond only with valid JSON.'],
                ['role' => 'user', 'content' => $evaluationPrompt],
            ],
            'max_tokens' => 2000,
        ]);

        $content = $response['choices'][0]['message']['content'] ?? '{}';
        $feedback = json_decode($content, true) ?? [
            'band_score' => 5.5,
            'criteria_breakdown' => ['fluency' => 5.5, 'lexical_resource' => 5.5, 'grammar' => 5.5, 'pronunciation' => 5.5],
            'strengths' => ['Response addresses the prompt'],
            'areas_for_improvement' => ['Expand your answers with more detail'],
            'vocabulary_suggestions' => [],
        ];

        $practice = SpeakingPractice::create([
            'user_id' => $request->user()->id,
            'part' => $validated['part'],
            'prompt' => $validated['prompt'],
            'response' => $validated['response'],
            'ai_feedback' => $feedback,
            'band_score' => $feedback['band_score'] ?? null,
            'prep_time_used' => $validated['prep_time_used'] ?? null,
            'speaking_time_used' => $validated['speaking_time_used'] ?? null,
        ]);

        return $this->created($practice, 'Speaking response evaluated');
    }

    public function speakingHistory(Request $request)
    {
        $practices = SpeakingPractice::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return $this->success($practices);
    }

    private function callOpenAI(array $payload): array
    {
        $apiKey = config('services.openai.api_key') ?: env('OPENAI_API_KEY');

        if (!$apiKey || $apiKey === 'mock') {
            return $this->mockResponse($payload);
        }

        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->post('https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => "Bearer {$apiKey}",
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
                'timeout' => 60,
            ]);
            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            \Log::error('IELTS AI call failed: ' . $e->getMessage());
            return $this->mockResponse($payload);
        }
    }

    private function mockResponse(array $payload): array
    {
        $userMessage = '';
        foreach ($payload['messages'] as $msg) {
            if ($msg['role'] === 'user') {
                $userMessage = $msg['content'];
                break;
            }
        }

        if (str_contains($userMessage, 'Extract 10 important English vocabulary')) {
            $topics = ['education', 'environment', 'technology', 'health', 'culture'];
            $words = [];
            for ($i = 0; $i < 10; $i++) {
                $words[] = [
                    'word' => ['significant', 'comprehensive', 'implement', 'analyze', 'demonstrate', 'establish', 'facilitate', 'consequently', 'innovative', 'substantial'][$i],
                    'definition' => 'Having meaning or importance; showing careful thought and full understanding.',
                    'example_sentence' => 'The study showed a significant improvement in student performance after using the new method.',
                    'synonyms' => 'important, meaningful, notable, considerable',
                    'topic' => $topics[$i % 5],
                ];
            }
            return ['choices' => [['message' => ['content' => json_encode($words)]]]];
        }

        if (str_contains($userMessage, 'IELTS Writing Task 2')) {
            return ['choices' => [['message' => ['content' => json_encode([
                'prompt' => 'Some people believe that unpaid community service should be a compulsory part of high school programs. To what extent do you agree or disagree?',
                'instructions' => 'Write at least 250 words. Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
                'word_limit' => 250,
            ])]]]];
        }

        if (str_contains($userMessage, 'IELTS Writing Task 1')) {
            return ['choices' => [['message' => ['content' => json_encode([
                'prompt' => 'The chart below shows the percentage of households in a country with Internet access from 2010 to 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
                'instructions' => 'Write at least 150 words.',
                'word_limit' => 150,
            ])]]]];
        }

        if (str_contains($userMessage, 'IELTS Speaking Part 1:')) {
            return ['choices' => [['message' => ['content' => json_encode([
                'prompt' => 'Let\'s talk about reading. Do you enjoy reading? What kind of books do you prefer? How often do you read?',
                'instructions' => 'Answer the questions naturally.',
                'follow_up_questions' => ['Why do people enjoy reading?', 'Has digital reading changed reading habits?', 'What was your favorite book as a child?'],
                'preparation_time' => 0,
                'speaking_time' => 60,
            ])]]]];
        }

        if (str_contains($userMessage, 'IELTS Speaking Part 2:')) {
            return ['choices' => [['message' => ['content' => json_encode([
                'prompt' => 'Describe a book that has influenced you. You should say: what the book was, when you read it, what it was about, and explain how it influenced you.',
                'instructions' => 'You will have 1 minute to prepare. Then speak for up to 2 minutes.',
                'follow_up_questions' => [],
                'preparation_time' => 60,
                'speaking_time' => 120,
            ])]]]];
        }

        if (str_contains($userMessage, 'IELTS Speaking Part 3:')) {
            return ['choices' => [['message' => ['content' => json_encode([
                'prompt' => 'Let\'s discuss childhood and memory. How important are childhood memories for personal development? Do you think children today will have different memories compared to past generations?',
                'instructions' => 'Answer the questions naturally.',
                'follow_up_questions' => ['How has technology changed childhood experiences?', 'What role do family traditions play in creating memories?', 'Do you think people remember events better as they get older?'],
                'preparation_time' => 0,
                'speaking_time' => 60,
            ])]]]];
        }

        if (str_contains($userMessage, 'Evaluate this IELTS Speaking')) {
            return ['choices' => [['message' => ['content' => json_encode([
                'band_score' => 6.0,
                'criteria_breakdown' => [
                    'fluency' => 6.0,
                    'lexical_resource' => 6.5,
                    'grammar' => 6.0,
                    'pronunciation' => 5.5,
                ],
                'strengths' => [
                    'Good range of vocabulary related to the topic',
                    'Clear structure with introduction and development',
                    'Appropriate use of complex sentence structures',
                ],
                'areas_for_improvement' => [
                    'Work on pronunciation of specific sounds (th, r, l)',
                    'Use more linking words to connect ideas smoothly',
                    'Avoid long pauses - use filler phrases naturally',
                ],
                'suggested_band' => 6.0,
                'vocabulary_suggestions' => [
                    'Instead of "good", try "beneficial" or "advantageous"',
                    'Instead of "big", try "significant" or "substantial"',
                    'Instead of "many", try "numerous" or "a wide range of"',
                ],
            ])]]]];
        }

        if (str_contains($userMessage, 'Evaluate this IELTS Writing')) {
            return ['choices' => [['message' => ['content' => json_encode([
                'band_score' => 6.5,
                'criteria_breakdown' => [
                    'task_achievement' => 6.5,
                    'coherence' => 6.0,
                    'lexical_resource' => 6.5,
                    'grammar' => 7.0,
                ],
                'strengths' => [
                    'Good use of complex sentence structures',
                    'Clear introduction and conclusion',
                    'Relevant examples provided',
                ],
                'areas_for_improvement' => [
                    'Work on paragraph coherence and linking ideas',
                    'Expand vocabulary range with more academic words',
                    'Check subject-verb agreement in complex sentences',
                ],
                'suggested_band' => 6.5,
            ])]]]];
        }

        return ['choices' => [['message' => ['content' => '{"message":"Mock response"}']]]];
    }
}
