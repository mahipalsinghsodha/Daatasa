// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import axios from 'axios'
// import { useAuth } from '../context/AuthContext'
// import { toast } from 'react-toastify'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   FiMapPin, FiCreditCard, FiPackage, FiShield,
//   FiTruck, FiCheckCircle, FiArrowRight, FiDollarSign,
// } from 'react-icons/fi'

// // ── Brand Tokens ──────────────────────────────────────────────────────────────
// const C = {
//   orange:      '#e8621a',
//   orangeHov:   '#cf5618',
//   orangeLight: '#fff4ee',
//   orangeMid:   '#fddcca',
//   bg:          '#f2f4f6',
//   white:       '#ffffff',
//   text:        '#1a1a2e',
//   textMid:     '#444455',
//   textLight:   '#8899aa',
//   border:      '#e4e9f0',
//   shadow:      '0 2px 12px rgba(0,0,0,0.07)',
//   shadowMd:    '0 6px 28px rgba(0,0,0,0.11)',
//   green:       '#16a34a', greenBg: '#dcfce7',
//   font:        "'Plus Jakarta Sans', system-ui, sans-serif",
// }

// // ── Reusable styled input ─────────────────────────────────────────────────────
// const Field = ({ label, icon: Icon, ...props }) => {
//   const [focused, setFocused] = useState(false)
//   return (
//     <div>
//       {label && (
//         <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
//       )}
//       <div style={{ position: 'relative' }}>
//         {Icon && <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused ? C.orange : C.textLight, transition: 'color 0.2s' }} />}
//         <input
//           {...props}
//           onFocus={e => { setFocused(true); props.onFocus?.(e) }}
//           onBlur={e => { setFocused(false); props.onBlur?.(e) }}
//           style={{
//             width: '100%', boxSizing: 'border-box',
//             border: `1.5px solid ${focused ? C.orange : C.border}`,
//             borderRadius: 10, padding: `10px 13px 10px ${Icon ? '34px' : '13px'}`,
//             fontSize: 14, color: C.text, outline: 'none',
//             fontFamily: C.font, background: C.white, transition: 'border-color 0.2s',
//           }}
//         />
//       </div>
//     </div>
//   )
// }

// // ── Section wrapper ───────────────────────────────────────────────────────────
// const Section = ({ icon: Icon, title, subtitle, children, step }) => (
//   <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: C.shadow }}>
//     <div style={{ padding: '18px 22px', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
//       <div style={{ width: 36, height: 36, background: C.orangeLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//         <Icon size={17} style={{ color: C.orange }} />
//       </div>
//       <div style={{ flex: 1 }}>
//         <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.text }}>{title}</h2>
//         {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textLight }}>{subtitle}</p>}
//       </div>
//       {step && (
//         <div style={{ width: 28, height: 28, background: C.orange, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//           <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>{step}</span>
//         </div>
//       )}
//     </div>
//     <div style={{ padding: '22px' }}>{children}</div>
//   </div>
// )

// const PriceRow = ({ label, val, bold, valColor, borderTop }) => (
//   <div style={{
//     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//     fontSize: bold ? 16 : 13, fontWeight: bold ? 900 : 500,
//     borderTop: borderTop ? `1.5px solid ${C.border}` : 'none',
//     paddingTop: borderTop ? 14 : 0,
//     marginTop: borderTop ? 6 : 0,
//   }}>
//     <span style={{ color: bold ? C.text : C.textLight }}>{label}</span>
//     <span style={{ color: valColor || (bold ? C.orange : C.textMid), fontWeight: bold ? 900 : 700 }}>{val}</span>
//   </div>
// )

// // ─────────────────────────────────────────────────────────────────────────────
// const Checkout = () => {
//   const { user }    = useAuth()
//   const navigate    = useNavigate()
//   const [cart, setCart]     = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [paymentMethod, setPaymentMethod] = useState('COD')
//   const [shippingAddress, setShippingAddress] = useState({
//     street: '', city: '', state: '', zipCode: '', country: '',
//   })

