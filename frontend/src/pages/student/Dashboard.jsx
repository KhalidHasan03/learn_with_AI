import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

function StatCard({ icon, label, value, gradient, accent, delay, suffix, progress }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl text-white shadow-lg shadow-${accent}-200 animate-fade-in-up`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-3xl font-bold">{value}{suffix}</p>
          <p className="text-white/80 text-sm mt-1">{label}</p>
        </div>
        <span className="text-2xl opacity-50">{icon}</span>
      </div>
      {progress !== undefined && (
        <div className="mt-3 bg-white/20 dark:bg-gray-800/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white dark:bg-gray-800 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

function CourseCard({ enrollment, index }) {
  return (
    <div
      className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">{enrollment.course?.title}</h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-2 ${
          enrollment.progress_percentage === 100 ? 'bg-emerald-50 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 text-indigo-600 dark:text-indigo-400'
        }`}>
          {enrollment.progress_percentage === 100 ? '✅ Completed' : `${enrollment.progress_percentage}%`}
        </span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
            enrollment.progress_percentage === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
          }`}
          style={{ width: `${enrollment.progress_percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">{enrollment.progress_percentage}% complete</span>
        <Link to={`/courses/${enrollment.course?.slug}`}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium inline-flex items-center gap-1 group/link">
          <span>Continue Learning</span>
          <span className="inline-block group-hover/link:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [enrollments, setEnrollments] = useState([])
  const [gamification, setGamification] = useState({ streak_count: 0, xp_points: 0, level: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/my-courses'),
      api.get('/user/points'),
    ])
      .then(([courses, points]) => {
        setEnrollments(courses.data.data)
        setGamification(points.data.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalXp = gamification.xp_points
  const xpForNext = gamification.level * 100
  const xpProgress = Math.min((totalXp % 100) / 100 * 100, 100)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-10 animate-fade-in-down">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Here's your learning progress overview</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-5 mb-10">
        <StatCard
          icon="⚡"
          label="XP Points"
          value={gamification.xp_points}
          gradient="from-indigo-500 to-indigo-600"
          accent="indigo"
          delay={0.1}
          progress={xpProgress}
          suffix=""
        />
        <StatCard
          icon="🏅"
          label="Current Level"
          value={`Level ${gamification.level}`}
          gradient="from-emerald-500 to-emerald-600"
          accent="emerald"
          delay={0.2}
        />
        <StatCard
          icon="📚"
          label="Enrolled Courses"
          value={enrollments.length}
          gradient="from-purple-500 to-purple-600"
          accent="purple"
          delay={0.3}
        />
        <StatCard
          icon="🔥"
          label="Day Streak"
          value={gamification.streak_count}
          gradient="from-amber-500 to-orange-600"
          accent="amber"
          delay={0.4}
          suffix=" days"
        />
      </div>

      {/* Level Progress Context */}
      {gamification.level < 10 && (
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Progress to Level {gamification.level + 1}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{totalXp} / {gamification.level * 100} XP</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                style={{ width: `${(totalXp / (gamification.level * 100)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* My Courses */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Courses</h2>
          <Link to="/courses" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-medium inline-flex items-center gap-1 group">
            <span>Browse More</span>
            <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        {enrollments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-scale-in">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-md font-medium inline-block transition-all hover:-translate-y-0.5">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {enrollments.map((enrollment, i) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* AI Tools */}
      <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-5">AI Learning Tools</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { to: '/ai-chat', icon: '🤖', title: 'AI Tutor', desc: 'Chat with voice support', gradient: 'from-indigo-500 to-purple-600' },
            { to: '/study-plan', icon: '📅', title: 'Study Plan', desc: 'Personalized weekly plan', gradient: 'from-emerald-500 to-teal-600' },
            { to: '/roadmap', icon: '🗺️', title: 'Roadmap', desc: 'Career guidance', gradient: 'from-amber-500 to-orange-600' },
            { to: '/profile', icon: '🏆', title: 'Profile', desc: 'Badges & leaderboard', gradient: 'from-pink-500 to-rose-600' },
          ].map((tool, i) => (
            <Link
              key={i}
              to={tool.to}
              className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
                {tool.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">{tool.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
