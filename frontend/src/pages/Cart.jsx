import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight, FiShield, FiTruck } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import api from '../api/axios'

const MAX_CART_QTY = 10 // global max per item

const Cart = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { fetchCartCount } = useCart()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/cart' } }); return }
    fetchCart()
  }, [user])

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart')
      setCart(res.data)
      fetchCartCount()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const updateQty = async (itemId, newQty, stock) => {
    if (newQty < 1) return
    // Dynamic cap: min(product stock, MAX_CART_QTY)
    const maxAllowed = Math.min(stock || 0, MAX_CART_QTY)
    if (newQty > maxAllowed) {
      toast.error(`Max ${maxAllowed} of this item allowed`)
      return
    }
    setUpdatingId(itemId)
    try {
      await api.put(`/api/cart/items/${itemId}`, { quantity: newQty })
      fetchCart()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity')
    }
    finally { setUpdatingId(null) }
  }

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/api/cart/items/${itemId}`)
      toast.success('Item removed')
      fetchCart()
    } catch { toast.error('Failed to remove item') }
  }

  const calcTotals = () => {
    if (!cart?.items) return { subtotal: 0, shipping: 0, total: 0 }
    const subtotal = cart.items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0)
    const shipping = subtotal > 500 ? 0 : 50
    return { subtotal, shipping, total: subtotal + shipping }
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center" style={{ background: '#f8f9fa' }}>
      <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  const totals = calcTotals()
  const hasItems = cart?.items?.length > 0

  return (
    <div className="min-h-screen pb-20" style={{ background: '#f8f9fa' }}>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-3">Your Cart</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>Shopping Cart</h1>
            </div>
            {hasItems && (
              <span className="text-sm text-gray-500 font-medium">{cart.items.length} item{cart.items.length > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!hasItems ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center text-center p-10"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
              <FiShoppingCart size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Your cart is empty</h2>
            <p className="text-sm text-gray-400 max-w-xs mb-6">Add some premium ghee products to your cart and come back here.</p>
            <Link to="/products" className="px-6 py-3 bg-gray-900 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-all">
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
              {cart.items.map((item, idx) => {
                  const stock     = item.product?.stock ?? 0
                  const maxQty    = Math.min(stock, MAX_CART_QTY)
                  const isOutOfStock = stock === 0
                  const atMax        = item.quantity >= maxQty
                  return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-4"
                  >
                    {/* Image */}
                    <Link to={`/products/${item.product?._id}`} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.product?.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5 capitalize">{item.product?.category} • {item.product?.weight}</p>
                          {/* Out-of-stock warning inline */}
                          {isOutOfStock && (
                            <p className="text-[11px] font-semibold text-red-500 mt-1">Currently Not Available</p>
                          )}
                          {/* At max warning */}
                          {!isOutOfStock && atMax && (
                            <p className="text-[11px] text-orange-500 mt-1">Max {maxQty} per order reached</p>
                          )}
                        </div>
                        <button onClick={() => removeItem(item._id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0">
                          <FiTrash2 size={15} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Qty Controls */}
                        <div className={`flex items-center gap-2 rounded-lg p-1 border ${
                          isOutOfStock ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'
                        }`}>
                          <button
                            disabled={updatingId === item._id || item.quantity <= 1}
                            onClick={() => updateQty(item._id, item.quantity - 1, stock)}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-700 shadow-sm hover:bg-gray-900 hover:text-white transition-all disabled:opacity-40"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900">
                            {updatingId === item._id ? '·' : item.quantity}
                          </span>
                          <button
                            disabled={updatingId === item._id || atMax || isOutOfStock}
                            onClick={() => updateQty(item._id, item.quantity + 1, stock)}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-700 shadow-sm hover:bg-gray-900 hover:text-white transition-all disabled:opacity-40"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className={`text-sm font-bold ${isOutOfStock ? 'text-gray-300 line-through' : 'text-gray-900'}`}>
                            ₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">₹{item.product?.price} each</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  )
                })}
              </AnimatePresence>

              <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600 px-2 py-1 mt-2 transition-colors">
                <FiArrowRight size={14} className="rotate-180" /> Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-50" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Order Summary</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className={`font-semibold ${totals.shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {totals.shipping === 0 ? 'FREE' : `₹${totals.shipping}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-4 border-t border-gray-100 mb-5">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>₹{totals.total.toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Proceed to Checkout <FiArrowRight size={15} />
                </button>

                <div className="mt-5 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <FiShield size={13} className="text-orange-400 shrink-0" /> Secure Payment
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <FiTruck size={13} className="text-orange-400 shrink-0" /> Fast Delivery
                  </div>
                </div>
              </div>

              {/* Free shipping notice */}
              {totals.subtotal <= 500 && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-xs text-orange-700 font-medium">
                    Add <span className="font-bold">₹{(501 - totals.subtotal).toLocaleString('en-IN')}</span> more for free delivery!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
