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
    if (password.length < 6) return setError('Security Protocol: Minimum 6 characters required.')
    if (password !== confirm) return setError('Sync Error: Key mismatch detected.')
    if (isExpiredLocally) return setError('Session Expired: Dispatch a new recovery link.')
    
    setLoading(true)
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password })
      clearInterval(timerRef.current)
      localStorage.removeItem(LS_KEY)
      setSuccess(true)
      toast.success('Key rotation completed successfully.')
    } catch (err) {
      const msg = err.response?.data?.message || 'Access Update Failed.'
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
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-50">
             <FiCheckCircle size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 font-head tracking-tight mb-4">Key Rotation Complete</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-10">
            Nuestra internal vault has been updated with your new credentials. Existing recovery links are now terminated.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl shadow-xl hover:bg-orange-600 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3"
          >
            Authenticate Identity <FiArrowRight />
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
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
          <div className="p-10 sm:p-12">
            
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-6">
                <FiLock size={14} className="text-orange-600" />
                <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">Key Rotation Protocol</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 font-head tracking-tight mb-2">New Access Key</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Re-establish Security</p>
            </div>

            {/* Session Expiry Matrix */}
            {!isExpiredLocally ? (
               <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Remaining</p>
                    <span className={`text-base font-black tabular-nums transition-colors ${secondsLeft < 30 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>{mm}:{ss}</span>
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
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-8 text-center">
                  <FiClock size={24} className="text-red-600 mx-auto mb-3" />
                  <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-2">Link Neutralized</p>
                  <p className="text-[11px] font-bold text-red-900/60 leading-relaxed mb-4">Security timeframe bypassed. The recovery link is no longer valid.</p>
                  <Link to="/forgot-password" className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] hover:text-red-900 transition-colors">Dispatch New Link</Link>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Key</label>
                    <div className="relative group">
                      <input 
                        type={showPass ? 'text' : 'password'}
                        required
                        disabled={isExpiredLocally}
                        value={password}
                        onChange={e => setPass(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-6 pr-12 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all disabled:opacity-30"
                      />
                      <button type="button" onClick={() => setShowP(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
                        {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Key</label>
                    <div className="relative group">
                      <input 
                        type={showConf ? 'text' : 'password'}
                        required
                        disabled={isExpiredLocally}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-6 pr-12 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all disabled:opacity-30"
                      />
                      <button type="button" onClick={() => setShowC(!showConf)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
                        {showConf ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
               </div>

               {password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                    <div className="flex gap-1.5 justify-between mb-2">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${strengthColor(i)}`} />
                      ))}
                    </div>
                    <div className="flex justify-between items-center px-1">
                       <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Strength Metric</p>
                       <p className={`text-[9px] font-black uppercase tracking-widest ${
                         strength <= 2 ? 'text-red-400' : strength <= 4 ? 'text-orange-400' : 'text-green-500'
                       }`}>
                         {['INVALID', 'VULNERABLE', 'FAIR', 'ROBUST', 'SECURE', 'ELITE'][strength]}
                       </p>
                    </div>
                  </motion.div>
               )}

               {error && (
                 <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-[11px] font-bold text-red-600 flex items-center gap-2">
                    <FiAlertCircle className="shrink-0" /> 
                    <div>
                      {error}
                      {(errorType === 'expired' || errorType === 'device') && (
                        <Link to="/forgot-password" className="block text-[9px] uppercase tracking-widest mt-1 underline">Retry Protocol</Link>
                      )}
                    </div>
                 </div>
               )}

               <button 
                type="submit"
                disabled={loading || isExpiredLocally}
                className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl shadow-xl shadow-gray-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiArrowRight />}
                 {loading ? 'Committing...' : 'Commit New Key'}
               </button>
            </form>

            <div className="mt-10 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-colors">
                <FiArrowLeft /> Return to Vault
              </Link>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPassword
