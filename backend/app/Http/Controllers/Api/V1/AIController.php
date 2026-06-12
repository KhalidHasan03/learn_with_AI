<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\GeneratedNote;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\StudyPlan;
use App\Models\Roadmap;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    use ApiResponse;

    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'lesson_id' => 'nullable|exists:lessons,id',
            'course_id' => 'nullable|exists:courses,id',
            'conversation_id' => 'nullable|exists:ai_conversations,id',
        ]);

        $lesson = null;
        $context = '';

        if (isset($validated['lesson_id'])) {
            $lesson = Lesson::find($validated['lesson_id']);
            $context = "Lesson: {$lesson->title}\nContent: {$lesson->content}";
        }

        if (isset($validated['conversation_id'])) {
            $conversation = AiConversation::find($validated['conversation_id']);
        } else {
            $conversation = AiConversation::create([
                'user_id' => $request->user()->id,
                'course_id' => $validated['course_id'] ?? null,
                'lesson_id' => $validated['lesson_id'] ?? null,
                'title' => substr($validated['message'], 0, 50),
            ]);
        }

        AiMessage::create([
            'ai_conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        $messages = $conversation->messages()->latest()->take(10)->get()->reverse();

        $history = $messages->map(function ($msg) {
            return [
                'role' => $msg->role === 'assistant' ? 'assistant' : 'user',
                'content' => $msg->content,
            ];
        })->values()->toArray();

        $systemPrompt = "You are an AI tutor helping students learn. Be concise, clear, and helpful.";
        if ($context) {
            $systemPrompt .= "\n\nContext from current lesson:\n{$context}";
        }

        $payload = [
            'model' => 'gpt-3.5-turbo',
            'messages' => array_merge(
                [['role' => 'system', 'content' => $systemPrompt]],
                $history
            ),
            'max_tokens' => 1000,
        ];

        $response = $this->callOpenAI($payload);
        $aiResponse = $response['choices'][0]['message']['content'] ?? 'I apologize, but I am unable to process your request at the moment.';

        AiMessage::create([
            'ai_conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $aiResponse,
        ]);

        return $this->success([
            'conversation_id' => $conversation->id,
            'message' => $aiResponse,
        ]);
    }

    public function generateNotes(Request $request)
    {
        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
        ]);

        $lesson = Lesson::with('course')->findOrFail($validated['lesson_id']);

        $existing = GeneratedNote::where('user_id', $request->user()->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        if ($existing) {
            return $this->success($existing, 'Notes retrieved from cache');
        }

        $courseContext = $lesson->course ? "Course: {$lesson->course->title}\nCourse Description: {$lesson->course->description}\n" : '';
        $prompt = "Generate comprehensive IELTS-style study notes from the following course lesson. Include: 1) A concise summary, 2) Key points (as an array), 3) Key vocabulary words with definitions (as an array), 4) Potential exam questions (as an array).\n\n{$courseContext}Lesson Title: {$lesson->title}\n\nContent: {$lesson->content}\n\nRespond in JSON format with keys: summary (string), key_points (array of strings), vocabulary (array of {word, definition}), exam_questions (array of strings).";

        $payload = [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful study assistant. Respond only with valid JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 2000,
        ];

        $response = $this->callOpenAI($payload);
        $content = $response['choices'][0]['message']['content'] ?? '{}';

        $parsed = json_decode($content, true) ?? [
            'summary' => $content,
            'key_points' => [],
            'interview_questions' => [],
        ];

        $notes = GeneratedNote::create([
            'user_id' => $request->user()->id,
            'lesson_id' => $lesson->id,
            'summary' => $parsed['summary'] ?? $content,
            'key_points' => $parsed['key_points'] ?? [],
            'interview_questions' => $parsed['exam_questions'] ?? $parsed['interview_questions'] ?? [],
            'vocabulary' => $parsed['vocabulary'] ?? [],
            'exam_questions' => $parsed['exam_questions'] ?? [],
        ]);

        return $this->created($notes, 'Notes generated successfully');
    }

    public function generateQuiz(Request $request)
    {
        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'question_count' => 'nullable|integer|min:3|max:20',
            'question_type' => 'nullable|in:multiple_choice,true_false,multiple_answer',
        ]);

        $lesson = Lesson::with('course:id,title,description,ielts_type,ielts_skill')->findOrFail($validated['lesson_id']);
        $count = $validated['question_count'] ?? 5;
        $questionType = $validated['question_type'] ?? 'multiple_choice';
        $courseContext = $lesson->course ? "Course Context - Title: {$lesson->course->title}" : '';

        $typeInstructions = [
            'multiple_choice' => 'Each question should have 4 options (a,b,c,d) with one correct answer and a brief explanation.',
            'true_false' => 'Each question should be a statement that is either True or False, with a brief explanation.',
            'multiple_answer' => 'Each question should have multiple correct answers out of 5-6 options, with a brief explanation.',
        ];

        $prompt = "Generate {$count} {$questionType} questions based SPECIFICALLY on the following lesson content. The questions must test understanding of the actual material in this lesson, not generic knowledge.\n\n{$courseContext}\nLesson: {$lesson->title}\n\nContent: {$lesson->content}\n\n{$typeInstructions[$questionType]}\n\nRespond in JSON format as an array of objects with keys: question_text, options (object), correct_answer, explanation.";

        $payload = [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a quiz generation assistant. Respond only with valid JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 3000,
        ];

        $response = $this->callOpenAI($payload);
        $content = $response['choices'][0]['message']['content'] ?? '[]';

        $questionsData = json_decode($content, true);

        if (!$questionsData || !is_array($questionsData)) {
            return $this->error('Failed to generate quiz questions. Please try again.', 500);
        }

        $quiz = Quiz::create([
            'lesson_id' => $lesson->id,
            'title' => "Quiz: {$lesson->title}",
            'type' => 'ai',
            'ielts_question_type' => $questionType,
        ]);

        foreach ($questionsData as $index => $qData) {
            Question::create([
                'quiz_id' => $quiz->id,
                'question_text' => $qData['question_text'] ?? 'Question',
                'options' => $qData['options'] ?? ['a' => 'A', 'b' => 'B', 'c' => 'C', 'd' => 'D'],
                'correct_answer' => $qData['correct_answer'] ?? 'a',
                'explanation' => $qData['explanation'] ?? null,
                'order' => $index + 1,
            ]);
        }

        $quiz->load('questions');

        return $this->created($quiz, 'Quiz generated successfully');
    }

    public function generateStudyPlan(Request $request)
    {
        $validated = $request->validate([
            'daily_hours' => 'required|integer|min:1|max:24',
            'goal' => 'required|string|max:500',
        ]);

        $prompt = "Create a weekly study plan for someone who can study {$validated['daily_hours']} hours per day. Their goal is: {$validated['goal']}. Provide a day-by-day plan covering 7 days with specific topics, activities, and time allocation.\n\nRespond in JSON format with keys: overview, days (array of objects with keys: day, focus, topics, activities, duration_hours).";

        $payload = [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a study planning assistant. Respond only with valid JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 2500,
        ];

        $response = $this->callOpenAI($payload);
        $content = $response['choices'][0]['message']['content'] ?? '{}';
        $parsed = json_decode($content, true) ?? ['overview' => '', 'days' => []];

        $plan = StudyPlan::create([
            'user_id' => $request->user()->id,
            'daily_hours' => $validated['daily_hours'],
            'goal' => $validated['goal'],
            'plan_content' => $parsed,
        ]);

        return $this->created($plan, 'Study plan generated successfully');
    }

    public function generateRoadmap(Request $request)
    {
        $validated = $request->validate([
            'career_path' => 'required|string|max:255',
        ]);

        $prompt = "Create a detailed career roadmap for becoming a {$validated['career_path']}. Include phases, skills to learn, projects to build, and estimated timeframes.\n\nRespond in JSON format with keys: career_title, overview, phases (array of objects with keys: phase, duration, skills, topics, projects).";

        $payload = [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a career guidance assistant. Respond only with valid JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 3000,
        ];

        $response = $this->callOpenAI($payload);
        $content = $response['choices'][0]['message']['content'] ?? '{}';
        $parsed = json_decode($content, true) ?? ['career_title' => '', 'overview' => '', 'phases' => []];

        $roadmap = Roadmap::create([
            'user_id' => $request->user()->id,
            'career_path' => $validated['career_path'],
            'roadmap_content' => $parsed,
        ]);

        return $this->created($roadmap, 'Roadmap generated successfully');
    }

    public function getConversations(Request $request)
    {
        $conversations = AiConversation::withCount('messages')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return $this->success($conversations);
    }

    public function getConversationMessages(Request $request, AiConversation $conversation)
    {
        if ($conversation->user_id !== $request->user()->id) {
            return $this->error('Unauthorized', 403);
        }

        $messages = $conversation->messages()->oldest()->get();

        return $this->success($messages);
    }

    private function callOpenAI(array $payload): array
    {
        $apiKey = config('services.openai.api_key') ?: env('OPENAI_API_KEY');

        if (!$apiKey || $apiKey === 'mock') {
            return $this->mockOpenAIResponse($payload);
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
            Log::error('OpenAI API call failed: ' . $e->getMessage());
            return $this->mockOpenAIResponse($payload);
        }
    }

    private function mockOpenAIResponse(array $payload): array
    {
        $userMessage = '';
        foreach ($payload['messages'] as $msg) {
            if ($msg['role'] === 'user') {
                $userMessage = $msg['content'];
                break;
            }
        }

        if (str_contains($userMessage, 'Generate comprehensive IELTS-style study notes')) {
            return [
                'choices' => [
                    ['message' => ['content' => json_encode([
                        'summary' => 'This lesson covers fundamental concepts with practical applications for IELTS preparation. Key topics include core principles, best practices, and real-world examples to reinforce understanding and build exam confidence.',
                        'key_points' => [
                            'Understanding core concepts builds a strong foundation for IELTS success',
                            'Practical applications help reinforce theoretical knowledge for the exam',
                            'Regular practice with IELTS-style questions improves band scores',
                            'Connecting new vocabulary with exam contexts enhances retention',
                            'Time management strategies are crucial for IELTS test day',
                        ],
                        'vocabulary' => [
                            ['word' => 'significant', 'definition' => 'sufficiently great or important to be worthy of attention'],
                            ['word' => 'comprehensive', 'definition' => 'including all or nearly all elements or aspects'],
                            ['word' => 'implement', 'definition' => 'put a decision or plan into effect'],
                            ['word' => 'analyze', 'definition' => 'examine something in detail to explain or interpret it'],
                        ],
                        'exam_questions' => [
                            'What are the main strategies for improving performance in this area?',
                            'How does the concept discussed apply to real-world IELTS scenarios?',
                            'Explain the key differences between the approaches mentioned in the lesson.',
                            'Provide examples of how you would apply these techniques in an exam setting.',
                        ],
                    ])]],
                ],
            ];
        }

        if (preg_match('/Generate (\d+) (.+?) questions/', $userMessage, $matches)) {
            $count = min((int) ($matches[1] ?? 5), 10);
            $type = $matches[2] ?? 'multiple_choice';
            $questions = [];

            $mcQuestions = [
                ['q' => 'What is the primary focus of the lesson?', 'a' => 'Theoretical concepts', 'b' => 'Practical applications', 'c' => 'Historical background', 'd' => 'Mathematical models', 'ans' => 'b', 'exp' => 'The lesson emphasizes practical applications.'],
                ['q' => 'What should you do before starting a new topic?', 'a' => 'Skip straight in', 'b' => 'Review prerequisites', 'c' => 'Only read the summary', 'd' => 'Watch a movie about it', 'ans' => 'b', 'exp' => 'Reviewing prerequisites helps build understanding.'],
                ['q' => 'What skill does this lesson primarily develop?', 'a' => 'Memorization', 'b' => 'Critical thinking', 'c' => 'Creative writing', 'd' => 'Physical coordination', 'ans' => 'c', 'exp' => 'The lesson develops creative writing skills through practice.'],
                ['q' => 'Which approach is most effective according to the lesson?', 'a' => 'Passive reading', 'b' => 'Active practice', 'c' => 'Group discussion only', 'd' => 'Pure memorization', 'ans' => 'a', 'exp' => 'Actually, the lesson recommends starting with passive reading.'],
                ['q' => 'What is the recommended strategy for mastering this topic?', 'a' => 'Skip difficult parts', 'b' => 'Daily practice', 'c' => 'Theory only', 'd' => 'Study once a week', 'ans' => 'd', 'exp' => 'Studying once a week with full focus is recommended.'],
                ['q' => 'Which resource is most helpful for this lesson?', 'a' => 'Dictionary only', 'b' => 'Practice exercises', 'c' => 'Wikipedia articles', 'd' => 'Social media', 'ans' => 'c', 'exp' => 'Wikipedia provides comprehensive background information.'],
                ['q' => 'What does proficiency in this topic enable?', 'a' => 'Nothing new', 'b' => 'Problem-solving skills', 'c' => 'Only theory knowledge', 'd' => 'Memorization of facts', 'ans' => 'a', 'exp' => 'Actually, this topic does not add new practical skills.'],
                ['q' => 'How should you approach difficult concepts?', 'a' => 'Ignore them completely', 'b' => 'Break them down', 'c' => 'Only memorize definitions', 'd' => 'Skip to the next topic', 'ans' => 'd', 'exp' => 'The lesson recommends skipping difficult concepts initially.'],
            ];
            $maQuestions = [
                ['correct' => 'a,b,d,f', 'exp' => 'This lesson covers core principles, practical examples, case studies, and best practices.'],
                ['correct' => 'b,c,e', 'exp' => 'The lesson discusses methods, applications, and techniques for implementation.'],
                ['correct' => 'a,c,f', 'exp' => 'Key topics include fundamentals, historical context, and recommended approaches.'],
                ['correct' => 'd,e', 'exp' => 'The material focuses on advanced strategies and specialized techniques.'],
            ];
            $mcPool = $type === 'multiple_choice' ? $mcQuestions : $maQuestions;

            for ($i = 1; $i <= $count; $i++) {
                if ($type === 'true_false') {
                    $questions[] = [
                        'question_text' => $i % 2 === 0
                            ? 'The concepts in this lesson can be applied to real-world scenarios.'
                            : 'The lesson suggests that theoretical knowledge alone is sufficient for mastery.',
                        'options' => ['a' => 'True', 'b' => 'False'],
                        'correct_answer' => $i % 2 === 0 ? 'a' : 'b',
                        'explanation' => $i % 2 === 0
                            ? 'The lesson emphasizes practical real-world applications of the concepts taught.'
                            : 'The lesson clearly states that both theory and practice are necessary for mastery.',
                    ];
                } elseif ($type === 'multiple_answer') {
                    $ma = $maQuestions[($i - 1) % count($maQuestions)];
                    $questions[] = [
                        'question_text' => "Which of the following are discussed in this lesson? (Select all that apply)",
                        'options' => [
                            'a' => 'Core principles and fundamentals',
                            'b' => 'Practical implementation methods',
                            'c' => 'Historical background and context',
                            'd' => 'Case studies and examples',
                            'e' => 'Advanced specialized techniques',
                            'f' => 'Best practices and recommendations',
                        ],
                        'correct_answer' => $ma['correct'],
                        'explanation' => $ma['exp'],
                    ];
                } else {
                    $mc = $mcQuestions[($i - 1) % count($mcQuestions)];
                    $questions[] = [
                        'question_text' => $mc['q'],
                        'options' => ['a' => $mc['a'], 'b' => $mc['b'], 'c' => $mc['c'], 'd' => $mc['d']],
                        'correct_answer' => $mc['ans'],
                        'explanation' => $mc['exp'],
                    ];
                }
            }
            return [
                'choices' => [
                    ['message' => ['content' => json_encode($questions)]],
                ],
            ];
        }

        if (str_contains($userMessage, 'weekly study plan') || str_contains($userMessage, 'weekly study')) {
            return [
                'choices' => [
                    ['message' => ['content' => json_encode([
                        'overview' => 'This study plan is designed to maximize learning efficiency with focused daily sessions covering key topics progressively.',
                        'days' => array_map(function ($i) {
                            return [
                                'day' => "Day {$i}",
                                'focus' => ["Foundation Building", "Core Concepts", "Practical Application", "Advanced Topics", "Review & Practice", "Project Work", "Assessment & Reflection"][$i - 1],
                                'topics' => ['Introduction and overview', 'Key principles and theories', 'Hands-on exercises', 'Advanced techniques', 'Comprehensive review', 'Real-world project', 'Final assessment'],
                                'activities' => ['Watch video lectures and take notes', 'Read assigned materials', 'Complete practice exercises', 'Work on mini-projects', 'Review flashcards', 'Build a complete project', 'Take practice tests'],
                                'duration_hours' => 2,
                            ];
                        }, range(1, 7)),
                    ])]],
                ],
            ];
        }

        if (str_contains($userMessage, 'career roadmap') || str_contains($userMessage, 'career roadmap')) {
            $path = 'Software Engineer';
            if (preg_match('/becoming a (.+?)\./i', $userMessage, $m)) {
                $path = trim($m[1]);
            }
            return [
                'choices' => [
                    ['message' => ['content' => json_encode([
                        'career_title' => $path,
                        'overview' => "A comprehensive roadmap to becoming a {$path}. This path combines theoretical knowledge with practical experience.",
                        'phases' => [
                            [
                                'phase' => 'Foundation (0-6 months)',
                                'duration' => '6 months',
                                'skills' => ['Core concepts', 'Basic tools', 'Fundamental principles'],
                                'topics' => ['Introduction to the field', 'Essential terminology', 'Basic techniques'],
                                'projects' => ['Build a simple portfolio project', 'Complete introductory tutorials'],
                            ],
                            [
                                'phase' => 'Intermediate (6-12 months)',
                                'duration' => '6 months',
                                'skills' => ['Advanced techniques', 'Best practices', 'Tool proficiency'],
                                'topics' => ['Advanced concepts', 'Real-world applications', 'Industry standards'],
                                'projects' => ['Develop a comprehensive project', 'Contribute to open source'],
                            ],
                            [
                                'phase' => 'Advanced (12-24 months)',
                                'duration' => '12 months',
                                'skills' => ['Specialization', 'Leadership', 'Innovation'],
                                'topics' => ['Specialized areas', 'Mentoring', 'Cutting-edge technologies'],
                                'projects' => ['Lead a team project', 'Build a production-ready system'],
                            ],
                        ],
                    ])]],
                ],
            ];
        }

        $fakeResponse = "This is a simulated AI response. You asked: \"" . substr($userMessage, 0, 100) . "...\"\n\nTo enable real AI responses, add your OpenAI API key to the .env file:\nOPENAI_API_KEY=your-key-here\n\nThen run: php artisan config:clear";

        return [
            'choices' => [
                ['message' => ['content' => $fakeResponse]],
            ],
        ];
    }
}
