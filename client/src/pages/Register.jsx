// pages/Register.jsx — Premium Immersive Design
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Sparkles } from 'lucide-react'
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
          id={id} type={type} value={value} onChange={onChange}
          autoComplete={autoComplete} required={required}
          placeholder={`Enter ${label.toLowerCase()}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full text-[14px] font-medium outline-none transition-all rounded-xl"
          style={{
            height: '52px',
            paddingLeft: Icon ? '42px' : '14px',
            paddingRight: rightElement ? '44px' : '14px',
            background: focused ? '#FEFEFE' : '#F7F9FC',
            border: `2px solid ${focused ? 'var(--gold)' : '#E2E8F0'}`,
            color: 'var(--navy)',
            boxShadow: focused ? '0 0 0 4px rgba(245,166,35,0.12), 0 2px 8px rgba(245,166,35,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
          }}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  )
}

const PERKS = [
  { text: 'Access to exclusive deals & offers',    color: 'rgba(245,166,35,0.20)',   dot: 'var(--gold)' },
  { text: 'Track your orders in real-time',        color: 'rgba(56,161,105,0.18)',   dot: 'var(--success)' },
  { text: 'Save products to your wishlist',         color: 'rgba(49,130,206,0.15)',   dot: 'var(--info)' },
  { text: 'Get 10% off your first order',          color: 'rgba(245,166,35,0.20)',   dot: 'var(--gold)' },
]

const Register = () => {
  const { register, googleLogin, user } = useAuth()
  const navigate = useNavigate()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => { if (user) navigate('/', { replace: true }) }, [user])

  /* Password strength */
  const strength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 6) s++
    if (password.length >= 10) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength]
  const strengthColor = strength <= 2 ? 'var(--danger)' : strength <= 4 ? 'var(--warning)' : 'var(--success)'
  const strengthGrad = strength <= 2
    ? 'linear-gradient(90deg, #E53E3E, #FC8181)'
    : strength <= 4
    ? 'linear-gradient(90deg, #D69E2E, #F6D860)'
    : 'linear-gradient(90deg, #38A169, #68D391)'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password || !confirm) { toast.error('Please fill all fields'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await register(name.trim(), email.trim(), password)
      toast.success('Account created! Welcome to DhaniFresh 🎉')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.')
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
        <title>Create Account — DhaniFresh</title>
        <meta name="description" content="Create a DhaniFresh account to shop pure Bilona ghee online." />
      </Helmet>

      {/* ── Left Panel (Navy Immersive) ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full pointer-events-none animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.35) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.5 }} />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full pointer-events-none animate-blob-delay"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 70%)', filter: 'blur(50px)', opacity: 0.5 }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center max-w-md w-full"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--gold)', boxShadow: '0 8px 24px rgba(245,166,35,0.55)' }}>
              <span className="text-2xl">🫙</span>
            </div>
            <span className="text-2xl font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Dhani<span style={{ color: 'var(--gold)' }}>Fresh</span>
            </span>
          </Link>

          <div className="relative mb-10 inline-block">
            <div className="w-40 h-40 rounded-3xl flex items-center justify-center mx-auto"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              }}>
              <div className="text-4xl sm:text-6xl animate-float">✨</div>
            </div>
            <div className="absolute -inset-4 rounded-[32px] pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, transparent 70%)', filter: 'blur(16px)' }} />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Join the Family!</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-base leading-relaxed mb-10">
            Create your account and start enjoying the purest Bilona ghee delivered across India.
          </p>

          <div className="space-y-3 text-left">
            {PERKS.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: perk.color }}>
                  <Check size={12} color={perk.dot} />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>{perk.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px] py-4"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--navy)' }}>
              <span className="text-xl">🫙</span>
            </div>
            <span className="text-xl font-extrabold" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
              Dhani<span style={{ color: 'var(--gold)' }}>Fresh</span>
            </span>
          </Link>

          <div className="rounded-3xl p-8 sm:p-10"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 24px 80px rgba(27,47,110,0.14), 0 4px 20px rgba(27,47,110,0.08)',
              border: '1px solid #E8EFF8',
            }}>
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold mb-1.5" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>Create Account</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Already have one?{' '}
                <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 700 }}>Sign in</Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FloatingInput
                id="reg-name" label="Full Name" type="text"
                value={name} onChange={e => setName(e.target.value)}
                icon={User} autoComplete="name" required
              />
              <FloatingInput
                id="reg-email" label="Email address" type="email"
                value={email} onChange={e => setEmail(e.target.value)}
                icon={Mail} autoComplete="email" required
              />
              <FloatingInput
                id="reg-password" label="Password (min 8 chars)" type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                icon={Lock} autoComplete="new-password" required
                rightElement={
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ color: 'var(--text-muted)' }} className="p-1 hover:text-[var(--navy)] transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {/* Password strength bar */}
              {password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <div className="flex gap-1.5 mb-1.5">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-500"
                        style={{ background: i <= strength ? strengthGrad : 'var(--border-color)' }} />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Password strength</p>
                    <p className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel}</p>
                  </div>
                </motion.div>
              )}

              <FloatingInput
                id="reg-confirm" label="Confirm Password" type={showConf ? 'text' : 'password'}
                value={confirm} onChange={e => setConfirm(e.target.value)}
                icon={Lock} autoComplete="new-password" required
                rightElement={
                  <button type="button" onClick={() => setShowConf(v => !v)}
                    style={{ color: 'var(--text-muted)' }} className="p-1 hover:text-[var(--navy)] transition-colors">
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <button type="submit" disabled={loading}
                className="w-full font-extrabold text-[15px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] mt-2"
                style={{
                  height: '52px',
                  background: 'var(--brand-gradient)',
                  color: '#FFFFFF',
                  boxShadow: '0 6px 24px rgba(27,47,110,0.35)',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Sparkles size={16} /> Create Account</>
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
              className="w-full h-12 rounded-xl flex items-center justify-center gap-3 transition-colors mb-2"
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
              Sign up with Google
            </button>

            <p className="mt-5 text-[11px] text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              By signing up you agree to our{' '}
              <Link to="/terms" style={{ color: 'var(--gold)' }}>Terms</Link>
              {' '}&{' '}
              <Link to="/privacy-policy" style={{ color: 'var(--gold)' }}>Privacy Policy</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
