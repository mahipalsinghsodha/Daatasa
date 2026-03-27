import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>
)

const EXPIRY_SECONDS = 120
const LS_KEY = 'resetPasswordSentAt'

const ResetPassword = () => {
  const { token }   = useParams()
  const navigate    = useNavigate()

  const [password, setPass]       = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowP]      = useState(false)
  const [showConf, setShowC]      = useState(false)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState('')
  const [errorType, setErrorType] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(null) // null = still calculating
  const timerRef = useRef(null)

  /* ─── ONE effect, empty deps = runs once on mount, cleans up on unmount ───
     BUG IN PREVIOUS VERSION: second useEffect had [secondsLeft] as dep, so
     React's cleanup fired on every tick and killed the interval each second.
  ─────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) {
      navigate('/forgot-password', { replace: true })
      return
    }

    const sentAt    = parseInt(raw, 10)
    const elapsed   = Math.floor((Date.now() - sentAt) / 1000)
    const remaining = Math.max(0, EXPIRY_SECONDS - elapsed)
    setSecondsLeft(remaining)

    if (remaining <= 0) return // already expired

    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          localStorage.removeItem(LS_KEY)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current) // only on unmount
  }, []) // ← empty: single run, no re-run on every tick

  const isExpiredLocally = secondsLeft === 0 && !success
  const mm = secondsLeft !== null ? String(Math.floor(secondsLeft / 60)).padStart(2, '0') : '--'
  const ss = secondsLeft !== null ? String(secondsLeft % 60).padStart(2, '0')             : '--'
  const timerBg   = secondsLeft > 60 ? 'bg-green-50 border-green-200'   : secondsLeft > 30 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
  const timerText = secondsLeft > 60 ? 'text-green-700'                 : secondsLeft > 30 ? 'text-yellow-700'                : 'text-red-700'
  const timerBar  = secondsLeft > 60 ? 'bg-green-500'                   : secondsLeft > 30 ? 'bg-yellow-400'                  : 'bg-red-500'

  const strength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 6)           s++
    if (password.length >= 10)          s++
    if (/[A-Z]/.test(password))         s++
    if (/[0-9]/.test(password))         s++
    if (/[^A-Za-z0-9]/.test(password))  s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'][strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrorType('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    if (isExpiredLocally)     return setError('The link has expired. Please request a new one.')
    setLoading(true)
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password })
      clearInterval(timerRef.current)
      localStorage.removeItem(LS_KEY)
      setSuccess(true)
    } catch (err) {
      const msg    = err.response?.data?.message || 'Reset failed.'
      const status = err.response?.status
      if (status === 403)                                                              setErrorType('device')
      else if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) setErrorType('expired')
      else                                                                             setErrorType('generic')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (secondsLeft === null) return null // brief loading while calculating

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary-600 px-8 py-7 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Password Reset</h2>
          </div>
          <div className="px-8 py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="text-gray-800 font-semibold text-base">Password updated successfully!</p>
            <p className="text-gray-500 text-sm">Your password has been changed. The reset link is now permanently disabled.</p>
            <button onClick={() => navigate('/login')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-sm">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          <div className="bg-primary-600 px-8 py-7 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Reset password</h2>
            <p className="text-primary-100 text-sm mt-1">Choose a strong new password</p>
          </div>

          <div className="px-8 py-8 space-y-5">

            {/* Timer */}
            {!isExpiredLocally ? (
              <div className={`rounded-lg border px-4 py-3 ${timerBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600">⏱ Link expires in</span>
                  <span className={`text-sm font-bold tabular-nums ${timerText}`}>{mm}:{ss}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full transition-all duration-1000 ${timerBar}`}
                    style={{ width: `${(secondsLeft / EXPIRY_SECONDS) * 100}%` }}/>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-4 text-center space-y-2">
                <p className="text-red-700 font-semibold text-sm">⏰ This link has expired</p>
                <p className="text-red-600 text-xs">Reset links are valid for 2 minutes only.</p>
                <Link to="/forgot-password"
                  className="inline-block mt-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition underline">
                  Request a new reset link →
                </Link>
              </div>
            )}

            {/* Error */}
            {error && !isExpiredLocally && (
              <div className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm border ${
                errorType === 'device' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div>
                  <span>{error}</span>
                  {(errorType === 'expired' || errorType === 'device') && (
                    <div className="mt-1.5">
                      <Link to="/forgot-password" className="text-xs font-semibold underline">Request a new reset link →</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={(e) => setPass(e.target.value)} required disabled={isExpiredLocally}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed"/>
                  <button type="button" onClick={() => setShowP(!showPass)} tabIndex={-1} disabled={isExpiredLocally}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-gray-200'}`}/>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Strength: <span className="font-medium">{strengthLabel}</span></p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
                <div className="relative">
                  <input type={showConf ? 'text' : 'password'} value={confirm}
                    onChange={(e) => setConfirm(e.target.value)} required disabled={isExpiredLocally}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 pr-11 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      confirm && confirm !== password ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}/>
                  <button type="button" onClick={() => setShowC(!showConf)} tabIndex={-1} disabled={isExpiredLocally}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showConf ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading || isExpiredLocally}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Resetting…
                  </>
                ) : 'Reset Password'}
              </button>
            </form>

            <Link to="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to Login
            </Link>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
