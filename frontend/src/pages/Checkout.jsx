import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMapPin, FiCreditCard, FiShield, FiTruck,
  FiCheckCircle, FiArrowRight, FiPlus,
  FiHome, FiBriefcase, FiCheck, FiTag, FiX, FiAlertCircle, FiEdit2, FiLock, FiBox
} from 'react-icons/fi'

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const emptyNew = { name: '', phone: '', street: '', city: '', district: '', state: '', zipCode: '', country: 'India' }

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-800 transition-all placeholder:text-gray-400"
const labelCls = "block text-sm font-medium text-gray-600 mb-1"

const Checkout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { fetchCartCount } = useCart()

  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddrId, setSelectedAddrId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newAddr, setNewAddr] = useState(emptyNew)
  const [saveNewAddr, setSaveNewAddr] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [stockModalItems, setStockModalItems] = useState(null)
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  // Price breakdown from backend — no frontend math
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return }
    fetchCart()
    fetchAddresses()
  }, [user])

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart')
      setCart(res.data)
      if (res.data.items.length === 0) { navigate('/cart'); return }
      fetchPreview()
    } catch (e) { console.error(e) }
  }

  const fetchPreview = async (couponDiscount = 0) => {
    setPreviewLoading(true)
    try {
      const res = await api.get('/api/orders/price-preview')
      const p = res.data
      // Apply coupon discount on top if one is applied
      if (couponDiscount > 0) {
        const afterDiscount = Math.max(0, p.itemsPrice - couponDiscount)
        const tax = afterDiscount * (p.gstRate / 100)
        const shipping = afterDiscount > (p.freeShippingThreshold || 500) ? 0 : (p.shippingPrice || 50)
        setPreview({ ...p, discount: couponDiscount, taxPrice: tax, shippingPrice: shipping, totalPrice: afterDiscount + tax + shipping })
      } else {
        setPreview({ ...p, discount: 0 })
      }
    } catch (e) { console.error(e) } finally { setPreviewLoading(false) }
  }

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/auth/me')
      const addrs = res.data.addresses || []
      setSavedAddresses(addrs)
      const def = addrs.find(a => a.isDefault) || addrs[addrs.length - 1]
      if (def) setSelectedAddrId(String(def._id))
    } catch (e) { console.error(e) }
  }

  const handlePinLookup = async (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6)
    setPinError('')
    setNewAddr(p => ({ ...p, zipCode: cleaned }))
    if (cleaned.length === 6) {
      setPinLoading(true)
      try {
        const res  = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`)
        const data = await res.json()
        if (data[0]?.Status === 'Success' && data[0].PostOffice?.length) {
          const po = data[0].PostOffice[0]
          setNewAddr(p => ({ ...p, zipCode: cleaned, state: po.State, district: po.District, city: po.Division || po.District }))
        } else { setPinError('PIN not found — fill manually') }
      } catch { setPinError('Could not fetch PIN') }
      finally { setPinLoading(false) }
    }
  }

  const getShippingAddr = () => {
    if (showNewForm || savedAddresses.length === 0) return newAddr
    return savedAddresses.find(a => String(a._id) === selectedAddrId) || newAddr
  }

  const verifyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return }
    setCouponLoading(true)
    try {
      const res = await api.post('/api/orders/verify-coupon', { couponCode: couponCode.trim() })
      const coupon = res.data.coupon
      const bd = res.data.breakdown
      setAppliedCoupon(coupon)
      // Update preview with server-computed breakdown
      setPreview(prev => ({ ...prev, discount: coupon.discountAmount, taxPrice: bd.taxPrice, shippingPrice: bd.shippingPrice, totalPrice: bd.totalPrice }))
      toast.success('Coupon applied!')
    } catch { setAppliedCoupon(null) }
    finally { setCouponLoading(false) }
  }

  const placeOrder = async () => {
    const shippingAddress = getShippingAddr()
    if (showNewForm && saveNewAddr) {
      await api.post('/api/auth/addresses', { ...newAddr, isDefault: savedAddresses.length === 0 })
    }
    const payload = { shippingAddress, paymentMethod, couponCode: appliedCoupon?.code || null }
    if (paymentMethod === 'COD') {
      await api.post('/api/orders', payload)
      fetchCartCount()
      toast.success('Order placed successfully!')
      navigate('/orders')
    } else {
      await startOnlinePayment(payload)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await placeOrder() }
    catch (err) {
      if (err.response?.status === 409 && err.response?.data?.allItems) {
        setStockModalItems(err.response.data.allItems)
      }
    } finally { setLoading(false) }
  }

  const startOnlinePayment = async (payload) => {
    const { data: order } = await api.post('/api/orders', payload)
    const { data: rzrOrder } = await api.post('/api/payment/create-order', { orderId: order._id })
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: rzrOrder.id,
      name: 'Dhani Fresh',
      description: 'Premium Ghee Purchase',
      amount: rzrOrder.amount,
      theme: { color: '#f97316' },
      prefill: { name: user.name, email: user.email },
      handler: async (res) => {
        try {
          await api.post('/api/payment/verify', res)
          fetchCartCount()
          toast.success('Payment successful!')
          navigate('/orders')
        } catch { toast.error('Payment verification failed') }
      },
      modal: {
        ondismiss: async () => {
          try { await api.post('/api/orders/fail', { razorpay_order_id: rzrOrder.id }) } catch {}
          toast.error('Payment cancelled')
        },
      },
    })
    rzp.open()
  }

  if (!cart || cart.items.length === 0) return null

  return (
    <div className="min-h-screen pb-20" style={{ background: '#f8f9fa' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-3">
            <FiLock size={10} className="inline mr-1" /> Secure Checkout
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 items-start">

          {/* Left: Steps */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Delivery Address */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">1</div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Delivery Address</h3>
                    <p className="text-xs text-gray-400">Where should we deliver?</p>
                  </div>
                </div>
                {savedAddresses.length > 0 && (
                  <button type="button" onClick={() => setShowNewForm(!showNewForm)} className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                    {showNewForm ? '← Use saved' : '+ New address'}
                  </button>
                )}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {!showNewForm && savedAddresses.length > 0 ? (
                    <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id}
                          onClick={() => setSelectedAddrId(String(addr._id))}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedAddrId === String(addr._id) ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-md ${addr.label === 'Home' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                {addr.label === 'Home' ? <FiHome size={12} /> : <FiBriefcase size={12} />}
                              </div>
                              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{addr.label || 'Address'}</span>
                            </div>
                            {selectedAddrId === addr._id && <FiCheck size={14} className="text-gray-900" />}
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">{addr.name}<br />{addr.street}<br />{addr.city}, {addr.state} - {addr.zipCode}</p>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div key="new" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Full Name</label>
                          <input required value={newAddr.name} onChange={e => setNewAddr(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Recipient name" />
                        </div>
                        <div>
                          <label className={labelCls}>Phone Number</label>
                          <input
                            required
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={newAddr.phone}
                            onChange={e => setNewAddr(p => ({ ...p, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                            className={inputCls}
                            placeholder="10-digit mobile number"
                            pattern="[6-9][0-9]{9}"
                            title="Enter a valid 10-digit Indian mobile number"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Street Address</label>
                        <input required value={newAddr.street} onChange={e => setNewAddr(p => ({ ...p, street: e.target.value }))} className={inputCls} placeholder="House no., Street, Area" />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className={labelCls}>PIN Code</label>
                          <div className="relative">
                            <input
                              required
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={newAddr.zipCode}
                              onChange={e => handlePinLookup(e.target.value)}
                              className={`${inputCls} pr-8`}
                              placeholder="6-digit PIN"
                              pattern="[0-9]{6}"
                            />
                            {pinLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-orange-400/30 border-t-orange-500 rounded-full animate-spin" />}
                          </div>
                          {pinError && <p className="text-xs text-red-500 mt-1">{pinError}</p>}
                          {!pinError && newAddr.city && newAddr.zipCode.length===6 && <p className="text-xs text-green-600 mt-1">✓ {newAddr.city}, {newAddr.state}</p>}
                        </div>
                        <div>
                          <label className={labelCls}>City</label>
                          <input required value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} className={inputCls} placeholder="City" />
                        </div>
                        <div>
                          <label className={labelCls}>State</label>
                          <select required value={newAddr.state} onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))} className={inputCls}>
                            <option value="">Select State</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <input type="checkbox" checked={saveNewAddr} onChange={e => setSaveNewAddr(e.target.checked)} className="w-4 h-4 accent-orange-500 rounded" />
                        <span className="text-xs font-medium text-gray-700">Save this address for future orders</span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Step 2: Payment Method */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">2</div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Payment Method</h3>
                  <p className="text-xs text-gray-400">Choose how to pay</p>
                </div>
              </div>

              <div className="p-6 grid sm:grid-cols-2 gap-3">
                {[
                  { id: 'COD', label: 'Cash on Delivery', icon: <FiBox size={18} />, desc: 'Pay when you receive' },
                  { id: 'Online', label: 'Pay Online', icon: <FiShield size={18} />, desc: 'Secure via Razorpay' },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      paymentMethod === opt.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${paymentMethod === opt.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {opt.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                    {paymentMethod === opt.id && <FiCheck size={15} className="ml-auto text-orange-500" />}
                  </div>
                ))}
              </div>
            </section>

            {/* Cart Items Preview */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Order Items ({cart.items.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {cart.items.map((item) => (
                  <div key={item._id} className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiTag size={14} className="text-orange-500" /> Coupon Code
              </h4>
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400 transition-all uppercase font-medium"
                  />
                  <button type="button" disabled={couponLoading} onClick={verifyCoupon} className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-orange-500 transition-all disabled:opacity-50">
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle size={15} className="text-green-600" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">-₹{appliedCoupon.discountAmount} saved</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setAppliedCoupon(null)} className="text-gray-300 hover:text-red-500"><FiX size={14} /></button>
                </div>
              )}
            </div>

            {/* Order Total */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-50" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Price Breakdown</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{(preview?.itemsPrice ?? 0).toLocaleString('en-IN')}</span>
                </div>
                {(preview?.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">-₹{Math.round(preview.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {preview && preview.gstRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST ({preview.gstRate}%)</span>
                    <span className="font-medium text-gray-900">₹{Math.round(preview.taxPrice).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-medium ${(preview?.shippingPrice ?? 50) === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {(preview?.shippingPrice ?? 50) === 0 ? 'FREE' : `₹${preview?.shippingPrice ?? 50}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-4 border-t border-gray-100 mb-4">
                <span className="font-bold text-gray-900">Total</span>
                {previewLoading
                  ? <span className="inline-block w-20 h-6 bg-gray-100 rounded animate-pulse" />
                  : <span className="text-xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>₹{Math.round(preview?.totalPrice ?? 0).toLocaleString('en-IN')}</span>
                }
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiArrowRight size={15} />}
                {loading ? 'Placing Order...' : paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
              </button>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-50">
                <span className="flex items-center gap-1"><FiShield size={11} className="text-orange-400" /> Secure</span>
                <span className="flex items-center gap-1"><FiTruck size={11} className="text-orange-400" /> Fast Delivery</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Stock Modal */}
      <AnimatePresence>
        {stockModalItems && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <FiAlertCircle size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Stock Issue</h2>
                  <p className="text-xs text-gray-400">Some items are out of stock</p>
                </div>
              </div>

              <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
                {stockModalItems.map((item) => (
                  <div key={item.itemId} className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-900 truncate max-w-[200px]">{item.name || 'Product'}</p>
                      <p className="text-[11px] text-red-600 mt-0.5">Requested {item.quantity} · Available {item.stock}</p>
                    </div>
                    <Link to="/cart" onClick={() => setStockModalItems(null)} className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      <FiEdit2 size={13} />
                    </Link>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => navigate('/cart')} className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-orange-500 transition-all flex items-center justify-center gap-2">
                  Update Cart <FiArrowRight size={14} />
                </button>
                <button onClick={() => setStockModalItems(null)} className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Checkout
