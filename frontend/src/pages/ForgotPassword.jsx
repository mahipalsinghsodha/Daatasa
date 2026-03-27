import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const LS_KEY = 'resetPasswordSentAt' // must match ResetPassword.jsx

const ForgotPassword = () => {
  const navigate              = useNavigate()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [notFound, setNotFound]     = useState(false) // 404 – not registered
  const [cooldown, setCooldown]     = useState(0)     // 409 – link already active
  const [error, setError]           = useState('')
  const cooldownRef = useRef(null)

  /* ── Cooldown countdown (when backend says link is still active) ── */
  useEffect(() => {
    if (cooldown <= 0) return
    cooldownRef.current = setInterval(() => {
      setCooldown(s => {
        if (s <= 1) { clearInterval(cooldownRef.current); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(cooldownRef.current)
  }, [cooldown]) // restarts only when a new cooldown value is set by the server

  const cdMm = String(Math.floor(cooldown / 60)).padStart(2, '0')
  const cdSs = String(cooldown % 60).padStart(2, '0')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotFound(false)
    if (cooldown > 0) return // still cooling down
    setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', { email })
      localStorage.setItem(LS_KEY, Date.now().toString())
      setSent(true)
    } catch (err) {
      const status    = err.response?.status
      const data      = err.response?.data || {}

      if (status === 404) {
        // Email not registered → offer registration
        setNotFound(true)
      } else if (status === 409) {
        // A valid link is already active — show remaining seconds
        const remaining = data.remainingSeconds || 120
        localStorage.setItem(LS_KEY, (Date.now() - (120 - remaining) * 1000).toString())
        setCooldown(remaining)
      } else {
        setError(data.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  /* ── Success screen ────────────────────────────────────────────── */
  if (sent) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary-600 px-8 py-7 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Check your inbox</h2>
          </div>
          <div className="px-8 py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <p className="text-gray-800 font-semibold text-base">Reset link sent!</p>
            <p className="text-gray-500 text-sm">
              We sent a reset link to <strong className="text-gray-700">{email}</strong>.
              <br/>It is valid for <strong>2 minutes</strong> — check your inbox now.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800 font-medium">
              ⚠️ Open the link on <strong>this device and browser</strong> — it won't work on a different one.
            </div>
            <p className="text-xs text-gray-400">
              Didn't receive it?{' '}
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-primary-600 hover:text-primary-700 font-semibold underline"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Main form ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          <div className="bg-primary-600 px-8 py-7 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Forgot password?</h2>
            <p className="text-primary-100 text-sm mt-1">We'll send you a reset link</p>
          </div>

          <div className="px-8 py-8 space-y-5">

            <p className="text-sm text-gray-500">
              Enter the email address linked to your account and we'll send you a reset link.
            </p>

            {/* ── 409: link already active ── */}
            {cooldown > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-4 space-y-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">A reset link was already sent</p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Check your inbox — the previous link is still active.
                      You can request a new one in:
                    </p>
                  </div>
                </div>
                {/* Cooldown timer */}
                <div className="bg-white border border-blue-200 rounded-lg px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">⏱ Resend available in</span>
                  <span className="text-sm font-bold tabular-nums text-blue-700">{cdMm}:{cdSs}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-blue-400 transition-all duration-1000"
                    style={{ width: `${(cooldown / 120) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* ── 404: email not registered ── */}
            {notFound && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-4 space-y-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">No account found for <span className="font-bold">{email}</span></p>
                    <p className="text-xs text-amber-700 mt-0.5">This email is not registered. Create an account instead?</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                >
                  Create an account →
                </button>
                <button
                  onClick={() => { setNotFound(false); setEmail('') }}
                  className="w-full text-xs text-gray-500 hover:text-gray-700 transition underline"
                >
                  Try a different email
                </button>
              </div>
            )}

            {/* Generic error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form — hidden when not-found banner is showing */}
            {!notFound && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               placeholder:text-gray-400 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg
                             text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Sending…
                    </>
                  ) : cooldown > 0
                    ? `Resend available in ${cdMm}:${cdSs}`
                    : 'Send Reset Link'
                  }
                </button>
              </form>
            )}

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

export default ForgotPassword
