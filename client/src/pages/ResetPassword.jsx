import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle, FiClock, FiAlertCircle, FiArrowLeft, FiShield } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { Helmet } from 'react-helmet-async'

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
          className="w-full rounded-xl text-[14px] font-medium outline-none transition-all"
          style={{
            height: '52px',
            paddingLeft: Icon ? '42px' : '14px',
            paddingRight: rightElement ? '44px' : '14px',
            background: disabled ? 'var(--bg-surface)' : (focused ? '#FEFEFE' : '#F7F9FC'),
            border: `2px solid ${focused ? 'var(--gold)' : '#E2E8F0'}`,
            color: 'var(--navy)',
            boxShadow: focused ? '0 0 0 4px rgba(245,166,35,0.12), 0 2px 8px rgba(245,166,35,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
            borderRadius: '14px',
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #EAF5FB 0%, #FFFFFF 100%)' }}>
      <Helmet><title>Password Reset Successful — DhaniFresh</title></Helmet>
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(56,161,105,0.08)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.90 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl p-10 text-center"
          style={{ background: '#FFFFFF', boxShadow: '0 24px 80px rgba(27,47,110,0.14)', border: '1px solid #E8EFF8' }}>

          {/* Animated success icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(56,161,105,0.15), rgba(56,161,105,0.08))', color: 'var(--success)', boxShadow: '0 8px 30px rgba(56,161,105,0.20)' }}
          >
            <FiCheckCircle size={44} />
          </motion.div>

          <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>Password Updated!</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
            Your password has been changed successfully. You can now log in with your new password.
          </p>

          <button onClick={() => navigate('/login')}
            className="w-full font-extrabold text-[15px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{ height: '52px', background: 'var(--brand-gradient)', color: 'white', boxShadow: 'var(--shadow-brand)', borderRadius: '14px', border: 'none', cursor: 'pointer' }}>
            Go to Login <FiArrowRight />
          </button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: '#EAF5FB' }}>
      <Helmet>
        <title>Reset Password — DhaniFresh</title>
        <meta name="description" content="Create a new password for your DhaniFresh account." />
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
            🔒 Secure Reset
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-[1.15]" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Create Your New Password
          </h2>
          <p className="text-[14.5px] leading-relaxed text-white/70">
            Ensure your new password is strong and memorable. We recommend using a mix of letters, numbers, and symbols.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[12px] font-medium text-white/55">
          © {new Date().getFullYear()} DhaniFresh. Prepared traditionally, delivered modernly.
        </div>
      </div>

      {/* Right Column: Reset Form */}
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
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Secure Reset</p>
          </div>



            {/* Header */}
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(245,166,35,0.12)', color: 'var(--gold)', boxShadow: '0 6px 20px rgba(245,166,35,0.18)' }}>
                <FiShield size={28} />
              </div>
              <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>Create New Password</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Enter your new password below.</p>
            </div>

            {/* Timer */}
            {secondsLeft > 0 && (
              <div className="rounded-2xl p-4 mb-6" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiClock size={14} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Time remaining</p>
                  </div>
                  <span className={`text-base font-bold tabular-nums transition-colors ${secondsLeft < 30 ? 'animate-pulse' : ''}`}
                    style={{ color: secondsLeft < 30 ? 'var(--danger)' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {mm}:{ss}
                  </span>
                </div>
                {/* Gradient progress bar */}
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: secondsLeft < 30 ? 'linear-gradient(90deg, #E53E3E, #FC8181)' : 'var(--brand-gradient)' }}
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
                className="rounded-2xl p-5 mb-6 text-center"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
                <FiClock size={28} style={{ color: 'var(--danger)' }} className="mx-auto mb-3" />
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--danger)' }}>Link Expired</p>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--danger)', opacity: 0.75 }}>This reset link has expired. Please request a new one.</p>
                <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                  style={{ background: 'rgba(239,68,68,0.10)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.20)' }}>
                  Request New Link <FiArrowRight size={12} />
                </Link>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <FloatingInput
                id="password"
                label="New Password"
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
                label="Confirm Password"
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
                  <div className="flex gap-1.5 mb-1.5">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-500"
                        style={{ background: i <= strength ? strengthGrad : 'var(--border-color)' }} />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Password strength</p>
                    <p className="text-xs font-semibold" style={{ color: strengthColor }}>
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
                    className="p-3.5 rounded-xl text-xs flex items-start gap-2.5"
                    style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: 'var(--danger)' }}>
                    <FiAlertCircle className="shrink-0 mt-0.5" size={14} />
                    <div>
                      {error}
                      {(errorType === 'expired' || errorType === 'device') && (
                        <Link to="/forgot-password" className="block text-xs mt-1 underline font-medium">Request new link</Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || isExpiredLocally}
                className="w-full font-extrabold text-[15px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{
                  height: '52px',
                  background: isExpiredLocally ? 'var(--border-color)' : 'var(--brand-gradient)',
                  color: '#FFFFFF',
                  boxShadow: isExpiredLocally ? 'none' : 'var(--shadow-brand)',
                  borderRadius: '14px', border: 'none',
                  cursor: (loading || isExpiredLocally) ? 'not-allowed' : 'pointer',
                  opacity: (loading || isExpiredLocally) ? 0.65 : 1,
                }}>
                {loading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <FiArrowRight size={15} />
                }
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <FiArrowLeft size={14} /> Back to Login
              </Link>
            </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ResetPassword
