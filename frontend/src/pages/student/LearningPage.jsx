import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

export default function LearningPage() {
  const { lessonId } = useParams()
  const [lesson, setLesson] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/lessons/${lessonId}`)
      .then(({ data }) => setLesson(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [lessonId])

  const handleComplete = async () => {
    try {
      const { data } = await api.post(`/lessons/${lessonId}/complete`)
      setCompleted(true)
      alert(`Lesson completed! Course progress: ${data.data.course_progress}%`)
    } catch (err) {
      alert('Failed to mark complete')
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading lesson...</div>
  if (!lesson) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Lesson not found</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to={`/courses/${lesson.course?.slug || ''}`} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
          &larr; Back to Course
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
      {lesson.duration && <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{lesson.duration} minutes</p>}

      {lesson.video_url && (
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-8">
          <iframe src={lesson.video_url} className="w-full h-full" allowFullScreen title={lesson.title} />
        </div>
      )}

      <div className="prose max-w-none mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {lesson.content ? (
            lesson.content.split('\n').map((p, i) => <p key={i} className="mb-4 text-gray-700 dark:text-gray-200 leading-relaxed">{p}</p>)
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No content available for this lesson.</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={handleComplete} disabled={completed}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
          {completed ? 'Completed ✓' : 'Mark as Complete'}
        </button>
        <Link to={`/ai-chat?lesson_id=${lesson.id}`}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
          Ask AI Tutor
        </Link>
        <Link to={`/ai-notes/${lesson.id}`}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-900 font-medium">
          Generate Notes
        </Link>
        <Link to={`/quiz/${lesson.id}`}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-900 font-medium">
          Take Quiz
        </Link>
      </div>
    </div>
  )
}
