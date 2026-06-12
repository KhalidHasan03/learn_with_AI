import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/public/Landing'
import CourseList from './pages/public/CourseList'
import CourseDetail from './pages/public/CourseDetail'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/student/Dashboard'
import LearningPage from './pages/student/LearningPage'
import AIChat from './pages/student/AIChat'
import AINotes from './pages/student/AINotes'
import QuizPage from './pages/student/QuizPage'
import StudyPlan from './pages/student/StudyPlan'
import RoadmapPage from './pages/student/RoadmapPage'
import Profile from './pages/student/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import IeltsDashboard from './pages/ielts/IeltsDashboard'
import WritingPractice from './pages/ielts/WritingPractice'
import VocabularyBuilder from './pages/ielts/VocabularyBuilder'
import SpeakingPractice from './pages/ielts/SpeakingPractice'
import useAuthStore from './store/authStore'

export default function App() {
  const { user } = useAuthStore()

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/learn/:lessonId" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
          <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          <Route path="/ai-notes/:lessonId" element={<ProtectedRoute><AINotes /></ProtectedRoute>} />
          <Route path="/quiz/:lessonId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/ielts/dashboard" element={<ProtectedRoute><IeltsDashboard /></ProtectedRoute>} />
          <Route path="/ielts/writing" element={<ProtectedRoute><WritingPractice /></ProtectedRoute>} />
          <Route path="/ielts/vocabulary" element={<ProtectedRoute><VocabularyBuilder /></ProtectedRoute>} />
          <Route path="/ielts/speaking" element={<ProtectedRoute><SpeakingPractice /></ProtectedRoute>} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}
