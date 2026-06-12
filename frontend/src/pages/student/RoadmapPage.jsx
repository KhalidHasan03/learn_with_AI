import { useState } from 'react'
import api from '../../services/api'

export default function RoadmapPage() {
  const [career, setCareer] = useState('')
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/ai/roadmap', { career_path: career })
      setRoadmap(data.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate roadmap')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI Career Roadmap</h1>

      {!roadmap ? (
        <form onSubmit={generate} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Career Path</label>
            <input type="text" value={career} onChange={(e) => setCareer(e.target.value)}
              placeholder="e.g., Full Stack Developer, Data Scientist, DevOps Engineer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button type="submit" disabled={loading || !career}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
            {loading ? 'Generating...' : 'Generate Roadmap'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-2">{roadmap.roadmap_content?.career_title || career}</h2>
            <p className="text-gray-600">{roadmap.roadmap_content?.overview}</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-indigo-200" />
            {(roadmap.roadmap_content?.phases || []).map((phase, i) => (
              <div key={i} className="relative ml-12 mb-8">
                <div className="absolute -left-12 top-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{phase.phase}</h3>
                    <span className="text-sm text-indigo-600 font-medium">{phase.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {phase.skills?.map((s, j) => (
                      <span key={j} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm">{s}</span>
                    ))}
                  </div>
                  {phase.topics?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Topics:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {phase.topics.map((t, j) => <li key={j}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                  {phase.projects?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Projects:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {phase.projects.map((p, j) => <li key={j}>{p}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setRoadmap(null)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            Create New Roadmap
          </button>
        </div>
      )}
    </div>
  )
}
