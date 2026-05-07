import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { FiMail, FiArrowLeft, FiClock, FiAlertCircle, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const LS_KEY = 'resetPasswordSentAt'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState('')
  const cooldownRef = useRef(null)

  useEffect(() => {
    if (cooldown <= 0) return
    cooldownRef.current = setInterval(() => {
      setCooldown(s => {
        if (s <= 1) { clearInterval(cooldownRef.current); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(cooldownRef.current)
  }, [cooldown])

  const cdMm = String(Math.floor(cooldown / 60)).padStart(2, '0')
  const cdSs = String(cooldown % 60).padStart(2, '0')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotFound(false)
    if (cooldown > 0) return
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      localStorage.setItem(LS_KEY, Date.now().toString())
      setSent(true)
    } catch (err) {
      const status = err.response?.status
      const data = err.response?.data || {}
      if (status === 404) {
        setNotFound(true)
      } else if (status === 409) {
        const remaining = data.remainingSeconds || 120
        setCooldown(remaining)
      } else {
        setError(data.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-orange-600/5 rounded-full blur-[120px]" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
             <FiCheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Check Your Email</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            We've sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>. The link is valid for 2 minutes.
          </p>
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
             <p className="text-xs font-semibold text-orange-700">⚠️ Important: Open the link on this same device and browser for it to work.</p>
          </div>
          <button 
            onClick={() => { setSent(false); setEmail(''); setNotFound(false) }}
            className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-orange-500 transition-all text-sm"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-orange-600/5 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="mb-8 text-center">
              <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FiMail size={24} />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Forgot Password?</h1>
              <p className="text-sm text-gray-500">Enter your email and we'll send you a reset link</p>
            </div>

            <AnimatePresence mode="wait">
              {cooldown > 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                     <FiClock className="text-blue-600" />
                     <p className="text-xs font-semibold text-blue-700">Please wait before requesting again</p>
                  </div>
                  <p className="text-xs text-blue-600 leading-relaxed mb-4">A reset link was already sent. You can request a new one after the timer expires.</p>
                  <div className="flex items-center justify-between">
                     <span className="text-xl font-bold text-blue-900 tabular-nums">{cdMm}:{cdSs}</span>
                     <div className="w-1/2 bg-blue-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(cooldown/120)*100}%` }} />
                     </div>
                  </div>
                </motion.div>
              ) : notFound ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                     <FiAlertCircle className="text-amber-600" />
                     <p className="text-xs font-semibold text-amber-700">Email not found</p>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed mb-4">No account found with <span className="font-semibold">{email}</span>. Please check and try again.</p>
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => navigate('/register')} className="py-2.5 bg-amber-600 text-white rounded-lg text-xs font-semibold">Create Account</button>
                     <button onClick={() => { setNotFound(false); setEmail('') }} className="py-2.5 bg-white border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold">Try Again</button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FiMail size={18} />
                      </div>
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-600 flex items-center gap-2">
                       <FiAlertCircle /> {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiArrowRight />}
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
                <FiArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
