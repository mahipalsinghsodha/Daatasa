// pages/Login.jsx — Premium Immersive Design
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { FiShield, FiTruck, FiAward } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Helmet } from 'react-helmet-async'

const FloatingInput = ({ id, label, type = 'text', value, onChange, icon: Icon, rightElement, autoComplete, required }) => {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative w-full">
      <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
            style={{ color: focused ? 'var(--gold)' : 'var(--text-muted)' }}>
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          placeholder={`Enter ${label.toLowerCase()}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl text-[14px] font-medium outline-none transition-all"
          style={{
            height: '52px',
            paddingLeft: Icon ? '42px' : '14px',
            paddingRight: rightElement ? '44px' : '14px',
            background: focused ? '#FEFEFE' : '#F7F9FC',
            border: `2px solid ${focused ? 'var(--gold)' : '#E2E8F0'}`,
            color: 'var(--navy)',
            boxShadow: focused ? '0 0 0 4px rgba(245,166,35,0.12), 0 2px 8px rgba(245,166,35,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
            borderRadius: '14px',
          }}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  )
}

const TRUST_BADGES = [
  { emoji: '🔬', label: 'FSSAI Certified', icon: <FiAward size={16} /> },
  { emoji: '🧪', label: 'Lab Tested',      icon: <FiShield size={16} /> },
  { emoji: '🚚', label: 'Pan India',        icon: <FiTruck size={16} /> },
]

const Login = () => {
  const { login, googleLogin, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => { if (user) navigate(from, { replace: true }) }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      await login(email.trim(), password)
      toast.success('Welcome back! 👋')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const handleGoogleLogin = () => {
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    
    const messageListener = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.token) {
        window.removeEventListener('message', messageListener);
        setLoading(true)
        try {
          await googleLogin(event.data.token)
        } catch (err) {
          toast.error('Google login failed')
        } finally {
          setLoading(false)
        }
      }
    };
    window.addEventListener('message', messageListener);

    window.open(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`,
      'Google Login',
      `width=${width},height=${height},left=${left},top=${top}`
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#EAF5FB' }}>
      <Helmet>
        <title>Login — Daatasa</title>
        <meta name="description" content="Log in to your Daatasa account to shop pure Bilona ghee." />
      </Helmet>

      {/* ── Left Panel (Navy Immersive) ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: 'var(--gradient-hero)' }}>

        {/* Background blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full pointer-events-none animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.35) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.5 }} />
        <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full pointer-events-none animate-blob-delay"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 70%)', filter: 'blur(50px)', opacity: 0.5 }} />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center max-w-md w-full"
        >
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-14">
            <img src="/logo_rectangle.png" alt="Daatasa Logo" className="h-16 w-auto" />
          </Link>

          {/* Floating hero visual */}
          <div className="relative mb-10 inline-block">
            <div className="w-40 h-40 rounded-3xl flex items-center justify-center mx-auto"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              }}>
              <div className="text-5xl sm:text-7xl animate-float-slow">🐄</div>
            </div>
            {/* Ring glow */}
            <div className="absolute -inset-4 rounded-[32px] pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, transparent 70%)', filter: 'blur(16px)' }} />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Welcome Back!</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-base leading-relaxed mb-10">
            Log in to access your account and enjoy fresh, pure Bilona ghee delivered to your door.
          </p>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {TRUST_BADGES.map(b => (
              <div key={b.label} className="rounded-2xl py-4 px-3 text-center transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                <div className="text-2xl mb-1.5">{b.emoji}</div>
                <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.72)' }}>{b.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center justify-center mb-8">
            <img src="/logo_rectangle.png" alt="Daatasa Logo" className="h-14 w-auto" />
          </Link>

          {/* Card */}
          <div className="rounded-3xl p-8 sm:p-10"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 24px 80px rgba(27,47,110,0.14), 0 4px 20px rgba(27,47,110,0.08)',
              border: '1px solid #E8EFF8',
            }}>
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold mb-1.5" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>Sign In</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                New here?{' '}
                <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 700 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--navy)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--gold)'}>
                  Create an account
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FloatingInput
                id="login-email" label="Email address" type="email"
                value={email} onChange={e => setEmail(e.target.value)}
                icon={Mail} autoComplete="email" required
              />
              <FloatingInput
                id="login-password" label="Password" type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                icon={Lock} autoComplete="current-password" required
                rightElement={
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ color: 'var(--text-muted)' }}
                    className="hover:text-[var(--navy)] transition-colors p-1">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-xs font-semibold transition-colors"
                  style={{ color: 'var(--gold)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--navy)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--gold)'}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full h-13 rounded-xl font-extrabold text-[15px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] mt-2"
                style={{
                  height: '52px',
                  background: 'var(--brand-gradient)',
                  color: '#FFFFFF',
                  boxShadow: '0 6px 24px rgba(27,47,110,0.35)',
                  borderRadius: '14px',
                }}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><ArrowRight size={16} /> Sign In</>
                }
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Or continue with</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 rounded-xl flex items-center justify-center gap-3 transition-colors mb-6"
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                color: 'var(--navy)',
                fontWeight: 600,
                fontSize: '14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="flex -space-x-1.5">
                {['#1B2F6E','#F5A623','#38A169','#3182CE'].map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <span>Join <strong style={{ color: 'var(--navy)' }}>5,000+</strong> happy customers</span>
            </div>

            <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 700 }}>Sign up free</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
