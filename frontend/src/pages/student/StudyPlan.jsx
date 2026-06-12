import { useState } from 'react'
import api from '../../services/api'

export default function StudyPlan() {
  const [form, setForm] = useState({ daily_hours: 2, goal: '' })
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/ai/study-plan', form)
      setPlan(data.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate plan')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI Study Planner</h1>

      {!plan ? (
        <form onSubmit={generate} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Study Hours</label>
            <input type="number" min={1} max={24} value={form.daily_hours}
              onChange={(e) => setForm({ ...form, daily_hours: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Goal</label>
            <textarea value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
              placeholder="e.g., Master Laravel in 3 months"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button type="submit" disabled={loading || !form.goal}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
            {loading ? 'Generating...' : 'Generate Study Plan'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-2">{plan.plan_content?.overview || 'Study Plan'}</h2>
            <p className="text-sm text-gray-500">{plan.daily_hours} hours/day — {plan.goal}</p>
          </div>
          <div className="grid gap-4">
            {(plan.plan_content?.days || []).map((day, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-indigo-600 mb-2">{day.day}</h3>
                <p className="text-sm text-gray-500 mb-2">Focus: {day.focus}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {day.topics?.map((t, j) => (
                    <span key={j} className="px-2 py-1 bg-gray-100 rounded text-sm">{t}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{day.activities}</p>
                <p className="text-sm text-gray-400 mt-1">{day.duration_hours} hours</p>
              </div>
            ))}
          </div>
          <button onClick={() => setPlan(null)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            Create New Plan
          </button>
        </div>
      )}
    </div>
  )
}