//   useEffect(() => {
//     if (!user) { navigate('/login'); return }
//     fetchCart()
//     if (user.address) setShippingAddress(user.address)
//   }, [user])

//   const fetchCart = async () => {
//     try {
//       const res = await axios.get('/api/cart')
//       setCart(res.data)
//       if (res.data.items.length === 0) navigate('/cart')
//     } catch (e) { console.error(e) }
//   }

//   const handleChange = e => setShippingAddress(p => ({ ...p, [e.target.name]: e.target.value }))

//   const calcTotals = () => {
//     if (!cart?.items) return { subtotal: 0, tax: 0, shipping: 0, total: 0 }
//     const subtotal = cart.items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0)
//     const tax      = subtotal * 0.18
//     const shipping = subtotal > 500 ? 0 : 50
//     return { subtotal, tax, shipping, total: subtotal + tax + shipping }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     try {
//       if (paymentMethod === 'COD') {
//         await createCODOrder(); navigate('/orders')
//       } else {
//         await startOnlinePayment()
//       }
//     } catch (err) {
//       console.error(err); toast.error('Something went wrong')
//     } finally { setLoading(false) }
//   }

//   const createCODOrder = async () => {
//     const token = localStorage.getItem('token')
//     await axios.post('/api/orders', { shippingAddress, paymentMethod: 'COD' }, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//   }

//   const startOnlinePayment = async () => {
//     const token = localStorage.getItem('token')
//     const { data: order } = await axios.post('/api/orders', { shippingAddress, paymentMethod: 'Online' }, { headers: { Authorization: `Bearer ${token}` } })
//     const { data: razorOrder } = await axios.post('/api/payment/create-order', { orderId: order._id }, { headers: { Authorization: `Bearer ${token}` } })
//     openRazorpay(razorOrder.id)
//   }

//   const openRazorpay = (razorpayOrderId) => {
//     const token = localStorage.getItem('token')
//     const rzp = new window.Razorpay({
//       key: 'rzp_test_EvzmZvtG1AJQAS',
//       order_id: razorpayOrderId,
//       name: 'Ghee Store',
//       currency: 'INR',
//       theme: { color: C.orange },
//       prefill: { name: user.name, email: user.email },
//       handler: async (response) => {
//         await axios.post('/api/payment/verify', response, { headers: { Authorization: `Bearer ${token}` } })
//         navigate('/orders')
//       },
//       modal: {
//         ondismiss: async () => {
//           await axios.post('/api/orders/fail', { razorpay_order_id: razorpayOrderId }, { headers: { Authorization: `Bearer ${token}` } })
//           toast.error('Payment cancelled')
//         },
//       },
//     })
//     rzp.on('payment.failed', async () => {
//       await axios.post('/api/orders/fail', { razorpay_order_id: razorpayOrderId }, { headers: { Authorization: `Bearer ${token}` } })
//       toast.error('Payment failed')
//     })
//     rzp.open()
//   }

//   if (!cart || cart.items.length === 0) return null
//   const totals = calcTotals()

//   const PAYMENT_OPTIONS = [
//     {
//       value: 'COD',
//       label: 'Cash on Delivery',
//       desc: 'Pay when your order arrives',
//       icon: '💵',
//       badge: 'Most Popular',
//     },
//     {
//       value: 'Online',
//       label: 'Online Payment',
//       desc: 'UPI, Cards, Net Banking via Razorpay',
//       icon: '💳',
//       badge: 'Instant Confirmation',
//     },
//   ]

//   return (
//     <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, color: C.text }}>
//       <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

//       {/* Page Header */}
//       <div style={{ background: C.white, borderBottom: `1.5px solid ${C.border}`, padding: '20px 28px', boxShadow: C.shadow }}>
//         <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
//           <div style={{ width: 44, height: 44, background: C.orange, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <FiPackage size={21} color="#fff" />
//           </div>
//           <div>
//             <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Checkout</h1>
//             <p style={{ margin: 0, fontSize: 13, color: C.textLight }}>Complete your order in 2 easy steps</p>
//           </div>

