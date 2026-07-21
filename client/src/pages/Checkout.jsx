import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMapPin, FiCreditCard, FiShield, FiTruck,
  FiArrowRight, FiHome, FiBriefcase,
  FiCheck, FiAlertCircle, FiEdit2, FiLock, FiBox
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
  <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: 'var(--border-color)' }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all"
         style={{ 
           background: active ? 'var(--brand-gradient)' : 'var(--bg-alt)',
           color: active ? '#ffffff' : 'var(--text-primary)',
           boxShadow: active ? 'var(--shadow-brand)' : 'none'
         }}>
      {num}
    </div>
    <div>
      <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{title}</h3>
      <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{sub}</p>
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
      if (err.response?.status === 409 && err.response?.data?.allItems) {
        setStockModal(err.response.data.allItems)
      } else {
        toast.error(err.response?.data?.message || 'Failed to place order')
      }
    } finally { setLoading(false) }
  }

  const startOnlinePayment = async (payload) => {
    const { data: order } = await api.post('/api/orders', payload)
    const { data: rzrOrder } = await api.post('/api/payment/create-order', { orderId: order._id })
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: rzrOrder.id, name: 'Daatasa',
      description: 'Premium Ghee Purchase', amount: rzrOrder.amount,
      theme: { color: '#F5A623' }, prefill: { name: user.name, email: user.email },
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
    <div className="min-h-screen pb-24 page-enter" style={{ background:'var(--bg-base)' }}>

      {/* Header */}
      <div className="relative overflow-hidden py-12 text-center" 
           style={{ background: 'var(--gradient-hero)' }}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'var(--gold)', filter: 'blur(30px)' }} />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                style={{ background: 'rgba(245,166,35,0.18)', color: 'var(--gold)', border: '1px solid rgba(245,166,35,0.30)' }}>
            <FiLock size={10} /> Secure Checkout
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white mb-6"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Complete Your Order
          </h1>

          {/* Progress stepper */}
          <div className="flex items-center justify-center gap-0 max-w-xs mx-auto">
            {[
              { num: 1, label: 'Address' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Review' },
            ].map((step, i, arr) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all"
                       style={{
                         background: i <= 1 ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                         color: i <= 1 ? 'var(--navy)' : 'rgba(255,255,255,0.4)',
                         boxShadow: i <= 1 ? '0 0 15px rgba(245,166,35,0.4)' : 'none',
                         border: i <= 1 ? 'none' : '1px solid rgba(255,255,255,0.15)'
                       }}>{step.num}</div>
                  <span className="text-[10px] font-bold mt-1.5 uppercase tracking-wider" 
                        style={{ color: i <= 1 ? 'var(--gold)' : 'rgba(255,255,255,0.4)' }}>{step.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-16 sm:w-20 h-[2px] mx-1 rounded-full -mt-4" 
                       style={{ background: i < 1 ? 'var(--gold)' : 'rgba(255,255,255,0.15)' }} />
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
            <div className="card overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black"
                       style={{ background: 'var(--navy)' }}>1</div>
                  <div>
                    <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)', fontFamily:'var(--font-display)' }}>Delivery Address</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Where should we deliver?</p>
                  </div>
                </div>
                {savedAddresses.length > 0 && (
                  <button type="button" onClick={() => setShowNew(!showNewForm)} className="text-xs font-bold transition-colors" style={{ color: 'var(--gold)' }}>
                    {showNewForm ? '← Use saved address' : '+ Add new address'}
                  </button>
                )}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {!showNewForm && savedAddresses.length > 0 ? (
                    <motion.div key="saved" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="grid sm:grid-cols-2 gap-3">
                      {savedAddresses.map(addr => (
                        <div key={addr._id} onClick={() => setSelAddr(String(addr._id))}
                          className="p-4 rounded-xl border-2 cursor-pointer transition-all"
                          style={{
                            borderColor: selectedAddrId === String(addr._id) ? 'var(--brand-primary)' : 'var(--border-color)',
                            background: selectedAddrId === String(addr._id) ? 'rgba(245,166,35,0.05)' : 'var(--bg-surface)',
                            boxShadow: selectedAddrId === String(addr._id) ? '0 0 15px rgba(245,166,35,0.08)' : 'none'
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg" style={{ background: addr.label === 'Home' ? 'rgba(27,47,110,0.1)' : 'rgba(45,68,153,0.1)', color: addr.label === 'Home' ? 'var(--navy)' : '#2D4499' }}>
                                {addr.label === 'Home' ? <FiHome size={12}/> : <FiBriefcase size={12}/>}
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--navy)' }}>{addr.label || 'Address'}</span>
                            </div>
                            {selectedAddrId === String(addr._id) && <FiCheck size={14} style={{ color: 'var(--brand-primary)' }}/>}
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{addr.name}<br/>{addr.street}<br/>{addr.city}, {addr.state} — {addr.zipCode}</p>
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
                            {pinLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin"/>}
                          </div>
                          {pinError && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{pinError}</p>}
                          {!pinError && newAddr.city && newAddr.zipCode.length===6 && <p className="text-xs mt-1 font-medium" style={{ color: 'var(--success)' }}>✓ {newAddr.city}, {newAddr.state}</p>}
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
                      <label className="flex items-center gap-2.5 cursor-pointer p-3.5 rounded-xl border" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border-color)' }}>
                        <input type="checkbox" checked={saveNewAddr} onChange={e => setSaveNew(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: 'var(--brand-primary)' }}/>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Save this address for future orders</span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="card overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <StepHeader num="2" title="Payment Method" sub="Choose how to pay" active={true}/>
              <div className="p-6 grid sm:grid-cols-2 gap-3">
                {[
                  { id:'COD',    label:'Cash on Delivery', icon:<FiBox size={18}/>,    desc:'Pay when you receive' },
                  { id:'Online', label:'Pay Online',       icon:<FiShield size={18}/>, desc:'Secure via Razorpay'  },
                ].map(opt => (
                  <div key={opt.id} onClick={() => setPayment(opt.id)}
                    className="p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3"
                    style={{
                      borderColor: paymentMethod === opt.id ? 'var(--brand-primary)' : 'var(--border-color)',
                      background: paymentMethod === opt.id ? 'rgba(245,166,35,0.05)' : 'var(--bg-surface)',
                      boxShadow: paymentMethod === opt.id ? '0 0 15px rgba(245,166,35,0.08)' : 'none'
                    }}
                  >
                    <div className="p-2.5 rounded-xl transition-all" style={{ background: paymentMethod === opt.id ? 'var(--gold)' : 'var(--bg-alt)', color: paymentMethod === opt.id ? '#fff' : 'var(--text-muted)' }}>{opt.icon}</div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{opt.label}</div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                    </div>
                    {paymentMethod === opt.id && <FiCheck size={15} style={{ marginLeft: 'auto', color: 'var(--brand-primary)' }}/>}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Order Items */}
            <div className="card overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily:'var(--font-display)' }}>Order Items ({cart.items.length})</h3>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {cart.items.map(item => (
                  <div key={item._id} className="px-6 py-4 flex items-center gap-4" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
                      <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.product?.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.product?.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-sm font-bold shrink-0" style={{ color: 'var(--text-primary)' }}>₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-28">

            {/* Price Breakdown */}
            <div className="card p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <h2 className="text-base font-extrabold mb-4 pb-3 border-b" style={{ color: 'var(--text-primary)', fontFamily:'var(--font-display)', borderColor: 'var(--border-color)' }}>Price Breakdown</h2>
              <div className="space-y-3 mb-4 text-sm" style={{ fontFamily:'var(--font-body)' }}>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{(preview?.itemsPrice ?? 0).toLocaleString('en-IN')}</span></div>
                {(preview?.discount ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: 'var(--success)' }}>Discount {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}</span>
                    <span className="font-bold" style={{ color: 'var(--success)' }}>−₹{Math.round(preview.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {preview?.gstRate > 0 && (
                  <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>GST ({preview.gstRate}%)</span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{Math.round(preview.taxPrice).toLocaleString('en-IN')}</span></div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                  <span className="font-semibold" style={{ color: (preview?.shippingPrice ?? 50) === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                    {(preview?.shippingPrice ?? 50) === 0 ? '🚚 FREE' : `₹${preview?.shippingPrice ?? 50}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t mb-5" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-extrabold" style={{ color: 'var(--text-primary)', fontFamily:'var(--font-display)' }}>Total</span>
                {previewLoad
                  ? <span className="inline-block w-24 h-7 skeleton rounded-lg"/>
                  : <span className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily:'var(--font-display)' }}>₹{Math.round(preview?.totalPrice ?? 0).toLocaleString('en-IN')}</span>
                }
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                style={{
                  background: 'var(--brand-gradient)',
                  boxShadow: 'var(--shadow-brand)',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <FiArrowRight size={15}/>}
                {loading ? 'Placing Order…' : paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
              </button>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[['🔒','Secure Payment'],['🚚','Fast Delivery']].map(([ic,lb]) => (
                  <div key={lb} className="flex items-center gap-2 text-xs rounded-xl p-3" style={{ background: 'var(--bg-alt)', color: 'var(--text-secondary)' }}>
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
              className="rounded-2xl w-full max-w-md p-6 shadow-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(229,62,62,0.1)' }}><FiAlertCircle size={20} style={{ color: 'var(--danger)' }}/></div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)', fontFamily:'var(--font-display)' }}>Stock Issue</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Some items have insufficient stock</p>
                </div>
              </div>
              <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
                {stockModal.map(item => (
                  <div key={item.itemId} className="p-3 border rounded-xl flex items-center justify-between" style={{ background: 'rgba(229,62,62,0.05)', borderColor: 'rgba(229,62,62,0.1)' }}>
                    <div>
                      <p className="text-xs font-bold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{item.name || 'Product'}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--danger)' }}>Requested {item.quantity} · Available {item.stock}</p>
                    </div>
                    <Link to="/cart" onClick={() => setStockModal(null)} className="p-2 rounded-lg transition-all shadow-sm btn-ghost" style={{ background: 'var(--bg-surface)', color: 'var(--danger)' }}><FiEdit2 size={13}/></Link>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate('/cart')} className="w-full btn-primary"
                        style={{ background: 'var(--brand-gradient)', boxShadow: 'var(--shadow-brand)' }}>
                  Update Cart <FiArrowRight size={14}/>
                </button>
                <button onClick={() => setStockModal(null)} className="w-full py-2.5 text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Checkout
