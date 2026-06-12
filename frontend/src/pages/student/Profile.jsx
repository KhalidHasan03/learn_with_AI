import { useState, useEffect } from 'react'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

export default function Profile() {
  const { user } = useAuthStore()
  const [badges, setBadges] = useState([])
  const [achievements, setAchievements] = useState([])
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    api.get('/user/badges').then(({ data }) => setBadges(data.data)).catch(() => {})
    api.get('/user/achievements').then(({ data }) => setAchievements(data.data)).catch(() => {})
    api.get('/leaderboard').then(({ data }) => setLeaderboard(data.data)).catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-400">Level {user?.level} · {user?.xp_points} XP</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Badges ({badges.length})</h2>
          {badges.length === 0 ? (
            <p className="text-gray-500 text-sm">Complete lessons and quizzes to earn badges!</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {badges.map((b, i) => (
                <div key={i} className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <span className="mr-1">🏅</span> {b.badge_name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Achievements ({achievements.length})</h2>
          {achievements.length === 0 ? (
            <p className="text-gray-500 text-sm">Start learning to unlock achievements!</p>
          ) : (
            <div className="space-y-2">
              {achievements.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span>🏆</span>
                  <span>{a.achievement_type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p className="text-gray-500 text-sm">No leaderboard data yet.</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' :
                  i === 1 ? 'bg-gray-200 text-gray-700' :
                  i === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-500'
                }`}>{i + 1}</span>
                <span className="flex-1 font-medium">{u.name}</span>
                <span className="text-sm text-gray-500">Level {u.level}</span>
                <span className="text-sm font-medium text-indigo-600">{u.xp_points} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