//           {/* Progress */}
//           <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
//             {['Address', 'Payment', 'Confirm'].map((step, i) => (
//               <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
//                   <div style={{ width: 22, height: 22, borderRadius: '50%', background: i <= 1 ? C.orange : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     {i < 1
//                       ? <FiCheckCircle size={12} color="#fff" />
//                       : <span style={{ fontSize: 10, fontWeight: 800, color: i <= 1 ? '#fff' : C.textLight }}>{i + 1}</span>}
//                   </div>
//                   <span style={{ fontSize: 11, fontWeight: 600, color: i <= 1 ? C.orange : C.textLight }}>{step}</span>
//                 </div>
//                 {i < 2 && <div style={{ width: 24, height: 1.5, background: i < 1 ? C.orange : C.border }} />}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
//         <form onSubmit={handleSubmit}>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 22, alignItems: 'start' }}>

//             {/* ── Left: Form ──────────────────────────────────────────────── */}
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

//               {/* Shipping Address */}
//               <Section icon={FiMapPin} title="Shipping Address" subtitle="Where should we deliver?" step="1">
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                   <Field
//                     label="Street Address"
//                     icon={FiMapPin}
//                     type="text" name="street"
//                     placeholder="House no., Street, Area"
//                     value={shippingAddress.street}
//                     onChange={handleChange}
//                     required
//                   />
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                     <Field label="City"  type="text" name="city"  placeholder="Mumbai" value={shippingAddress.city}  onChange={handleChange} required />
//                     <Field label="State" type="text" name="state" placeholder="Maharashtra" value={shippingAddress.state} onChange={handleChange} required />
//                   </div>
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                     <Field label="PIN Code" type="text" name="zipCode" placeholder="400001" value={shippingAddress.zipCode} onChange={handleChange} required />
//                     <Field label="Country" type="text" name="country" placeholder="India" value={shippingAddress.country} onChange={handleChange} required />
//                   </div>
//                 </div>
//               </Section>

