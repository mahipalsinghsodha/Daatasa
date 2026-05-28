// pages/ForgotPassword.jsx — Mooly Navy + Gold Theme
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { FiMail, FiArrowLeft, FiClock, FiAlertCircle, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

const LS_KEY = 'resetPasswordSentAt'

/* ── Floating Input standard (matches Login/Register) ── */
const FloatingInput = ({ id, label, type = 'text', value, onChange, icon: Icon, required, autoComplete }) => {
  const [focused, setFocused] = useState(false)
  const isLifted = focused || value.length > 0

  return (
    <div className="relative mb-5">
      <div className="relative">
        {Icon && (
          <Icon size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
            style={{ color: focused ? 'var(--brand-secondary)' : 'var(--text-muted)' }}
          />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          placeholder=" "
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl text-[14px] font-medium outline-none transition-all"
          style={{
            paddingTop: '22px', paddingBottom: '8px',
            paddingLeft: Icon ? '40px' : '14px',
            background: '#F7F9FC',
            border: `2px solid ${focused ? 'var(--gold)' : '#E2E8F0'}`,
            color: 'var(--navy)',
            boxShadow: focused ? '0 0 0 4px rgba(245,166,35,0.12)' : 'none',
            height: '56px',
          }}
        />
      </div>
      <label htmlFor={id}
        className="absolute pointer-events-none transition-all duration-200"
        style={{
          left: Icon ? '40px' : '14px',
          top: isLifted ? '8px' : '50%',
          transform: isLifted ? 'none' : 'translateY(-50%)',
          fontSize: isLifted ? '11px' : '14px',
          fontWeight: isLifted ? '700' : '500',
          color: focused ? 'var(--gold)' : 'var(--text-muted)',
          letterSpacing: isLifted ? '0.03em' : '0',
        }}
      >
        {label}
      </label>
    </div>
  )
}

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError]       = useState('')
  const [timerRef, setTimerRef] = useState(null)

  useEffect(() => {
    // Check if there's an active cooldown from a previous session on mount
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const sentAt = parseInt(raw, 10)
      const elapsed = Math.floor((Date.now() - sentAt) / 1000)
      const remaining = 120 - elapsed
      if (remaining > 0) {
        startTimer(remaining)
      } else {
        localStorage.removeItem(LS_KEY)
      }
    }
    return () => {
      if (timerRef) clearInterval(timerRef)
    }
  }, [])

  const startTimer = (secs) => {
    setCooldown(secs)
    const id = setInterval(() => {
      setCooldown(s => {
        if (s <= 1) {
          clearInterval(id)
          localStorage.removeItem(LS_KEY)
          return 0
        }
        return s - 1
      })
    }, 1000)
    setTimerRef(id)
  }

  const cdMm = String(Math.floor(cooldown / 60)).padStart(2, '0')
  const cdSs = String(cooldown % 60).padStart(2, '0')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setNotFound(false)
    if (cooldown > 0) return
    if (!email.trim()) { setError('Please enter your email'); return }
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() })
      localStorage.setItem(LS_KEY, Date.now().toString())
      setSent(true)
      startTimer(120)
    } catch (err) {
      const status = err.response?.status
      const data = err.response?.data || {}
      if (status === 404) setNotFound(true)
      else if (status === 409) startTimer(data.remainingSeconds || 120)
      else setError(data.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#EAF5FB' }}>
      <Helmet>
        <title>Forgot Password — DhaniFresh</title>
        <meta name="description" content="Reset your DhaniFresh account password to continue shopping premium A2 bilona ghee." />
      </Helmet>

      {/* Left Column: Visual Brand Identity (Mooly Navy Style) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--bg-navy)' }}>
        
        {/* Soft elegant glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[160px] opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-35 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--gold-light) 0%, transparent 70%)' }} />

        {/* Top Header */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5 self-start group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(245,166,35,0.35)] group-hover:scale-105 transition-transform"
            style={{ background: 'var(--gold)' }}>
            <span className="text-lg">🫙</span>
          </div>
          <span className="font-extrabold text-[20px] text-white tracking-tight">
            Dhani<span style={{ color: 'var(--gold)' }}>Fresh</span>
          </span>
        </Link>

        {/* Narrative / Focus section */}
        <div className="relative z-10 my-auto max-w-[420px] space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-widest uppercase"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--gold)', border: '1px solid rgba(255,255,255,0.12)' }}>
            🔒 Password Recovery
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-[1.15]" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Regain Access to Pure Goodness
          </h2>
          <p className="text-[14.5px] leading-relaxed text-white/70">
            No worries! Simply enter your registered email and we'll send a secure password reset link to your inbox.
          </p>

          <div className="pt-4 border-t border-white/10 space-y-3.5">
            {[
              'Secure encrypted link generation',
              'Quick 2-minute recovery window',
              'Protects your saved orders & delivery addresses',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--gold)' }}>
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-[13px] font-semibold text-white/90">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[12px] font-medium text-white/55">
          © {new Date().getFullYear()} DhaniFresh. Prepared traditionally, delivered modernly.
        </div>
      </div>

      {/* Right Column: Reset Request Form (White Card Float) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px] bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-[0_8px_32px_rgba(27,47,110,0.08)]"
        >
          {/* Mobile logo header */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2 group mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gold)' }}>
                <span className="text-base">🫙</span>
              </div>
              <span className="font-extrabold text-[18px] text-[var(--navy)]">Dhani<span style={{ color: 'var(--gold)' }}>Fresh</span></span>
            </Link>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password Recovery</p>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_8px_20px_rgba(56,161,105,0.15)]"
                  style={{ background: 'rgba(56,161,105,0.1)', color: 'var(--success)' }}>
                  <FiCheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--navy)' }}>Check Your Email</h3>
                <p className="text-[13.5px] leading-relaxed text-slate-500 mb-6">
                  We've sent a recovery link to <strong className="text-slate-800">{email}</strong>.
                </p>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-8 text-left space-y-1">
                  <p className="text-[12.5px] font-bold text-amber-800">⚠️ Secure Action Required</p>
                  <p className="text-[11.5px] text-amber-700 leading-relaxed">
                    For strict account security, open the link on this **same device and browser**. The link is valid for **2 minutes**.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => { setSent(false); setEmail(''); setNotFound(false) }}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-[0_4px_12px_rgba(15,23,42,0.15)] active:scale-[0.98]"
                  >
                    Resend Link
                  </button>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-bold rounded-xl text-sm transition-all"
                  >
                    <FiArrowLeft size={16} /> Back to Login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6 text-center lg:text-left">
                  <h3 className="text-2xl font-extrabold mb-1.5" style={{ color: 'var(--navy)' }}>Forgot Password?</h3>
                  <p className="text-sm text-slate-500">Provide your account email to receive your recovery credentials link.</p>
                </div>

                <AnimatePresence mode="wait">
                  {cooldown > 0 ? (
                    <motion.div
                      key="timer"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 border border-blue-100 rounded-2xl p-4.5 mb-6"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FiClock className="text-blue-600 shrink-0" size={16} />
                        <p className="text-[12.5px] font-bold text-blue-800">Request Rate Limit Active</p>
                      </div>
                      <p className="text-[11.5px] text-blue-650 leading-relaxed mb-4">
                        A secure link has already been sent to your inbox. Please wait before generating another link.
                      </p>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl font-black text-blue-900 tabular-nums">{cdMm}:{cdSs}</span>
                        <div className="w-1/2 bg-blue-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-1000 rounded-full" style={{ width: `${(cooldown / 120) * 100}%` }} />
                        </div>
                      </div>
                    </motion.div>
                  ) : notFound ? (
                    <motion.div
                      key="notfound-alert"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border border-amber-100 rounded-2xl p-4.5 mb-6"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <FiAlertCircle className="text-amber-600 shrink-0" size={16} />
                        <p className="text-[12.5px] font-bold text-amber-800">Account Not Registered</p>
                      </div>
                      <p className="text-[12px] text-amber-700 leading-relaxed mb-4">
                        No registered email found matching <strong className="text-slate-800">{email}</strong>.
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => navigate('/register')}
                          className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Create Account
                        </button>
                        <button
                          onClick={() => { setNotFound(false); setEmail('') }}
                          className="py-2.5 bg-white border border-amber-250 text-amber-750 rounded-xl text-xs font-bold hover:bg-amber-50 transition-all"
                        >
                          Try Another
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <form key="actual-form" onSubmit={handleSubmit} className="space-y-4">
                      <FloatingInput
                        id="email"
                        label="Email Address"
                        type="email"
                        icon={FiMail}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />

                      {error && (
                        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
                          <FiAlertCircle size={15} className="shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 text-white font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_6px_20px_rgba(27,47,110,0.25)] active:scale-[0.99]"
                        style={{ background: 'var(--brand-gradient)' }}
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Send Reset Link <FiArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </AnimatePresence>

                <div className="mt-8 text-center pt-4 border-t border-slate-100">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs font-extrabold transition-colors"
                    style={{ color: 'var(--navy)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--navy)'}
                  >
                    <FiArrowLeft size={14} /> Back to Sign In
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPassword
