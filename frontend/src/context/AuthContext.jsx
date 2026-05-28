// frontend/src/context/AuthContext.jsx
// ✅ Access token stored in memory (not localStorage)
// ✅ On app init: calls /api/auth/refresh to restore session from httpOnly cookie
// ✅ Listens to auth:forced_logout event from Axios interceptor

import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import api, { setAccessToken, getAccessToken } from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // ── On mount: restore session from httpOnly refresh token cookie ──────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        // This calls /api/auth/refresh which reads the httpOnly cookie
        const res = await api.post('/api/auth/refresh')
        setAccessToken(res.data.token)
        setUser(res.data.user)
      } catch {
        // No valid cookie → user is a guest, that's fine
        setAccessToken(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // ── Listen for forced logout (when refresh token expires) ─────────────────
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null)
      setAccessToken(null)
    }
    window.addEventListener('auth:forced_logout', handleForcedLogout)
    return () => window.removeEventListener('auth:forced_logout', handleForcedLogout)
  }, [])

  // ── After login/register: merge any pending guest cart item ───────────────
  const flushPendingCartItem = async () => {
    const pending = sessionStorage.getItem('pendingCartItem')
    if (!pending) return
    try {
      const { productId, quantity } = JSON.parse(pending)
      await api.post('/api/cart/items', { productId, quantity })
    } catch { /* non-fatal */ }
    finally { sessionStorage.removeItem('pendingCartItem') }
  }

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    // Access token stored in memory via setAccessToken
    setAccessToken(res.data.token)
    setUser(res.data.user)
    await flushPendingCartItem()
    return res.data
  }

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password })
    setAccessToken(res.data.token)
    setUser(res.data.user)
    await flushPendingCartItem()
    return res.data
  }

  const logout = async () => {
    try {
      // Pass Authorization header so backend can remove the specific refresh token
      await api.post('/api/auth/logout')
    } catch {
      // Non-fatal — clear client state regardless
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }

  const logoutAll = async () => {
    try {
      await api.post('/api/auth/logout-all')
    } catch { /* non-fatal */ }
    finally {
      setAccessToken(null)
      setUser(null)
    }
  }

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data)
      return res.data
    } catch (error) {
      throw error
    }
  }, [])

  const hasPermission = (permission) => {
    if (!user) return false
    if (user.role === 'superadmin') return true
    return user.role === 'admin' && user.permissions?.includes(permission)
  }

  const toggleWishlist = async (productId) => {
    if (!user) return false
    try {
      const res = await api.post('/api/auth/wishlist', { productId })
      setUser(prev => ({ ...prev, wishlist: res.data.wishlist }))
      return res.data.added
    } catch (error) {
      console.error('Wishlist toggle error', error)
      throw error
    }
  }

  const updateUser = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      logoutAll,
      fetchUser,
      hasPermission,
      toggleWishlist,
      updateUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}