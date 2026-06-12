import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { useTheme } from '../../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { dark, toggle } = useTheme()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  const navBg = scrolled
    ? 'rgba(var(--nav-bg-rgb,255,255,255),0.9) backdrop-blur-lg shadow-sm'
    : 'rgba(var(--nav-bg-rgb,255,255,255),0.8) backdrop-blur-md'

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300`}
      style={{
        background: scrolled
          ? dark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)'
          : dark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.8)',
        borderBottom: `1px solid ${dark ? 'rgba(51,65,85,0.5)' : 'rgba(229,231,235,0.5)'}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
              <span className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm shadow-sm">L</span>
              LearnAI
            </Link>
            <div className="hidden md:flex gap-1">
              {[
                { to: '/courses', label: 'Courses' },
                ...(user ? [
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/ai-chat', label: 'AI Tutor' },
                  { to: '/ielts/dashboard', label: 'IELTS' },
                ] : []),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    backgroundColor: (isActive(to) || location.pathname.startsWith(to + '/')) ? (dark ? 'rgba(99,102,241,0.15)' : '#eef2ff') : 'transparent',
                    color: (isActive(to) || location.pathname.startsWith(to + '/')) ? (dark ? '#818cf8' : '#4f46e5') : (dark ? '#94a3b8' : '#4b5563'),
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:${dark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-gray-50 text-gray-900'}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg transition-colors"
              style={{ color: dark ? '#94a3b8' : '#6b7280' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(51,65,85,0.5)' : '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: dark ? '#94a3b8' : '#6b7280' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(51,65,85,0.5)' : '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Toggle mobile menu"
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <span className={`block h-0.5 rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} style={{ backgroundColor: dark ? '#94a3b8' : '#6b7280' }} />
                <span className={`block h-0.5 rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} style={{ backgroundColor: dark ? '#94a3b8' : '#6b7280' }} />
                <span className={`block h-0.5 rounded-full transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} style={{ backgroundColor: dark ? '#94a3b8' : '#6b7280' }} />
              </div>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200"
                  style={{ color: dark ? '#94a3b8' : '#4b5563' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(51,65,85,0.5)' : '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2" style={{ ringColor: dark ? '#1e293b' : 'white' }}>
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="hidden md:block text-sm font-medium" style={{ color: dark ? '#e2e8f0' : '#374151' }}>{user.name}</span>
                  <svg className={`hidden md:block w-4 h-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} style={{ color: dark ? '#64748b' : '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border py-2 animate-fade-in" style={{ backgroundColor: dark ? '#1e293b' : 'white', borderColor: dark ? '#334155' : '#e5e7eb' }}>
                      <div className="px-4 py-3 border-b" style={{ borderColor: dark ? '#334155' : '#f3f4f6' }}>
                        <p className="text-sm font-medium" style={{ color: dark ? '#f1f5f9' : '#111827' }}>{user.name}</p>
                        <p className="text-xs" style={{ color: dark ? '#64748b' : '#6b7280' }}>{user.email}</p>
                      </div>
                      <div className="px-4 py-2 border-b" style={{ borderColor: dark ? '#334155' : '#f3f4f6' }}>
                        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: dark ? '#64748b' : '#9ca3af' }}>Main</p>
                      </div>
                      {[
                        { to: '/dashboard', label: 'Dashboard' },
                        { to: '/profile', label: 'Profile' },
                        { to: '/study-plan', label: 'Study Plan' },
                        { to: '/roadmap', label: 'Roadmap' },
                      ].map(({ to, label }) => (
                        <Link
                          key={to}
                          to={to}
                          className="block px-4 py-2.5 text-sm transition-colors"
                          style={{ color: dark ? '#cbd5e1' : '#374151' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(99,102,241,0.15)' : '#eef2ff'; e.currentTarget.style.color = dark ? '#818cf8' : '#4f46e5'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = dark ? '#cbd5e1' : '#374151'; }}
                          onClick={() => setMenuOpen(false)}
                        >
                          {label}
                        </Link>
                      ))}
                      <div className="px-4 py-2 border-t" style={{ borderColor: dark ? '#334155' : '#f3f4f6' }}>
                        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: dark ? '#64748b' : '#9ca3af' }}>IELTS</p>
                      </div>
                      {[
                        { to: '/ielts/dashboard', label: 'IELTS Dashboard' },
                        { to: '/ielts/writing', label: 'Writing Practice' },
                        { to: '/ielts/speaking', label: 'Speaking Practice' },
                        { to: '/ielts/vocabulary', label: 'Vocabulary' },
                      ].map(({ to, label }) => (
                        <Link
                          key={to}
                          to={to}
                          className="block px-4 py-2.5 text-sm transition-colors"
                          style={{ color: dark ? '#cbd5e1' : '#374151' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'; e.currentTarget.style.color = dark ? '#34d399' : '#059669'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = dark ? '#cbd5e1' : '#374151'; }}
                          onClick={() => setMenuOpen(false)}
                        >
                          {label}
                        </Link>
                      ))}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2.5 text-sm font-medium transition-colors"
                          style={{ color: dark ? '#818cf8' : '#4f46e5' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(99,102,241,0.15)' : '#eef2ff'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          onClick={() => setMenuOpen(false)}
                        >
                          ⚙️ Admin Panel
                        </Link>
                      )}
                      <hr style={{ borderColor: dark ? '#334155' : '#e5e7eb', margin: '8px 0' }} />
                      <button
                        onClick={() => { logout(); setMenuOpen(false) }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200" style={{ color: dark ? '#94a3b8' : '#6b7280' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(51,65,85,0.5)' : '#f3f4f6'; e.currentTarget.style.color = dark ? '#e2e8f0' : '#111827'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = dark ? '#94a3b8' : '#6b7280'; }}>
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 font-medium">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t py-4 space-y-1 animate-slide-down" style={{ borderColor: dark ? '#334155' : '#f3f4f6' }}>
            {[
              { to: '/courses', label: 'Courses' },
              ...(user ? [
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/ai-chat', label: 'AI Tutor' },
                { to: '/study-plan', label: 'Study Plan' },
                { to: '/roadmap', label: 'Roadmap' },
                { to: '/profile', label: 'Profile' },
              ] : []),
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive(to) ? (dark ? 'bg-indigo-900/30 text-indigo-400 font-medium' : 'bg-indigo-50 text-indigo-600 font-medium') : ''
                }`}
                style={{ color: isActive(to) ? undefined : (dark ? '#94a3b8' : '#6b7280') }}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            {user && (
              <>
                <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: dark ? '#64748b' : '#9ca3af' }}>IELTS</div>
                {[
                  { to: '/ielts/dashboard', label: 'IELTS Dashboard' },
                  { to: '/ielts/writing', label: 'Writing Practice' },
                  { to: '/ielts/speaking', label: 'Speaking Practice' },
                  { to: '/ielts/vocabulary', label: 'Vocabulary' },
                ].map(({ to, label }) => (
                  <Link key={to} to={to}
                    className="block px-3 py-2.5 rounded-lg text-sm transition-colors"
                    style={{ color: dark ? '#94a3b8' : '#6b7280' }}
                    onClick={() => setMobileOpen(false)}>
                    {label}
                  </Link>
                ))}
              </>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="block px-3 py-2.5 rounded-lg font-medium transition-colors text-sm"
                style={{ color: dark ? '#818cf8' : '#4f46e5' }}
                onClick={() => setMobileOpen(false)}
              >
                ⚙️ Admin Panel
              </Link>
            )}
            {user ? (
              <>
                <hr style={{ borderColor: dark ? '#334155' : '#e5e7eb' }} />
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-2 px-3">
                <Link
                  to="/login"
                  className="block text-center py-2.5 rounded-lg transition-colors text-sm"
                  style={{ color: dark ? '#94a3b8' : '#6b7280' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-center py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
