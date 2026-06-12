import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/api'

const PARTS = [
  { key: 'part1', label: 'Part 1: Interview', desc: 'General questions about yourself' },
  { key: 'part2', label: 'Part 2: Cue Card', desc: 'Speak for 2 minutes on a topic' },
  { key: 'part3', label: 'Part 3: Discussion', desc: 'Abstract topic discussion' },
]

function getBandColor(score) {
  if (score >= 7) return 'from-emerald-500 to-teal-600'
  if (score >= 5) return 'from-amber-500 to-orange-600'
  return 'from-red-500 to-rose-600'
}

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SpeakingPractice() {
  const { dark } = useTheme()
  const [part, setPart] = useState('part1')
  const [loading, setLoading] = useState(false)
  const [promptData, setPromptData] = useState(null)
  const [response, setResponse] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('practice')

  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerPhase, setTimerPhase] = useState('idle')
  const timerRef = useRef(null)
  const timerStartRef = useRef(0)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    if (activeTab === 'history') fetchHistory()
  }, [activeTab])

  const startTimer = (seconds) => {
    stopTimer()
    setTimer(seconds)
    setTimerRunning(true)
    setTimerPhase('running')
    timerStartRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStartRef.current) / 1000)
      const remaining = Math.max(0, seconds - elapsed)
      setTimer(remaining)
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        setTimerRunning(false)
        setTimerPhase('done')
      }
    }, 200)
  }

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setTimerRunning(false)
  }

  const resetTimer = () => {
    stopTimer()
    setTimer(0)
    setTimerPhase('idle')
  }

  const generatePrompt = async (p) => {
    setLoading(true)
    setPromptData(null)
    setResult(null)
    setResponse('')
    resetTimer()
    try {
      const { data } = await api.post('/ielts/speaking/generate-prompt', { part: p })
      setPromptData(data.data)
      if (data.data.preparation_time > 0) {
        setTimer(data.data.preparation_time)
        setTimerPhase('ready')
      }
    } catch (e) {
      alert('Failed to generate prompt')
    } finally {
      setLoading(false)
    }
  }

  const submitResponse = async () => {
    if (!response.trim() || response.trim().length < 20) return alert('Please write at least 20 characters')
    setLoading(true)
    try {
      const { data } = await api.post('/ielts/speaking/submit', {
        part,
        prompt: promptData.prompt,
        response: response.trim(),
        prep_time_used: promptData.preparation_time > 0 ? (promptData.preparation_time - timer) : null,
        speaking_time_used: timerPhase === 'done' ? (promptData.speaking_time) : null,
      })
      setResult(data.data)
    } catch (e) {
      alert('Failed to evaluate response')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/ielts/speaking/history')
      setHistory(data.data?.data || [])
    } catch (_) {}
  }

  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="animate-fade-in-down mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Speaking Practice</h1>
            <p className="text-gray-600 dark:text-gray-400">Practice IELTS speaking with AI-powered evaluation</p>
          </div>
        </div>
      </div>

      {/* Tab: Practice / History */}
      <div className="flex gap-2 mb-6">
        {['practice', 'history'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab === 'practice' ? 'Practice' : 'History'}
          </button>
        ))}
      </div>

      {activeTab === 'history' ? (
        <div className="space-y-3 animate-fade-in">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-500">No speaking practice history yet</div>
          ) : (
            history.map(h => (
              <div key={h.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 uppercase">{h.part}</span>
                  <span className="text-sm font-bold" style={{ color: h.band_score >= 5 ? '#059669' : '#dc2626' }}>Band {h.band_score}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{h.prompt}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(h.created_at).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Part Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Choose Speaking Part</h2>
            <div className="flex flex-wrap gap-3">
              {PARTS.map(p => (
                <button key={p.key} onClick={() => { setPart(p.key); setPromptData(null); setResult(null); resetTimer() }}
                  className={`flex-1 min-w-[180px] p-4 rounded-xl border-2 text-left transition-all ${
                    part === p.key
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                      : 'border-gray-100 dark:border-gray-600 hover:border-rose-200 dark:hover:border-rose-800'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{p.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{p.desc}</div>
                </button>
              ))}
            </div>
            {!promptData && !loading && (
              <button onClick={() => generatePrompt(part)}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 shadow-sm hover:shadow-md transition-all font-medium text-sm"
              >
                Generate Prompt
              </button>
            )}
          </div>

          {/* Timer */}
          {(timerPhase === 'ready' || timerPhase === 'running' || timerPhase === 'done') && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 text-center animate-fade-in">
              <div className="text-5xl font-bold mb-2" style={{ color: timer <= 10 && timerPhase === 'running' ? '#dc2626' : (dark ? '#f1f5f9' : '#111827') }}>
                {formatTime(timer)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {timerPhase === 'ready' && 'Press start when ready for preparation time'}
                {timerPhase === 'running' && (promptData?.preparation_time > 0 && timer > 0 ? 'Preparation time — start speaking when ready' : 'Speaking time')}
                {timerPhase === 'done' && 'Time is up! Submit your response.'}
              </p>
              <div className="flex gap-3 justify-center">
                {timerPhase === 'ready' && (
                  <button onClick={() => startTimer(promptData.preparation_time)}
                    className="px-5 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium">Start Preparation</button>
                )}
                {timerPhase === 'running' && promptData?.preparation_time > 0 && timer > 0 && (
                  <button onClick={() => startTimer(promptData.speaking_time)}
                    className="px-5 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm">Start Speaking</button>
                )}
                <button onClick={resetTimer}
                  className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">Reset Timer</button>
              </div>
            </div>
          )}

          {/* Prompt & Response */}
          {promptData && (
            <div className="animate-fade-in-up space-y-6">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-2xl border border-rose-200 dark:border-rose-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Prompt</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{promptData.prompt}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">{promptData.instructions}</p>
                {promptData.follow_up_questions?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-rose-200 dark:border-rose-800">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Follow-up questions:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {promptData.follow_up_questions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Your Response</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{wordCount} words</span>
                </div>
                <textarea value={response} onChange={e => setResponse(e.target.value)}
                  placeholder="Type your spoken response here..."
                  className="w-full h-48 p-4 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-rose-500 outline-none resize-none transition-colors"
                  style={{ backgroundColor: dark ? '#0f172a' : 'white', color: dark ? '#f1f5f9' : '#111827' }}
                />
                <div className="flex justify-end mt-3">
                  <button onClick={submitResponse} disabled={loading || response.trim().length < 20}
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 shadow-sm hover:shadow-md transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Evaluating...' : 'Submit for Evaluation'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-6 animate-fade-in-up space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Speaking Evaluation</h3>
                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br shadow-lg mb-4" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`, ['--tw-gradient-from']: '#f43f5e', ['--tw-gradient-to']: '#e11d48' }}>
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{result.band_score}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overall Band Score</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.ai_feedback?.criteria_breakdown && Object.entries(result.ai_feedback.criteria_breakdown).map(([key, val]) => (
                  <div key={key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{val}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h4 className="font-medium text-emerald-600 dark:text-emerald-400 mb-3">Strengths</h4>
                  <ul className="space-y-2">
                    {result.ai_feedback?.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-emerald-500 mt-0.5">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {result.ai_feedback?.areas_for_improvement?.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-amber-500 mt-0.5">→</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.ai_feedback?.vocabulary_suggestions?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h4 className="font-medium text-violet-600 dark:text-violet-400 mb-3">Vocabulary Suggestions</h4>
                  <ul className="space-y-2">
                    {result.ai_feedback.vocabulary_suggestions.map((v, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-violet-500 mt-0.5">💡</span> {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-center">
                <button onClick={() => { setPromptData(null); setResult(null); setResponse(''); resetTimer() }}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all text-sm font-medium shadow-sm">
                  Try Another Prompt
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && !result && (
            <div className="flex items-center justify-center py-12">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-3 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