//               {/* Payment Method */}
//               <Section icon={FiCreditCard} title="Payment Method" subtitle="How would you like to pay?" step="2">
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                   {PAYMENT_OPTIONS.map(opt => (
//                     <motion.div
//                       key={opt.value}
//                       whileHover={{ y: -1 }}
//                       onClick={() => setPaymentMethod(opt.value)}
//                       style={{
//                         border: `2px solid ${paymentMethod === opt.value ? C.orange : C.border}`,
//                         background: paymentMethod === opt.value ? C.orangeLight : C.white,
//                         borderRadius: 14, padding: '16px 18px',
//                         cursor: 'pointer', transition: 'all 0.2s',
//                         display: 'flex', alignItems: 'center', gap: 14,
//                       }}
//                     >
//                       {/* Custom radio */}
//                       <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === opt.value ? C.orange : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.2s' }}>
//                         {paymentMethod === opt.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.orange }} />}
//                       </div>
//                       <span style={{ fontSize: 26 }}>{opt.icon}</span>
//                       <div style={{ flex: 1 }}>
//                         <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{opt.label}</div>
//                         <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{opt.desc}</div>
//                       </div>
//                       <span style={{ background: paymentMethod === opt.value ? C.orange : C.bg, color: paymentMethod === opt.value ? '#fff' : C.textLight, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
//                         {opt.badge}
//                       </span>
//                     </motion.div>
//                   ))}
//                 </div>

//                 {/* COD note */}
//                 <AnimatePresence>
//                   {paymentMethod === 'COD' && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
//                       style={{ overflow: 'hidden', marginTop: 12 }}
//                     >
//                       <div style={{ background: C.greenBg, border: '1.5px solid #86efac', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.green, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
//                         <FiCheckCircle size={14} />
//                         No advance payment needed. Pay our delivery partner when your order arrives.
//                       </div>
//                     </motion.div>
//                   )}
//                   {paymentMethod === 'Online' && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
//                       style={{ overflow: 'hidden', marginTop: 12 }}
//                     >
//                       <div style={{ background: C.orangeLight, border: `1.5px solid ${C.orangeMid}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.orange, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
//                         <FiShield size={14} />
//                         Secured by Razorpay — supports UPI, Credit/Debit Cards, Net Banking & Wallets.
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </Section>
//             </div>

//             {/* ── Right: Order Summary ─────────────────────────────────────── */}
//             <div style={{ position: 'sticky', top: 20 }}>
//               <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: C.shadowMd }}>
//                 {/* Header */}
//                 <div style={{ background: C.text, padding: '18px 22px' }}>
//                   <h2 style={{ margin: 0, fontWeight: 800, fontSize: 17, color: '#fff' }}>Order Summary</h2>
//                   <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
//                 </div>

//                 <div style={{ padding: '20px 22px' }}>
//                   {/* Items */}
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
//                     {cart.items.map(item => (
//                       <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                         <div style={{ width: 42, height: 42, borderRadius: 9, overflow: 'hidden', border: `1.5px solid ${C.border}`, flexShrink: 0 }}>
//                           <img src={item.product?.image} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                         </div>
//                         <div style={{ flex: 1, minWidth: 0 }}>
//                           <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.text }}>{item.product?.name}</div>
//                           <div style={{ fontSize: 11, color: C.textLight }}>×{item.quantity}</div>
//                         </div>
//                         <div style={{ fontSize: 13, fontWeight: 800, color: C.orange, flexShrink: 0 }}>₹{((item.product?.price || 0) * item.quantity).toFixed(2)}</div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Price breakdown */}
//                   <div style={{ borderTop: `1.5px solid ${C.border}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
//                     <PriceRow label="Subtotal"     val={`₹${totals.subtotal.toFixed(2)}`} />
//                     <PriceRow label="Tax (18% GST)" val={`₹${totals.tax.toFixed(2)}`} />
//                     <PriceRow
//                       label="Shipping"
//                       val={totals.shipping === 0 ? 'FREE 🎉' : `₹${totals.shipping.toFixed(2)}`}
//                       valColor={totals.shipping === 0 ? C.green : undefined}
//                     />
//                     <PriceRow label="Total" val={`₹${totals.total.toFixed(2)}`} bold borderTop />
//                   </div>

//                   {/* Delivery estimate */}
//                   <div style={{ marginTop: 16, padding: '10px 14px', background: C.bg, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.textMid, fontWeight: 600 }}>
//                     <FiTruck size={14} style={{ color: C.orange, flexShrink: 0 }} />
//                     Estimated delivery: <strong style={{ color: C.text }}>3–5 Business Days</strong>
//                   </div>

//                   {/* Place Order */}
//                   <motion.button
//                     type="submit"
//                     disabled={loading}
//                     whileHover={!loading ? { scale: 1.02 } : {}}
//                     whileTap={!loading ? { scale: 0.97 } : {}}
//                     style={{
//                       width: '100%', marginTop: 18, padding: '14px',
//                       background: loading ? '#f0a070' : C.orange,
//                       border: 'none', borderRadius: 12, color: '#fff',
//                       fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
//                       fontFamily: C.font, display: 'flex', alignItems: 'center',
//                       justifyContent: 'center', gap: 8,
//                       boxShadow: loading ? 'none' : '0 6px 20px rgba(232,98,26,0.35)',
//                     }}
//                   >
//                     {loading ? (
//                       <>
//                         <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
//                         Placing Order…
//                       </>
//                     ) : (
//                       <>
//                         {paymentMethod === 'COD' ? <FiDollarSign size={16} /> : <FiCreditCard size={16} />}
//                         {paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay & Place Order'}
//                         <FiArrowRight size={15} />
//                       </>
//                     )}
//                   </motion.button>
//                   <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

//                   {/* Security badges */}
//                   <div style={{ marginTop: 14, display: 'flex', gap: 12, justifyContent: 'center' }}>
//                     {[
//                       { icon: <FiShield size={12} />, label: '100% Secure' },
//                       { icon: <FiCheckCircle size={12} />, label: 'Easy Returns' },
//                       { icon: <FiTruck size={12} />, label: 'Fast Shipping' },
//                     ].map(t => (
//                       <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.textLight, fontWeight: 600 }}>
//                         <span style={{ color: C.orange }}>{t.icon}</span> {t.label}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default Checkout

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMapPin, FiCreditCard, FiPackage, FiShield, FiTruck,
  FiCheckCircle, FiArrowRight, FiDollarSign, FiPlus,
  FiHome, FiBriefcase, FiCheck,
} from 'react-icons/fi'

const C = {
  orange:      '#e8621a', orangeHov: '#cf5618',
  orangeLight: '#fff4ee', orangeMid: '#fddcca',
  bg:          '#f2f4f6', white: '#ffffff',
  text:        '#1a1a2e', textMid: '#444455', textLight: '#8899aa',
  border:      '#e4e9f0',
  shadow:      '0 2px 12px rgba(0,0,0,0.07)',
  shadowMd:    '0 6px 28px rgba(0,0,0,0.11)',
  green:       '#16a34a', greenBg: '#dcfce7',
  grayBg:      '#f1f5f9',
  font:        "'Inter', system-ui, sans-serif",
}

const useW = () => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

// ── All Indian States ─────────────────────────────────────────────────────────
const INDIAN_STATES = [
  'Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam',
  'Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir',
  'Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry',
  'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
]

const inp = (extra = {}) => ({
  width: '100%', boxSizing: 'border-box',
  border: `1.5px solid ${C.border}`, borderRadius: 10,
  padding: '10px 13px', fontSize: 14, color: C.text,
  outline: 'none', fontFamily: C.font, background: C.white,
  transition: 'border-color 0.2s', ...extra,
})
const onF = e => e.target.style.borderColor = C.orange
const onB = e => e.target.style.borderColor = C.border

const Field = ({ label, required, children, style }) => (
  <div style={style}>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}{required && <span style={{ color: C.orange }}> *</span>}
    </label>}
    {children}
  </div>
)

