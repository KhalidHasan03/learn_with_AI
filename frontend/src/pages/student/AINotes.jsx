import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

export default function AINotes() {
  const { lessonId } = useParams()
  const [notes, setNotes] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateNotes = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/ai/generate-notes', { lesson_id: lessonId })
      setNotes(data.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate notes')
    }
    setLoading(false)
  }

  if (!notes) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">📝</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI Study Notes</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Generate comprehensive study notes, key vocabulary, and exam questions from this lesson.</p>
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
              <p className="text-gray-500 dark:text-gray-400">Generating notes with AI...</p>
            </div>
          ) : (
            <button onClick={generateNotes}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              Generate Notes
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Study Notes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-generated from your lesson</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateNotes} disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 font-medium transition-all">
            {loading ? 'Regenerating...' : 'Regenerate'}
          </button>
          <Link to={`/learn/${lessonId}`} className="px-4 py-2 text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 font-medium transition-all">
            Back to Lesson
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">📋</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Summary</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{notes.summary}</p>
      </div>

      {/* Key Points */}
      {notes.key_points?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up shadow-sm" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm">🎯</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Key Points</h2>
          </div>
          <ul className="space-y-2">
            {notes.key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-gray-700 dark:text-gray-200">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vocabulary */}
      {notes.vocabulary?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up shadow-sm" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-sm">📖</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Key Vocabulary</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {notes.vocabulary.map((v, i) => (
              <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{v.word}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{v.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam Questions */}
      {notes.exam_questions?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up shadow-sm" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-sm">❓</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Practice Questions</h2>
          </div>
          <div className="space-y-4">
            {notes.exam_questions.map((q, i) => (
              <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
                <div className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-pink-200 text-pink-700 text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                  <p className="text-gray-700 dark:text-gray-200">{q}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Questions (fallback) */}
      {notes.interview_questions?.length > 0 && !notes.exam_questions?.length && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up shadow-sm" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-sm">💬</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Interview Questions</h2>
          </div>
          <ul className="space-y-3">
            {notes.interview_questions.map((q, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-gray-700 dark:text-gray-200">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <button onClick={generateNotes} disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-medium shadow-md transition-all">
          {loading ? 'Regenerating...' : 'Regenerate Notes'}
        </button>
      </div>
    </div>
  )
}
