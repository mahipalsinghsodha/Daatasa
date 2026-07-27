// pages/ForgotPassword.jsx — Mooly Navy + Gold Theme
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { FiMail, FiArrowLeft, FiClock, FiAlertCircle, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

const LS_KEY = 'resetPasswordSentAt'

/* ── Floating Input standard (matches Login/Register) ── */
const FloatingInput = ({ id, label, type = 'text', value, onChange, icon: Icon, rightElement, autoComplete, required }) => {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative mb-5 w-full">
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
          className="w-full rounded-[1rem] text-sm font-medium outline-none transition-all placeholder:text-brand-text/30"
          style={{
            height: '52px',
            paddingLeft: Icon ? '42px' : '14px',
            paddingRight: rightElement ? '44px' : '14px',
            background: focused ? '#FFFFFF' : 'var(--ivory)',
            border: `1px solid ${focused ? 'var(--brand-secondary)' : 'rgba(27, 47, 110, 0.2)'}`,
            color: 'var(--brand-primary)',
            boxShadow: focused ? '0 0 0 1px var(--brand-secondary)' : 'none',
          }}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  )
}

const ForgotPassword = () => {
  const { t } = useTranslation()
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
    <div className="min-h-screen flex bg-[var(--ivory)] font-sans">
      <Helmet>
        <title>Forgot Password — Daatasa</title>
        <meta name="description" content="Reset your Daatasa account password to continue shopping premium Tharparkar bilona ghee." />
      </Helmet>

      {/* ── Left Panel (Brand Background) ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden flex-col items-center justify-center p-12 bg-white border-r border-brand-primary/10">
        
        {/* Background blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full pointer-events-none animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.5 }} />
        <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full pointer-events-none animate-blob-delay"
          style={{ background: 'radial-gradient(circle, rgba(27, 47, 110, 0.08) 0%, transparent 70%)', filter: 'blur(50px)', opacity: 0.5 }} />
        
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, var(--brand-primary) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center max-w-md w-full"
        >
          {/* Logo */}
          <Link to="/" className="flex w-full justify-center items-center gap-3 mb-14">
            <img src="/logo_rectangle.png" alt="Daatasa Logo" className="h-16 w-auto" />
          </Link>

          {/* Floating hero visual */}
          <div className="relative mb-10 inline-block">
            <div className="w-40 h-40 rounded-[2rem] flex items-center justify-center mx-auto bg-brand-primary text-white shadow-[0_20px_60px_rgba(27,47,110,0.15)]">
              <div className="text-5xl sm:text-7xl animate-float-slow">🔐</div>
            </div>
            {/* Ring glow */}
            <div className="absolute -inset-4 rounded-[2.5rem] pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)', filter: 'blur(16px)' }} />
          </div>

          <h2 className="text-3xl font-extrabold font-display text-brand-primary mb-3">
            {t('auth.recoveryTitle', 'Password Recovery')}
          </h2>
          <p className="text-base font-medium text-brand-text/60 leading-relaxed mb-10">
            {t('auth.recoveryDesc', "Regain access to pure goodness. We'll send a secure reset link directly to your inbox.")}
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { emoji: '🛡️', label: t('auth.badgeSecure', 'Secure') },
              { emoji: '⏱️', label: t('auth.badgeLink', '2-Min Link') },
              { emoji: '📦', label: t('auth.badgeSafe', 'Safe Data') },
            ].map(b => (
              <div key={b.label} className="rounded-2xl py-4 px-3 text-center transition-all duration-200 bg-brand-primary/5 border border-brand-primary/10 hover:bg-brand-primary/10">
                <div className="text-2xl mb-2">{b.emoji}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">{b.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Column: Reset Request Form (White Card Float) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 sm:p-10 border border-brand-primary/10 shadow-[0_24px_80px_rgba(27,47,110,0.08)]"
        >
          {/* Mobile logo header */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <img src="/logo_rectangle.png" alt="Daatasa Logo" className="h-16 w-auto" />
            </Link>
            <p className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest">{t('auth.recoveryTitle', 'Password Recovery')}</p>
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
                <div className="w-16 h-16 rounded-[1rem] flex items-center justify-center mx-auto mb-6 bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <FiCheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold font-display text-brand-primary mb-2">{t('auth.checkEmail', 'Check Your Email')}</h3>
                <p className="text-sm font-medium leading-relaxed text-brand-text/60 mb-6">
                  {t('auth.sentLink', "We've sent a recovery link to ")} <strong className="text-brand-primary">{email}</strong>.
                </p>

                <div className="rounded-[1.5rem] p-5 mb-8 text-left space-y-2 bg-amber-50 border border-amber-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-amber-600">
                    <FiAlertCircle size={14} /> Secure Action Required
                  </p>
                  <p className="text-xs font-medium leading-relaxed text-amber-700">
                    For strict account security, open the link on this <strong className="font-bold">same device and browser</strong>. The link is valid for <strong className="font-bold">2 minutes</strong>.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => { setSent(false); setEmail(''); setNotFound(false) }}
                    className="w-full btn btn-primary h-14 rounded-full text-sm font-bold flex items-center justify-center"
                  >
                    {t('auth.resendLink', 'Resend Link')}
                  </button>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 w-full h-14 font-bold rounded-full text-sm transition-all bg-white border border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5"
                  >
                    <FiArrowLeft size={16} /> {t('auth.backToLogin', 'Back to Login')}
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-8 text-center lg:text-left">
                    <h3 className="text-3xl font-bold font-display text-brand-primary mb-2">{t('auth.forgotTitle', 'Forgot Password?')}</h3>
                    <p className="text-sm font-medium text-brand-text/60">{t('auth.forgotDesc', "Provide your account email to receive your recovery credentials link.")}</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {cooldown > 0 ? (
                      <motion.div
                        key="timer"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[1.5rem] p-5 mb-8 bg-white border border-brand-primary/10 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <FiClock size={16} className="text-brand-text/40" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Request Rate Limit Active</p>
                        </div>
                        <p className="text-xs font-medium leading-relaxed mb-4 text-brand-text/60">
                          A secure link has already been sent to your inbox. Please wait before generating another link.
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-2xl font-bold font-display tabular-nums transition-colors ${cooldown < 30 ? 'text-red-500' : 'text-brand-primary'}`}>
                            {cdMm}:{cdSs}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-brand-primary/5">
                          <div className="h-full rounded-full transition-all duration-1000 bg-brand-primary"
                            style={{ width: `${(cooldown / 120) * 100}%`, background: cooldown < 30 ? 'var(--danger)' : 'var(--brand-primary)' }} />
                        </div>
                      </motion.div>
                    ) : notFound ? (
                      <motion.div
                        key="notfound-alert"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                          className="bg-amber-50 border border-amber-100 rounded-[1.5rem] p-5 mb-8"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FiAlertCircle className="text-amber-600 shrink-0" size={16} />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800">Account Not Registered</p>
                          </div>
                          <p className="text-xs font-medium text-amber-700 leading-relaxed mb-5">
                            No registered email found matching <strong className="text-amber-900">{email}</strong>.
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => navigate('/register')}
                              className="py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                            >
                              Create Account
                            </button>
                            <button
                              onClick={() => { setNotFound(false); setEmail('') }}
                              className="py-3 bg-white border border-amber-200 text-amber-700 rounded-full text-xs font-bold hover:bg-amber-50 transition-all"
                            >
                              Try Another
                            </button>
                          </div>
                        </motion.div>
                  ) : (
                          <form key="actual-form" onSubmit={handleSubmit} className="space-y-5">
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
                              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-[1rem] text-xs font-bold text-red-600">
                                <FiAlertCircle size={16} className="shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                              className="w-full btn btn-primary h-14 rounded-full flex items-center justify-center gap-2 mt-4 text-sm font-bold"
                      >
                        {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                                    Send Reset Link <FiArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </AnimatePresence>

                  <div className="mt-8 text-center pt-6 border-t border-brand-primary/10">
                  <Link
                    to="/login"
                      className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-text/40 hover:text-brand-secondary transition-colors"
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
