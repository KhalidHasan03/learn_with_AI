import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const gradients = {
  beginner: 'from-emerald-500 to-teal-600',
  intermediate: 'from-indigo-500 to-purple-600',
  advanced: 'from-purple-500 to-pink-600',
}

const icons = {
  beginner: '🌱',
  intermediate: '🚀',
  advanced: '🔥',
}

function CourseCard({ course, index }) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [course.id])

  return (
    <Link
      ref={cardRef}
      to={`/courses/${course.slug}`}
      className={`group block ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
        <div className={`h-44 bg-gradient-to-br ${gradients[course.difficulty_level] || 'from-indigo-500 to-purple-600'} flex items-center justify-center relative overflow-hidden`}>
          <span className="text-6xl group-hover:scale-110 transition-transform duration-500">{icons[course.difficulty_level] || '📚'}</span>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          <div className="absolute top-3 right-3 flex gap-2">
            <span className="px-3 py-1 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-full text-white text-xs font-medium capitalize">
              {course.difficulty_level}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">{course.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{course.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              {course.lessons_count || 0} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {course.enrollments_count || 0} students
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function CourseList() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    api.get('/courses')
      .then(({ data }) => setCourses(data.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const levels = ['all', 'beginner', 'intermediate', 'advanced']

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
    const matchLevel = activeFilter === 'all' || c.difficulty_level === activeFilter
    return matchSearch && matchLevel
  })

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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10 animate-fade-in-down">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3">Explore Courses</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Discover courses designed to accelerate your learning with AI.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 focus:shadow-md"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Filter pills */}
      <div className={`flex gap-2 mb-8 flex-wrap transition-all duration-300 ${showFilters ? 'max-h-20' : 'max-h-20'} ${showFilters ? 'opacity-100' : ''} animate-fade-in-up`} style={{ animationDelay: '0.15s' }}>
        {levels.map(level => (
          <button
            key={level}
            onClick={() => setActiveFilter(level)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === level
                ? 'bg-indigo-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 hover:-translate-y-0.5'
            }`}
          >
            {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
        {activeFilter !== 'all' && (
          <button
            onClick={() => setActiveFilter('all')}
            className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 animate-scale-in">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No courses found matching your criteria.</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filter settings.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
