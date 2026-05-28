import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMapPin, FiCreditCard, FiShield, FiTruck,
  FiCheckCircle, FiArrowRight, FiHome, FiBriefcase,
  FiCheck, FiTag, FiX, FiAlertCircle, FiEdit2, FiLock, FiBox
} from 'react-icons/fi'

const STATES = [
  'Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar',
  'Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka',
  'Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
  'Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
]

const emptyNew = { name:'', phone:'', street:'', city:'', district:'', state:'', zipCode:'', country:'India' }

const StepHeader = ({ num, title, sub, active }) => (
  <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${active ? 'bg-orange-500 text-white shadow-[0_4px_12px_rgb(249_115_22_/_0.35)]' : 'bg-slate-900 text-white'}`}>{num}</div>
    <div>
      <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>{title}</h3>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  </div>
)

const Checkout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { fetchCartCount } = useCart()

  const [cart, setCart]               = useState(null)
  const [loading, setLoading]         = useState(false)
  const [paymentMethod, setPayment]   = useState('COD')
  const [savedAddresses, setSaved]    = useState([])
  const [selectedAddrId, setSelAddr]  = useState(null)
  const [showNewForm, setShowNew]     = useState(false)
  const [newAddr, setNewAddr]         = useState(emptyNew)
  const [saveNewAddr, setSaveNew]     = useState(true)
  const [couponCode, setCoupon]       = useState('')
  const [appliedCoupon, setApplied]   = useState(null)
  const [couponLoading, setCouponL]   = useState(false)
  const [stockModal, setStockModal]   = useState(null)
  const [pinLoading, setPinL]         = useState(false)
  const [pinError, setPinErr]         = useState('')
  const [preview, setPreview]         = useState(null)
  const [previewLoad, setPreviewLoad] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login', { state:{ from:'/checkout' } }); return }
    fetchCart(); fetchAddresses()

    if (location.state?.couponCode) {
      const code = location.state.couponCode
      setCoupon(code)
      setCouponL(true)
      api.post('/api/orders/verify-coupon', { couponCode: code })
        .then(res => {
          const coupon = res.data.coupon
          const bd = res.data.breakdown
          setApplied(coupon)
          setPreview(prev => ({
            ...prev,
            discount: coupon.discountAmount,
            taxPrice: bd.taxPrice,
            shippingPrice: bd.shippingPrice,
            totalPrice: bd.totalPrice
          }))
          toast.success("Coupon auto-applied from cart!")
        })
        .catch(() => {
          setApplied(null)
          setCoupon('')
        })
        .finally(() => setCouponL(false))
    }
  }, [user, location.state])

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart')
      setCart(res.data)
      if (res.data.items.length === 0) { navigate('/cart'); return }
      fetchPreview()
    } catch(e) { console.error(e) }
  }

  const fetchPreview = async (couponDiscount = 0) => {
    setPreviewLoad(true)
    try {
      const res = await api.get('/api/orders/price-preview')
      const p = res.data
      if (couponDiscount > 0) {
        const after = Math.max(0, p.itemsPrice - couponDiscount)
        const tax = after * (p.gstRate / 100)
        const ship = after > (p.freeShippingThreshold || 500) ? 0 : (p.shippingPrice || 50)
        setPreview({ ...p, discount: couponDiscount, taxPrice: tax, shippingPrice: ship, totalPrice: after + tax + ship })
      } else { setPreview({ ...p, discount: 0 }) }
    } catch(e) { console.error(e) } finally { setPreviewLoad(false) }
  }

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/auth/me')
      const addrs = res.data.addresses || []
      setSaved(addrs)
      const def = addrs.find(a => a.isDefault) || addrs[addrs.length - 1]
      if (def) setSelAddr(String(def._id))
    } catch(e) { console.error(e) }
  }

  const handlePin = async (val) => {
    const c = val.replace(/\D/g,'').slice(0,6)
    setPinErr(''); setNewAddr(p => ({ ...p, zipCode: c }))
    if (c.length === 6) {
      setPinL(true)
      try {
        const res = await api.get(`/api/pincode/${c}`)
        const data = res.data
        if (data[0]?.Status === 'Success' && data[0].PostOffice?.length) {
          const po = data[0].PostOffice[0]
          setNewAddr(p => ({ ...p, zipCode: c, state: po.State, district: po.District, city: po.Division || po.District }))
        } else { setPinErr('PIN not found — fill manually') }
      } catch { setPinErr('Could not fetch PIN') } finally { setPinL(false) }
    }
  }

  const getAddr = () => {
    if (showNewForm || savedAddresses.length === 0) return newAddr
    return savedAddresses.find(a => String(a._id) === selectedAddrId) || newAddr
  }

  const verifyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return }
    setCouponL(true)
    try {
      const res = await api.post('/api/orders/verify-coupon', { couponCode: couponCode.trim() })
      const coupon = res.data.coupon; const bd = res.data.breakdown
      setApplied(coupon)
      setPreview(prev => ({ ...prev, discount: coupon.discountAmount, taxPrice: bd.taxPrice, shippingPrice: bd.shippingPrice, totalPrice: bd.totalPrice }))
      toast.success('Coupon applied!')
    } catch { setApplied(null) } finally { setCouponL(false) }
  }

  const placeOrder = async () => {
    const shippingAddress = getAddr()
    if (showNewForm && saveNewAddr) await api.post('/api/auth/addresses', { ...newAddr, isDefault: savedAddresses.length === 0 })
    const payload = { shippingAddress, paymentMethod, couponCode: appliedCoupon?.code || null }
    if (paymentMethod === 'COD') {
      await api.post('/api/orders', payload); fetchCartCount()
      toast.success('Order placed successfully!'); navigate('/orders')
    } else { await startOnlinePayment(payload) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    // Validate address before opening Razorpay or placing order
    const addr = getAddr()
    if (!addr.name?.trim() || !addr.street?.trim() || !addr.city?.trim() || !addr.zipCode?.trim() || !addr.state?.trim()) {
      toast.error('Please select or fill in a delivery address')
      setLoading(false); return
    }
    try { await placeOrder() } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.allItems) setStockModal(err.response.data.allItems)
    } finally { setLoading(false) }
  }

  const startOnlinePayment = async (payload) => {
    const { data: order } = await api.post('/api/orders', payload)
    const { data: rzrOrder } = await api.post('/api/payment/create-order', { orderId: order._id })
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: rzrOrder.id, name: 'Dhani Fresh',
      description: 'Premium Ghee Purchase', amount: rzrOrder.amount,
      theme: { color: '#f97316' }, prefill: { name: user.name, email: user.email },
      handler: async (res) => {
        try { await api.post('/api/payment/verify', res); fetchCartCount(); toast.success('Payment successful!'); navigate('/orders') }
        catch { toast.error('Payment verification failed') }
      },
      modal: { ondismiss: async () => {
        try { await api.post('/api/orders/fail', { razorpay_order_id: rzrOrder.id }) } catch {}
        toast.error('Payment cancelled')
      }},
    })
    rzp.open()
  }

  if (!cart || cart.items.length === 0) return null

  const inputCls = "input-base"
  const labelCls = "label"

  return (
    <div className="min-h-screen pb-24" style={{ background:'var(--bg-base)' }}>

      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
          <span className="section-tag"><FiLock size={10} /> Secure Checkout</span>
          <h1 className="section-title mb-6">Complete Your Order</h1>

          {/* Progress stepper */}
          <div className="flex items-center justify-center gap-0 max-w-xs mx-auto">
            {[
              { num: 1, label: 'Address' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Review' },
            ].map((step, i, arr) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    i === 0 ? 'bg-orange-500 text-white shadow-[0_4px_12px_rgb(249_115_22_/_0.35)]' :
                    i <= 1 ? 'bg-orange-500 text-white shadow-[0_4px_12px_rgb(249_115_22_/_0.35)]' :
                    'bg-slate-100 text-slate-400'
                  }`}>{step.num}</div>
                  <span className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${i <= 1 ? 'text-orange-600' : 'text-slate-300'}`}>{step.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`w-16 sm:w-20 h-0.5 mx-1 rounded-full -mt-4 ${i < 1 ? 'bg-orange-300' : 'bg-slate-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 items-start">

          {/* Left */}
          <div className="lg:col-span-2 space-y-5">

            {/* Step 1: Address */}
            <div className="card overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black">1</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>Delivery Address</h3>
                    <p className="text-xs text-slate-400">Where should we deliver?</p>
                  </div>
                </div>
                {savedAddresses.length > 0 && (
                  <button type="button" onClick={() => setShowNew(!showNewForm)} className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
                    {showNewForm ? '← Use saved' : '+ New address'}
                  </button>
                )}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {!showNewForm && savedAddresses.length > 0 ? (
                    <motion.div key="saved" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="grid sm:grid-cols-2 gap-3">
                      {savedAddresses.map(addr => (
                        <div key={addr._id} onClick={() => setSelAddr(String(addr._id))}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddrId === String(addr._id) ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${addr.label === 'Home' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {addr.label === 'Home' ? <FiHome size={12}/> : <FiBriefcase size={12}/>}
                              </div>
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{addr.label || 'Address'}</span>
                            </div>
                            {selectedAddrId === String(addr._id) && <FiCheck size={14} className="text-slate-900"/>}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{addr.name}<br/>{addr.street}<br/>{addr.city}, {addr.state} — {addr.zipCode}</p>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div key="new" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Full Name</label><input required value={newAddr.name} onChange={e => setNewAddr(p=>({...p,name:e.target.value}))} className={inputCls} placeholder="Recipient name"/></div>
                        <div><label className={labelCls}>Phone</label>
                          <input required type="tel" inputMode="numeric" maxLength={10} value={newAddr.phone}
                            onChange={e => setNewAddr(p=>({...p,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))}
                            className={inputCls} placeholder="10-digit mobile" pattern="[6-9][0-9]{9}"/>
                        </div>
                      </div>
                      <div><label className={labelCls}>Street Address</label><input required value={newAddr.street} onChange={e => setNewAddr(p=>({...p,street:e.target.value}))} className={inputCls} placeholder="House no., Street, Area"/></div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className={labelCls}>PIN Code</label>
                          <div className="relative">
                            <input required type="text" inputMode="numeric" maxLength={6} value={newAddr.zipCode}
                              onChange={e => handlePin(e.target.value)} className={`${inputCls} pr-8`} placeholder="6-digit PIN"/>
                            {pinLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin"/>}
                          </div>
                          {pinError && <p className="text-xs text-red-500 mt-1">{pinError}</p>}
                          {!pinError && newAddr.city && newAddr.zipCode.length===6 && <p className="text-xs text-emerald-600 mt-1 font-medium">✓ {newAddr.city}, {newAddr.state}</p>}
                        </div>
                        <div><label className={labelCls}>City</label><input required value={newAddr.city} onChange={e => setNewAddr(p=>({...p,city:e.target.value}))} className={inputCls} placeholder="City"/></div>
                        <div>
                          <label className={labelCls}>District</label>
                          <input value={newAddr.district} onChange={e => setNewAddr(p=>({...p,district:e.target.value}))} className={inputCls} placeholder="District (auto-filled)"/>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>State</label>
                        <select required value={newAddr.state} onChange={e => setNewAddr(p=>({...p,state:e.target.value}))} className={inputCls}>
                          <option value="">Select State</option>
                          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <label className="flex items-center gap-2.5 cursor-pointer p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <input type="checkbox" checked={saveNewAddr} onChange={e => setSaveNew(e.target.checked)} className="w-4 h-4 accent-orange-500 rounded"/>
                        <span className="text-xs font-medium text-slate-700">Save this address for future orders</span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="card overflow-hidden">
              <StepHeader num="2" title="Payment Method" sub="Choose how to pay" active={true}/>
              <div className="p-6 grid sm:grid-cols-2 gap-3">
                {[
                  { id:'COD',    label:'Cash on Delivery', icon:<FiBox size={18}/>,    desc:'Pay when you receive' },
                  { id:'Online', label:'Pay Online',       icon:<FiShield size={18}/>, desc:'Secure via Razorpay'  },
                ].map(opt => (
                  <div key={opt.id} onClick={() => setPayment(opt.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${paymentMethod === opt.id ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className={`p-2.5 rounded-xl ${paymentMethod === opt.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'} transition-all`}>{opt.icon}</div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{opt.label}</div>
                      <p className="text-xs text-slate-400">{opt.desc}</p>
                    </div>
                    {paymentMethod === opt.id && <FiCheck size={15} className="ml-auto text-orange-500"/>}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Order Items */}
            <div className="card overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-50">
                <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>Order Items ({cart.items.length})</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {cart.items.map(item => (
                  <div key={item._id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                      <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.product?.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity} × ₹{item.product?.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 shrink-0">₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-28">

            {/* Coupon */}
            <div className="card p-5">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><FiTag size={14} className="text-orange-500"/> Have a Coupon?</h4>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle size={15} className="text-emerald-600"/>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{appliedCoupon.code}</p>
                      <p className="text-xs text-emerald-600 font-medium">−₹{Number(appliedCoupon.discountAmount).toLocaleString('en-IN')} saved</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setApplied(null); setCoupon(''); fetchPreview() }} className="text-slate-300 hover:text-red-500 transition-colors" title="Remove coupon"><FiX size={14}/></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => setCoupon(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all uppercase font-bold tracking-widest"
                  />
                  <button type="button" disabled={couponLoading || !couponCode.trim()} onClick={verifyCoupon}
                    className="px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-orange-500 transition-all disabled:opacity-50">
                    {couponLoading ? '…' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="card p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-50" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>Price Breakdown</h2>
              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold text-slate-900">₹{(preview?.itemsPrice ?? 0).toLocaleString('en-IN')}</span></div>
                {(preview?.discount ?? 0) > 0 && (
                  <div className="flex justify-between"><span className="text-emerald-600">Discount</span><span className="font-semibold text-emerald-600">−₹{Math.round(preview.discount).toLocaleString('en-IN')}</span></div>
                )}
                {preview?.gstRate > 0 && (
                  <div className="flex justify-between"><span className="text-slate-500">GST ({preview.gstRate}%)</span><span className="font-semibold">₹{Math.round(preview.taxPrice).toLocaleString('en-IN')}</span></div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping</span>
                  <span className={`font-semibold ${(preview?.shippingPrice ?? 50) === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {(preview?.shippingPrice ?? 50) === 0 ? '🚚 FREE' : `₹${preview?.shippingPrice ?? 50}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-slate-100 mb-5">
                <span className="font-extrabold text-slate-900">Total</span>
                {previewLoad
                  ? <span className="inline-block w-24 h-7 shimmer rounded-lg"/>
                  : <span className="text-2xl font-extrabold text-slate-900" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>₹{Math.round(preview?.totalPrice ?? 0).toLocaleString('en-IN')}</span>
                }
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl shadow-[0_4px_14px_rgb(249_115_22_/_0.35)] hover:shadow-[0_6px_20px_rgb(249_115_22_/_0.45)] transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <FiArrowRight size={15}/>}
                {loading ? 'Placing Order…' : paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
              </button>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[['🔒','Secure Payment'],['🚚','Fast Delivery']].map(([ic,lb]) => (
                  <div key={lb} className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                    <span>{ic}</span><span className="font-medium">{lb}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Stock Modal */}
      <AnimatePresence>
        {stockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><FiAlertCircle size={20} className="text-red-600"/></div>
                <div>
                  <h2 className="text-base font-bold text-slate-900" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>Stock Issue</h2>
                  <p className="text-xs text-slate-400">Some items have insufficient stock</p>
                </div>
              </div>
              <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
                {stockModal.map(item => (
                  <div key={item.itemId} className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{item.name || 'Product'}</p>
                      <p className="text-[11px] text-red-600 mt-0.5">Requested {item.quantity} · Available {item.stock}</p>
                    </div>
                    <Link to="/cart" onClick={() => setStockModal(null)} className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><FiEdit2 size={13}/></Link>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate('/cart')} className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2">
                  Update Cart <FiArrowRight size={14}/>
                </button>
                <button onClick={() => setStockModal(null)} className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Checkout