const PriceRow = ({ label, val, bold, valColor, borderTop }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: bold ? 16 : 13, fontWeight: bold ? 900 : 500, borderTop: borderTop ? `1.5px solid ${C.border}` : 'none', paddingTop: borderTop ? 12 : 0, marginTop: borderTop ? 6 : 0 }}>
    <span style={{ color: bold ? C.text : C.textLight }}>{label}</span>
    <span style={{ color: valColor || (bold ? C.orange : C.textMid), fontWeight: bold ? 900 : 700 }}>{val}</span>
  </div>
)

const LABEL_CFG = {
  Home:  { icon: FiHome,      color: '#3B82F6' },
  Work:  { icon: FiBriefcase, color: '#8B5CF6' },
  Other: { icon: FiMapPin,    color: '#EC4899' },
}

const emptyNew = { name: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India' }

// ─────────────────────────────────────────────────────────────────────────────
const Checkout = () => {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const w         = useW()
  const isMobile  = w < 640
  const isDesktop = w >= 1024

  const [cart,          setCart]          = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddrId, setSelectedAddrId] = useState(null)
  const [showNewForm,   setShowNewForm]   = useState(false)
  const [newAddr,       setNewAddr]       = useState(emptyNew)
  const [saveNewAddr,   setSaveNewAddr]   = useState(true)
 const { fetchCartCount }  = useCart()
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
    } catch (e) { console.error(e) }
  }

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await api.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      const addrs = res.data.addresses || []
      setSavedAddresses(addrs)
      // Auto-select default
      const def = addrs.find(a => a.isDefault) || addrs[addrs.length - 1]
      if (def) setSelectedAddrId(String(def._id))
    } catch (e) { console.error(e) }
  }

  const calcTotals = () => {
    if (!cart?.items) return { subtotal: 0, tax: 0, shipping: 0, total: 0 }
    const subtotal = cart.items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0)
    const tax = subtotal * 0.18
    const shipping = subtotal > 500 ? 0 : 50
    return { subtotal, tax, shipping, total: subtotal + tax + shipping }
  }

  // Resolve shipping address to send to API
  const getShippingAddr = () => {
    if (showNewForm || savedAddresses.length === 0) return newAddr
    return savedAddresses.find(a => String(a._id) === selectedAddrId) || newAddr
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const shippingAddress = getShippingAddr()

      // Optionally save new address to profile
      if (showNewForm && saveNewAddr) {
        await api.post('/api/auth/addresses', { ...newAddr, isDefault: savedAddresses.length === 0 }, { headers })
      }

      if (paymentMethod === 'COD') {
        await api.post('/api/orders', { shippingAddress, paymentMethod: 'COD' }, { headers })
        navigate('/orders')
      } else {
        await startOnlinePayment(shippingAddress, headers)
      }
       fetchCartCount()
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.message || err.message || 'Something went wrong'          
       toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const startOnlinePayment = async (shippingAddress, headers) => {
    const { data: order } = await api.post('/api/orders', { shippingAddress, paymentMethod: 'Online' }, { headers })
    const { data: rzrOrder } = await api.post('/api/payment/create-order', { orderId: order._id }, { headers })
    const rzp = new window.Razorpay({
      key: 'rzp_test_EvzmZvtG1AJQAS', order_id: rzrOrder.id,
      name: 'Ghee Store', currency: 'INR', theme: { color: C.orange },
      prefill: { name: user.name, email: user.email },
      handler: async (res) => {
        await api.post('/api/payment/verify', res, { headers })
        navigate('/orders')
      },
      modal: {
        ondismiss: async () => {
          await api.post('/api/orders/fail', { razorpay_order_id: rzrOrder.id }, { headers })
          toast.error('Payment cancelled')
        },
      },
    })
    rzp.open()
  }

  if (!cart || cart.items.length === 0) return null
  const totals = calcTotals()

  // ── Order Summary Card ──────────────────────────────────────────────────────
  const SummaryCard = () => (
    <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: C.shadowMd }}>
      <div style={{ background: C.text, padding: '16px 20px' }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 17, color: '#fff' }}>Order Summary</h2>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {cart.items.map(item => (
            <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, overflow: 'hidden', border: `1.5px solid ${C.border}`, flexShrink: 0 }}>
                <img src={item.product?.image} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.text }}>{item.product?.name}</div>
                <div style={{ fontSize: 11, color: C.textLight }}>×{item.quantity}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.orange, flexShrink: 0 }}>₹{((item.product?.price || 0) * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1.5px solid ${C.border}`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <PriceRow label="Subtotal" val={`₹${totals.subtotal.toFixed(2)}`} />
          <PriceRow label="Tax (18% GST)" val={`₹${totals.tax.toFixed(2)}`} />
          <PriceRow label="Shipping" val={totals.shipping === 0 ? 'FREE 🎉' : `₹${totals.shipping.toFixed(2)}`} valColor={totals.shipping === 0 ? C.green : undefined} />
          <PriceRow label="Total" val={`₹${totals.total.toFixed(2)}`} bold borderTop />
        </div>
        <div style={{ marginTop: 14, padding: '9px 12px', background: C.grayBg, borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.textMid, fontWeight: 600 }}>
          <FiTruck size={13} style={{ color: C.orange, flexShrink: 0 }} /> Estimated: <strong style={{ color: C.text }}>3–5 Business Days</strong>
        </div>
        <motion.button type="submit" form="checkout-form" disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
          style={{ width: '100%', marginTop: 16, padding: '14px', background: loading ? '#f0a070' : C.orange, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: C.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 6px 20px rgba(232,98,26,0.35)' }}>
          {loading
            ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Placing Order…</>
            : <>{paymentMethod === 'COD' ? <FiDollarSign size={15} /> : <FiCreditCard size={15} />}{paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay & Place Order'}<FiArrowRight size={14} /></>
          }
        </motion.button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[{ icon: <FiShield size={11} />, label: '100% Secure' }, { icon: <FiCheckCircle size={11} />, label: 'Easy Returns' }, { icon: <FiTruck size={11} />, label: 'Fast Shipping' }].map(t => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.textLight, fontWeight: 600 }}>
              <span style={{ color: C.orange }}>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Section card header ─────────────────────────────────────────────────────
  const SecHeader = ({ icon: Icon, title, subtitle, step }) => (
    <div style={{ padding: '16px 20px', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 34, height: 34, background: C.orangeLight, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} style={{ color: C.orange }} />
      </div>
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{title}</h2>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textLight }}>{subtitle}</p>}
      </div>
      <div style={{ width: 26, height: 26, background: C.orange, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>{step}</span>
      </div>
    </div>
  )

  const PAYMENT_OPTS = [
    { value: 'COD',    label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵', badge: 'Popular' },
    { value: 'Online', label: 'Online Payment',   desc: 'UPI, Cards, Net Banking via Razorpay', icon: '💳', badge: 'Instant' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, color: C.text }}>

      {/* ── Header ── */}
      <div style={{ background: C.white, borderBottom: `1.5px solid ${C.border}`, padding: isMobile ? '14px 16px' : '18px 28px', boxShadow: C.shadow }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ width: isMobile ? 38 : 44, height: isMobile ? 38 : 44, background: C.orange, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FiPackage size={isMobile ? 18 : 21} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800 }}>Checkout</h1>
            <p style={{ margin: 0, fontSize: 12, color: C.textLight }}>Complete your order in 2 easy steps</p>
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {['Address', 'Payment', 'Confirm'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: i <= 1 ? C.orange : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i < 1 ? <FiCheckCircle size={12} color="#fff" /> : <span style={{ fontSize: 10, fontWeight: 800, color: i <= 1 ? '#fff' : C.textLight }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: i <= 1 ? C.orange : C.textLight }}>{step}</span>
                  </div>
                  {i < 2 && <div style={{ width: 20, height: 1.5, background: i < 1 ? C.orange : C.border }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '14px 12px' : isDesktop ? '28px 24px' : '22px 18px' }}>
        <form id="checkout-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 340px' : '1fr', gap: isDesktop ? 22 : 18, alignItems: 'start' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ── Section 1: Shipping Address ── */}
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: C.shadow }}>
                <SecHeader icon={FiMapPin} title="Delivery Address" subtitle="Where should we deliver?" step="1" />
                <div style={{ padding: '20px' }}>

                  {/* Saved address pills */}
                  {savedAddresses.length > 0 && !showNewForm && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                      {savedAddresses.map(addr => {
                        const lc = LABEL_CFG[addr.label] || LABEL_CFG.Other
                        const LIcon = lc.icon
                        const isSelected = selectedAddrId === String(addr._id)
                        return (
                          <div key={String(addr._id)}
                            onClick={() => setSelectedAddrId(String(addr._id))}
                            style={{ border: `2px solid ${isSelected ? C.orange : C.border}`, background: isSelected ? C.orangeLight : C.white, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'all 0.2s' }}>
                            {/* Radio */}
                            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? C.orange : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                              {isSelected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.orange }} />}
                            </div>
                            {/* Label icon */}
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${lc.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <LIcon size={16} style={{ color: lc.color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                                <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{addr.label}</span>
                                <span style={{ fontSize: 13, color: C.textMid }}>{addr.name}</span>
                                {addr.isDefault && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: C.orange, color: '#fff' }}>Default</span>}
                              </div>
                              <p style={{ margin: '0 0 2px', fontSize: 13, color: C.textMid }}>{addr.street}, {addr.city}</p>
                              <p style={{ margin: 0, fontSize: 12, color: C.textLight }}>{addr.state} — {addr.zipCode}</p>
                            </div>
                            {isSelected && <FiCheck size={18} style={{ color: C.orange, flexShrink: 0, marginTop: 2 }} />}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Add new address toggle */}
                  {!showNewForm ? (
                    <button type="button" onClick={() => setShowNewForm(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', background: C.grayBg, border: `1.5px dashed ${C.border}`, borderRadius: 12, color: C.textMid, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: C.font, width: '100%', justifyContent: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid }}>
                      <FiPlus size={15} /> {savedAddresses.length > 0 ? 'Use a Different Address' : 'Add Delivery Address'}
                    </button>
                  ) : (
                    <div style={{ background: C.grayBg, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.text }}>New Delivery Address</h3>
                        {savedAddresses.length > 0 && (
                          <button type="button" onClick={() => setShowNewForm(false)}
                            style={{ background: 'none', border: 'none', fontSize: 13, color: C.orange, cursor: 'pointer', fontWeight: 700, fontFamily: C.font }}>
                            ← Use Saved
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                          <Field label="Full Name" required>
                            <input type="text" value={newAddr.name} onChange={e => setNewAddr(p => ({ ...p, name: e.target.value }))} required placeholder="Recipient name" style={inp()} onFocus={onF} onBlur={onB} />
                          </Field>
                          <Field label="Phone" required>
                            <input type="tel" value={newAddr.phone} onChange={e => setNewAddr(p => ({ ...p, phone: e.target.value }))} required placeholder="+91 98765 43210" style={inp()} onFocus={onF} onBlur={onB} />
                          </Field>
                        </div>
                        <Field label="Street Address" required>
                          <input type="text" value={newAddr.street} onChange={e => setNewAddr(p => ({ ...p, street: e.target.value }))} required placeholder="House no., building, street name" style={inp()} onFocus={onF} onBlur={onB} />
                        </Field>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                          <Field label="State" required>
                            <select value={newAddr.state} onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))} required style={{ ...inp(), cursor: 'pointer' }} onFocus={onF} onBlur={onB}>
                              <option value="">Select State</option>
                              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </Field>
                          <Field label="City / Town" required>
                            <input type="text" value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} required placeholder="City name" style={inp()} onFocus={onF} onBlur={onB} />
                          </Field>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                          <Field label="PIN Code" required>
                            <input type="text" value={newAddr.zipCode} onChange={e => setNewAddr(p => ({ ...p, zipCode: e.target.value }))} required maxLength={6} placeholder="6-digit PIN" style={inp()} onFocus={onF} onBlur={onB} />
                          </Field>
                          <Field label="Country">
                            <input type="text" value={newAddr.country} onChange={e => setNewAddr(p => ({ ...p, country: e.target.value }))} style={inp()} onFocus={onF} onBlur={onB} />
                          </Field>
                        </div>
                        {/* Save to profile option */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: C.textMid }}>
                          <input type="checkbox" checked={saveNewAddr} onChange={e => setSaveNewAddr(e.target.checked)} style={{ width: 15, height: 15, accentColor: C.orange }} />
                          <span>Save this address to my profile for future orders</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Section 2: Payment ── */}
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: C.shadow }}>
                <SecHeader icon={FiCreditCard} title="Payment Method" subtitle="How would you like to pay?" step="2" />
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PAYMENT_OPTS.map(opt => (
                    <motion.div key={opt.value} whileHover={{ y: -1 }}
                      onClick={() => setPaymentMethod(opt.value)}
                      style={{ border: `2px solid ${paymentMethod === opt.value ? C.orange : C.border}`, background: paymentMethod === opt.value ? C.orangeLight : C.white, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === opt.value ? C.orange : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {paymentMethod === opt.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.orange }} />}
                      </div>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{opt.desc}</div>
                      </div>
                      <span style={{ background: paymentMethod === opt.value ? C.orange : C.grayBg, color: paymentMethod === opt.value ? '#fff' : C.textLight, padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {opt.badge}
                      </span>
                    </motion.div>
                  ))}
                  <AnimatePresence>
                    {paymentMethod === 'COD' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ background: C.greenBg, border: '1.5px solid #86efac', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.green, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <FiCheckCircle size={13} /> No advance payment. Pay our delivery partner when your order arrives.
                        </div>
                      </motion.div>
                    )}
                    {paymentMethod === 'Online' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ background: C.orangeLight, border: `1.5px solid ${C.orangeMid}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.orange, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <FiShield size={13} /> Secured by Razorpay — UPI, Cards, Net Banking &amp; Wallets.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Mobile: summary inline */}
              {!isDesktop && <SummaryCard />}
            </div>

            {/* Desktop: sticky summary */}
            {isDesktop && <div style={{ position: 'sticky', top: 20 }}><SummaryCard /></div>}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout
