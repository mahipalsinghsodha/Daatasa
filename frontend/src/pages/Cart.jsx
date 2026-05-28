import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight,
  FiShield, FiTruck, FiTag, FiChevronRight
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import api from '../api/axios'

const MAX_CART_QTY = 10

const Cart = () => {
  const { user }           = useAuth()
  const navigate           = useNavigate()
  const { fetchCartCount } = useCart()
  const [cart,           setCart]           = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [updatingId,     setUpdatingId]     = useState(null)
  const [preview,        setPreview]        = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [couponCode,     setCouponCode]     = useState('')
  const [appliedCoupon,  setAppliedCoupon]  = useState(null)
  const [couponLoading,  setCouponLoading]  = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/cart' } }); return }
    fetchCart()
  }, [user])

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await api.post('/api/orders/verify-coupon', { couponCode: couponCode.trim() })
      const coupon = res.data.coupon
      const bd = res.data.breakdown
      setAppliedCoupon(coupon)
      setPreview(prev => ({
        ...prev,
        discount: coupon.discountAmount,
        taxPrice: bd.taxPrice,
        shippingPrice: bd.shippingPrice,
        totalPrice: bd.totalPrice
      }))
      toast.success('Coupon applied!')
    } catch {
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    fetchPreview()
    toast.info('Coupon removed')
  }

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart')
      setCart(res.data)
      fetchCartCount()
      if (res.data?.items?.length > 0) fetchPreview()
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchPreview = async () => {
    setPreviewLoading(true)
    try {
      const res = await api.get('/api/orders/price-preview')
      setPreview(res.data)
    } catch (e) { console.error('Price preview error:', e) }
    finally { setPreviewLoading(false) }
  }

  const updateQty = async (itemId, newQty, stock) => {
    if (newQty < 1) return
    const maxAllowed = Math.min(stock || 0, MAX_CART_QTY)
    if (newQty > maxAllowed) { toast.error(`Max ${maxAllowed} of this item allowed`); return }
    setUpdatingId(itemId)
    try {
      await api.put(`/api/cart/items/${itemId}`, { quantity: newQty })
      fetchCart()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update quantity') }
    finally { setUpdatingId(null) }
  }

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/api/cart/items/${itemId}`)
      toast.success('Item removed from cart')
      fetchCart()
    } catch { toast.error('Failed to remove item') }
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  const hasItems = cart?.items?.length > 0
  const subtotal = cart?.items?.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0) || 0

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-base)' }}>

      {/* ── Page Header ── */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="section-tag">Your Cart</span>
              <h1 className="section-title">Shopping Cart</h1>
            </div>
            {hasItems && (
              <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                {cart.items.length} item{cart.items.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!hasItems ? (

          /* ── Empty State ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-28 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center text-center p-10"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-5">
              <FiShoppingCart size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Your cart is empty
            </h2>
            <p className="text-sm text-slate-400 max-w-xs mb-8">Add some premium ghee products to your cart and come back here.</p>
            <Link to="/products" className="px-7 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgb(249_115_22_/_0.35)] transition-all">
              Browse Products
            </Link>
          </motion.div>

        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* ── Cart Items ── */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {cart.items.map((item, idx) => {
                  const stock       = item.product?.stock ?? 0
                  const maxQty      = Math.min(stock, MAX_CART_QTY)
                  const isOut       = stock === 0
                  const atMax       = item.quantity >= maxQty

                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.96 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`bg-white rounded-2xl border shadow-[0_2px_8px_-2px_rgb(0_0_0_/_0.06)] p-4 sm:p-5 flex items-start gap-4 ${
                        isOut ? 'border-red-100 opacity-70' : 'border-slate-100'
                      }`}
                    >
                      {/* Image */}
                      <Link
                        to={`/products/${item.product?._id}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 hover:opacity-90 transition-opacity"
                      >
                        <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" loading="lazy" />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                              {item.product?.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 capitalize flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold uppercase">{item.product?.category}</span>
                              {item.product?.weight && <span>{item.product.weight}</span>}
                            </p>
                            {isOut && <p className="text-[11px] font-bold text-red-500 mt-1.5">Currently Unavailable</p>}
                            {!isOut && atMax && <p className="text-[11px] font-semibold text-amber-500 mt-1.5">Max {maxQty} per order</p>}
                          </div>

                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                            title="Remove item"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3.5">
                          {/* Qty Controls */}
                          <div className={`flex items-center rounded-xl overflow-hidden border ${isOut ? 'border-red-100 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                            <button
                              disabled={updatingId === item._id || item.quantity <= 1}
                              onClick={() => updateQty(item._id, item.quantity - 1, stock)}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-slate-900">
                              {updatingId === item._id ? <span className="text-slate-300">·</span> : item.quantity}
                            </span>
                            <button
                              disabled={updatingId === item._id || atMax || isOut}
                              onClick={() => updateQty(item._id, item.quantity + 1, stock)}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className={`text-base font-extrabold ${isOut ? 'text-slate-300 line-through' : 'text-slate-900'}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                              ₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">₹{item.product?.price?.toLocaleString('en-IN')} each</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 px-2 py-1 mt-1 transition-colors"
              >
                <FiArrowRight size={14} className="rotate-180" /> Continue Shopping
              </Link>
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-2px_rgb(0_0_0_/_0.06)] overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50">
                  <h2 className="text-base font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Order Summary</h2>
                </div>

                <div className="p-6">
                  {/* Shipping Progress Bar */}
                  {preview && preview.freeShippingThreshold > 0 && (
                    <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className={subtotal >= preview.freeShippingThreshold ? 'text-emerald-600' : 'text-slate-600'}>
                          {subtotal >= preview.freeShippingThreshold ? '🎉 Free Shipping Unlocked!' : 'Shipping Progress'}
                        </span>
                        <span className="text-slate-400">
                          ₹{subtotal.toLocaleString('en-IN')} / ₹{Number(preview.freeShippingThreshold).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${subtotal >= preview.freeShippingThreshold ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`}
                          style={{ width: `${Math.min((subtotal / preview.freeShippingThreshold) * 100, 100)}%` }}
                        />
                      </div>
                      {subtotal < preview.freeShippingThreshold ? (
                        <p className="text-[11px] text-slate-500">
                          Add <span className="font-bold text-orange-600">₹{(preview.freeShippingThreshold - subtotal).toLocaleString('en-IN')}</span> more for free delivery
                        </p>
                      ) : (
                        <p className="text-[11px] text-emerald-600 font-medium">
                          Your order qualifies for free shipping!
                        </p>
                      )}
                    </div>
                  )}

                  {previewLoading ? (
                    <div className="space-y-3 mb-5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 w-20 shimmer rounded" />
                          <div className="h-4 w-16 shimmer rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-semibold text-slate-900">₹{(preview?.itemsPrice ?? subtotal).toLocaleString('en-IN')}</span>
                      </div>
                      {preview?.discount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                          <span>Coupon Discount</span>
                          <span>-₹{Math.round(preview.discount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {preview?.gstRate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">GST ({preview.gstRate}%)</span>
                          <span className="font-semibold text-slate-900">₹{Math.round(preview.taxPrice).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Shipping</span>
                        <span className={`font-semibold ${(preview?.shippingPrice ?? 50) === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {(preview?.shippingPrice ?? 50) === 0
                            ? <span className="flex items-center gap-1"><FiTruck size={12} /> FREE</span>
                            : `₹${preview?.shippingPrice ?? 50}`
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Coupon Input */}
                  <div className="pt-4 border-t border-slate-100 mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Have a Coupon?</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FiTag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="ENTER CODE"
                          value={couponCode}
                          disabled={!!appliedCoupon || couponLoading}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none uppercase placeholder:text-slate-300 focus:border-orange-400 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>
                      {appliedCoupon ? (
                        <button
                          onClick={removeCoupon}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all border border-red-100"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      )}
                    </div>
                    {appliedCoupon && (
                      <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                        ✓ Coupon '{appliedCoupon.code}' applied (Saved ₹{Number(appliedCoupon.discountAmount).toLocaleString('en-IN')})
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 border-t border-slate-100 mb-5">
                    <span className="font-extrabold text-slate-900">Total</span>
                    <span className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {previewLoading
                        ? <span className="inline-block w-24 h-7 shimmer rounded" />
                        : `₹${Math.round(Number(preview?.totalPrice ?? subtotal)).toLocaleString('en-IN')}`
                      }
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgb(249_115_22_/_0.35)] hover:shadow-[0_6px_20px_rgb(249_115_22_/_0.45)] transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                  >
                    Proceed to Checkout <FiChevronRight size={16} />
                  </button>

                  {/* Trust Strip */}
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { emoji: '🔒', text: 'Secure Payment' },
                        { emoji: '🔬', text: 'FSSAI Certified' },
                        { emoji: '🚚', text: 'Fast Delivery' },
                        { emoji: '↩️', text: 'Easy Returns' },
                      ].map(({ emoji, text }) => (
                        <div key={text} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 bg-slate-50 rounded-xl px-2.5 py-2">
                          <span>{emoji}</span> {text}
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-[10px] text-slate-300 mt-3">
                      100% Pure · Lab Tested · Pan India Delivery
                    </p>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="px-6 pb-5 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                    <FiShield size={14} className="text-orange-400 shrink-0" />
                    <span className="font-medium">Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                    <FiTruck size={14} className="text-orange-400 shrink-0" />
                    <span className="font-medium">Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
