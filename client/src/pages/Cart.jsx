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
      <div className="w-8 h-8 border-2 rounded-full animate-spin border-t-transparent" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--brand-secondary)' }} />
    </div>
  )

  const hasItems = cart?.items?.length > 0
  const subtotal = cart?.items?.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0) || 0

  return (
    <div className="min-h-screen pb-24 page-enter" style={{ background: 'var(--bg-base)' }}>

      {/* ── Page Header ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-10 right-20 w-72 h-72 rounded-full pointer-events-none animate-blob" style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full border mb-3"
                style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--gold)', borderColor: 'rgba(245,166,35,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Cart</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>Shopping Cart</h1>
            </div>
            {hasItems && (
              <span className="text-sm font-bold px-4 py-2 rounded-full shadow-sm" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
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
            className="py-28 rounded-3xl flex flex-col items-center text-center p-10 shadow-sm"
            style={{ background: 'var(--bg-card)', border: '2px dashed var(--border-color)' }}
          >
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <FiShoppingCart size={32} />
            </div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Your cart is empty
            </h2>
            <p className="text-sm max-w-xs mb-8" style={{ color: 'var(--text-muted)' }}>Add some premium ghee products to your cart and come back here.</p>
            <Link
              to="/products"
              className="btn btn-primary"
            >
              Browse Products
            </Link>
          </motion.div>

        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* ── Cart Items ── */}
            <div className="lg:col-span-2 space-y-4">
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
                      className="rounded-2xl p-4 sm:p-5 flex items-start gap-4 transition-all duration-300 card-hover"
                      style={{
                        background: 'var(--bg-card)',
                        border: `1px solid ${isOut ? 'rgba(229,62,62,0.3)' : 'var(--border-color)'}`,
                        opacity: isOut ? 0.7 : 1
                      }}
                    >
                      {/* Image */}
                      <Link
                        to={`/products/${item.product?._id}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 hover:opacity-90 transition-opacity"
                        style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}
                      >
                        <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" loading="lazy" />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-extrabold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                              {item.product?.name}
                            </h3>
                            <p className="text-xs mt-1 capitalize flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: 'var(--bg-alt)', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>{item.product?.category}</span>
                              {item.product?.weight && <span>{item.product.weight}</span>}
                            </p>
                            {isOut && <p className="text-[11px] font-bold mt-1.5 uppercase tracking-wide" style={{ color: 'var(--danger)' }}>Currently Unavailable</p>}
                            {!isOut && atMax && <p className="text-[11px] font-bold mt-1.5 uppercase tracking-wide" style={{ color: 'var(--warning)' }}>Max {maxQty} per order</p>}
                          </div>

                          <button
                            onClick={() => removeItem(item._id)}
                            className="btn btn-ghost shrink-0"
                            style={{ color: 'var(--danger)', width: '36px', height: '36px', padding: 0 }}
                            title="Remove item"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3.5">
                          {/* Qty Controls */}
                          <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: isOut ? 'rgba(229,62,62,0.3)' : 'var(--border-color)', background: 'var(--bg-surface)' }}>
                            <button
                              disabled={updatingId === item._id || item.quantity <= 1}
                              onClick={() => updateQty(item._id, item.quantity - 1, stock)}
                              className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-40 rounded-l-xl"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                              {updatingId === item._id ? <span style={{ color: 'var(--text-muted)' }}>·</span> : item.quantity}
                            </span>
                            <button
                              disabled={updatingId === item._id || atMax || isOut}
                              onClick={() => updateQty(item._id, item.quantity + 1, stock)}
                              className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-40 rounded-r-xl"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-base font-extrabold" style={{ color: isOut ? 'var(--text-muted)' : 'var(--brand-primary)', textDecoration: isOut ? 'line-through' : 'none', fontFamily: 'var(--font-display)' }}>
                              ₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>₹{item.product?.price?.toLocaleString('en-IN')} each</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-sm font-bold px-2 py-1 mt-2 transition-all duration-200"
                style={{ color: 'var(--gold)' }}
              >
                <FiArrowRight size={14} className="rotate-180" /> Continue Shopping
              </Link>
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-28">
              <div className="rounded-3xl border shadow-sm overflow-hidden card">
                <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Order Summary</h2>
                </div>

                <div className="p-6">
                  {/* Shipping Progress Bar */}
                  {preview && preview.freeShippingThreshold > 0 && (
                    <div className="mb-5 p-4 rounded-2xl border" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                        <span style={{ color: subtotal >= preview.freeShippingThreshold ? 'var(--success)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {subtotal >= preview.freeShippingThreshold ? '🎉 Free Shipping Unlocked!' : 'Shipping Progress'}
                        </span>
                        <span className="font-bold" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                          ₹{subtotal.toLocaleString('en-IN')} / ₹{Number(preview.freeShippingThreshold).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden mb-2.5" style={{ background: 'var(--border-color)' }}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${subtotal >= preview.freeShippingThreshold ? 'animate-pulse' : ''}`}
                          style={{ width: `${Math.min((subtotal / preview.freeShippingThreshold) * 100, 100)}%`, background: subtotal >= preview.freeShippingThreshold ? 'var(--success)' : 'var(--accent-gradient)' }}
                        />
                      </div>
                      {subtotal < preview.freeShippingThreshold ? (
                        <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                          Add <span className="font-bold" style={{ color: 'var(--gold-deep)' }}>₹{(preview.freeShippingThreshold - subtotal).toLocaleString('en-IN')}</span> more for free delivery
                        </p>
                      ) : (
                        <p className="text-[11px] font-bold" style={{ color: 'var(--success)' }}>
                          Your order qualifies for free shipping!
                        </p>
                      )}
                    </div>
                  )}

                  {previewLoading ? (
                    <div className="space-y-3 mb-5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 w-20 skeleton rounded" />
                          <div className="h-4 w-16 skeleton rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                        <span className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>₹{(preview?.itemsPrice ?? subtotal).toLocaleString('en-IN')}</span>
                      </div>
                      {preview?.discount > 0 && (
                        <div className="flex justify-between text-sm font-bold" style={{ color: 'var(--success)' }}>
                          <span>Coupon Discount</span>
                          <span style={{ fontFamily: 'var(--font-display)' }}>-₹{Math.round(preview.discount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {preview?.gstRate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="font-medium" style={{ color: 'var(--text-muted)' }}>GST ({preview.gstRate}%)</span>
                          <span className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>₹{Math.round(preview.taxPrice).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Shipping</span>
                        <span className="font-bold" style={{ color: (preview?.shippingPrice ?? 50) === 0 ? 'var(--success)' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                          {(preview?.shippingPrice ?? 50) === 0
                            ? <span className="flex items-center gap-1 font-bold"><FiTruck size={12} /> FREE</span>
                            : `₹${preview?.shippingPrice ?? 50}`
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Coupon Input */}
                  <div className="pt-4 border-t mb-4" style={{ borderColor: 'var(--border-color)' }}>
                    <label className="block text-[10px] font-bold uppercase mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>Have a Coupon?</label>
                    <div className="flex gap-2 items-stretch h-[44px]">
                      <div className="relative flex-1 h-full">
                        <FiTag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          placeholder="ENTER CODE"
                          value={couponCode}
                          disabled={!!appliedCoupon || couponLoading}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full pl-9 pr-3 h-full text-xs font-bold uppercase rounded-xl outline-none border transition-colors"
                          style={{ 
                            background: appliedCoupon ? 'var(--bg-alt)' : 'var(--bg-surface)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      {appliedCoupon ? (
                        <button
                          onClick={removeCoupon}
                          className="btn btn-danger text-xs font-bold"
                          style={{ fontFamily: 'var(--font-display)', padding: '0 16px', height: '100%' }}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="btn btn-primary text-xs font-bold"
                          style={{ fontFamily: 'var(--font-display)', padding: '0 20px', height: '100%' }}
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      )}
                    </div>
                    {appliedCoupon && (
                      <p className="text-[11px] font-bold mt-2 flex items-center gap-1" style={{ color: 'var(--success)' }}>
                        ✓ Coupon '{appliedCoupon.code}' applied (Saved ₹{Number(appliedCoupon.discountAmount).toLocaleString('en-IN')})
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 border-t mb-5" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Total</span>
                    <span className="text-2xl font-extrabold" style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-display)' }}>
                      {previewLoading
                        ? <span className="inline-block w-24 h-7 skeleton rounded" />
                        : `₹${Math.round(Number(preview?.totalPrice ?? subtotal)).toLocaleString('en-IN')}`
                      }
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}
                    className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span> <FiChevronRight size={18} />
                  </button>

                  {/* Trust Strip */}
                  <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold rounded-xl px-2.5 py-2 border" style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                        <span>🔒</span> Secure Pay
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold rounded-xl px-2.5 py-2 border" style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                        <span>🔬</span> Lab Tested
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold rounded-xl px-2.5 py-2 border" style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                        <span>🚚</span> Fast Ship
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold rounded-xl px-2.5 py-2 border" style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                        <span>↩️</span> Easy Return
                      </div>
                    </div>
                    <p className="text-center text-[10px] font-medium mt-3.5" style={{ color: 'var(--text-muted)' }}>
                      100% Pure · FSSAI Certified · Pan India Delivery
                    </p>
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
