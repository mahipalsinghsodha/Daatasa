import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleGoogleLogin = () => {
    const w = 500, h = 600
    const left = window.screen.width / 2 - w / 2
    const top  = window.screen.height / 2 - h / 2

    const popup = window.open(
      'https://dhanifresh.onrender.com/api/auth/google',
      'Google Login',
      `width=${w},height=${h},top=${top},left=${left}`
    )

    const handler = (event) => {
      if (event.origin !== 'https://dhanifresh.onrender.com') return
      const token = event.data?.token
      if (token) {
        localStorage.setItem('token', token)
        window.removeEventListener('message', handler)
        window.location.href = '/'
      }
    }

    window.addEventListener('message', handler)
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer)
        window.removeEventListener('message', handler)
      }
    }, 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      const isAdmin = data.user.role === 'admin' || data.user.role === 'superadmin'
      navigate(isAdmin ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Review your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-orange-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-gray-900/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
          
          <div className="p-10 sm:p-12">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-6">
                <FiCheckCircle size={14} className="text-orange-600" />
                <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">Secure Vault Access</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 font-head tracking-tight mb-2">Welcome Back</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Identify Yourself</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Control */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Universal Identity</label>
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
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secret Key</label>
                  <Link to="/forgot-password" size={14} className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-gray-900 transition-colors">
                    Recovery?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
                    <FiLock size={18} />
                  </div>
                  <input 
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-14 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-bold transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 border border-red-100 p-4 rounded-2xl text-[11px] font-bold text-red-600 flex items-center gap-2"
                >
                  <FiAlertCircle className="shrink-0" /> {error}
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl shadow-xl shadow-gray-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiArrowRight />}
                {loading ? 'Authenticating...' : 'Establish Connection'}
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                <span className="bg-white px-4">Inter-Network</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 py-4 px-6 rounded-2xl border-2 border-gray-50 hover:bg-gray-50 hover:border-gray-100 transition-all text-sm font-black text-gray-700"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          <div className="bg-gray-50/50 p-8 text-center border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              No account in nuestra records?{' '}
              <Link to="/register" className="text-orange-600 hover:text-gray-900 transition-colors">Initialize One</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
