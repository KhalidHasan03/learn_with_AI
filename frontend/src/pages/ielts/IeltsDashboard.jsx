import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function BandCircle({ band, label, size = 'lg' }) {
  const getColor = (b) => {
    if (b >= 7) return 'from-emerald-500 to-teal-600'
    if (b >= 5) return 'from-amber-500 to-orange-600'
    if (b > 0) return 'from-red-500 to-rose-600'
    return 'from-gray-300 to-gray-400'
  }

  const dim = size === 'lg' ? 'w-28 h-28' : 'w-20 h-20'
  const textSize = size === 'lg' ? 'text-3xl' : 'text-xl'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${dim} rounded-full bg-gradient-to-br ${getColor(band)} flex items-center justify-center shadow-lg`}>
        <span className={`${textSize} font-bold text-white`}>{band > 0 ? band.toFixed(1) : '-'}</span>
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  )
}

function StatCard({ icon, label, value, gradient }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} p-4 rounded-xl text-white shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-white/80 text-xs mt-0.5">{label}</p>
        </div>
        <span className="text-2xl opacity-60">{icon}</span>
      </div>
    </div>
  )
}

export default function IeltsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ielts/band-score')
      .then(({ data }) => setData(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex gap-2">
        {[0, 1, 2].map(i => <div key={i} className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-fade-in-down mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">🎯</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">IELTS Dashboard</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Track your IELTS preparation progress and estimated band scores</p>
      </div>

      {/* Band Score Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 mb-8 shadow-sm animate-fade-in-up">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Estimated Band Scores</h2>
        <div className="flex justify-center gap-12 md:gap-20">
          <BandCircle band={data?.overall_band || 0} label="Overall" size="lg" />
          <BandCircle band={data?.quiz_band || 0} label="Reading" size="lg" />
          <BandCircle band={data?.writing_band || 0} label="Writing" size="lg" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <StatCard icon="📝" label="Quizzes Taken" value={data?.quizzes_taken || 0} gradient="from-indigo-500 to-indigo-600" />
        <StatCard icon="✍️" label="Essays Written" value={data?.essays_written || 0} gradient="from-emerald-500 to-emerald-600" />
        <StatCard icon="📖" label="Vocabulary Words" value={data?.vocabulary_words || 0} gradient="from-amber-500 to-orange-600" />
        <StatCard icon="🔄" label="Words Reviewed" value={data?.vocabulary_reviewed || 0} gradient="from-purple-500 to-purple-600" />
      </div>

      {/* Course Progress */}
      {data?.course_progress?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Course Progress</h2>
          <div className="space-y-4">
            {data.course_progress.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{c.course_title}</span>
                  <span className="text-gray-500 dark:text-gray-400">{c.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${c.progress}%` }} />
                </div>
                {c.ielts_skill && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 inline-block capitalize">{c.ielts_skill}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { to: '/ielts/vocabulary', icon: '📖', title: 'Vocabulary Builder', desc: 'Review words and flashcards', gradient: 'from-amber-500 to-orange-600' },
            { to: '/ielts/writing', icon: '✍️', title: 'Writing Practice', desc: 'Practice IELTS Task 1 & 2 essays', gradient: 'from-emerald-500 to-teal-600' },
            { to: '/study-plan', icon: '📅', title: 'Study Plan', desc: 'Create a personalized IELTS plan', gradient: 'from-indigo-500 to-purple-600' },
          ].map((item, i) => (
            <Link key={i} to={item.to} className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
