// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'

// const Login = () => {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const { login } = useAuth()
//   const navigate = useNavigate()

//   const handleGoogleLogin = () => {
//   const width = 500;
//   const height = 600;

//   const left = window.screen.width / 2 - width / 2;
//   const top = window.screen.height / 2 - height / 2;

//   const popup = window.open(
//     "http://localhost:5000/api/auth/google",
//     "Google Login",
//     `width=${width},height=${height},top=${top},left=${left}`
//   );

//   // Listen for message from popup
//   window.addEventListener("message", (event) => {
//     if (event.origin !== "http://localhost:5000") return;

//     const token = event.data.token;

//     if (token) {
//       localStorage.setItem("token", token);
//       window.location.href = "/";
//     }
//   });
// };
//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     try {
//       await login(email, password)
//       navigate('/')
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="max-w-md mx-auto px-4 py-12">
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-gray-700 font-semibold mb-2">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-gray-700 font-semibold mb-2">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//          <button
//   type="button"
//   onClick={handleGoogleLogin}
//   className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
// >
//   Continue with Google
// </button>
//         </form>

//         <p className="mt-4 text-center text-gray-600">
//           Don't have an account?{' '}
//           <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
//             Sign Up
//           </Link>
//         </p>
//       </div>
//     </div>
//   )
// }

// export default Login

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ─── Google SVG Icon ─────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
)

/* ─── Eye / EyeOff Icons ──────────────────────────────────────── */
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

const Login = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  /* ── Google OAuth popup ──────────────────────────────────────── */
  const handleGoogleLogin = () => {
    const w = 500, h = 600
    const left = window.screen.width  / 2 - w / 2
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
  }

  /* ── Email / Password submit ─────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header strip */}
          <div className="bg-primary-600 px-8 py-7 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-primary-100 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="px-8 py-8 space-y-5">

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email address
                </label>
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

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               placeholder:text-gray-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
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
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"/>
              <span className="text-xs text-gray-400 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-gray-200"/>
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-gray-300
                         bg-white hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm
                         font-semibold transition shadow-sm"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold transition"
              >
                Create one
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

