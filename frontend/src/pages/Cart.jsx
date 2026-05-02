import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight, FiTag, FiTruck, FiShield, FiChevronRight } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import api from '../api/axios'

const Cart = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { fetchCartCount } = useCart()

  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [user])

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart')
      setCart(res.data)
      fetchCartCount()
    } catch (e) {
      console.error('Error fetching cart:', e)
    } finally {
      setLoading(false)
    }
  }

  const updateQty = async (itemId, newQty, stock) => {
    if (newQty < 1) return
    if (newQty > stock) {
      toast.error(`Only ${stock} items available`)
      return
    }
    setUpdatingId(itemId)
    try {
      await api.put(`/api/cart/items/${itemId}`, { quantity: newQty })
      fetchCart()
    } catch {
      toast.error('Failed to update quantity')
    } finally {
      setUpdatingId(null)
    }
  }

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/api/cart/items/${itemId}`)
      toast.success('Item removed')
      fetchCart()
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const calcTotals = () => {
    if (!cart?.items) return { subtotal: 0, tax: 0, shipping: 0, total: 0 }
    const subtotal = cart.items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0)
    const tax = subtotal * 0.18 // Standard 18% GST Example
    const shipping = subtotal > 500 ? 0 : 50
    return { subtotal, tax, shipping, total: subtotal + tax + shipping }
  }

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[var(--color-bg)]">
      <div className="w-10 h-10 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
      <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Organizing selection...</p>
    </div>
  )

  const totals = calcTotals()
  const hasItems = cart?.items?.length > 0

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-32">
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-[var(--color-border)] pt-12 pb-8 sm:pt-16 sm:pb-12 shadow-sm relative z-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-4">
                <FiShoppingCart size={14} className="text-orange-600" />
                <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">Purchase Pipeline</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 font-head tracking-tight">Shopping Cart</h1>
              <p className="text-gray-500 font-medium max-w-lg mt-2">Check your selected goods and proceed to secure checkout.</p>
            </div>
            {hasItems && (
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Items for settlement</p>
                <div className="text-2xl font-black text-gray-900 font-head">{cart.items.length} Unique Selections</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!hasItems ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 bg-white rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center text-center p-12"
          >
            <div className="text-6xl mb-6 grayscale opacity-20">🛒</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 font-head">Abandoned Cart?</h2>
            <p className="text-gray-400 font-medium max-w-xs mx-auto">Your selection is empty. Start adding our premium Bilona Ghee to your daily diet.</p>
            <Link to="/products" className="mt-8 px-10 py-4 bg-gray-900 text-white text-sm font-black rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-gray-900/10">Browse Our Collection</Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            
            {/* ── Left: Cart Items Matrix ── */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.items.map((item, idx) => (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[32px] border border-white shadow-lg hover:border-gray-100 transition-all p-6 sm:p-8 flex items-center gap-6 group"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-50 shrink-0">
                      <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-gray-900 font-head leading-tight group-hover:text-orange-600 transition-colors">{item.product?.name}</h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{item.product?.category}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item._id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-6">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                          <button 
                            disabled={updatingId === item._id}
                            onClick={() => updateQty(item._id, item.quantity - 1, item.product?.stock)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-900 shadow-sm hover:bg-gray-900 hover:text-white transition-colors"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-black text-gray-900 font-head">
                            {updatingId === item._id ? '..' : item.quantity}
                          </span>
                          <button 
                            disabled={updatingId === item._id}
                            onClick={() => updateQty(item._id, item.quantity + 1, item.product?.stock)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-900 shadow-sm hover:bg-gray-900 hover:text-white transition-colors"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-gray-900">₹{(item.product?.price * item.quantity).toLocaleString()}</div>
                          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">₹{item.product?.price}/unit</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link to="/products" className="inline-flex items-center gap-2 text-sm font-black text-orange-600 px-6 py-3 rounded-2xl hover:bg-orange-50 transition-all mt-8">
                 <FiArrowRight className="rotate-180" /> Continue Adding Items
              </Link>
            </div>

            {/* ── Right: Settlement Summary ── */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-32">
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full translate-x-12 -translate-y-12" />
                
                <h2 className="text-xl font-black text-gray-900 mb-8 font-head tracking-tight relative z-10">Order Summary</h2>
                
                <div className="space-y-4 mb-8 border-b border-gray-50 pb-8 relative z-10">
                   <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-400 font-bold">Cart Subtotal</span>
                      <span className="text-gray-900 font-black">₹{totals.subtotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-400 font-bold">Service Tax (GST)</span>
                      <span className="text-gray-900 font-black">₹{totals.tax.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-400 font-bold">Logistics Fee</span>
                      <span className={totals.shipping === 0 ? 'text-green-600 font-black text-xs' : 'text-gray-900 font-black'}>
                        {totals.shipping === 0 ? 'FREE' : `₹${totals.shipping}`}
                      </span>
                   </div>
                </div>

                <div className="flex justify-between items-end mb-10">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Final Settlement</h3>
                    <div className="text-4xl font-black text-gray-900 font-head tracking-tighter leading-none">₹{totals.total.toLocaleString()}</div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl shadow-xl shadow-gray-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Confirm & Checkout <FiChevronRight />
                </button>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { icon: <FiShield />, label: 'Secure Payment' },
                    { icon: <FiTag />, label: 'Best Quality' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400">
                      <div className="text-orange-500">{item.icon}</div>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Banner */}
              <div className="bg-orange-600 rounded-[32px] p-8 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                   <FiTag size={80} />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-widest mb-2">Free Delivery</h4>
                 <p className="text-xs font-bold text-orange-100 leading-relaxed">
                   {totals.subtotal > 500 
                    ? 'Congratulations! You qualify for free nationwide shipping.'
                    : `Add ₹${(501 - totals.subtotal).toLocaleString()} more to your cart to unlock free delivery across India.`
                   }
                 </p>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  )
}

export default Cart
