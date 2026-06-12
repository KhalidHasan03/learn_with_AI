import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'

function ParticleField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
      a: Math.random() * 0.5 + 0.2,
    }))

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.a})`
        ctx.fill()
        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x, dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(255,255,255,${0.1 * (1 - dist / 150)})`
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />
}

function AnimatedFeatureCard({ icon, title, desc, index, gradient }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`group p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  )
}

function TestimonialCard({ name, role, text, rating, index }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-indigo-50 border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${
        isVisible ? 'animate-slide-up' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="flex text-yellow-400 mb-4">
        {Array.from({ length: rating }).map((_, j) => (
          <span key={j} className="animate-bounce-in" style={{ animationDelay: `${j * 0.1}s` }}>★</span>
        ))}
      </div>
      <p className="text-gray-700 mb-6 leading-relaxed italic">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${['from-indigo-400 to-purple-500', 'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500'][index]} flex items-center justify-center text-white font-bold text-sm`}>
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  )
}

function FloatingShape({ className, gradient, size }) {
  return (
    <div
      className={`absolute rounded-full bg-gradient-to-br ${gradient} opacity-20 animate-float ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export default function Landing() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ courses: 0, students: 0, conversations: 0 })
  const [showScrollHint, setShowScrollHint] = useState(true)

  useEffect(() => {
    api.get('/courses').then(({ data }) => {
      const courses = data.data?.data || []
      setStats(prev => ({ ...prev, courses: courses.length }))
    }).catch(() => {})

    const handleScroll = () => setShowScrollHint(window.scrollY < 100)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 overflow-hidden">
        <ParticleField />
        <FloatingShape className="-top-20 -left-20 animate-float" gradient="from-indigo-400 to-purple-500" size="300px" />
        <FloatingShape className="top-1/3 -right-32 animate-float-delayed" gradient="from-purple-400 to-pink-500" size="250px" />
        <FloatingShape className="-bottom-20 left-1/3 animate-float" gradient="from-cyan-400 to-indigo-500" size="200px" />

        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '0.75s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center" style={{ zIndex: 2 }}>
          <div className="animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-indigo-200 text-sm font-medium mb-6 border border-indigo-400/30">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              The Future of Learning is Here
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
            Learn Smarter with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 animate-pulse-glow inline-block">
              AI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-200/80 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            An AI-powered learning platform that adapts to you. Get personalized courses,
            AI tutoring with voice interaction, smart notes, and interactive quizzes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {user ? (
              <Link to="/dashboard" className="group px-8 py-3.5 bg-white text-indigo-900 rounded-xl hover:bg-indigo-50 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
                Go to Dashboard
                <span className="inline-block group-hover:translate-x-1 transition-transform ml-1">→</span>
              </Link>
            ) : (
              <>
                <Link to="/register" className="group px-8 py-3.5 bg-white text-indigo-900 rounded-xl hover:bg-indigo-50 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
                  Start Learning Free
                  <span className="inline-block group-hover:translate-x-1 transition-transform ml-1">→</span>
                </Link>
                <Link to="/courses" className="px-8 py-3.5 border-2 border-indigo-400/50 text-white rounded-xl hover:bg-white/10 font-semibold text-lg transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm">
                  Browse Courses
                </Link>
              </>
            )}
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {[
              { value: `${stats.courses}+`, label: 'Courses' },
              { value: '2K+', label: 'Students' },
              { value: 'AI', label: 'Powered' },
            ].map((s, i) => (
              <div key={i} className="group">
                <p className="text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{s.value}</p>
                <p className="text-indigo-300/70 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {showScrollHint && (
            <div className="mt-20 animate-fade-in-up flex flex-col items-center gap-2 text-indigo-300/50">
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <div className="w-5 h-8 border-2 border-indigo-300/30 rounded-full flex justify-center p-1">
                <div className="w-1 h-2 bg-indigo-300/50 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium mb-4">
              <span>✨</span> AI-Powered Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">AI-powered tools designed to make learning faster, smarter, and more engaging.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <AnimatedFeatureCard key={i} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-indigo-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-50/50 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium mb-4">
              <span>🚀</span> Quick Start
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Start learning in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free and set up your learning profile in seconds.', color: 'from-indigo-500 to-blue-500', icon: '👤' },
              { step: '02', title: 'Enroll in Courses', desc: 'Browse our catalog and enroll in courses that match your goals.', color: 'from-purple-500 to-pink-500', icon: '📚' },
              { step: '03', title: 'Learn with AI', desc: 'Use AI tutor, smart notes, quizzes, and study plans to master the material.', color: 'from-pink-500 to-rose-500', icon: '🤖' },
            ].map((item, i) => (
              <div key={i} className="group text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="relative inline-block">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-900 shadow-md group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/3 left-[calc(33%+2rem)] w-[calc(33%-4rem)] h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-300 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-50/30 to-purple-50/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-medium mb-4">
              <span>💬</span> Student Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Hear from learners who transformed their skills with AI-powered education.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah J.', role: 'Web Developer', text: 'The AI tutor is incredible. It feels like having a personal teacher available 24/7.', rating: 5 },
              { name: 'Mike R.', role: 'Data Scientist', text: 'The study plans and career roadmaps helped me transition into data science smoothly.', rating: 5 },
              { name: 'Emily C.', role: 'CS Student', text: 'Smart notes and AI quizzes are game-changers. I retain so much more information now.', rating: 5 },
            ].map((t, i) => (
              <TestimonialCard key={i} {...t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-indigo-400 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-purple-400 rounded-full blur-3xl opacity-20 animate-float-delayed" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Start Learning?</h2>
            <p className="text-xl text-indigo-200/80 mb-8">Join thousands of students already learning with AI.</p>
            {!user && (
              <Link to="/register" className="group px-10 py-4 bg-white text-indigo-900 rounded-xl hover:bg-indigo-50 font-semibold text-lg shadow-xl transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center gap-2">
                Get Started Free
                <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-950/50 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">L</span>
            <p className="text-xl font-bold text-white">LearnAI</p>
          </div>
          <p className="text-sm text-gray-500">Empowering learning through artificial intelligence.</p>
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <Link to="/courses" className="hover:text-indigo-400 transition-colors">Courses</Link>
            <Link to="/login" className="hover:text-indigo-400 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-indigo-400 transition-colors">Register</Link>
          </div>
          <div className="mt-6 text-sm text-gray-600">&copy; {new Date().getFullYear()} LearnAI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  { icon: '🤖', title: 'AI Voice Tutor', desc: 'Have natural conversations with an AI tutor. Use voice input and get spoken responses — just like talking to a real teacher.', gradient: 'from-indigo-50 to-purple-50' },
  { icon: '📝', title: 'Smart Notes', desc: 'Generate comprehensive study notes, summaries, key points, and interview questions from any lesson with one click.', gradient: 'from-emerald-50 to-teal-50' },
  { icon: '🧠', title: 'AI Quizzes', desc: 'Test your knowledge with automatically generated quizzes. Get instant feedback with detailed explanations for each answer.', gradient: 'from-purple-50 to-pink-50' },
  { icon: '📅', title: 'Study Planner', desc: 'Get a personalized 7-day study plan based on your goals and available time. AI-optimized for maximum retention.', gradient: 'from-amber-50 to-orange-50' },
  { icon: '🗺️', title: 'Career Roadmaps', desc: 'Follow AI-generated career roadmaps with phased learning paths, skill recommendations, and project ideas.', gradient: 'from-rose-50 to-red-50' },
  { icon: '🏆', title: 'Gamification', desc: 'Earn XP points, level up, maintain learning streaks, and unlock badges and achievements as you progress.', gradient: 'from-cyan-50 to-blue-50' },
]
