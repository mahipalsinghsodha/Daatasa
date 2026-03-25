// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import axios from 'axios'
// import { useAuth } from '../context/AuthContext'
// import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight, FiTag, FiTruck, FiShield } from 'react-icons/fi'
// import { toast } from 'react-toastify'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useCart } from '../context/CartContext'

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
//   red:         '#dc2626', redBg:   '#fee2e2',
//   font:        "'Plus Jakarta Sans', system-ui, sans-serif",
// }

// const inp = (focus) => ({
//   border: `1.5px solid ${focus ? C.orange : C.border}`,
//   borderRadius: 10, padding: '10px 14px',
//   fontSize: 14, color: C.text, outline: 'none',
//   fontFamily: C.font, background: C.white,
//   transition: 'border-color 0.2s', width: '100%',
//   boxSizing: 'border-box',
// })

// const Cart = () => {
//   const { user }      = useAuth()
//   const navigate      = useNavigate()
//   const [cart, setCart] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [removing, setRemoving] = useState(null)
//   const { fetchCartCount } = useCart()

//   useEffect(() => {
//     if (!user) { navigate('/login'); return }
//     fetchCart()
//   }, [user])

//   const fetchCart = async () => {
//     try {
//       const res = await axios.get('/api/cart')
//       setCart(res.data)
//       fetchCartCount()
//     } catch (e) { console.error(e) }
//     finally { setLoading(false) }
//   }

//   const updateQty = async (itemId, newQty, stock) => {
//     if (newQty < 1) return
//     if (newQty > stock) { toast.error(`Only ${stock} item(s) in stock`); return }
//     try {
//       await axios.put(`/api/cart/items/${itemId}`, { quantity: newQty })
//       fetchCart(); fetchCartCount()
//     } catch (e) { console.error(e) }
//   }

//   const removeItem = async (itemId) => {
//     setRemoving(itemId)
//     try {
//       await axios.delete(`/api/cart/items/${itemId}`)
//       fetchCart(); fetchCartCount()
//     } catch (e) { console.error(e) }
//     finally { setRemoving(null) }
//   }

//   const calcTotals = () => {
//     if (!cart?.items) return { subtotal: 0, tax: 0, shipping: 0, total: 0 }
//     const subtotal = cart.items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0)
//     const tax      = subtotal * 0.18
//     const shipping = subtotal > 500 ? 0 : 50
//     return { subtotal, tax, shipping, total: subtotal + tax + shipping }
//   }

//   if (loading) return (
//     <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
//       <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.orange}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   )

//   const totals = calcTotals()

//   return (
//     <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, color: C.text }}>
//       <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

//       {/* Page Header */}
//       <div style={{ background: C.white, borderBottom: `1.5px solid ${C.border}`, padding: '20px 28px', boxShadow: C.shadow }}>
//         <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
//           <div style={{ width: 44, height: 44, background: C.orange, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <FiShoppingCart size={21} color="#fff" />
//           </div>
//           <div>
//             <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Shopping Cart</h1>
//             <p style={{ margin: 0, fontSize: 13, color: C.textLight }}>
//               {cart?.items?.length || 0} item{cart?.items?.length !== 1 ? 's' : ''} in your cart
//             </p>
//           </div>
//         </div>
//       </div>

//       <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

//         {/* Empty state */}
//         {(!cart || cart.items.length === 0) ? (
//           <motion.div
//             initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
//             style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '72px 24px', textAlign: 'center', boxShadow: C.shadow }}
//           >
//             <div style={{ width: 80, height: 80, background: C.orangeLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
//               <FiShoppingCart size={36} style={{ color: C.orange }} />
//             </div>
//             <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800 }}>Your cart is empty</h2>
//             <p style={{ color: C.textLight, fontSize: 15, marginBottom: 28 }}>Looks like you haven't added anything yet.</p>
//             <motion.button
//               whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//               onClick={() => navigate('/products')}
//               style={{ padding: '12px 28px', background: C.orange, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: C.font, display: 'inline-flex', alignItems: 'center', gap: 8 }}
//             >
//               Browse Products <FiArrowRight size={15} />
//             </motion.button>
//           </motion.div>
//         ) : (
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 22, alignItems: 'start' }}>

