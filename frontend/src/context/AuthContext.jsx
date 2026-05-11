// import { createContext, useState, useEffect, useContext } from 'react'
// import axios from 'axios'

// const AuthContext = createContext()

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider')
//   }
//   return context
// }

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const token = localStorage.getItem('token')
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
//       fetchUser()
//     } else {
//       setLoading(false)
//     }
//   }, [])

//   const fetchUser = async () => {
//     try {
//       const res = await axios.get('/api/auth/me')
//       setUser(res.data)
//     } catch (error) {
//       localStorage.removeItem('token')
//       delete axios.defaults.headers.common['Authorization']
//     } finally {
//       setLoading(false)
//     }
//   }

//   const login = async (email, password) => {
//     const res = await axios.post('/api/auth/login', { email, password })
//     localStorage.setItem('token', res.data.token)
//     axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
//     setUser(res.data.user)
//     return res.data
//   }

//   const register = async (name, email, password) => {
//     const res = await axios.post('/api/auth/register', { name, email, password })
//     localStorage.setItem('token', res.data.token)
//     axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
//     setUser(res.data.user)
//     return res.data
//   }

//   const logout = () => {
//     localStorage.removeItem('token')
//     delete axios.defaults.headers.common['Authorization']
//     setUser(null)
//   }

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }
import { createContext, useState, useEffect, useContext } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data)
    } catch (error) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  // After login/register, flush any pending cart item (saved by guest Buy Now)
  const flushPendingCartItem = async () => {
    const pending = sessionStorage.getItem('pendingCartItem')
    if (!pending) return
    try {
      const { productId, quantity } = JSON.parse(pending)
      await api.post('/api/cart/items', { productId, quantity })
    } catch {} // non-fatal
    finally { sessionStorage.removeItem('pendingCartItem') }
  }

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setUser(res.data.user)
    await flushPendingCartItem()
    return res.data
  }

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password })
    localStorage.setItem('token', res.data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setUser(res.data.user)
    await flushPendingCartItem()
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    return user.role === 'admin' && user.permissions?.includes(permission);
  };

  const toggleWishlist = async (productId) => {
    if (!user) return false;
    try {
      const res = await api.post('/api/auth/wishlist', { productId });
      setUser(prev => ({ ...prev, wishlist: res.data.wishlist }));
      return res.data.added;
    } catch (error) {
      console.error('Wishlist toggle error', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, fetchUser, hasPermission, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
}