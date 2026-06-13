# 🚀 AI Learning Platform

An AI-powered e-learning platform built with Laravel and React that combines online education, IELTS preparation, personalized AI assistance, gamification, and intelligent learning tools into a single modern learning ecosystem.

---

## 🌟 Overview

AI Learning Platform is designed to provide students with a personalized and engaging learning experience. The platform offers course management, AI-powered tutoring, IELTS preparation tools, progress tracking, achievements, and interactive learning features.

Whether users want to learn programming, improve IELTS scores, or follow a structured career roadmap, the platform provides AI-driven guidance throughout the learning journey.

---

## ✨ Features

### 🔐 Authentication & User Management

- Laravel Sanctum Token-Based Authentication
- Secure User Registration & Login
- Role-Based Access Control (Student & Admin)
- Profile Management
- Avatar Generation Based on User Initials

---

### 📚 Course Management

- 8 Pre-Seeded Courses
- 4 Course Categories
  - Programming
  - Web Development
  - Data Science
  - IELTS
- Course CRUD Operations
- Lesson Management
- Video URL Support
- Duration Tracking
- Enrollment System
- Learning Progress Tracking
- Lesson Completion Tracking
- Continue Learning Section
- Course Search Functionality
- Difficulty Filtering
  - Beginner
  - Intermediate
  - Advanced

---

### 🤖 AI-Powered Features

#### AI Chat Tutor

- Context-Aware Learning Assistant
- Lesson & Course Specific Conversations
- Conversation History Support
- Voice Input Support (Web Speech API)
- Text-To-Speech Responses

#### AI Notes Generator

Generate:

- Study Summaries
- Key Learning Points
- Important Vocabulary
- Exam-Oriented Questions

#### AI Quiz Generator

Generate:

- Multiple Choice Questions (MCQ)
- True/False Questions
- Multiple Answer Questions

#### AI Study Planner

- Personalized 7-Day Study Plan
- Goal-Based Recommendations
- Daily Study Hour Optimization

#### AI Career Roadmap

- Structured Career Paths
- Skill Recommendations
- Project Suggestions
- Learning Milestones

#### Mock AI Mode

- Fully Functional Without OpenAI API Key
- Intelligent Fallback Responses

---

### 🎯 IELTS Preparation Module

#### 📊 Band Score Dashboard

Track Performance Across:

- Writing
- Speaking
- Quiz Assessments

#### ✍️ Writing Practice

- Task 1 Evaluation
- Task 2 Evaluation
- AI Band Score Prediction
- Detailed Criteria Breakdown

#### 🎙️ Speaking Practice

- Part 1 Practice
- Part 2 Practice
- Part 3 Practice
- Countdown Timer
- AI Feedback & Scoring

#### 📖 Vocabulary Builder

- AI-Generated Vocabulary
- Manual Vocabulary Management
- Search & Filter Support
- Progress Tracking

#### 🗣️ Speaking Prompts

- AI-Generated Topics
- Follow-Up Questions
- Built-In Practice Timer

---

### 🏆 Gamification System

#### XP Rewards

| Activity | XP |
|----------|----|
| Lesson Completion | 10 |
| Quiz Pass | 20 |
| Perfect Quiz Score | 50 |
| Course Completion | 100 |

#### Level System

- 10 User Levels
- XP-Based Progression

#### Streak Tracking

- Daily Login Streaks
- Consistency Rewards

#### Achievement Badges

- First Steps
- Dedicated Learner
- Perfect Score
- Quiz Master
- Course Graduate
- Consistent Learner
- Unstoppable
- And More...

#### Leaderboard

- Top 20 Users Ranked By XP

---

### 📊 Admin Dashboard

- Platform Statistics
- User Management
- Role Management
- Course Management
- Lesson Management
- Enrollment Analytics
- Popular Course Tracking
- AI Usage Monitoring

---

### 🎨 Modern User Experience

- Full Dark Mode
- System Theme Detection
- Mobile-First Responsive Design
- Sticky Navigation Bar
- Backdrop Blur Effects
- Canvas Particle Background
- Smooth Page Animations
- Scroll-Based Animations
- Custom CSS Effects

#### Included Animations

- Fade
- Slide
- Float
- Pulse
- Shimmer
- Bounce
- And More...

---

## 🛠️ Technology Stack

### Backend

- Laravel
- Laravel Sanctum
- MySQL
- REST API

### Frontend

- React
- JavaScript
- Tailwind CSS
- Web Speech API

### AI Integration

- OpenAI GPT-3.5 Turbo

---

## 📸 Screenshots

### 🏠 Dashboard (1)
![Dashboard 1](screenshots/Dashboard1.png)

### 🏠 Dashboard (2)
![Dashboard 2](screenshots/Dashboard2.png)

### 🏠 Dashboard (3)
![Dashboard 3](screenshots/Dashboard3.png)

### 📊 IELTS Dashboard
![IELTS Dashboard](screenshots/ielts_Dashboard.png)

### 📖 Vocabulary Builder
![Vocabulary Builder](screenshots/vocabulary.png)

### ✍️ IELTS Writing Practice
![Writing Practice](screenshots/WrittingPractice.png)

### 📈 IELTS Writing Result
![Writing Result](screenshots/writingResult.png)

### 🤖 AI Chat Tutor
![AI Tutor](screenshots/AiTutor.png)

### 📚 Course Explorer
![Courses](screenshots/courses.png)

### 👤 User Profile
![Profile](screenshots/profile.png)

### 🎙️ Speaking Interview (1)
![Speaking Interview 1](screenshots/speaking_Interview1.png)

### 🎙️ Speaking Interview (2)
![Speaking Interview 2](screenshots/speaking_Interview2.png)

### 🗣️ Speaking Practice
![Speaking Practice](screenshots/speakingPractice.png)


---

## 🚀 Installation Guide

### Clone The Repository

```bash
git clone https://github.com/your-username/ai-learning-platform.git
```

### Backend Setup

```bash
cd backend

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate --seed

php artisan serve
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 📂 Project Structure

```text
backend/
├── app/
├── database/
├── routes/
├── storage/
└── tests/

frontend/
├── src/
├── components/
├── pages/
├── services/
└── assets/
```

---

## 📈 Future Enhancements

- Live Classes
- Video Conferencing Integration
- Certificate Generation
- Payment Gateway Integration
- Mobile Application
- Multi-Language Support
- AI Interview Preparation Module
- AI Resume Builder

---

## 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Khalid Hasan Shafi**

Laravel Backend Developer | Full Stack Web Developer

### Connect With Me

- LinkedIn: https://linkedin.com/in/halid-hasan-shafi
- GitHub: https://github.com/KhalidHasan03

---

⭐ If you found this project useful, please consider giving it a star on GitHub.
