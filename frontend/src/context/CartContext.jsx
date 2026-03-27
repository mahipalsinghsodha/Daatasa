// import { createContext, useContext, useState, useEffect } from 'react'
// import axios from 'axios'
// import { useAuth } from './AuthContext'

// const CartContext = createContext()

// export const CartProvider = ({ children }) => {
//   const { user } = useAuth()
//   const [cartCount, setCartCount] = useState(0)

//   const fetchCartCount = async () => {
//     try {
//       const res = await axios.get('/api/cart')
//       const count = res.data.items.reduce((sum, item) => sum + item.quantity, 0)
//       setCartCount(count)
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   useEffect(() => {
//     if (user) fetchCartCount()
//     else setCartCount(0)
//   }, [user])

//   return (
//     <CartContext.Provider value={{ cartCount, fetchCartCount }}>
//       {children}
//     </CartContext.Provider>
//   )
// }

// export const useCart = () => useContext(CartContext)
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const fetchCartCount = async () => {
    try {
      const res = await api.get('/api/cart')
      const count = res.data.items.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (user) fetchCartCount()
    else setCartCount(0)
  }, [user])

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
