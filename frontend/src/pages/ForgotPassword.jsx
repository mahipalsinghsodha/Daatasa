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
        setError(data.message || 'Transmission error. System failure.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-orange-600/5 rounded-full blur-[120px]" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-50">
             <FiMail size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 font-head tracking-tight mb-4">Transmission Successful</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-8">
            A secure recovery link has been dispatched to <span className="text-gray-900">{email}</span>. Use it within 2 minutes.
          </p>
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-8">
             <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Crucial Protocol</p>
             <p className="text-[11px] font-bold text-orange-900 mt-1">Open link on this device/browser only to maintain session integrity.</p>
          </div>
          <button 
            onClick={() => { setSent(false); setEmail(''); setNotFound(false) }}
            className="w-full py-4 bg-gray-900 text-white font-black rounded-3xl shadow-xl hover:bg-orange-600 transition-all text-xs uppercase tracking-widest"
          >
            Acknowledge & Sync
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
                <FiClock size={14} className="text-orange-600" />
                <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">Recovery Protocol</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 font-head tracking-tight mb-2">Key Recovery</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Restore Access Control</p>
            </div>

            <AnimatePresence mode="wait">
              {cooldown > 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                     <FiClock className="text-blue-600" />
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-[10px]">Flood Protection Active</p>
                  </div>
                  <p className="text-xs font-bold text-blue-900/60 leading-relaxed mb-6">Our system identifies an active link already in transit. Deployment cooling down.</p>
                  <div className="flex items-center justify-between text-2xl font-black font-head text-blue-900 tabular-nums">
                     <span>{cdMm}:{cdSs}</span>
                     <div className="w-1/2 bg-white/50 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(cooldown/120)*100}%` }} />
                     </div>
                  </div>
                </motion.div>
              ) : notFound ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-amber-50 border border-amber-100 rounded-3xl p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                     <FiAlertCircle className="text-amber-600" />
                     <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest text-[10px]">Identity Conflict</p>
                  </div>
                  <p className="text-xs font-bold text-amber-900/60 leading-relaxed mb-6">Digital coordinate <span className="text-amber-900">{email}</span> not found in nuestra vault.</p>
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => navigate('/register')} className="py-3 bg-amber-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest">Initialize New</button>
                     <button onClick={() => { setNotFound(false); setEmail('') }} className="py-3 bg-white border border-amber-200 text-amber-900 rounded-2xl text-[9px] font-black uppercase tracking-widest">Retry Search</button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Digital Coordinate</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
                        <FiMail size={18} />
                      </div>
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@coordinate.com"
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-[11px] font-bold text-red-600 flex items-center gap-2">
                       <FiAlertCircle /> {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl shadow-xl shadow-gray-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiArrowRight />}
                    {loading ? 'Dispatched...' : 'Deploy Recovery Link'}
                  </button>
                </form>
              )}
            </AnimatePresence>

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

export default ForgotPassword
