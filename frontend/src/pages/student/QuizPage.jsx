import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

export default function QuizPage() {
  const { lessonId } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [questionType, setQuestionType] = useState('multiple_choice')

  const generateQuiz = async () => {
    setGenerating(true)
    try {
      const { data } = await api.post('/ai/generate-quiz', {
        lesson_id: lessonId,
        question_count: 5,
        question_type: questionType,
      })
      setQuiz(data.data)
      setAnswers({})
      setResult(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate quiz')
    }
    setGenerating(false)
  }

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: questionType === 'multiple_answer'
        ? (prev[questionId]?.includes(value)
            ? prev[questionId].filter(v => v !== value)
            : [...(prev[questionId] || []), value])
        : value,
    }))
  }

  const submitQuiz = async () => {
    if (Object.keys(answers).length !== quiz.questions.length) {
      alert('Please answer all questions before submitting.')
      return
    }
    setSubmitting(true)
    try {
      const formatted = Object.entries(answers).map(([question_id, answer]) => ({
        question_id: parseInt(question_id),
        answer: Array.isArray(answer) ? answer.sort().join(',') : answer,
      }))
      const { data } = await api.post(`/quizzes/${quiz.id}/attempt`, { answers: formatted })
      setResult(data.data)
    } catch (err) {
      alert('Failed to submit quiz')
    }
    setSubmitting(false)
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">📝</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI Quiz Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Generate an AI-powered quiz to test your knowledge on this lesson.</p>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm mx-auto mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Question Type</label>
            <div className="flex gap-2">
              {[
                { id: 'multiple_choice', label: 'Multiple Choice' },
                { id: 'true_false', label: 'True/False' },
                { id: 'multiple_answer', label: 'Multiple Answer' },
              ].map(t => (
                <button key={t.id} onClick={() => setQuestionType(t.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    questionType === t.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {generating ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
              <p className="text-gray-500 dark:text-gray-400">Generating quiz questions...</p>
            </div>
          ) : (
            <button onClick={generateQuiz}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              Generate Quiz
            </button>
          )}
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
            {result.percentage >= 70 ? '🎉' : result.percentage >= 40 ? '💪' : '📚'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Quiz Results</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 mb-8 shadow-sm">
          <div className="text-center mb-6">
            <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{result.score}/{result.total}</p>
            <p className="text-xl text-gray-600 dark:text-gray-400">{result.percentage}%</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div className={`h-4 rounded-full transition-all duration-1000 ease-out ${
              result.percentage >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
              result.percentage >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-rose-500'
            }`} style={{ width: `${result.percentage}%` }} />
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
            {result.percentage >= 70 ? 'Great job! You have a strong understanding.' :
             result.percentage >= 40 ? 'Good effort! Review the material and try again.' :
             'Keep studying! Review the lesson and try again.'}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {result.results.map((r, i) => (
            <div key={i} className={`bg-white dark:bg-gray-800 rounded-xl border p-5 transition-all ${
              r.is_correct ? 'border-emerald-200 hover:shadow-md' : 'border-red-200 hover:shadow-md'
            }`}>
              <div className="flex items-start gap-3">
                <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  r.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {r.is_correct ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{r.question_text}</p>
                  <div className="text-sm space-y-1">
                    <p>Your answer: <span className={r.is_correct ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>{r.your_answer}</span></p>
                    {!r.is_correct && <p>Correct answer: <span className="text-emerald-600 font-medium">{r.correct_answer}</span></p>}
                  </div>
                  {r.explanation && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{r.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={() => { setQuiz(null); setResult(null) }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-md transition-all">
            Try Again
          </button>
          <Link to={`/learn/${lessonId}`} className="px-6 py-3 bg-gray-100 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 font-medium transition-all">
            Back to Lesson
          </Link>
        </div>
      </div>
    )
  }

  const isMultipleAnswer = quiz.ielts_question_type === 'multiple_answer'
  const isTrueFalse = quiz.ielts_question_type === 'true_false'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{quiz.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quiz.questions?.length || 0} questions — {questionType === 'true_false' ? 'True/False' : questionType === 'multiple_answer' ? 'Multiple Answer' : 'Multiple Choice'}</p>
        </div>
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">{quiz.ielts_question_type || 'standard'}</span>
      </div>

      <div className="space-y-6 mb-8">
        {quiz.questions?.map((q, i) => (
          <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-sm transition-shadow">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-4">
              <span className="w-7 h-7 inline-flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold mr-2">{i + 1}</span>
              {q.question_text}
            </p>
            <div className="space-y-2.5 ml-9">
              {isTrueFalse ? (
                ['a', 'b'].map(key => (
                  <label key={key} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[q.id] === key
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                      : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[q.id] === key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300'
                    }`}>
                      {answers[q.id] === key && <div className="w-2.5 h-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full" />}
                    </div>
                    <input type="radio" name={`q-${q.id}`} value={key}
                      checked={answers[q.id] === key}
                      onChange={() => handleAnswer(q.id, key)}
                      className="sr-only" />
                    <span className="font-medium text-gray-800 dark:text-gray-100">{q.options?.[key]}</span>
                  </label>
                ))
              ) : isMultipleAnswer ? (
                Object.entries(q.options || {}).map(([key, value]) => {
                  const selected = answers[q.id]?.includes(key)
                  return (
                    <label key={key} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selected ? 'border-indigo-500 bg-indigo-500 dark:bg-indigo-600' : 'border-gray-300'
                      }`}>
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" value={key}
                        checked={selected}
                        onChange={() => handleAnswer(q.id, key)}
                        className="sr-only" />
                      <span className="font-medium text-gray-800 dark:text-gray-100">{key}. {value}</span>
                    </label>
                  )
                })
              ) : (
                Object.entries(q.options || {}).map(([key, value]) => (
                  <label key={key} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[q.id] === key
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                      : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[q.id] === key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300'
                    }`}>
                      {answers[q.id] === key && <div className="w-2 h-2 bg-white dark:bg-gray-800 rounded-full" />}
                    </div>
                    <input type="radio" name={`q-${q.id}`} value={key}
                      checked={answers[q.id] === key}
                      onChange={() => handleAnswer(q.id, key)}
                      className="sr-only" />
                    <span className="font-medium text-gray-800">{key}. {value}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={submitQuiz} disabled={submitting}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-medium shadow-md hover:shadow-lg transition-all">
        {submitting ? 'Submitting...' : 'Submit Answers'}
      </button>
    </div>
  )
}
