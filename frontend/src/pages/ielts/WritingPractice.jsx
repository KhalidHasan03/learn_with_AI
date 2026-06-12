import { useState } from 'react'
import api from '../../services/api'

export default function WritingPractice() {
  const [taskType, setTaskType] = useState('task_1')
  const [prompt, setPrompt] = useState(null)
  const [essay, setEssay] = useState('')
  const [submission, setSubmission] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pastSubmissions, setPastSubmissions] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const generatePrompt = async () => {
    setGenerating(true)
    setPrompt(null)
    setEssay('')
    setSubmission(null)
    try {
      const { data } = await api.post('/ielts/writing/generate-prompt', { task_type: taskType })
      setPrompt(data.data)
    } catch (err) {
      alert('Failed to generate prompt')
    }
    setGenerating(false)
  }

  const submitEssay = async () => {
    if (!essay || essay.length < 50) {
      alert('Please write at least 50 words.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/ielts/writing/submit', {
        task_type: taskType,
        prompt: prompt.prompt,
        essay,
      })
      setSubmission(data.data)
    } catch (err) {
      alert('Failed to submit essay')
    }
    setSubmitting(false)
  }

  const loadHistory = async () => {
    if (pastSubmissions) { setShowHistory(!showHistory); return }
    try {
      const { data } = await api.get('/ielts/writing/submissions')
      setPastSubmissions(data.data)
      setShowHistory(true)
    } catch (err) {
      alert('Failed to load history')
    }
  }

  const getBandColor = (score) => {
    if (score >= 7) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 5) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in-down">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-lg">✍️</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">IELTS Writing Practice</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Practice with AI-generated prompts and get instant feedback</p>
          </div>
        </div>
        <button onClick={loadHistory} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
          {showHistory ? 'Close History' : 'Past Essays'}
        </button>
      </div>

      {/* Task Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up">
        <div className="flex gap-3 mb-4">
          {[
            { id: 'task_1', label: 'Task 1', desc: 'Graph/Chart/Diagram' },
            { id: 'task_2', label: 'Task 2', desc: 'Essay' },
          ].map(t => (
            <button key={t.id} onClick={() => { setTaskType(t.id); setPrompt(null); setEssay(''); setSubmission(null) }}
              className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                taskType === t.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
              }`}>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{t.label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.desc}</p>
              {taskType === t.id && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">Selected</span>}
            </button>
          ))}
        </div>
        <button onClick={generatePrompt} disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 font-medium shadow-md transition-all">
          {generating ? 'Generating Prompt...' : 'Generate Writing Prompt'}
        </button>
      </div>

      {/* History */}
      {showHistory && pastSubmissions && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Past Submissions</h2>
          {pastSubmissions.data?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {pastSubmissions.data?.map(s => (
                <div key={s.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 transition-all cursor-pointer"
                  onClick={() => setSubmission(s)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 capitalize">{s.task_type?.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-bold text-lg ${getBandColor(s.band_score)}`}>{s.band_score?.toFixed(1) || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Writing Area */}
      {prompt && !submission && (
        <div className="animate-fade-in-up">
          <div className="bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-teal-50 dark:to-teal-900/20 rounded-2xl border border-emerald-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-700 rounded text-xs font-medium">{taskType === 'task_1' ? 'Task 1' : 'Task 2'}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Word limit: {prompt.word_limit} words</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Writing Prompt:</h3>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{prompt.prompt}</p>
            {prompt.instructions && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic">{prompt.instructions}</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Your Essay</label>
            <textarea value={essay} onChange={e => setEssay(e.target.value)}
              placeholder={`Write your ${taskType === 'task_1' ? 'Task 1' : 'Task 2'} essay here...`}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-y min-h-[250px] dark:bg-gray-700 dark:text-gray-100"
              rows={10} />
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${essay.length < 50 ? 'text-red-500' : 'text-gray-400'}`}>
                {essay.length} words (min 50)
              </span>
              <button onClick={submitEssay} disabled={submitting || essay.length < 50}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 font-medium shadow-md transition-all">
                {submitting ? 'Evaluating...' : 'Submit for Evaluation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {submission && (
        <div className="animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 mb-6 shadow-sm">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getBandColor(submission.band_score).replace('text-', 'from-').replace('600', '500')} to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                <span className="text-3xl font-bold text-white">{submission.band_score?.toFixed(1)}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Estimated Band Score</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{taskType === 'task_1' ? 'Task 1' : 'Task 2'} — IELTS Writing</p>
            </div>

            {submission.ai_feedback?.criteria_breakdown && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(submission.ai_feedback.criteria_breakdown).map(([key, val]) => (
                  <div key={key} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                    <p className={`text-2xl font-bold ${getBandColor(val)}`}>{val}</p>
                  </div>
                ))}
              </div>
            )}

            {submission.ai_feedback?.strengths?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">✅ Strengths</h3>
                <ul className="space-y-2">
                  {submission.ai_feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {submission.ai_feedback?.areas_for_improvement?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">💡 Areas to Improve</h3>
                <ul className="space-y-2">
                  {submission.ai_feedback.areas_for_improvement.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button onClick={() => { setPrompt(null); setEssay(''); setSubmission(null) }}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-medium shadow-md transition-all">
            Try Another Prompt
          </button>
        </div>
      )}
    </div>
  )
}
