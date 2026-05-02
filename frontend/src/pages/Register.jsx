import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle, FiShield } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  /* Password strength */
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
    if (password !== confirmPassword) return setError('Synchronization error: Passwords must match.')
    if (password.length < 6) return setError('Security protocol: Minimum 6 characters required.')

    setLoading(true)
    try {
      await register(name, email, password)
      toast.success('Account established successfully!')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Network rejection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-orange-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -left-1/4 w-1/2 h-1/2 bg-gray-900/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
          
          <div className="p-10 sm:p-12">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-6">
                <FiShield size={14} className="text-orange-600" />
                <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">New Identity Protocol</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 font-head tracking-tight mb-2">Join Dhani</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Create Your Artifact</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Control */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Designation</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
                    <FiUser size={18} />
                  </div>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Real world name"
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-bold transition-all"
                  />
                </div>
              </div>

              {/* Email Control */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Digital Coordinates</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
                    <FiMail size={18} />
                  </div>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@provider.com"
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-bold transition-all"
                  />
                </div>
              </div>

              {/* Password Control */}
              <div className="gap-3 grid sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secret Key</label>
                  <div className="relative group">
                    <input 
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full pl-6 pr-12 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-bold transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
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
                      value={confirmPassword}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••"
                      className="w-full pl-6 pr-12 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-bold transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConf(!showConf)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConf ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Metric */}
              <AnimatePresence>
                {password && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 px-1"
                  >
                    <div className="flex gap-1.5 justify-between">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${strengthColor(i)}`} />
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                       <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Strength Metric</p>
                       <p className={`text-[9px] font-black uppercase tracking-widest ${
                         strength <= 2 ? 'text-red-400' : strength <= 4 ? 'text-orange-400' : 'text-green-500'
                       }`}>
                         {['INVALID', 'VULNERABLE', 'FAIR', 'ROBUST', 'SECURE', 'ELITE'][strength]}
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-[11px] font-bold text-red-600 flex items-center gap-2">
                  <FiCheckCircle className="shrink-0 rotate-180" /> {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl shadow-xl shadow-gray-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiArrowRight />}
                {loading ? 'Initializing...' : 'Establish Identity'}
              </button>
            </form>
          </div>

          <div className="bg-gray-50/50 p-8 text-center border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Already possess an identity?{' '}
              <Link to="/login" className="text-orange-600 hover:text-gray-900 transition-colors">Return to Vault</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