//             {/* ── Cart Items ─────────────────────────────────────────────── */}
//             <div>
//               {/* Free shipping notice */}
//               {totals.shipping > 0 && (
//                 <div style={{ background: C.orangeLight, border: `1.5px solid ${C.orangeMid}`, borderRadius: 12, padding: '11px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.orange, fontWeight: 600 }}>
//                   <FiTruck size={15} />
//                   Add ₹{(500 - totals.subtotal).toFixed(0)} more to get FREE delivery!
//                 </div>
//               )}
//               {totals.shipping === 0 && (
//                 <div style={{ background: C.greenBg, border: '1.5px solid #86efac', borderRadius: 12, padding: '11px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.green, fontWeight: 600 }}>
//                   <FiTruck size={15} />
//                   🎉 You qualify for FREE delivery!
//                 </div>
//               )}

//               <AnimatePresence>
//                 {cart.items.map((item, i) => (
//                   <motion.div
//                     key={item._id}
//                     layout
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
//                     transition={{ duration: 0.25, delay: i * 0.04 }}
//                     style={{ marginBottom: 12 }}
//                   >
//                     <div style={{
//                       background: C.white, border: `1.5px solid ${C.border}`,
//                       borderRadius: 16, padding: '18px 20px',
//                       display: 'flex', gap: 16, alignItems: 'center',
//                       boxShadow: C.shadow, transition: 'box-shadow 0.2s',
//                     }}>
//                       {/* Product image */}
//                       <div style={{ width: 88, height: 88, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: C.grayBg, border: `1.5px solid ${C.border}` }}>
//                         <img src={item.product?.image} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                       </div>

//                       {/* Info */}
//                       <div style={{ flex: 1, minWidth: 0 }}>
//                         <h3 style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 15, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                           {item.product?.name}
//                         </h3>
//                         {item.product?.weight && (
//                           <span style={{ fontSize: 12, color: C.textLight, background: C.bg, padding: '2px 8px', borderRadius: 8, fontWeight: 500 }}>
//                             {item.product.weight}
//                           </span>
//                         )}
//                         <div style={{ marginTop: 8, fontSize: 16, fontWeight: 800, color: C.orange }}>
//                           ₹{item.product?.price}
//                           <span style={{ fontSize: 12, color: C.textLight, fontWeight: 500, marginLeft: 6 }}>per unit</span>
//                         </div>
//                       </div>

//                       {/* Qty controls */}
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: `1.5px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
//                         <button
//                           onClick={() => updateQty(item._id, item.quantity - 1, item.product?.stock)}
//                           style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMid, fontSize: 16 }}
//                         ><FiMinus size={14} /></button>
//                         <span style={{ width: 36, textAlign: 'center', fontWeight: 800, fontSize: 15, color: C.text, borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, lineHeight: '36px' }}>
//                           {item.quantity}
//                         </span>
//                         <button
//                           onClick={() => updateQty(item._id, item.quantity + 1, item.product?.stock)}
//                           style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMid }}
//                         ><FiPlus size={14} /></button>
//                       </div>

//                       {/* Line total + delete */}
//                       <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
//                         <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
//                           ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
//                         </div>
//                         <button
//                           onClick={() => removeItem(item._id)}
//                           disabled={removing === item._id}
//                           style={{ marginTop: 8, background: C.redBg, border: 'none', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: C.red, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, fontFamily: C.font }}
//                         >
//                           <FiTrash2 size={13} /> Remove
//                         </button>
//                       </div>
//                     </div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>

//               {/* Continue Shopping */}
//               <button
//                 onClick={() => navigate('/products')}
//                 style={{ marginTop: 6, background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '10px 18px', cursor: 'pointer', color: C.textMid, fontWeight: 600, fontSize: 13, fontFamily: C.font, display: 'flex', alignItems: 'center', gap: 7 }}
//               >
//                 ← Continue Shopping
//               </button>
//             </div>

//             {/* ── Order Summary ──────────────────────────────────────────── */}
//             <div style={{ position: 'sticky', top: 20 }}>
//               <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: C.shadowMd }}>
//                 {/* Header */}
//                 <div style={{ background: C.text, padding: '18px 22px' }}>
//                   <h2 style={{ margin: 0, fontWeight: 800, fontSize: 17, color: '#fff' }}>Order Summary</h2>
//                   <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
//                 </div>

//                 <div style={{ padding: '20px 22px' }}>
//                   {/* Items list */}
//                   <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
//                     {cart.items.map(item => (
//                       <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.textMid }}>
//                         <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 10 }}>
//                           {item.product?.name} <span style={{ color: C.textLight }}>×{item.quantity}</span>
//                         </span>
//                         <span style={{ fontWeight: 700, flexShrink: 0 }}>₹{((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Breakdown */}
//                   <div style={{ borderTop: `1.5px solid ${C.border}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
//                     <PriceRow label="Subtotal"    val={`₹${totals.subtotal.toFixed(2)}`} />
//                     <PriceRow label="Tax (18% GST)" val={`₹${totals.tax.toFixed(2)}`} />
//                     <PriceRow
//                       label="Shipping"
//                       val={totals.shipping === 0 ? 'FREE 🎉' : `₹${totals.shipping.toFixed(2)}`}
//                       valColor={totals.shipping === 0 ? C.green : C.text}
//                     />
//                   </div>

