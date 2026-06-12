<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Badge;
use App\Models\Achievement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin1234'),
            'role' => 'admin',
        ]);

        // Test student
        $testUser = User::create([
            'name' => 'Test Student',
            'email' => 'student@test.com',
            'password' => Hash::make('test1234'),
            'role' => 'student',
            'xp_points' => 150,
            'level' => 3,
            'streak_count' => 5,
            'last_activity_at' => now(),
        ]);

        // Categories
        $categories = [
            ['name' => 'Web Development', 'slug' => 'web-development', 'description' => 'Build modern web applications'],
            ['name' => 'Data Science', 'slug' => 'data-science', 'description' => 'Learn data analysis and ML'],
            ['name' => 'Mobile Development', 'slug' => 'mobile-development', 'description' => 'Create mobile apps'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // Courses with lessons
        $coursesData = [
            [
                'title' => 'Laravel 10 Masterclass',
                'description' => 'Learn Laravel 10 from scratch. Build REST APIs, use Eloquent, implement authentication, and deploy production-ready applications.',
                'difficulty_level' => 'beginner',
                'category_index' => 0,
                'lessons' => [
                    ['title' => 'Introduction to Laravel', 'content' => 'Laravel is a PHP web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling.', 'duration' => 15, 'order' => 1],
                    ['title' => 'Routing & Controllers', 'content' => 'Laravel routes are defined in routes files. Controllers handle incoming requests and return responses. Learn how to organize your application logic.', 'duration' => 25, 'order' => 2],
                    ['title' => 'Eloquent ORM Basics', 'content' => 'Eloquent is Laravel\'s ORM. It provides a beautiful, simple ActiveRecord implementation for working with your database. Each database table has a corresponding Model.', 'duration' => 30, 'order' => 3],
                    ['title' => 'Authentication with Sanctum', 'content' => 'Laravel Sanctum provides a featherweight authentication system for SPAs and simple APIs. Learn token-based authentication and API security.', 'duration' => 20, 'order' => 4],
                ],
            ],
            [
                'title' => 'React 19 Complete Guide',
                'description' => 'Master React 19 with hooks, context, routing, state management, and modern patterns. Build real-world applications.',
                'difficulty_level' => 'beginner',
                'category_index' => 0,
                'lessons' => [
                    ['title' => 'React Fundamentals', 'content' => 'React is a JavaScript library for building user interfaces. Learn about components, JSX, props, and the virtual DOM.', 'duration' => 20, 'order' => 1],
                    ['title' => 'Hooks Deep Dive', 'content' => 'Hooks let you use state and other React features without writing a class. Master useState, useEffect, useContext, and custom hooks.', 'duration' => 35, 'order' => 2],
                    ['title' => 'State Management', 'content' => 'Learn different state management approaches in React. From useState to useContext to Zustand and Redux.', 'duration' => 30, 'order' => 3],
                ],
            ],
            [
                'title' => 'Python for Data Science',
                'description' => 'Learn Python programming for data analysis, visualization, and machine learning. Hands-on with real datasets.',
                'difficulty_level' => 'intermediate',
                'category_index' => 1,
                'lessons' => [
                    ['title' => 'Python Basics for Data Science', 'content' => 'Learn Python fundamentals: data types, control flow, functions, and list comprehensions essential for data analysis.', 'duration' => 25, 'order' => 1],
                    ['title' => 'NumPy & Pandas', 'content' => 'NumPy provides numerical computing. Pandas offers DataFrames for data manipulation. These are the foundation of data science in Python.', 'duration' => 40, 'order' => 2],
                ],
            ],
        ];

        foreach ($coursesData as $courseData) {
            $category = Category::skip($courseData['category_index'])->first();

            $course = Course::create([
                'user_id' => $testUser->id,
                'category_id' => $category?->id,
                'title' => $courseData['title'],
                'slug' => Str::slug($courseData['title']) . '-' . Str::random(6),
                'description' => $courseData['description'],
                'difficulty_level' => $courseData['difficulty_level'],
                'status' => 'published',
            ]);

            foreach ($courseData['lessons'] as $lessonData) {
                Lesson::create([
                    'course_id' => $course->id,
                    'title' => $lessonData['title'],
                    'content' => $lessonData['content'],
                    'duration' => $lessonData['duration'],
                    'order' => $lessonData['order'],
                ]);
            }
        }

        // ─── IELTS Category ───
        $ieltsCat = Category::create([
            'name' => 'IELTS Preparation',
            'slug' => 'ielts-preparation',
            'description' => 'Comprehensive IELTS preparation covering Listening, Reading, Writing, and Speaking skills',
        ]);

        // ─── IELTS Courses ───
        $ieltsCourses = [
            [
                'title' => 'IELTS Listening Mastery',
                'description' => 'Develop essential listening skills for IELTS Academic and General Training. Practice with various accents, question types including form completion, map labeling, and multiple choice.',
                'difficulty_level' => 'intermediate',
                'ielts_type' => 'academic',
                'ielts_skill' => 'listening',
                'ielts_band_required' => 6,
                'lessons' => [
                    ['title' => 'Section 1: Everyday Conversations', 'content' => 'Master listening for Section 1 which involves a conversation between two people in an everyday social context. Learn to identify key information like names, dates, prices, and phone numbers. Practice with common scenarios: hotel bookings, library registrations, and course enrollments.', 'duration' => 25, 'order' => 1],
                    ['title' => 'Section 2: Monologues & Talks', 'content' => 'Focus on Section 2 featuring a monologue about everyday topics. Develop skills for understanding guided tours, radio broadcasts, orientation talks. Learn to follow signposting language and track information flow.', 'duration' => 30, 'order' => 2],
                    ['title' => 'Section 3: Academic Discussions', 'content' => 'Tackle Section 3 with conversations between up to four people in an academic context. Practice identifying opinions, agreements, disagreements, and following complex discussion patterns between tutors and students.', 'duration' => 30, 'order' => 3],
                    ['title' => 'Section 4: Academic Lectures', 'content' => 'Master Section 4 academic monologues. Develop note-taking strategies, learn to identify main ideas vs supporting details, and practice with lectures on topics like environmental science, economics, and sociology.', 'duration' => 35, 'order' => 4],
                ],
            ],
            [
                'title' => 'IELTS Reading Strategies',
                'description' => 'Comprehensive reading course covering all IELTS question types: true/false/not given, matching headings, sentence completion, and multiple choice. Build skimming and scanning techniques.',
                'difficulty_level' => 'intermediate',
                'ielts_type' => 'academic',
                'ielts_skill' => 'reading',
                'ielts_band_required' => 6,
                'lessons' => [
                    ['title' => 'Skimming & Scanning Techniques', 'content' => 'Learn rapid reading strategies. Skimming for gist and main ideas. Scanning for specific information like names, dates, and keywords. Practice timed exercises to improve reading speed while maintaining comprehension.', 'duration' => 25, 'order' => 1],
                    ['title' => 'True/False/Not Given Mastery', 'content' => 'Master the most challenging question type. Understand the subtle differences between false and not given. Learn to identify paraphrasing and distinguish between direct contradictions and missing information.', 'duration' => 30, 'order' => 2],
                    ['title' => 'Matching Headings & Features', 'content' => 'Develop strategies for matching headings to paragraphs and matching features to options. Learn to identify topic sentences, paragraph structure, and distinguish between main ideas and supporting details.', 'duration' => 30, 'order' => 3],
                    ['title' => 'Summary & Sentence Completion', 'content' => 'Master gap-fill questions including summary completion, sentence completion, and table/diagram labeling. Build vocabulary for recognizing synonyms and paraphrasing in academic texts.', 'duration' => 25, 'order' => 4],
                ],
            ],
            [
                'title' => 'IELTS Writing Task 1 & 2',
                'description' => 'Comprehensive writing preparation for both Academic and General Training modules. Learn essay structure, data interpretation, and advanced grammar for band 7+ scores.',
                'difficulty_level' => 'advanced',
                'ielts_type' => 'academic',
                'ielts_skill' => 'writing',
                'ielts_band_required' => 6.5,
                'lessons' => [
                    ['title' => 'Task 1: Describing Visual Data', 'content' => 'Learn to describe charts, graphs, tables, and diagrams. Master language for trends, comparisons, and data highlights. Practice structuring your response with clear overview and detailed paragraphs.', 'duration' => 35, 'order' => 1],
                    ['title' => 'Task 1: Process & Map Descriptions', 'content' => 'Develop skills for describing processes, flowcharts, and map changes. Learn sequential language, passive constructions, and how to organize spatial descriptions clearly.', 'duration' => 30, 'order' => 2],
                    ['title' => 'Task 2: Opinion & Discussion Essays', 'content' => 'Master opinion essays, discussion essays, and problem-solution essays. Learn thesis statements, paragraph development, and balancing arguments. Practice with real IELTS past paper topics.', 'duration' => 40, 'order' => 3],
                    ['title' => 'Grammar & Vocabulary for Band 7+', 'content' => 'Advanced grammar structures including complex sentences, conditional clauses, and nominalization. Academic vocabulary building for common IELTS topics: education, environment, technology, health, and society.', 'duration' => 30, 'order' => 4],
                ],
            ],
            [
                'title' => 'IELTS Speaking Confidence',
                'description' => 'Build fluency and confidence for the IELTS speaking test. Cover all three parts with mock interviews, pronunciation practice, and topic-specific vocabulary.',
                'difficulty_level' => 'intermediate',
                'ielts_type' => 'academic',
                'ielts_skill' => 'speaking',
                'ielts_band_required' => 6,
                'lessons' => [
                    ['title' => 'Part 1: Introduction & Interview', 'content' => 'Master Part 1 questions about yourself, your home, work, studies, and interests. Learn to give extended answers with examples. Practice common topics: hobbies, food, travel, technology, and daily routines.', 'duration' => 25, 'order' => 1],
                    ['title' => 'Part 2: The Long Turn (Cue Card)', 'content' => 'Develop strategies for the 2-minute monologue. Learn to structure your talk with a clear beginning, middle, and end. Practice with 50+ common cue card topics covering people, places, objects, and experiences.', 'duration' => 30, 'order' => 2],
                    ['title' => 'Part 3: Two-Way Discussion', 'content' => 'Tackle abstract questions in Part 3. Learn to express opinions, speculate, analyze, and evaluate. Practice discussing society, culture, education, and global issues with sophisticated vocabulary.', 'duration' => 30, 'order' => 3],
                    ['title' => 'Pronunciation & Fluency Boost', 'content' => 'Focus on pronunciation features: word stress, sentence stress, intonation, and connected speech. Practice fluency-building exercises, filler phrases, and discourse markers for natural-sounding speech.', 'duration' => 25, 'order' => 4],
                ],
            ],
            [
                'title' => 'IELTS General Training Reading & Writing',
                'description' => 'Focused preparation for General Training module candidates. Cover GT reading passages and letter writing tasks with real-world scenarios.',
                'difficulty_level' => 'intermediate',
                'ielts_type' => 'general_training',
                'ielts_skill' => 'reading',
                'ielts_band_required' => 5.5,
                'lessons' => [
                    ['title' => 'GT Section 1: Everyday Texts', 'content' => 'Practice with short texts from everyday life: advertisements, notices, timetables, and brochures. Learn to quickly locate specific information and understand practical details.', 'duration' => 20, 'order' => 1],
                    ['title' => 'GT Section 2: Workplace & Training', 'content' => 'Develop skills for workplace-related texts: job descriptions, training manuals, contracts, and staff handbooks. Build professional vocabulary and workplace communication understanding.', 'duration' => 25, 'order' => 2],
                    ['title' => 'GT Section 3: Extended Reading', 'content' => 'Master longer, more complex GT reading passages on general interest topics. Practice all question types including matching, completion, and multiple choice with extended texts.', 'duration' => 30, 'order' => 3],
                    ['title' => 'GT Writing Task 1: Letter Writing', 'content' => 'Learn formal, semi-formal, and informal letter structures. Practice all letter types: complaint, request, invitation, application, and apology. Master tone and appropriate language for each.', 'duration' => 30, 'order' => 4],
                ],
            ],
        ];

        foreach ($ieltsCourses as $courseData) {
            $course = Course::create([
                'user_id' => $testUser->id,
                'category_id' => $ieltsCat->id,
                'title' => $courseData['title'],
                'slug' => Str::slug($courseData['title']) . '-' . Str::random(6),
                'description' => $courseData['description'],
                'difficulty_level' => $courseData['difficulty_level'],
                'status' => 'published',
                'ielts_type' => $courseData['ielts_type'],
                'ielts_skill' => $courseData['ielts_skill'],
                'ielts_band_required' => $courseData['ielts_band_required'],
            ]);

            foreach ($courseData['lessons'] as $lessonData) {
                Lesson::create([
                    'course_id' => $course->id,
                    'title' => $lessonData['title'],
                    'content' => $lessonData['content'],
                    'duration' => $lessonData['duration'],
                    'order' => $lessonData['order'],
                ]);
            }
        }

        // Sample badges for test user
        Badge::create([
            'user_id' => $testUser->id,
            'badge_type' => 'first_lesson',
            'badge_name' => 'First Steps',
            'description' => 'Completed your first lesson',
        ]);

        Badge::create([
            'user_id' => $testUser->id,
            'badge_type' => 'streak_3',
            'badge_name' => 'Consistent',
            'description' => '3-day learning streak',
        ]);

        // Sample achievements for test user
        Achievement::create([
            'user_id' => $testUser->id,
            'achievement_type' => 'badge_earned:first_lesson',
            'metadata' => ['badge_name' => 'First Steps', 'badge_type' => 'first_lesson'],
        ]);

        Achievement::create([
            'user_id' => $testUser->id,
            'achievement_type' => 'badge_earned:streak_3',
            'metadata' => ['badge_name' => 'Consistent', 'badge_type' => 'streak_3'],
        ]);
    }
}
