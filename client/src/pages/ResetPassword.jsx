import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle, FiClock, FiAlertCircle, FiArrowLeft, FiShield } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

const EXPIRY_SECONDS = 120
const LS_KEY = 'resetPasswordSentAt'

/* ── Floating Input standard (matches Login/Register) ── */
const FloatingInput = ({ id, label, type = 'text', value, onChange, icon: Icon, rightElement, autoComplete, required, disabled }) => {
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
          disabled={disabled}
          placeholder={`Enter ${label.toLowerCase()}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-[1rem] text-sm font-medium outline-none transition-all placeholder:text-brand-text/30"
          style={{
            height: '52px',
            paddingLeft: Icon ? '42px' : '14px',
            paddingRight: rightElement ? '44px' : '14px',
            background: disabled ? 'rgba(27,47,110,0.05)' : (focused ? '#FFFFFF' : 'var(--ivory)'),
            border: `1px solid ${focused ? 'var(--brand-secondary)' : 'rgba(27, 47, 110, 0.2)'}`,
            color: 'var(--brand-primary)',
            boxShadow: focused ? '0 0 0 1px var(--brand-secondary)' : 'none',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  )
}

const ResetPassword = () => {
  const { t } = useTranslation()
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowP] = useState(false)
  const [showConf, setShowC] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(-1) // -1 means no local timer
  const timerRef = useRef(null)

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) {
      // User opened link on a new device/browser, we don't have the local timer.
      // That's fine, let them reset, the backend will validate the token.
      setSecondsLeft(-1)
      return
    }
    const sentAt = parseInt(raw, 10)
    const elapsed = Math.floor((Date.now() - sentAt) / 1000)
    const remaining = Math.max(0, EXPIRY_SECONDS - elapsed)
    setSecondsLeft(remaining)
    if (remaining <= 0) return
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current); localStorage.removeItem(LS_KEY); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const isExpiredLocally = secondsLeft === 0 && !success
  const mm = secondsLeft > 0 ? String(Math.floor(secondsLeft / 60)).padStart(2, '0') : '--'
  const ss = secondsLeft > 0 ? String(secondsLeft % 60).padStart(2, '0') : '--'
  const timerProgress = secondsLeft > 0 ? (secondsLeft / EXPIRY_SECONDS) * 100 : 100

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
  const strengthGrad = strength <= 2
    ? 'linear-gradient(90deg, #E53E3E, #FC8181)'
    : strength <= 4
    ? 'linear-gradient(90deg, #D69E2E, #F6D860)'
    : 'linear-gradient(90deg, #38A169, #68D391)'
  const strengthColor = strength <= 2 ? 'var(--danger)' : strength <= 4 ? 'var(--warning)' : 'var(--success)'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setErrorType('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    if (isExpiredLocally) return setError('This link has expired. Please request a new one.')
    setLoading(true)
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password })
      clearInterval(timerRef.current)
      localStorage.removeItem(LS_KEY)
      setSuccess(true)
      toast.success('Password updated successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password.'
      const status = err.response?.status
      if (status === 403) setErrorType('device')
      else if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) setErrorType('expired')
      else setErrorType('generic')
      setError(msg)
    } finally { setLoading(false) }
  }

  // if (secondsLeft === null) return null // Removed to allow rendering without timer

  /* ── Success State ── */
  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[var(--ivory)] font-sans">
      <Helmet><title>Password Reset Successful — Daatasa</title></Helmet>
      
      {/* Background visual */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, var(--brand-primary) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.90 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-[2rem] p-10 text-center bg-white border border-brand-primary/10 shadow-[0_24px_80px_rgba(27,47,110,0.08)]">

          {/* Animated success icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 bg-emerald-50 text-emerald-600 border border-emerald-100"
          >
            <FiCheckCircle size={44} />
          </motion.div>

          <h1 className="text-3xl font-bold font-display text-brand-primary mb-3">{t('auth.passwordUpdated', 'Password Updated!')}</h1>
          <p className="text-sm font-medium leading-relaxed text-brand-text/60 mb-10">
            {t('auth.passwordUpdatedDesc', 'Your password has been changed successfully. You can now log in with your new password.')}
          </p>

          <button onClick={() => navigate('/login')}
            className="w-full btn btn-primary h-14 rounded-full flex items-center justify-center gap-2 text-sm font-bold">
            {t('auth.goToLogin', 'Go to Login')} <FiArrowRight />
          </button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-[var(--ivory)] font-sans">
      <Helmet>
        <title>Reset Password — Daatasa</title>
        <meta name="description" content="Create a new password for your Daatasa account." />
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
              <div className="text-5xl sm:text-7xl animate-float-slow">🛡️</div>
            </div>
            {/* Ring glow */}
            <div className="absolute -inset-4 rounded-[2.5rem] pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)', filter: 'blur(16px)' }} />
          </div>

          <h2 className="text-3xl font-extrabold font-display text-brand-primary mb-3">{t('auth.secureResetTitle', 'Secure Reset')}</h2>
          <p className="text-base font-medium text-brand-text/60 leading-relaxed mb-10">
            {t('auth.secureResetDesc', 'Ensure your new password is strong and memorable. We recommend using a mix of letters, numbers, and symbols.')}
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { emoji: '🔒', label: t('auth.badgeEncrypted', 'Encrypted') },
              { emoji: '🛡️', label: t('auth.badgeProtected', 'Protected') },
              { emoji: '⚡', label: t('auth.badgeInstant', 'Instant') },
            ].map(b => (
              <div key={b.label} className="rounded-2xl py-4 px-3 text-center transition-all duration-200 bg-brand-primary/5 border border-brand-primary/10 hover:bg-brand-primary/10">
                <div className="text-2xl mb-2">{b.emoji}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">{b.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Column: Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 sm:p-10 border border-brand-primary/10 shadow-[0_24px_80px_rgba(27,47,110,0.08)]"
        >
            {/* Mobile logo header */}
            <div className="flex flex-col items-center mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3 mb-8">
                <img src="/logo_rectangle.png" alt="Daatasa Logo" className="h-16 w-auto" />
              </Link>
              <p className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest">{t('auth.secureResetTitle', 'Secure Reset')}</p>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-[1rem] flex items-center justify-center mx-auto mb-6 bg-brand-primary/5 text-brand-secondary border border-brand-primary/10">
                <FiShield size={28} />
              </div>
              <h1 className="text-3xl font-bold font-display text-brand-primary mb-3">{t('auth.resetTitle', 'Create New Password')}</h1>
              <p className="text-sm font-medium text-brand-text/60">{t('auth.resetDesc', 'Enter your new password below.')}</p>
            </div>

            {/* Timer */}
            {secondsLeft > 0 && (
              <div className="rounded-[1.5rem] p-5 mb-8 bg-white border border-brand-primary/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiClock size={16} className="text-brand-text/40" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Time remaining</p>
                  </div>
                  <span className={`text-xl font-bold font-display tabular-nums transition-colors ${secondsLeft < 30 ? 'text-red-500 animate-pulse' : 'text-brand-primary'}`}>
                    {mm}:{ss}
                  </span>
                </div>
                {/* Gradient progress bar */}
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-brand-primary/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: secondsLeft < 30 ? 'var(--danger)' : 'var(--brand-primary)' }}
                    initial={{ width: '100%' }}
                    animate={{ width: `${timerProgress}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>
              </div>
            )}
            
            {isExpiredLocally && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[1.5rem] p-6 mb-8 text-center bg-red-50 border border-red-100"
              >
                <FiClock size={32} className="mx-auto mb-4 text-red-500" />
                <p className="text-sm font-bold text-red-600 mb-2">Link Expired</p>
                <p className="text-xs font-medium leading-relaxed text-red-500 mb-5">This reset link has expired. Please request a new one.</p>
                <Link to="/forgot-password" className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full transition-all bg-white text-red-600 border border-red-200 hover:bg-red-50">
                  Request New Link <FiArrowRight size={14} />
                </Link>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <FloatingInput
                id="password"
                label={t('auth.newPassLabel', 'New Password')}
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPass(e.target.value)}
                required
                disabled={isExpiredLocally}
                icon={FiLock}
                rightElement={
                  <button type="button" onClick={() => setShowP(!showPass)}
                    className="transition-colors p-1"
                    style={{ color: 'var(--text-muted)' }}>
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
              />

              {/* Confirm Password */}
              <FloatingInput
                id="confirm"
                label={t('auth.confirmPassLabel', 'Confirm Password')}
                type={showConf ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                disabled={isExpiredLocally}
                icon={FiLock}
                rightElement={
                  <button type="button" onClick={() => setShowC(!showConf)}
                    className="transition-colors p-1"
                    style={{ color: 'var(--text-muted)' }}>
                    {showConf ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
              />

              {/* Strength bar */}
              {password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <div className="flex gap-1.5 mb-1.5 mt-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-500"
                        style={{ background: i <= strength ? strengthGrad : 'rgba(27,47,110,0.1)' }} />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40">Password strength</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: strengthColor }}>
                      {['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength]}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 rounded-[1rem] text-xs font-bold flex items-start gap-3 bg-red-50 border border-red-100 text-red-600"
                  >
                    <FiAlertCircle className="shrink-0 mt-0.5" size={16} />
                    <div>
                      {error}
                      {(errorType === 'expired' || errorType === 'device') && (
                        <Link to="/forgot-password" className="block text-xs mt-1.5 underline font-bold text-red-700">Request new link</Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || isExpiredLocally}
                className="w-full btn btn-primary h-14 rounded-full flex items-center justify-center gap-2 mt-4 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <FiArrowRight size={16} />
                }
                {loading ? t('auth.resetting', 'Updating…') : t('auth.resetBtn', 'Update Password')}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-brand-primary/10">
              <Link to="/login"
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-text/40 hover:text-brand-secondary transition-colors"
              >
                <FiArrowLeft size={14} /> {t('auth.backToLogin', 'Back to Login')}
              </Link>
            </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ResetPassword