//                   {/* Total */}
//                   <div style={{ borderTop: `1.5px solid ${C.border}`, marginTop: 14, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Total</span>
//                     <span style={{ fontWeight: 900, fontSize: 22, color: C.orange }}>₹{totals.total.toFixed(2)}</span>
//                   </div>

//                   {/* CTA */}
//                   <motion.button
//                     whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
//                     onClick={() => navigate('/checkout')}
//                     style={{ width: '100%', marginTop: 18, padding: '14px', background: C.orange, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: C.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(232,98,26,0.32)' }}
//                   >
//                     Proceed to Checkout <FiArrowRight size={16} />
//                   </motion.button>

//                   {/* Trust */}
//                   <div style={{ marginTop: 16, display: 'flex', gap: 14, justifyContent: 'center' }}>
//                     {[
//                       { icon: <FiShield size={13} />, label: 'Secure' },
//                       { icon: <FiTruck size={13} />, label: 'Fast Delivery' },
//                       { icon: <FiTag size={13} />, label: 'Best Price' },
//                     ].map(t => (
//                       <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.textLight, fontWeight: 600 }}>
//                         <span style={{ color: C.orange }}>{t.icon}</span> {t.label}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// const PriceRow = ({ label, val, valColor }) => (
//   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
//     <span style={{ color: C.textLight }}>{label}</span>
//     <span style={{ fontWeight: 700, color: valColor || C.textMid }}>{val}</span>
//   </div>
// )

// export default Cart


import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight, FiTag, FiTruck, FiShield } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  orange:'#e8621a', orangeHov:'#cf5618', orangeLight:'#fff4ee', orangeMid:'#fddcca',
  bg:'#f2f4f6', white:'#ffffff', text:'#1a1a2e', textMid:'#444455', textLight:'#8899aa',
  border:'#e4e9f0', shadow:'0 2px 12px rgba(0,0,0,0.07)', shadowMd:'0 6px 28px rgba(0,0,0,0.11)',
  green:'#16a34a', greenBg:'#dcfce7', red:'#dc2626', redBg:'#fee2e2',
  grayBg:'#f1f5f9', font:"'Plus Jakarta Sans', system-ui, sans-serif",
}

// ── Responsive hook ───────────────────────────────────────────────────────────
const useW = () => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

