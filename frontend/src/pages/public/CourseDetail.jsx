import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

const gradients = {
  beginner: 'from-emerald-500 to-teal-600',
  intermediate: 'from-indigo-500 to-purple-600',
  advanced: 'from-purple-500 to-pink-600',
}

export default function CourseDetail() {
  const { slug } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    setShowContent(false)
    api.get(`/courses/${slug}`)
      .then(({ data }) => setCourse(data.data))
      .catch(console.error)
      .finally(() => {
        setLoading(false)
        setTimeout(() => setShowContent(true), 50)
      })
  }, [slug])

  const handleEnroll = async () => {
    if (!user) return
    setEnrolling(true)
    try {
      await api.post(`/enroll/${course.id}`)
      navigate(`/courses/${slug}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll')
    }
    setEnrolling(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )

  if (!course) return (
    <div className="text-center py-20 animate-scale-in">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-gray-500 dark:text-gray-400 text-lg">Course not found</p>
      <Link to="/courses" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">← Back to Courses</Link>
    </div>
  )

  const grad = gradients[course.difficulty_level] || 'from-indigo-500 to-purple-600'

  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500 dark:text-gray-400 animate-fade-in-down">
        <Link to="/courses" className="hover:text-indigo-600 dark:text-indigo-400 transition-colors">Courses</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">{course.title}</span>
      </div>

      {/* Hero */}
      <div className={`bg-gradient-to-br ${grad} rounded-2xl p-8 md:p-10 text-white mb-8 shadow-xl relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative">
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-full text-xs font-medium capitalize">{course.difficulty_level}</span>
            <span className="px-3 py-1 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-full text-xs font-medium">{course.category?.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{course.title}</h1>
          <p className="text-white/80 text-lg mb-6 leading-relaxed">{course.description}</p>
          <div className="flex flex-wrap gap-6 text-sm text-white/70 mb-6">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              {course.lessons_count} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {course.enrollments_count} students
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              By {course.user?.name}
            </span>
          </div>
          {user ? (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-gray-50 dark:bg-gray-900 disabled:opacity-50 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now →'}
            </button>
          ) : (
            <Link to="/login" className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-gray-50 dark:bg-gray-900 font-semibold shadow-lg inline-block transition-all duration-300 hover:-translate-y-0.5">
              Login to Enroll
            </Link>
          )}
        </div>
      </div>

      {/* Lessons */}
      {course.lessons?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Course Content ({course.lessons.length} lessons)</h2>
          </div>
          <div className="space-y-3">
            {course.lessons.map((lesson, i) => (
              <div
                key={lesson.id}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:bg-gray-900 transition-all duration-200 border border-transparent hover:border-gray-200 dark:border-gray-700 group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                  i === 0
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md group-hover:shadow-lg group-hover:scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:text-indigo-400'
                }`}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">{lesson.title}</p>
                  {lesson.duration && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {lesson.duration} min
                    </p>
                  )}
                </div>
                {user && (
                  <Link
                    to={`/learn/${lesson.id}`}
                    className="px-4 py-2 text-sm bg-indigo-50 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 font-medium transition-all duration-200 shrink-0 hover:-translate-y-0.5"
                  >
                    Start
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
