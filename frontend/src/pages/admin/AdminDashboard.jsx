import { useState, useEffect } from 'react'
import api from '../../services/api'

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [tab, setTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [showLessons, setShowLessons] = useState(null)
  const [lessons, setLessons] = useState([])
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', category_id: '', difficulty_level: 'beginner', status: 'draft',
  })
  const [lessonForm, setLessonForm] = useState({
    title: '', content: '', video_url: '', duration: '',
  })

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data.data)).catch(() => {})
    api.get('/admin/users').then(({ data }) => setUsers(data.data.data)).catch(() => {})
    api.get('/admin/analytics').then(({ data }) => setAnalytics(data.data)).catch(() => {})
    api.get('/admin/courses').then(({ data }) => setCourses(data.data.data)).catch(() => {})
    api.get('/admin/categories').then(({ data }) => setCategories(data.data)).catch(() => {})
  }, [])

  const loadCourses = () => {
    api.get('/admin/courses').then(({ data }) => setCourses(data.data.data)).catch(() => {})
  }

  const loadLessons = (courseId) => {
    api.get(`/courses/${courseId}/lessons`).then(({ data }) => setLessons(data.data)).catch(() => {})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, form)
      } else {
        await api.post('/courses', form)
      }
      setShowForm(false)
      setEditingCourse(null)
      setForm({ title: '', description: '', category_id: '', difficulty_level: 'beginner', status: 'draft' })
      loadCourses()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save course')
    }
    setLoading(false)
  }

  const handleDelete = async (course) => {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return
    try {
      await api.delete(`/courses/${course.id}`)
      loadCourses()
    } catch (err) {
      alert('Failed to delete course')
    }
  }

  const openEdit = (course) => {
    setForm({
      title: course.title,
      description: course.description || '',
      category_id: course.category_id || '',
      difficulty_level: course.difficulty_level,
      status: course.status,
    })
    setEditingCourse(course)
    setShowForm(true)
  }

  const openCreate = () => {
    setForm({ title: '', description: '', category_id: '', difficulty_level: 'beginner', status: 'draft' })
    setEditingCourse(null)
    setShowForm(true)
  }

  const handleLessonSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...lessonForm, duration: parseInt(lessonForm.duration) || 0 }
      if (editingLesson) {
        await api.put(`/lessons/${editingLesson.id}`, payload)
      } else {
        await api.post(`/courses/${showLessons.id}/lessons`, payload)
      }
      setShowLessonForm(false)
      setEditingLesson(null)
      setLessonForm({ title: '', content: '', video_url: '', duration: '' })
      loadLessons(showLessons.id)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save lesson')
    }
    setLoading(false)
  }

  const handleDeleteLesson = async (lesson) => {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return
    try {
      await api.delete(`/lessons/${lesson.id}`)
      loadLessons(showLessons.id)
    } catch (err) {
      alert('Failed to delete lesson')
    }
  }

  const openLessonEdit = (lesson) => {
    setLessonForm({
      title: lesson.title,
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      duration: lesson.duration?.toString() || '',
    })
    setEditingLesson(lesson)
    setShowLessonForm(true)
  }

  const openLessonCreate = () => {
    setLessonForm({ title: '', content: '', video_url: '', duration: '' })
    setEditingLesson(null)
    setShowLessonForm(true)
  }

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
      </div>

      {stats && tab === 'overview' && (
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Students', value: stats.total_students, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'Courses', value: stats.total_courses, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Enrollments', value: stats.total_enrollments, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Published', value: stats.published_courses, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'AI Requests', value: stats.total_ai_requests, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'New Today', value: stats.active_users_today, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow`}>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'courses', label: 'Courses' },
          { id: 'users', label: 'Users' },
          { id: 'analytics', label: 'Analytics' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Courses Tab */}
      {tab === 'courses' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)}
              className="max-w-xs px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
            <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-all">
              + New Course
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left p-3 font-medium">Title</th>
                  <th className="text-left p-3 font-medium">Difficulty</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Lessons</th>
                  <th className="text-left p-3 font-medium">Students</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-3 font-medium">{c.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        c.difficulty_level === 'beginner' ? 'bg-emerald-100 text-emerald-700' :
                        c.difficulty_level === 'intermediate' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>{c.difficulty_level}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 dark:text-gray-400">{c.lessons_count || 0}</td>
                    <td className="p-3 text-gray-500 dark:text-gray-400">{c.enrollments_count || 0}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setShowLessons(c); loadLessons(c.id) }}
                          className="px-2 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 transition-colors">
                          Lessons
                        </button>
                        <button onClick={() => openEdit(c)}
                          className="px-2 py-1 text-xs bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(c)}
                          className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">No courses found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Courses</th>
                <th className="text-left p-3 font-medium">AI Chats</th>
                <th className="text-left p-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">{u.enrollments_count || 0}</td>
                  <td className="p-3">{u.ai_conversations_count || 0}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && analytics && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Popular Courses</h2>
            {analytics.popular_courses?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No courses yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.popular_courses.map(c => (
                  <div key={c.id} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <span className="font-medium text-sm">{c.title}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{c.enrollments_count} enrollments</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Enrollments</h2>
            {analytics.recent_enrollments?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No enrollments yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.recent_enrollments.map(e => (
                  <div key={e.id} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <span className="font-medium text-sm">{e.user?.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{e.course?.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'overview' && stats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-lg text-gray-700 dark:text-gray-200">Welcome to the Admin Dashboard</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Manage courses, users, and view analytics from one place.</p>
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-8">
            {[
              { label: 'Total Students', value: stats.total_students },
              { label: 'Total Courses', value: stats.total_courses },
              { label: 'Total Enrollments', value: stats.total_enrollments },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Form Modal */}
      {showForm && (
        <Modal title={editingCourse ? 'Edit Course' : 'Create Course'} onClose={() => { setShowForm(false); setEditingCourse(null) }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Difficulty</label>
                <select value={form.difficulty_level} onChange={e => setForm({ ...form, difficulty_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-all">
                {loading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingCourse(null) }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 text-sm transition-all">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Lessons Modal */}
      {showLessons && (
        <Modal title={`Lessons: ${showLessons.title}`} onClose={() => { setShowLessons(null); setLessons([]) }}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">{lessons.length} lessons</span>
            <button onClick={openLessonCreate} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium transition-all">+ Add Lesson</button>
          </div>
          {lessons.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No lessons yet. Create your first lesson.</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((l, i) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{l.title}</p>
                      {l.duration && <p className="text-xs text-gray-400">{l.duration} min</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openLessonEdit(l)} className="px-2 py-1 text-xs bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition-colors">Edit</button>
                    <button onClick={() => handleDeleteLesson(l)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <Modal title={editingLesson ? 'Edit Lesson' : 'Add Lesson'} onClose={() => { setShowLessonForm(false); setEditingLesson(null) }}>
          <form onSubmit={handleLessonSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
              <input type="text" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Content</label>
              <textarea value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Video URL</label>
                <input type="text" value={lessonForm.video_url} onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Duration (min)</label>
                <input type="number" value={lessonForm.duration} onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" min={0} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-all">
                {loading ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Add Lesson'}
              </button>
              <button type="button" onClick={() => { setShowLessonForm(false); setEditingLesson(null) }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 text-sm transition-all">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