const PriceRow = ({ label, val, valColor }) => (
  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
    <span style={{ color:C.textLight }}>{label}</span>
    <span style={{ fontWeight:700, color:valColor||C.textMid }}>{val}</span>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
const Cart = () => {
  const { user }            = useAuth()
  const navigate            = useNavigate()
  const { fetchCartCount }  = useCart()
  const w                   = useW()
  const isMobile            = w < 640
  const isTablet            = w >= 640 && w < 1024

  const [cart, setCart]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchCart()
  }, [user])

  const fetchCart = async () => {
    try {
      const res = await axios.get('/api/cart')
      setCart(res.data); fetchCartCount()
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const updateQty = async (id, qty, stock) => {
    if (qty < 1) return
    if (qty > stock) { toast.error(`Only ${stock} item(s) in stock`); return }
    try { await axios.put(`/api/cart/items/${id}`, { quantity: qty }); fetchCart(); fetchCartCount() }
    catch (e) { console.error(e) }
  }

  const removeItem = async (id) => {
    setRemoving(id)
    try { await axios.delete(`/api/cart/items/${id}`); fetchCart(); fetchCartCount() }
    catch (e) { console.error(e) }
    finally { setRemoving(null) }
  }

  const calcTotals = () => {
    if (!cart?.items) return { subtotal:0, tax:0, shipping:0, total:0 }
    const subtotal = cart.items.reduce((s,i)=>s+(i.product?.price||0)*i.quantity, 0)
    const tax      = subtotal * 0.18
    const shipping = subtotal > 500 ? 0 : 50
    return { subtotal, tax, shipping, total: subtotal+tax+shipping }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.bg }}>
      <div style={{ width:38, height:38, border:`3px solid ${C.border}`, borderTop:`3px solid ${C.orange}`, borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const totals = calcTotals()

  // ── Summary card (shared between mobile/desktop) ────────────────────────────
  const SummaryCard = () => (
    <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:18, overflow:'hidden', boxShadow:C.shadowMd }}>
      <div style={{ background:C.text, padding:'16px 20px' }}>
        <h2 style={{ margin:0, fontWeight:800, fontSize:17, color:'#fff' }}>Order Summary</h2>
        <p style={{ margin:'3px 0 0', fontSize:12, color:'rgba(255,255,255,0.5)' }}>
          {cart.items.length} item{cart.items.length!==1?'s':''}
        </p>
      </div>
      <div style={{ padding:'18px 20px' }}>
        {/* Item list */}
        <div style={{ marginBottom:16, display:'flex', flexDirection:'column', gap:7 }}>
          {cart.items.map(item=>(
            <div key={item._id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:C.textMid }}>
              <span style={{ flex:1, marginRight:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {item.product?.name} <span style={{ color:C.textLight }}>×{item.quantity}</span>
              </span>
              <span style={{ fontWeight:700, flexShrink:0 }}>₹{((item.product?.price||0)*item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        {/* Breakdown */}
        <div style={{ borderTop:`1.5px solid ${C.border}`, paddingTop:12, display:'flex', flexDirection:'column', gap:9 }}>
          <PriceRow label="Subtotal"     val={`₹${totals.subtotal.toFixed(2)}`}/>
          <PriceRow label="Tax (18% GST)" val={`₹${totals.tax.toFixed(2)}`}/>
          <PriceRow label="Shipping"
            val={totals.shipping===0?'FREE 🎉':`₹${totals.shipping.toFixed(2)}`}
            valColor={totals.shipping===0?C.green:undefined}/>
        </div>
        {/* Total */}
        <div style={{ borderTop:`1.5px solid ${C.border}`, marginTop:12, paddingTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:800, fontSize:16 }}>Total</span>
          <span style={{ fontWeight:900, fontSize:22, color:C.orange }}>₹{totals.total.toFixed(2)}</span>
        </div>
        {/* CTA */}
        <motion.button
          whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
          onClick={()=>navigate('/checkout')}
          style={{ width:'100%', marginTop:16, padding:'13px', background:C.orange, border:'none', borderRadius:12, color:'#fff', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:C.font, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 6px 20px rgba(232,98,26,0.32)' }}
        >
          Proceed to Checkout <FiArrowRight size={16}/>
        </motion.button>
        {/* Trust */}
        <div style={{ marginTop:14, display:'flex', gap:isMobile?8:14, justifyContent:'center', flexWrap:'wrap' }}>
          {[{icon:<FiShield size={12}/>,label:'Secure'},{icon:<FiTruck size={12}/>,label:'Fast Delivery'},{icon:<FiTag size={12}/>,label:'Best Price'}].map(t=>(
            <div key={t.label} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:C.textLight, fontWeight:600 }}>
              <span style={{ color:C.orange }}>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:C.font, color:C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ background:C.white, borderBottom:`1.5px solid ${C.border}`, padding:`${isMobile?'14px 16px':'18px 28px'}`, boxShadow:C.shadow }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:isMobile?38:44, height:isMobile?38:44, background:C.orange, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <FiShoppingCart size={isMobile?18:21} color="#fff"/>
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:isMobile?18:22, fontWeight:800 }}>Shopping Cart</h1>
            <p style={{ margin:0, fontSize:12, color:C.textLight }}>
              {cart?.items?.length||0} item{cart?.items?.length!==1?'s':''} in your cart
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:isMobile?'16px 12px':isTablet?'22px 18px':'28px 24px' }}>

        {/* ── Empty State ───────────────────────────────────────────────── */}
        {(!cart||cart.items.length===0) ? (
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
            style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:20, padding:isMobile?'48px 20px':'72px 24px', textAlign:'center', boxShadow:C.shadow }}>
            <div style={{ width:72, height:72, background:C.orangeLight, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
              <FiShoppingCart size={32} style={{ color:C.orange }}/>
            </div>
            <h2 style={{ margin:'0 0 8px', fontSize:20, fontWeight:800 }}>Your cart is empty</h2>
            <p style={{ color:C.textLight, fontSize:14, marginBottom:24 }}>Looks like you haven't added anything yet.</p>
            <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}}
              onClick={()=>navigate('/products')}
              style={{ padding:'11px 24px', background:C.orange, border:'none', borderRadius:12, color:'#fff', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:C.font, display:'inline-flex', alignItems:'center', gap:8 }}>
              Browse Products <FiArrowRight size={15}/>
            </motion.button>
          </motion.div>
        ) : (
          <div style={{
            display:'grid',
            gridTemplateColumns: isDesktop(w) ? '1fr 340px' : '1fr',
            gap: isMobile ? 16 : 22,
            alignItems:'start',
          }}>

            {/* ── Items Column ─────────────────────────────────────────── */}
            <div>
              {/* Shipping notice */}
              {totals.shipping>0 ? (
                <div style={{ background:C.orangeLight, border:`1.5px solid ${C.orangeMid}`, borderRadius:12, padding:'10px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.orange, fontWeight:600 }}>
                  <FiTruck size={14}/> Add ₹{(500-totals.subtotal).toFixed(0)} more for FREE delivery!
                </div>
              ):(
                <div style={{ background:C.greenBg, border:'1.5px solid #86efac', borderRadius:12, padding:'10px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.green, fontWeight:600 }}>
                  <FiTruck size={14}/> 🎉 You qualify for FREE delivery!
                </div>
              )}

              <AnimatePresence>
                {cart.items.map((item,i)=>(
                  <motion.div key={item._id} layout
                    initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                    exit={{opacity:0,x:-30,height:0,marginBottom:0}}
                    transition={{duration:0.25,delay:i*0.04}}
                    style={{ marginBottom:10 }}>
                    <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:16, padding:isMobile?'14px 12px':'18px 20px', display:'flex', gap:isMobile?10:16, alignItems:isMobile?'flex-start':'center', boxShadow:C.shadow }}>

                      {/* Image */}
                      <div style={{ width:isMobile?64:88, height:isMobile?64:88, borderRadius:12, overflow:'hidden', flexShrink:0, border:`1.5px solid ${C.border}` }}>
                        <img src={item.product?.image} alt={item.product?.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                      </div>

                      {/* Info + controls (mobile: stacked) */}
                      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:isMobile?8:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <h3 style={{ margin:'0 0 4px', fontWeight:800, fontSize:isMobile?13:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.product?.name}</h3>
                            {item.product?.weight&&<span style={{ fontSize:11, color:C.textLight, background:C.bg, padding:'2px 7px', borderRadius:7, fontWeight:500 }}>{item.product.weight}</span>}
                            <div style={{ marginTop:6, fontSize:isMobile?14:16, fontWeight:800, color:C.orange }}>₹{item.product?.price}</div>
                          </div>
                          {/* Mobile: delete top-right */}
                          {isMobile&&(
                            <button onClick={()=>removeItem(item._id)} disabled={removing===item._id}
                              style={{ background:C.redBg, border:'none', borderRadius:8, padding:'6px', cursor:'pointer', color:C.red, display:'flex', flexShrink:0 }}>
                              <FiTrash2 size={14}/>
                            </button>
                          )}
                        </div>

                        {/* Qty + total row */}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                          {/* Stepper */}
                          <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
                            <button onClick={()=>updateQty(item._id,item.quantity-1,item.product?.stock)}
                              style={{ width:32, height:32, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.textMid }}>
                              <FiMinus size={13}/>
                            </button>
                            <span style={{ width:34, textAlign:'center', fontWeight:800, fontSize:14, color:C.text, borderLeft:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`, lineHeight:'32px' }}>
                              {item.quantity}
                            </span>
                            <button onClick={()=>updateQty(item._id,item.quantity+1,item.product?.stock)}
                              style={{ width:32, height:32, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.textMid }}>
                              <FiPlus size={13}/>
                            </button>
                          </div>

                          {/* Line total */}
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <span style={{ fontWeight:800, fontSize:isMobile?14:16, color:C.text }}>₹{((item.product?.price||0)*item.quantity).toFixed(2)}</span>
                            {/* Desktop: delete */}
                            {!isMobile&&(
                              <button onClick={()=>removeItem(item._id)} disabled={removing===item._id}
                                style={{ background:C.redBg, border:'none', borderRadius:8, padding:'5px 9px', cursor:'pointer', color:C.red, display:'flex', alignItems:'center', gap:4, fontSize:12, fontWeight:600, fontFamily:C.font }}>
                                <FiTrash2 size={12}/> Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button onClick={()=>navigate('/products')}
                style={{ marginTop:4, background:'none', border:`1.5px solid ${C.border}`, borderRadius:10, padding:'9px 16px', cursor:'pointer', color:C.textMid, fontWeight:600, fontSize:13, fontFamily:C.font, display:'flex', alignItems:'center', gap:6 }}>
                ← Continue Shopping
              </button>

              {/* Mobile: summary appears below items */}
              {!isDesktop(w)&&<div style={{ marginTop:16 }}><SummaryCard1/></div>}
            </div>

            {/* ── Desktop Summary ──────────────────────────────────────── */}
            {isDesktop(w)&&<div style={{ position:'sticky', top:20 }}><SummaryCard/></div>}
          </div>
        )}
      </div>
    </div>
  )

  function SummaryCard1() {
    return (
      <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:18, overflow:'hidden', boxShadow:C.shadowMd }}>
        <div style={{ background:C.text, padding:'16px 20px' }}>
          <h2 style={{ margin:0, fontWeight:800, fontSize:17, color:'#fff' }}>Order Summary</h2>
          <p style={{ margin:'3px 0 0', fontSize:12, color:'rgba(255,255,255,0.5)' }}>{cart.items.length} item{cart.items.length!==1?'s':''}</p>
        </div>
        <div style={{ padding:'18px 20px' }}>
          <div style={{ marginBottom:14, display:'flex', flexDirection:'column', gap:7 }}>
            {cart.items.map(item=>(
              <div key={item._id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:C.textMid }}>
                <span style={{ flex:1, marginRight:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {item.product?.name} <span style={{ color:C.textLight }}>×{item.quantity}</span>
                </span>
                <span style={{ fontWeight:700, flexShrink:0 }}>₹{((item.product?.price||0)*item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1.5px solid ${C.border}`, paddingTop:12, display:'flex', flexDirection:'column', gap:9 }}>
            <PriceRow label="Subtotal"     val={`₹${totals.subtotal.toFixed(2)}`}/>
            <PriceRow label="Tax (18% GST)" val={`₹${totals.tax.toFixed(2)}`}/>
            <PriceRow label="Shipping" val={totals.shipping===0?'FREE 🎉':`₹${totals.shipping.toFixed(2)}`} valColor={totals.shipping===0?C.green:undefined}/>
          </div>
          <div style={{ borderTop:`1.5px solid ${C.border}`, marginTop:12, paddingTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:800, fontSize:16 }}>Total</span>
            <span style={{ fontWeight:900, fontSize:22, color:C.orange }}>₹{totals.total.toFixed(2)}</span>
          </div>
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
            onClick={()=>navigate('/checkout')}
            style={{ width:'100%', marginTop:16, padding:'13px', background:C.orange, border:'none', borderRadius:12, color:'#fff', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:C.font, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 6px 20px rgba(232,98,26,0.32)' }}>
            Proceed to Checkout <FiArrowRight size={16}/>
          </motion.button>
          <div style={{ marginTop:14, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            {[{icon:<FiShield size={12}/>,label:'Secure'},{icon:<FiTruck size={12}/>,label:'Fast Delivery'},{icon:<FiTag size={12}/>,label:'Best Price'}].map(t=>(
              <div key={t.label} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:C.textLight, fontWeight:600 }}>
                <span style={{ color:C.orange }}>{t.icon}</span>{t.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

const isDesktop = (w) => w >= 1024

export default Cart
