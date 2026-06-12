import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function VocabularyBuilder() {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [lessonId, setLessonId] = useState('')
  const [addForm, setAddForm] = useState({
    word: '', definition: '', example_sentence: '', synonyms: '', topic: 'general', difficulty: 'intermediate',
  })

  const loadVocabulary = () => {
    setLoading(true)
    const params = {}
    if (selectedTopic) params.topic = selectedTopic
    if (search) params.search = search
    api.get('/ielts/vocabulary', { params })
      .then(({ data }) => setWords(data.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadVocabulary() }, [selectedTopic, search])
  useEffect(() => {
    api.get('/ielts/topics').then(({ data }) => setTopics(data.data)).catch(() => {})
  }, [])

  const generateFromLesson = async () => {
    if (!lessonId) { alert('Please enter a lesson ID'); return }
    setGenerating(true)
    try {
      await api.post('/ielts/vocabulary/generate', { lesson_id: parseInt(lessonId) })
      loadVocabulary()
      setLessonId('')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate vocabulary')
    }
    setGenerating(false)
  }

  const addWord = async (e) => {
    e.preventDefault()
    try {
      await api.post('/ielts/vocabulary/add', addForm)
      setAddForm({ word: '', definition: '', example_sentence: '', synonyms: '', topic: 'general', difficulty: 'intermediate' })
      setShowAddForm(false)
      loadVocabulary()
    } catch (err) {
      alert('Failed to add word')
    }
  }

  const reviewWord = async (word) => {
    try {
      await api.post(`/ielts/vocabulary/${word.id}/review`)
      loadVocabulary()
    } catch (err) { /* ignore */ }
  }

  const deleteWord = async (word) => {
    if (!confirm(`Delete "${word.word}"?`)) return
    try {
      await api.delete(`/ielts/vocabulary/${word.id}`)
      loadVocabulary()
    } catch (err) { /* ignore */ }
  }

  const filtered = words.filter(w => filter === 'all' || w.difficulty === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in-down">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-lg">📖</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Vocabulary Builder</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Build your IELTS vocabulary with AI-generated word lists</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 text-sm bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 font-medium transition-all">
          + Add Word
        </button>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Generate from Lesson ID</label>
            <div className="flex gap-2">
              <input type="number" value={lessonId} onChange={e => setLessonId(e.target.value)}
                placeholder="Enter lesson ID..."
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
              <button onClick={generateFromLesson} disabled={generating || !lessonId}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-sm font-medium transition-all whitespace-nowrap">
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search words..."
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
        <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
          <option value="">All Topics</option>
          {topics.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
        <div className="flex gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'basic', label: 'Basic' },
            { id: 'intermediate', label: 'Intermediate' },
            { id: 'advanced', label: 'Advanced' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === f.id ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Word</h3>
          <form onSubmit={addWord} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Word</label>
                <input type="text" value={addForm.word} onChange={e => setAddForm({ ...addForm, word: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Topic</label>
                <input type="text" value={addForm.topic} onChange={e => setAddForm({ ...addForm, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Definition</label>
              <textarea value={addForm.definition} onChange={e => setAddForm({ ...addForm, definition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" rows={2} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Example Sentence</label>
              <textarea value={addForm.example_sentence} onChange={e => setAddForm({ ...addForm, example_sentence: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" rows={2} required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Synonyms</label>
                <input type="text" value={addForm.synonyms} onChange={e => setAddForm({ ...addForm, synonyms: e.target.value })}
                  placeholder="comma, separated"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Difficulty</label>
                <select value={addForm.difficulty} onChange={e => setAddForm({ ...addForm, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-all">Save Word</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 text-sm transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Word List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-gray-500 dark:text-gray-400">No vocabulary words yet.</p>
          <p className="text-sm text-gray-400 mt-1">Generate words from a lesson or add them manually.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((word, i) => (
            <div key={word.id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{word.word}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      word.difficulty === 'basic' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                      word.difficulty === 'advanced' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {word.difficulty}
                    </span>
                    {word.topic && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 dark:text-gray-400 rounded text-xs">{word.topic}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => reviewWord(word)}
                    className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 transition-colors">
                    Review
                  </button>
                  <button onClick={() => deleteWord(word)}
                    className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">
                    Del
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">{word.definition}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-2">"{word.example_sentence}"</p>
              {word.synonyms && (
                <div className="flex flex-wrap gap-1">
                  {word.synonyms.split(',').map((s, j) => (
                    <span key={j} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded text-xs">{s.trim()}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                <span>Reviews: {word.review_count || 0}</span>
                {word.last_reviewed_at && <span>Last: {new Date(word.last_reviewed_at).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
