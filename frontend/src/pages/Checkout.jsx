import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMapPin, FiCreditCard, FiPackage, FiShield, FiTruck,
  FiCheckCircle, FiArrowRight, FiDollarSign, FiPlus, FiMinus,
  FiHome, FiBriefcase, FiCheck, FiTag, FiX, FiTrash2, FiAlertCircle, FiChevronRight, FiLock, FiEdit2
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

const emptyNew = { name: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India' }

const Checkout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { fetchCartCount } = useCart()

  // ── State ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddrId, setSelectedAddrId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newAddr, setNewAddr] = useState(emptyNew)
  const [saveNewAddr, setSaveNewAddr] = useState(true)

  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  // Stock Modal
  const [stockModalItems, setStockModalItems] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchCart()
    fetchAddresses()
  }, [user])

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart')
      setCart(res.data)
      if (res.data.items.length === 0) navigate('/cart')
    } catch (e) {
      console.error('Error fetching cart:', e)
    }
  }

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/auth/me')
      const addrs = res.data.addresses || []
      setSavedAddresses(addrs)
      const def = addrs.find(a => a.isDefault) || addrs[addrs.length - 1]
      if (def) setSelectedAddrId(String(def._id))
    } catch (e) {
      console.error('Error fetching addresses:', e)
    }
  }

  const calcTotals = () => {
    if (!cart?.items) return { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 }
    const subtotal = cart.items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0)
    const discount = appliedCoupon?.discountAmount || 0
    const afterDiscount = Math.max(0, subtotal - discount)
    const tax = afterDiscount * 0.18
    const shipping = afterDiscount > 500 ? 0 : 50
    return { subtotal, discount, tax, shipping, total: afterDiscount + tax + shipping }
  }

  const getShippingAddr = () => {
    if (showNewForm || savedAddresses.length === 0) return newAddr
    return savedAddresses.find(a => String(a._id) === selectedAddrId) || newAddr
  }

  const verifyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return }
    setCouponLoading(true)
    try {
      const totals = calcTotals()
      const res = await api.post('/api/orders/verify-coupon', { 
        couponCode: couponCode.trim(), 
        orderTotal: totals.subtotal 
      })
      setAppliedCoupon(res.data.coupon)
      toast.success('Coupon applied!')
    } catch (err) {
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const placeOrder = async () => {
    const shippingAddress = getShippingAddr()
    if (showNewForm && saveNewAddr) {
      await api.post('/api/auth/addresses', { ...newAddr, isDefault: savedAddresses.length === 0 })
    }

    const orderPayload = {
      shippingAddress,
      paymentMethod,
      couponCode: appliedCoupon?.code || null,
    }

    if (paymentMethod === 'COD') {
      await api.post('/api/orders', orderPayload)
      fetchCartCount()
      toast.success('Order placed successfully!')
      navigate('/orders')
    } else {
      await startOnlinePayment(orderPayload)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await placeOrder()
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.allItems) {
        setStockModalItems(err.response.data.allItems)
      }
    } finally {
      setLoading(false)
    }
  }

  const startOnlinePayment = async (orderPayload) => {
    const { data: order } = await api.post('/api/orders', orderPayload)
    const { data: rzrOrder } = await api.post('/api/payment/create-order', { orderId: order._id })

    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SfFPdtbqDtnwPd',
      order_id: rzrOrder.id,
      name: 'Dhani Fresh',
      description: 'Premium Ghee Purchase',
      image: '/logo.png', // Fallback to root logo
      amount: rzrOrder.amount,
      theme: { color: '#e8621a' },
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
          try { await api.post('/api/orders/fail', { razorpay_order_id: rzrOrder.id }) } catch { }
          toast.error('Payment cancelled')
        },
      },
    })
    rzp.open()
  }

  if (!cart || cart.items.length === 0) return null
  const totals = calcTotals()

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-32">
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-[var(--color-border)] pt-12 pb-8 sm:pt-16 sm:pb-12 shadow-sm relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-4">
              <FiLock size={14} className="text-orange-600" />
              <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">Secure Settlement</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 font-head tracking-tight">Checkout</h1>
            <p className="text-gray-500 font-medium max-w-lg">Finalize your delivery coordinates and secure your premium selection.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12 items-start">
          
          {/* ── Left Content Matrix ── */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Step 1: Destination */}
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 sm:p-10 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 font-head">Destination</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 01 / 02</p>
                  </div>
                </div>
                {savedAddresses.length > 0 && (
                   <button 
                    type="button"
                    onClick={() => setShowNewForm(!showNewForm)}
                    className="text-xs font-black text-orange-600 uppercase tracking-widest hover:text-gray-900 transition-colors"
                   >
                     {showNewForm ? 'Back to Saved' : 'Add New Address'}
                   </button>
                )}
              </div>

              <div className="p-8 sm:p-10">
                 <AnimatePresence mode="wait">
                    {!showNewForm && savedAddresses.length > 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid sm:grid-cols-2 gap-4"
                      >
                         {savedAddresses.map((addr) => (
                           <div 
                            key={addr._id}
                            onClick={() => setSelectedAddrId(addr._id)}
                            className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all relative ${
                              selectedAddrId === addr._id ? 'border-gray-900 bg-gray-50' : 'border-gray-50 hover:border-gray-100'
                            }`}
                           >
                            <div className="flex items-center gap-3 mb-4">
                               <div className={`p-2 rounded-xl ${addr.label === 'Home' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                  {addr.label === 'Home' ? <FiHome size={14}/> : <FiBriefcase size={14}/>}
                               </div>
                               <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{addr.label}</span>
                               {selectedAddrId === addr._id && <FiCheckCircle className="ml-auto text-gray-900" />}
                            </div>
                            <div className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tighter">
                               {addr.name}<br/>
                               {addr.street}<br/>
                               {addr.city}, {addr.state}
                            </div>
                           </div>
                         ))}
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                         <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recipient Name</label>
                               <input required value={newAddr.name} onChange={e => setNewAddr(p => ({ ...p, name: e.target.value }))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Phone</label>
                               <input required value={newAddr.phone} onChange={e => setNewAddr(p => ({ ...p, phone: e.target.value }))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all" />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                            <input required value={newAddr.street} onChange={e => setNewAddr(p => ({ ...p, street: e.target.value }))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all" />
                         </div>
                         <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-1 sm:col-span-1">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PIN Code</label>
                               <input required maxLength={6} value={newAddr.zipCode} onChange={e => setNewAddr(p => ({ ...p, zipCode: e.target.value }))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all" />
                            </div>
                            <div className="space-y-1 sm:col-span-1">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                               <input required value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all" />
                            </div>
                            <div className="space-y-1 sm:col-span-1">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                               <select required value={newAddr.state} onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all appearance-none cursor-pointer">
                                  <option value="">Select State</option>
                                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                               </select>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4">
                            <input type="checkbox" id="save" checked={saveNewAddr} onChange={e => setSaveNewAddr(e.target.checked)} className="w-4 h-4 accent-gray-900 rounded cursor-pointer" />
                            <label htmlFor="save" className="text-xs font-black text-gray-700 cursor-pointer">Archive for future orders</label>
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
            </section>

            {/* Step 2: Settlement Method */}
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-8 sm:p-10 border-b border-gray-50 flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                    <FiCreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 font-head">Settlement</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 02 / 02</p>
                  </div>
               </div>

               <div className="p-8 sm:p-10 grid sm:grid-cols-2 gap-4">
                  {[
                    { id: 'COD', label: 'Cash on Delivery', icon: <FiDollarSign size={18}/>, desc: 'Settle upon arrival' },
                    { id: 'Online', label: 'Razorpay Secure', icon: <FiShield size={18}/>, desc: 'Instant verification' }
                  ].map((opt) => (
                    <div 
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all flex items-center gap-4 ${
                        paymentMethod === opt.id ? 'border-orange-600 bg-orange-50/30' : 'border-gray-50 hover:border-gray-100'
                      }`}
                    >
                       <div className={`p-3 rounded-2xl ${paymentMethod === opt.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {opt.icon}
                       </div>
                       <div>
                          <div className="text-sm font-black text-gray-900 uppercase tracking-widest">{opt.label}</div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{opt.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          {/* ── Right: Summary Sidebar ── */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-32">
            
            {/* Coupon Layer */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiTag className="text-orange-600" /> Redemption Code
                </h4>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input 
                      placeholder="XXXX-XXXX"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-xs font-black outline-none focus:border-orange-500 transition-all uppercase"
                    />
                    <button 
                      type="button"
                      disabled={couponLoading}
                      onClick={verifyCoupon}
                      className="px-4 py-3 bg-gray-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
                     <div className="flex items-center gap-3">
                        <FiCheckCircle className="text-green-600" />
                        <div>
                           <div className="text-xs font-black text-gray-900 uppercase">{appliedCoupon.code}</div>
                           <div className="text-[10px] font-bold text-green-600 uppercase">Save ₹{appliedCoupon.discountAmount}</div>
                        </div>
                     </div>
                     <button type="button" onClick={() => setAppliedCoupon(null)} className="text-gray-400 hover:text-red-500"><FiX /></button>
                  </div>
                )}
            </div>

            {/* Final Computation Matrix */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 p-8 sm:p-10">
               <h2 className="text-xl font-black text-gray-900 mb-8 font-head tracking-tight">Final Settlement</h2>
               
               <div className="space-y-4 mb-8 border-b border-gray-50 pb-8">
                  <div className="flex justify-between text-sm font-medium">
                     <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Selections</span>
                     <span className="text-gray-900 font-black tracking-tight flex items-center gap-2">
                       {cart.items.length} <FiChevronRight size={12}/>
                     </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                     <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Net Total</span>
                     <span className="text-gray-900 font-black">₹{totals.subtotal.toLocaleString()}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-sm font-medium">
                       <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Redemption</span>
                       <span className="text-green-600 font-black">-₹{totals.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium">
                     <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">GST (18%)</span>
                     <span className="text-gray-900 font-black">₹{totals.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                     <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Logistics</span>
                     <span className={totals.shipping === 0 ? 'text-green-600 font-black text-xs' : 'text-gray-900 font-black'}>
                        {totals.shipping === 0 ? 'FREE' : `₹${totals.shipping}`}
                     </span>
                  </div>
               </div>

               <div className="mb-10 text-center">
                  <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Payable Balance</h3>
                  <div className="text-5xl font-black text-gray-900 font-head tracking-tighter leading-none">₹{Math.round(totals.total).toLocaleString()}</div>
               </div>

               <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl shadow-xl shadow-gray-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
               >
                 {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiArrowRight />}
                 {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Confirm Artifacts' : 'Initialize Razorpay'}
               </button>

               <div className="mt-8 flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <FiShield size={20} className="text-orange-600 shrink-0" />
                     <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">
                       End-to-end encryption ensures your data stays within nuestra vault.
                     </p>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <FiTruck size={20} className="text-orange-600 shrink-0" />
                     <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">
                       Estimated arrival: {new Date(Date.now() + 4*24*60*60*1000).toLocaleDateString()} — {new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Stock Issue Modal ── */}
      <AnimatePresence>
        {stockModalItems && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
             <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[48px] w-full max-w-xl p-10 shadow-2xl relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-8 grayscale opacity-5">
                   <FiAlertCircle size={120} />
                </div>

                <div className="relative z-10 text-center mb-10">
                   <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-100">
                      <FiAlertCircle size={32} />
                   </div>
                   <h2 className="text-2xl font-black text-gray-900 mb-2 font-head">Inventory Conflict</h2>
                   <p className="text-gray-400 font-medium max-w-xs mx-auto">Nuestra internal vault reports availability issues for the following selections.</p>
                </div>

                <div className="space-y-4 mb-10 max-h-[40vh] overflow-y-auto px-2">
                   {stockModalItems.map((item) => (
                      <div key={item.itemId} className="p-6 bg-red-50/50 border border-red-100 rounded-[32px] flex items-center justify-between">
                         <div>
                            <p className="text-xs font-black text-gray-900 uppercase tracking-widest truncate max-w-[200px]">{item.name || 'Artifact'}</p>
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Requested {item.quantity} / Available {item.stock}</p>
                         </div>
                         <Link to="/cart" onClick={() => setStockModalItems(null)} className="p-3 bg-white text-red-600 rounded-2xl shadow-sm hover:bg-red-600 hover:text-white transition-all">
                            <FiEdit2 size={16} />
                         </Link>
                      </div>
                   ))}
                </div>

                <div className="flex flex-col gap-3">
                   <button 
                    onClick={() => navigate('/cart')}
                    className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3"
                   >
                     Adjust Selection Matrix <FiArrowRight />
                   </button>
                   <button 
                    onClick={() => setStockModalItems(null)}
                    className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                   >
                     Cancel Checkout
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
