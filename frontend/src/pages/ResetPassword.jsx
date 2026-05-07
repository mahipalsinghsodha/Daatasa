import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle, FiClock, FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'

const EXPIRY_SECONDS = 120
const LS_KEY = 'resetPasswordSentAt'

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
  const [secondsLeft, setSecondsLeft] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) {
      navigate('/forgot-password', { replace: true })
      return
    }

    const sentAt = parseInt(raw, 10)
    const elapsed = Math.floor((Date.now() - sentAt) / 1000)
    const remaining = Math.max(0, EXPIRY_SECONDS - elapsed)
    setSecondsLeft(remaining)

    if (remaining <= 0) return

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

    return () => clearInterval(timerRef.current)
  }, [])

  const isExpiredLocally = secondsLeft === 0 && !success
  const mm = secondsLeft !== null ? String(Math.floor(secondsLeft / 60)).padStart(2, '0') : '--'
  const ss = secondsLeft !== null ? String(secondsLeft % 60).padStart(2, '0') : '--'

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

  const strengthColor = (idx) => {
    if (idx > strength) return 'bg-gray-100'
    if (strength <= 2) return 'bg-red-400'
    if (strength <= 4) return 'bg-orange-400'
    return 'bg-green-500'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrorType('')
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
    } finally {
      setLoading(false)
    }
  }

  if (secondsLeft === null) return null

  if (success) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-orange-600/5 rounded-full blur-[120px]" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
             <FiCheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Password Updated!</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            Your password has been changed successfully. You can now login with your new password.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-orange-500 transition-all text-sm flex items-center justify-center gap-2"
          >
            Go to Login <FiArrowRight />
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
                <FiLock size={24} />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Create New Password</h1>
              <p className="text-sm text-gray-500">Enter your new password below</p>
            </div>

            {/* Timer */}
            {!isExpiredLocally ? (
               <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-500">Time remaining</p>
                    <span className={`text-base font-bold tabular-nums transition-colors ${secondsLeft < 30 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>{mm}:{ss}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${secondsLeft < 30 ? 'bg-red-500' : 'bg-gray-900'}`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(secondsLeft / EXPIRY_SECONDS) * 100}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>
               </div>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border border-red-100 rounded-xl p-5 mb-6 text-center">
                  <FiClock size={24} className="text-red-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-red-700 mb-1">Link Expired</p>
                  <p className="text-xs text-red-600 leading-relaxed mb-4">This reset link has expired. Please request a new one.</p>
                  <Link to="/forgot-password" className="text-xs font-semibold text-red-600 underline hover:text-red-800 transition-colors">Request New Link</Link>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                 <div className="relative">
                   <input 
                     type={showPass ? 'text' : 'password'}
                     required
                     disabled={isExpiredLocally}
                     value={password}
                     onChange={e => setPass(e.target.value)}
                     placeholder="Enter new password"
                     className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition-all disabled:opacity-40"
                   />
                   <button type="button" onClick={() => setShowP(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                     {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                   </button>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                 <div className="relative">
                   <input 
                     type={showConf ? 'text' : 'password'}
                     required
                     disabled={isExpiredLocally}
                     value={confirm}
                     onChange={e => setConfirm(e.target.value)}
                     placeholder="Confirm new password"
                     className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition-all disabled:opacity-40"
                   />
                   <button type="button" onClick={() => setShowC(!showConf)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                     {showConf ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                   </button>
                 </div>
               </div>

               {password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <div className="flex gap-1.5 mb-2">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${strengthColor(i)}`} />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                       <p className="text-xs text-gray-400">Password strength</p>
                       <p className={`text-xs font-semibold ${
                         strength <= 2 ? 'text-red-400' : strength <= 4 ? 'text-orange-400' : 'text-green-500'
                       }`}>
                         {['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength]}
                       </p>
                    </div>
                  </motion.div>
               )}

               {error && (
                 <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-600 flex items-center gap-2">
                    <FiAlertCircle className="shrink-0" /> 
                    <div>
                      {error}
                      {(errorType === 'expired' || errorType === 'device') && (
                        <Link to="/forgot-password" className="block text-xs mt-1 underline font-medium">Request new link</Link>
                      )}
                    </div>
                 </div>
               )}

               <button 
                type="submit"
                disabled={loading || isExpiredLocally}
                className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
               >
                 {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiArrowRight />}
                 {loading ? 'Updating...' : 'Update Password'}
               </button>
            </form>

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

export default ResetPassword
