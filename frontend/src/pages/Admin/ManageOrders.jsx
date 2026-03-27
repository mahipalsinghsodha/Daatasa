
// import { useState, useEffect, useRef } from 'react'
// import { useAuth } from '../../context/AuthContext'
// import axios from 'axios'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   FiPackage, FiCheckCircle, FiTruck, FiDollarSign,
//   FiRefreshCw, FiBell, FiPrinter, FiCheckSquare,
//   FiSquare, FiX, FiSearch, FiChevronDown, FiChevronUp,
//   FiTag, FiFilter, FiEye, FiUser, FiMapPin, FiCalendar,
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
//   shadow:      '0 2px 10px rgba(0,0,0,0.07)',
//   shadowMd:    '0 6px 24px rgba(0,0,0,0.11)',
//   green:       '#16a34a', greenBg: '#dcfce7', greenMid: '#86efac',
//   yellow:      '#b45309', yellowBg: '#fef3c7',
//   blue:        '#1d4ed8', blueBg:  '#dbeafe',
//   red:         '#dc2626', redBg:   '#fee2e2',
//   gray:        '#64748b', grayBg:  '#f1f5f9',
//   font:        "'Plus Jakarta Sans', system-ui, sans-serif",
// }

// // ── QR Code URL helper ────────────────────────────────────────────────────────
// const qrUrl = (data, size = 120) =>
//   `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=6&color=1a1a2e`

// // ── Status helpers ────────────────────────────────────────────────────────────
// const orderStatus = (o) => {
//   if (o.isDelivered) return { label: 'Delivered', color: C.green,  bg: C.greenBg,  dot: '#16a34a' }
//   if (o.isPaid)      return { label: 'Paid',      color: C.blue,   bg: C.blueBg,   dot: '#1d4ed8' }
//   return               { label: 'Pending',   color: C.yellow, bg: C.yellowBg, dot: '#d97706' }
// }

// const StatusPill = ({ order }) => {
//   const s = orderStatus(order)
//   return (
//     <span style={{
//       background: s.bg, color: s.color,
//       padding: '3px 11px', borderRadius: 20,
//       fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
//       display: 'inline-flex', alignItems: 'center', gap: 5,
//     }}>
//       <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
//       {s.label}
//     </span>
//   )
// }

// // ── Invoice print generator ───────────────────────────────────────────────────
// const invoiceHTML = (order) => {
//   const qr = qrUrl(`ORDER:${order._id}`, 100)
//   const items = (order.orderItems || []).map(i => `
//     <tr>
//       <td>${i.name}</td>
//       <td style="text-align:center">${i.quantity}</td>
//       <td style="text-align:right">₹${Number(i.price).toFixed(2)}</td>
//       <td style="text-align:right">₹${(i.price * i.quantity).toFixed(2)}</td>
//     </tr>`).join('')
//   return `
//   <div class="inv-page">
//     <div class="inv-head">
//       <div>
//         <div class="brand">🧈 Ghee Store</div>
//         <div class="brand-sub">Pure &amp; Natural A1 Ghee</div>
//       </div>
//       <div class="inv-meta">
//         <div class="inv-title">TAX INVOICE</div>
//         <div class="inv-id">#${order._id.slice(-10).toUpperCase()}</div>
//         <div class="inv-date">${new Date(order.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>
//       </div>
//     </div>
//     <div class="inv-info">
//       <div class="bill-box">
//         <div class="box-label">BILL TO</div>
//         <div class="box-name">${order.user?.name || 'Customer'}</div>
//         <div class="box-detail">${order.user?.email || ''}</div>
//         ${order.shippingAddress ? `<div class="box-detail">${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}</div>
//         <div class="box-detail">${order.shippingAddress.state || ''} – ${order.shippingAddress.zipCode || ''}</div>` : ''}
//       </div>
//       <div class="qr-box">
//         <img src="${qr}" width="90" height="90" alt="QR" />
//         <div class="qr-label">Scan to track</div>
//       </div>
//     </div>
//     <table class="inv-table">
//       <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
//       <tbody>${items}</tbody>
//       <tfoot>
//         <tr><td colspan="3">Subtotal</td><td>₹${Number(order.itemsPrice||0).toFixed(2)}</td></tr>
//         <tr><td colspan="3">Tax (18% GST)</td><td>₹${Number(order.taxPrice||0).toFixed(2)}</td></tr>
//         <tr><td colspan="3">Shipping</td><td>₹${Number(order.shippingPrice||0).toFixed(2)}</td></tr>
//         <tr class="total-row"><td colspan="3"><strong>TOTAL</strong></td><td><strong>₹${Number(order.totalPrice||0).toFixed(2)}</strong></td></tr>
//       </tfoot>
//     </table>
//     <div class="inv-footer">
//       <div class="pay-badge ${order.isPaid ? 'paid' : 'unpaid'}">${order.isPaid ? '✓ PAID' : '⚠ PAYMENT PENDING'}</div>
//       <div class="footer-note">Payment Method: ${order.paymentMethod || 'N/A'} &nbsp;|&nbsp; Thank you for choosing Ghee Store!</div>
//     </div>
//   </div>`
// }

// // ── Shipping Label HTML ───────────────────────────────────────────────────────
// const labelHTML = (order) => {
//   const qr = qrUrl(`ORDER:${order._id}`, 150)
//   const addr = order.shippingAddress || {}
//   return `
//   <div class="label-page">
//     <div class="label-header">
//       <div class="label-brand">🧈 Ghee Store</div>
//       <div class="label-id">ORDER #${order._id.slice(-8).toUpperCase()}</div>
//     </div>
//     <div class="label-body">
//       <div class="label-ship">
//         <div class="label-section-title">SHIP TO</div>
//         <div class="label-name">${order.user?.name || 'Customer'}</div>
//         <div class="label-addr">${addr.street || ''}</div>
//         <div class="label-addr">${addr.city || ''}, ${addr.state || ''}</div>
//         <div class="label-addr">PIN: ${addr.zipCode || ''}</div>
//         <div class="label-addr">${addr.country || 'India'}</div>
//         <div class="label-phone">${order.user?.phone || ''}</div>
//       </div>
//       <div class="label-qr">
//         <img src="${qr}" width="130" height="130" alt="QR" />
//         <div class="label-qr-text">Scan to view order</div>
//       </div>
//     </div>
//     <div class="label-footer">
//       <div>Items: ${(order.orderItems||[]).length} &nbsp;|&nbsp; Total: ₹${Number(order.totalPrice||0).toFixed(2)}</div>
//       <div>${order.isPaid ? '✓ PREPAID' : '💰 CASH ON DELIVERY'}</div>
//     </div>
//   </div>`
// }

// // ── Print Styles ──────────────────────────────────────────────────────────────
// const INVOICE_CSS = `
//   * { margin:0; padding:0; box-sizing:border-box; }
//   body { font-family: 'Segoe UI', sans-serif; background:#fff; color:#1a1a2e; }
//   .inv-page { max-width:760px; margin:0 auto; padding:36px; page-break-after:always; }
//   .inv-page:last-child { page-break-after:auto; }
//   .inv-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; padding-bottom:20px; border-bottom:3px solid #e8621a; }
//   .brand { font-size:26px; font-weight:800; color:#e8621a; }
//   .brand-sub { font-size:12px; color:#888; margin-top:2px; }
//   .inv-meta { text-align:right; }
//   .inv-title { font-size:20px; font-weight:700; color:#1a1a2e; letter-spacing:2px; }
//   .inv-id { font-size:14px; font-weight:700; color:#e8621a; margin-top:4px; }
//   .inv-date { font-size:12px; color:#888; margin-top:2px; }
//   .inv-info { display:flex; justify-content:space-between; margin-bottom:28px; gap:20px; }
//   .bill-box { flex:1; }
//   .box-label { font-size:10px; font-weight:700; letter-spacing:2px; color:#e8621a; margin-bottom:8px; text-transform:uppercase; }
//   .box-name { font-size:16px; font-weight:700; color:#1a1a2e; margin-bottom:4px; }
//   .box-detail { font-size:13px; color:#555; line-height:1.6; }
//   .qr-box { text-align:center; }
//   .qr-label { font-size:10px; color:#888; margin-top:6px; }
//   .inv-table { width:100%; border-collapse:collapse; margin-bottom:24px; }
//   .inv-table th { background:#f2f4f6; padding:10px 12px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#555; border-bottom:2px solid #e4e9f0; }
//   .inv-table td { padding:10px 12px; font-size:13px; border-bottom:1px solid #f0f2f4; }
//   .inv-table tbody tr:last-child td { border-bottom:2px solid #e4e9f0; }
//   .inv-table tfoot td { padding:8px 12px; font-size:13px; color:#555; }
//   .total-row td { font-size:15px; font-weight:700; color:#1a1a2e; padding-top:12px; border-top:2px solid #1a1a2e; }
//   .inv-footer { display:flex; align-items:center; justify-content:space-between; margin-top:28px; padding-top:16px; border-top:1px solid #e4e9f0; flex-wrap:wrap; gap:10px; }
//   .pay-badge { padding:6px 18px; border-radius:20px; font-size:12px; font-weight:800; letter-spacing:1px; }
//   .pay-badge.paid { background:#dcfce7; color:#16a34a; }
//   .pay-badge.unpaid { background:#fee2e2; color:#dc2626; }
//   .footer-note { font-size:12px; color:#888; }
//   .print-btn { display:block; margin:24px auto; padding:12px 32px; background:#e8621a; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:700; cursor:pointer; }
//   @media print { .print-btn { display:none; } }
// `

// const LABEL_CSS = `
//   * { margin:0; padding:0; box-sizing:border-box; }
//   body { font-family: 'Segoe UI', sans-serif; background:#fff; }
//   .label-page { width:100mm; min-height:150mm; border:2px solid #1a1a2e; border-radius:8px; margin:10px auto; overflow:hidden; page-break-after:always; }
//   .label-page:last-child { page-break-after:auto; }
//   .label-header { background:#1a1a2e; color:#fff; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; }
//   .label-brand { font-size:15px; font-weight:800; }
//   .label-id { font-size:10px; font-weight:700; color:#e8621a; }
//   .label-body { display:flex; padding:12px; gap:10px; }
//   .label-ship { flex:1; }
//   .label-section-title { font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#e8621a; margin-bottom:6px; }
//   .label-name { font-size:15px; font-weight:800; color:#1a1a2e; margin-bottom:4px; }
//   .label-addr { font-size:12px; color:#444; line-height:1.55; }
//   .label-phone { font-size:12px; color:#e8621a; font-weight:700; margin-top:6px; }
//   .label-qr { display:flex; flex-direction:column; align-items:center; justify-content:center; }
//   .label-qr-text { font-size:9px; color:#888; margin-top:5px; text-align:center; }
//   .label-footer { background:#f2f4f6; border-top:1.5px solid #e4e9f0; padding:8px 14px; display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:#444; }
//   .print-btn { display:block; margin:20px auto; padding:10px 28px; background:#e8621a; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; }
//   @media print { .print-btn { display:none; } .label-page { margin:0; border-radius:0; } }
// `

// const openPrint = (bodyHTML, css, title) => {
//   const w = window.open('', '_blank')
//   w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>${css}</style></head><body>${bodyHTML}<button class="print-btn" onclick="window.print()">🖨 Print</button></body></html>`)
//   w.document.close()
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// const ManageOrders = () => {
//   const { user }               = useAuth()
//   const [orders, setOrders]    = useState([])
//   const [loading, setLoading]  = useState(true)
//   const [filter, setFilter]    = useState('all')
//   const [search, setSearch]    = useState('')
//   const [selected, setSelected]= useState([])
//   const [expanded, setExpanded]= useState(null)
//   const [notification, setNotif] = useState(false)
//   const [newCount, setNewCount]  = useState(0)
//   const lastCount                = useRef(0)
//   const intervalRef              = useRef(null)

//   useEffect(() => {
//     if (user?.role === 'admin') {
//       loadOrders()
//       intervalRef.current = setInterval(loadOrders, 10000)
//     }
//     return () => clearInterval(intervalRef.current)
//   }, [user])

//   const loadOrders = async (showLoad = false) => {
//     if (showLoad) setLoading(true)
//     try {
//       const res  = await api.get('/api/orders')
//       const data = res.data.orders || res.data || []
//       setOrders(data)
//       const nc = res.data.newOrdersCount ??
//         data.filter(o => !o.isPaid && new Date(o.createdAt) > new Date(Date.now() - 5*60*1000)).length
//       if (nc > lastCount.current && lastCount.current > 0) {
//         setNotif(true); setTimeout(() => setNotif(false), 5000)
//       }
//       setNewCount(nc); lastCount.current = nc
//     } catch (e) { console.error(e) }
//     finally { setLoading(false) }
//   }

//   const markPaid = async id => {
//     try { await api.put(`/api/orders/${id}/pay`);      loadOrders() }
//     catch (e) { console.error(e) }
//   }
//   const markDelivered = async id => {
//     try { await api.put(`/api/orders/${id}/deliver`); loadOrders() }
//     catch (e) { console.error(e) }
//   }
//   const bulkAction = async action => {
//     if (!selected.length) return
//     try {
//       await api.put('/api/orders/bulk/update', { orderIds: selected, action })
//       setSelected([]); loadOrders()
//     } catch (e) { console.error(e) }
//   }

//   // ── Filtering + Search ──────────────────────────────────────────────────────
//   const filtered = orders.filter(o => {
//     const matchF =
//       filter === 'all'       ? true :
//       filter === 'pending'   ? (!o.isPaid && !o.isDelivered) :
//       filter === 'paid'      ? (o.isPaid && !o.isDelivered) :
//       filter === 'delivered' ? o.isDelivered : true
//     const q = search.toLowerCase()
//     const matchS = !q ||
//       o._id.toLowerCase().includes(q) ||
//       o.user?.name?.toLowerCase().includes(q) ||
//       o.user?.email?.toLowerCase().includes(q) ||
//       o.paymentMethod?.toLowerCase().includes(q)
//     return matchF && matchS
//   })

//   const counts = {
//     all:       orders.length,
//     pending:   orders.filter(o => !o.isPaid && !o.isDelivered).length,
//     paid:      orders.filter(o => o.isPaid && !o.isDelivered).length,
//     delivered: orders.filter(o => o.isDelivered).length,
//   }

//   const allFilteredSelected = filtered.length > 0 && filtered.every(o => selected.includes(o._id))

//   const toggleSelect = id =>
//     setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

//   const toggleAll = () =>
//     setSelected(allFilteredSelected ? [] : filtered.map(o => o._id))

//   // ── Print single invoice ────────────────────────────────────────────────────
//   const printInv = async (orderId) => {
//     try {
//       const res = await api.get(`/api/invoices/${orderId}`)
//       // Merge invoice data with order structure if needed
//       const order = orders.find(o => o._id === orderId) || {}
//       const merged = { ...order, ...res.data }
//       openPrint(invoiceHTML(merged), INVOICE_CSS, `Invoice – ${orderId.slice(-8).toUpperCase()}`)
//     } catch {
//       // Fallback: use local order data
//       const order = orders.find(o => o._id === orderId)
//       if (order) openPrint(invoiceHTML(order), INVOICE_CSS, `Invoice – ${orderId.slice(-8).toUpperCase()}`)
//     }
//   }

//   // ── Print single label ──────────────────────────────────────────────────────
//   const printLabel = (orderId) => {
//     const order = orders.find(o => o._id === orderId)
//     if (order) openPrint(labelHTML(order), LABEL_CSS, `Label – ${orderId.slice(-8).toUpperCase()}`)
//   }

//   // ── Print multiple labels ───────────────────────────────────────────────────
//   const printAllLabels = () => {
//     const targets = selected.length
//       ? orders.filter(o => selected.includes(o._id))
//       : filtered
//     if (!targets.length) return
//     const body = targets.map(labelHTML).join('')
//     openPrint(body, LABEL_CSS, `Shipping Labels (${targets.length})`)
//   }

//   // ── Print multiple invoices ─────────────────────────────────────────────────
//   const printAllInvoices = () => {
//     const targets = selected.length
//       ? orders.filter(o => selected.includes(o._id))
//       : filtered
//     if (!targets.length) return
//     const body = targets.map(invoiceHTML).join('')
//     openPrint(body, INVOICE_CSS, `Invoices (${targets.length})`)
//   }

//   // ─────────────────────────────────────────────────────────────────────────────
//   if (!user || user.role !== 'admin') return (
//     <div style={{ padding: 40, textAlign: 'center', color: C.red }}>Access denied. Admin only.</div>
//   )

//   // ── Shared input style ──────────────────────────────────────────────────────
//   const chip = (active) => ({
//     padding: '7px 16px', borderRadius: 22,
//     border: `1.5px solid ${active ? C.orange : C.border}`,
//     background: active ? C.orange : C.white,
//     color: active ? '#fff' : C.textMid,
//     fontWeight: 700, fontSize: 13, cursor: 'pointer',
//     fontFamily: C.font, whiteSpace: 'nowrap', transition: 'all 0.15s',
//   })

//   const actionBtn = (bg, hover, txt) => ({
//     display: 'inline-flex', alignItems: 'center', gap: 6,
//     padding: '7px 14px', background: bg,
//     border: 'none', borderRadius: 9,
//     color: txt || '#fff', fontSize: 12, fontWeight: 700,
//     cursor: 'pointer', fontFamily: C.font, transition: 'opacity 0.15s',
//   })

//   return (
//     <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, color: C.text }}>
//       <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

//       {/* ── New Order Toast ────────────────────────────────────────────────── */}
//       <AnimatePresence>
//         {notification && (
//           <motion.div
//             initial={{ x: 120, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: 120, opacity: 0 }}
//             style={{
//               position: 'fixed', top: 76, right: 20, zIndex: 9999,
//               background: C.green, color: '#fff',
//               padding: '12px 20px', borderRadius: 12,
//               boxShadow: C.shadowMd, display: 'flex', alignItems: 'center', gap: 10,
//               fontWeight: 700, fontSize: 14,
//             }}
//           >
//             <FiBell /> 🎉 New Order Received!
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── Page Header ───────────────────────────────────────────────────── */}
//       <div style={{
//         background: C.white, borderBottom: `1.5px solid ${C.border}`,
//         padding: '20px 28px', boxShadow: C.shadow,
//       }}>
//         <div style={{ maxWidth: 1200, margin: '0 auto' }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//               <div style={{ width: 44, height: 44, background: C.orange, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <FiPackage size={22} color="#fff" />
//               </div>
//               <div>
//                 <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Manage Orders</h1>
//                 <p style={{ margin: 0, fontSize: 13, color: C.textLight }}>
//                   {orders.length} total orders{newCount > 0 && ` · ${newCount} new`}
//                 </p>
//               </div>
//             </div>

//             {/* Header Actions */}
//             <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//               <button onClick={printAllLabels} style={actionBtn('#1a1a2e', '#333')}>
//                 <FiTag size={14} /> Print Labels {selected.length > 0 && `(${selected.length})`}
//               </button>
//               <button onClick={printAllInvoices} style={actionBtn(C.gray, '#555')}>
//                 <FiPrinter size={14} /> Print Invoices {selected.length > 0 && `(${selected.length})`}
//               </button>
//               <button
//                 onClick={() => loadOrders(true)}
//                 style={actionBtn(C.orange, C.orangeHov)}
//               >
//                 <FiRefreshCw size={14} /> Refresh
//               </button>
//             </div>
//           </div>

//           {/* Search + Filters row */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
//             {/* Search */}
//             <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
//               <FiSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
//               <input
//                 placeholder="Search order, customer, email…"
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 style={{
//                   width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 10,
//                   padding: '9px 12px 9px 34px', fontSize: 13, color: C.text,
//                   outline: 'none', fontFamily: C.font, background: C.grayBg,
//                   transition: 'border-color 0.2s', boxSizing: 'border-box',
//                 }}
//                 onFocus={e => e.target.style.borderColor = C.orange}
//                 onBlur={e => e.target.style.borderColor = C.border}
//               />
//             </div>

//             {/* Filter chips */}
//             <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//               {[
//                 { key: 'all',       label: `All (${counts.all})` },
//                 { key: 'pending',   label: `Pending (${counts.pending})` },
//                 { key: 'paid',      label: `Paid (${counts.paid})` },
//                 { key: 'delivered', label: `Delivered (${counts.delivered})` },
//               ].map(f => (
//                 <button key={f.key} onClick={() => setFilter(f.key)} style={chip(filter === f.key)}>
//                   {f.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Body ─────────────────────────────────────────────────────────── */}
//       <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 28px' }}>

//         {/* Bulk Action Bar */}
//         <AnimatePresence>
//           {selected.length > 0 && (
//             <motion.div
//               initial={{ opacity: 0, height: 0, marginBottom: 0 }}
//               animate={{ opacity: 1, height: 'auto', marginBottom: 18 }}
//               exit={{ opacity: 0, height: 0, marginBottom: 0 }}
//               style={{ overflow: 'hidden' }}
//             >
//               <div style={{
//                 background: C.orangeLight, border: `1.5px solid ${C.orangeMid}`,
//                 borderRadius: 12, padding: '12px 18px',
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 flexWrap: 'wrap', gap: 10,
//               }}>
//                 <span style={{ fontWeight: 700, color: C.orange, fontSize: 14 }}>
//                   {selected.length} order{selected.length > 1 ? 's' : ''} selected
//                 </span>
//                 <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//                   <button onClick={() => bulkAction('pay')} style={actionBtn(C.green, '#14a349')}>
//                     <FiDollarSign size={13} /> Mark All Paid
//                   </button>
//                   <button onClick={() => bulkAction('deliver')} style={actionBtn(C.blue, '#1a44c8')}>
//                     <FiTruck size={13} /> Mark All Delivered
//                   </button>
//                   <button onClick={printAllLabels} style={actionBtn('#1a1a2e', '#333')}>
//                     <FiTag size={13} /> Labels
//                   </button>
//                   <button onClick={printAllInvoices} style={actionBtn(C.gray, '#555')}>
//                     <FiPrinter size={13} /> Invoices
//                   </button>
//                   <button onClick={() => setSelected([])} style={actionBtn(C.white, C.grayBg, C.textMid)}>
//                     <FiX size={13} /> Clear
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Select All row */}
//         {filtered.length > 0 && (
//           <div style={{
//             background: C.white, border: `1.5px solid ${C.border}`,
//             borderRadius: 10, padding: '10px 16px', marginBottom: 12,
//             display: 'flex', alignItems: 'center', gap: 10,
//             boxShadow: C.shadow,
//           }}>
//             <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: C.textMid, fontFamily: C.font, fontWeight: 600, fontSize: 13 }}>
//               {allFilteredSelected
//                 ? <FiCheckSquare size={18} style={{ color: C.orange }} />
//                 : <FiSquare size={18} />}
//               Select All ({filtered.length})
//             </button>
//             {selected.length > 0 && (
//               <span style={{ fontSize: 12, color: C.textLight }}>
//                 · {selected.length} selected
//               </span>
//             )}
//           </div>
//         )}

//         {/* Loading */}
//         {loading ? (
//           <div style={{ textAlign: 'center', padding: 80, color: C.textLight }}>
//             <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.orange}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
//             <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//             Loading orders…
//           </div>
//         ) : filtered.length === 0 ? (
//           <div style={{ background: C.white, borderRadius: 14, padding: '60px 24px', textAlign: 'center', border: `1.5px solid ${C.border}`, boxShadow: C.shadow }}>
//             <FiPackage size={44} style={{ color: C.border, marginBottom: 14 }} />
//             <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>No orders found</p>
//             <p style={{ color: C.textLight, fontSize: 13, marginTop: 6 }}>Try adjusting your filters or search.</p>
//           </div>
//         ) : (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//             {filtered.map((order, i) => {
//               const isExpanded = expanded === order._id
//               const isSelected = selected.includes(order._id)
//               const s = orderStatus(order)

//               return (
//                 <motion.div
//                   key={order._id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: i * 0.03 }}
//                 >
//                   <div style={{
//                     background: C.white,
//                     border: `1.5px solid ${isSelected ? C.orange + '80' : isExpanded ? C.orange + '50' : C.border}`,
//                     borderRadius: 14, overflow: 'hidden',
//                     boxShadow: isExpanded ? C.shadowMd : C.shadow,
//                     transition: 'all 0.2s',
//                   }}>

//                     {/* ── Order Row ──────────────────────────────────────────── */}
//                     <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>

//                       {/* Checkbox */}
//                       <button onClick={() => toggleSelect(order._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0, display: 'flex' }}>
//                         {isSelected
//                           ? <FiCheckSquare size={20} style={{ color: C.orange }} />
//                           : <FiSquare size={20} style={{ color: C.textLight }} />}
//                       </button>

//                       {/* Status dot */}
//                       <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />

//                       {/* Main info — clickable to expand */}
//                       <div
//                         style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
//                         onClick={() => setExpanded(isExpanded ? null : order._id)}
//                       >
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
//                           <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>
//                             #{order._id.slice(-8).toUpperCase()}
//                           </span>
//                           <StatusPill order={order} />
//                           {order.paymentMethod && (
//                             <span style={{ fontSize: 11, color: C.textLight, background: C.grayBg, padding: '2px 8px', borderRadius: 10 }}>
//                               {order.paymentMethod}
//                             </span>
//                           )}
//                         </div>
//                         <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
//                           <span style={{ fontSize: 12, color: C.textLight, display: 'flex', alignItems: 'center', gap: 4 }}>
//                             <FiUser size={11} /> {order.user?.name || 'N/A'}
//                           </span>
//                           <span style={{ fontSize: 12, color: C.textLight, display: 'flex', alignItems: 'center', gap: 4 }}>
//                             <FiCalendar size={11} /> {new Date(order.createdAt).toLocaleDateString('en-IN')}
//                           </span>
//                           <span style={{ fontSize: 12, color: C.textLight }}>
//                             {order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Price */}
//                       <div style={{ textAlign: 'right', flexShrink: 0 }}>
//                         <div style={{ fontWeight: 800, fontSize: 17, color: C.orange }}>
//                           ₹{Number(order.totalPrice || 0).toFixed(2)}
//                         </div>
//                       </div>

//                       {/* Quick actions */}
//                       <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
//                         <button onClick={() => printInv(order._id)} title="Print Invoice" style={{ width: 32, height: 32, background: C.grayBg, border: `1.5px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMid }}>
//                           <FiPrinter size={14} />
//                         </button>
//                         <button onClick={() => printLabel(order._id)} title="Print Label" style={{ width: 32, height: 32, background: C.grayBg, border: `1.5px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMid }}>
//                           <FiTag size={14} />
//                         </button>
//                         {!order.isPaid && (
//                           <button onClick={() => markPaid(order._id)} title="Mark Paid" style={{ width: 32, height: 32, background: C.greenBg, border: `1.5px solid ${C.greenMid}`, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.green }}>
//                             <FiDollarSign size={14} />
//                           </button>
//                         )}
//                         {order.isPaid && !order.isDelivered && (
//                           <button onClick={() => markDelivered(order._id)} title="Mark Delivered" style={{ width: 32, height: 32, background: C.blueBg, border: `1.5px solid #93c5fd`, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue }}>
//                             <FiTruck size={14} />
//                           </button>
//                         )}
//                       </div>

//                       {/* Expand toggle */}
//                       <button
//                         onClick={() => setExpanded(isExpanded ? null : order._id)}
//                         style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textLight, display: 'flex', padding: 0, flexShrink: 0 }}
//                       >
//                         <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
//                           <FiChevronDown size={18} />
//                         </motion.div>
//                       </button>
//                     </div>

//                     {/* ── Expanded Detail ────────────────────────────────────── */}
//                     <AnimatePresence>
//                       {isExpanded && (
//                         <motion.div
//                           initial={{ height: 0, opacity: 0 }}
//                           animate={{ height: 'auto', opacity: 1 }}
//                           exit={{ height: 0, opacity: 0 }}
//                           transition={{ duration: 0.26 }}
//                           style={{ overflow: 'hidden' }}
//                         >
//                           <div style={{ borderTop: `1.5px solid ${C.border}`, background: '#fafbfc' }}>
//                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

//                               {/* Customer & Address */}
//                               <div style={{ padding: '18px 20px', borderRight: `1.5px solid ${C.border}` }}>
//                                 <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Customer Info</div>
//                                 <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                                   <InfoRow icon={<FiUser size={13}/>} label="Name" value={order.user?.name || 'N/A'} />
//                                   <InfoRow icon={<FiUser size={13}/>} label="Email" value={order.user?.email || 'N/A'} />
//                                   {order.shippingAddress && (
//                                     <InfoRow
//                                       icon={<FiMapPin size={13}/>}
//                                       label="Address"
//                                       value={`${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} – ${order.shippingAddress.zipCode || ''}`}
//                                     />
//                                   )}
//                                   <InfoRow icon={<FiDollarSign size={13}/>} label="Payment" value={order.paymentMethod || 'N/A'} />
//                                   {order.isPaid && <InfoRow icon={<FiCheckCircle size={13}/>} label="Paid on" value={new Date(order.paidAt).toLocaleDateString('en-IN')} color={C.green} />}
//                                   {order.isDelivered && <InfoRow icon={<FiTruck size={13}/>} label="Delivered" value={new Date(order.deliveredAt).toLocaleDateString('en-IN')} color={C.blue} />}
//                                 </div>

//                                 {/* Price breakdown */}
//                                 <div style={{ marginTop: 16, padding: '12px 14px', background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10 }}>
//                                   <PriceRow label="Items"    val={`₹${Number(order.itemsPrice||0).toFixed(2)}`} />
//                                   <PriceRow label="Tax"      val={`₹${Number(order.taxPrice||0).toFixed(2)}`} />
//                                   <PriceRow label="Shipping" val={`₹${Number(order.shippingPrice||0).toFixed(2)}`} />
//                                   <div style={{ borderTop: `1.5px solid ${C.border}`, marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
//                                     <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Total</span>
//                                     <span style={{ fontSize: 15, fontWeight: 800, color: C.orange }}>₹{Number(order.totalPrice||0).toFixed(2)}</span>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Order Items */}
//                               <div style={{ padding: '18px 20px' }}>
//                                 <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
//                                   Order Items ({order.orderItems?.length || 0})
//                                 </div>
//                                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
//                                   {(order.orderItems || []).map((item, idx) => (
//                                     <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10 }}>
//                                       {item.image && (
//                                         <img src={item.image} alt={item.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
//                                       )}
//                                       <div style={{ flex: 1, minWidth: 0 }}>
//                                         <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
//                                         <div style={{ fontSize: 12, color: C.textLight }}>Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}</div>
//                                       </div>
//                                       <div style={{ fontWeight: 800, fontSize: 14, color: C.orange, flexShrink: 0 }}>
//                                         ₹{(item.price * item.quantity).toFixed(2)}
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>

//                                 {/* Action buttons */}
//                                 <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//                                   <button onClick={() => printInv(order._id)} style={actionBtn('#1a1a2e', '#333')}>
//                                     <FiPrinter size={13} /> Invoice
//                                   </button>
//                                   <button onClick={() => printLabel(order._id)} style={actionBtn(C.gray, '#555')}>
//                                     <FiTag size={13} /> Label + QR
//                                   </button>
//                                   {!order.isPaid && (
//                                     <button onClick={() => markPaid(order._id)} style={actionBtn(C.green, '#14a349')}>
//                                       <FiDollarSign size={13} /> Mark Paid
//                                     </button>
//                                   )}
//                                   {order.isPaid && !order.isDelivered && (
//                                     <button onClick={() => markDelivered(order._id)} style={actionBtn(C.blue, '#1a44c8')}>
//                                       <FiTruck size={13} /> Mark Delivered
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>

//                   </div>
//                 </motion.div>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// // ── Sub-components ────────────────────────────────────────────────────────────
// const InfoRow = ({ icon, label, value, color }) => (
//   <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
//     <span style={{ color: C.textLight, marginTop: 1, flexShrink: 0 }}>{icon}</span>
//     <div>
//       <span style={{ fontSize: 11, color: C.textLight }}>{label}: </span>
//       <span style={{ fontSize: 13, fontWeight: 600, color: color || C.text }}>{value}</span>
//     </div>
//   </div>
// )

// const PriceRow = ({ label, val }) => (
//   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
//     <span style={{ fontSize: 12, color: C.textLight }}>{label}</span>
//     <span style={{ fontSize: 12, color: C.textMid }}>{val}</span>
//   </div>
// )

// export default ManageOrders
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPackage, FiCheckCircle, FiTruck, FiDollarSign, FiRefreshCw, FiBell, FiPrinter, FiCheckSquare, FiSquare, FiX, FiSearch, FiChevronDown, FiTag, FiUser, FiMapPin, FiCalendar } from 'react-icons/fi'

const C = {
  orange:'#e8621a', orangeHov:'#cf5618', orangeLight:'#fff4ee', orangeMid:'#fddcca',
  bg:'#f2f4f6', white:'#ffffff', text:'#1a1a2e', textMid:'#444455', textLight:'#8899aa',
  border:'#e4e9f0', shadow:'0 2px 10px rgba(0,0,0,0.07)', shadowMd:'0 6px 24px rgba(0,0,0,0.11)',
  green:'#16a34a', greenBg:'#dcfce7', greenMid:'#86efac',
  yellow:'#b45309', yellowBg:'#fef3c7',
  red:'#dc2626', redBg:'#fee2e2',
  blue:'#1d4ed8', blueBg:'#dbeafe',
  gray:'#64748b', grayBg:'#f1f5f9',
  font:"'Plus Jakarta Sans', system-ui, sans-serif",
}

const useW=()=>{const[w,setW]=useState(typeof window!=='undefined'?window.innerWidth:1200);useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h)},[]);return w}

const qrUrl=(data,size=120)=>`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=6`

const orderStatus=(o)=>{if(o.isDelivered)return{label:'Delivered',color:C.green,bg:C.greenBg,dot:'#16a34a'};if(o.isPaid)return{label:'Paid',color:C.blue,bg:C.blueBg,dot:'#1d4ed8'};return{label:'Pending',color:C.yellow,bg:C.yellowBg,dot:'#d97706'}}

const StatusPill=({order})=>{const s=orderStatus(order);return<span style={{background:s.bg,color:s.color,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:4}}><span style={{width:6,height:6,borderRadius:'50%',background:s.dot}}/>{s.label}</span>}

const INV_CSS=`*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#1a1a2e}.inv-page{max-width:760px;margin:0 auto;padding:32px;page-break-after:always}.inv-page:last-child{page-break-after:auto}.inv-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:18px;border-bottom:3px solid #e8621a}.brand{font-size:24px;font-weight:800;color:#e8621a}.brand-sub{font-size:11px;color:#888;margin-top:2px}.inv-meta{text-align:right}.inv-title{font-size:18px;font-weight:700;color:#1a1a2e;letter-spacing:2px}.inv-id{font-size:13px;font-weight:700;color:#e8621a;margin-top:3px}.inv-date{font-size:11px;color:#888;margin-top:2px}.inv-info{display:flex;justify-content:space-between;margin-bottom:24px;gap:20px}.bill-box{flex:1}.box-label{font-size:10px;font-weight:700;letter-spacing:2px;color:#e8621a;margin-bottom:7px;text-transform:uppercase}.box-name{font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:3px}.box-detail{font-size:12px;color:#555;line-height:1.6}.qr-box{text-align:center}.qr-label{font-size:10px;color:#888;margin-top:5px}.inv-table{width:100%;border-collapse:collapse;margin-bottom:20px}.inv-table th{background:#f2f4f6;padding:9px 11px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;border-bottom:2px solid #e4e9f0}.inv-table td{padding:9px 11px;font-size:13px;border-bottom:1px solid #f0f2f4}.inv-table tbody tr:last-child td{border-bottom:2px solid #e4e9f0}.inv-table tfoot td{padding:7px 11px;font-size:13px;color:#555}.total-row td{font-size:14px;font-weight:700;color:#1a1a2e;padding-top:11px;border-top:2px solid #1a1a2e}.inv-footer{display:flex;align-items:center;justify-content:space-between;margin-top:24px;padding-top:14px;border-top:1px solid #e4e9f0;flex-wrap:wrap;gap:10px}.pay-badge{padding:5px 16px;border-radius:20px;font-size:11px;font-weight:800;letter-spacing:1px}.pay-badge.paid{background:#dcfce7;color:#16a34a}.pay-badge.unpaid{background:#fee2e2;color:#dc2626}.footer-note{font-size:11px;color:#888}.print-btn{display:block;margin:20px auto;padding:11px 28px;background:#e8621a;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer}@media print{.print-btn{display:none}}`

const LABEL_CSS=`*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#fff}.label-page{width:100mm;min-height:140mm;border:2px solid #1a1a2e;border-radius:8px;margin:10px auto;overflow:hidden;page-break-after:always}.label-page:last-child{page-break-after:auto}.label-header{background:#1a1a2e;color:#fff;padding:9px 13px;display:flex;justify-content:space-between;align-items:center}.label-brand{font-size:14px;font-weight:800}.label-id{font-size:10px;font-weight:700;color:#e8621a}.label-body{display:flex;padding:11px;gap:9px}.label-ship{flex:1}.label-section-title{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#e8621a;margin-bottom:5px}.label-name{font-size:14px;font-weight:800;color:#1a1a2e;margin-bottom:3px}.label-addr{font-size:11px;color:#444;line-height:1.5}.label-qr{display:flex;flex-direction:column;align-items:center;justify-content:center}.label-qr-text{font-size:9px;color:#888;margin-top:4px;text-align:center}.label-footer{background:#f2f4f6;border-top:1.5px solid #e4e9f0;padding:7px 13px;display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:#444}.print-btn{display:block;margin:16px auto;padding:9px 24px;background:#e8621a;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer}@media print{.print-btn{display:none}.label-page{margin:0;border-radius:0}}`

const invoiceHTML=(o)=>`<div class="inv-page"><div class="inv-head"><div><div class="brand">🧈 Ghee Store</div><div class="brand-sub">Pure & Natural A1 Ghee</div></div><div class="inv-meta"><div class="inv-title">TAX INVOICE</div><div class="inv-id">#${o._id.slice(-10).toUpperCase()}</div><div class="inv-date">${new Date(o.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div></div></div><div class="inv-info"><div class="bill-box"><div class="box-label">BILL TO</div><div class="box-name">${o.user?.name||'Customer'}</div><div class="box-detail">${o.user?.email||''}</div>${o.shippingAddress?`<div class="box-detail">${o.shippingAddress.street||''}, ${o.shippingAddress.city||''}</div><div class="box-detail">${o.shippingAddress.state||''} – ${o.shippingAddress.zipCode||''}</div>`:''}</div><div class="qr-box"><img src="${qrUrl(`ORDER:${o._id}`,90)}" width="85" height="85" alt="QR"/><div class="qr-label">Scan to track</div></div></div><table class="inv-table"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${(o.orderItems||[]).map(i=>`<tr><td>${i.name}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">₹${Number(i.price).toFixed(2)}</td><td style="text-align:right">₹${(i.price*i.quantity).toFixed(2)}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3">Subtotal</td><td>₹${Number(o.itemsPrice||0).toFixed(2)}</td></tr><tr><td colspan="3">Tax (18% GST)</td><td>₹${Number(o.taxPrice||0).toFixed(2)}</td></tr><tr><td colspan="3">Shipping</td><td>₹${Number(o.shippingPrice||0).toFixed(2)}</td></tr><tr class="total-row"><td colspan="3"><strong>TOTAL</strong></td><td><strong>₹${Number(o.totalPrice||0).toFixed(2)}</strong></td></tr></tfoot></table><div class="inv-footer"><div class="pay-badge ${o.isPaid?'paid':'unpaid'}">${o.isPaid?'✓ PAID':'⚠ PENDING'}</div><div class="footer-note">Payment: ${o.paymentMethod||'N/A'} | Thank you!</div></div></div>`

const labelHTML=(o)=>{const a=o.shippingAddress||{};return`<div class="label-page"><div class="label-header"><div class="label-brand">🧈 Ghee Store</div><div class="label-id">#${o._id.slice(-8).toUpperCase()}</div></div><div class="label-body"><div class="label-ship"><div class="label-section-title">SHIP TO</div><div class="label-name">${o.user?.name||'Customer'}</div><div class="label-addr">${a.street||''}</div><div class="label-addr">${a.city||''}, ${a.state||''}</div><div class="label-addr">PIN: ${a.zipCode||''}</div><div class="label-addr">${a.country||'India'}</div></div><div class="label-qr"><img src="${qrUrl(`ORDER:${o._id}`,120)}" width="110" height="110" alt="QR"/><div class="label-qr-text">Scan to view</div></div></div><div class="label-footer"><div>${(o.orderItems||[]).length} item(s) | ₹${Number(o.totalPrice||0).toFixed(2)}</div><div>${o.isPaid?'✓ PREPAID':'💰 COD'}</div></div></div>`}

const openPrint=(body,css,title)=>{const w=window.open('','_blank');w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>${css}</style></head><body>${body}<button class="print-btn" onclick="window.print()">🖨 Print</button></body></html>`);w.document.close()}

// ─────────────────────────────────────────────────────────────────────────────
const ManageOrders=()=>{
  const { user }    = useAuth()
  const w           = useW()
  const isMobile    = w < 640
  const isTablet    = w >= 640 && w < 1024

  const [orders,setOrders]   = useState([])
  const [loading,setLoading] = useState(true)
  const [filter,setFilter]   = useState('all')
  const [search,setSearch]   = useState('')
  const [selected,setSelected]= useState([])
  const [expanded,setExpanded]= useState(null)
  const [notification,setNotif]= useState(false)
  const [newCount,setNewCount]  = useState(0)
  const lastCount               = useRef(0)
  const intervalRef             = useRef(null)

  useEffect(()=>{if(user?.role==='admin'){loadOrders(true);intervalRef.current=setInterval(loadOrders,10000)}return()=>clearInterval(intervalRef.current)},[user])

  const loadOrders=async(showLoad=false)=>{if(showLoad)setLoading(true);try{const res=await api.get('/api/orders');const data=res.data.orders||res.data||[];setOrders(data);const nc=res.data.newOrdersCount??data.filter(o=>!o.isPaid&&new Date(o.createdAt)>new Date(Date.now()-5*60*1000)).length;if(nc>lastCount.current&&lastCount.current>0){setNotif(true);setTimeout(()=>setNotif(false),5000)}setNewCount(nc);lastCount.current=nc}catch(e){console.error(e)}finally{setLoading(false)}}

  const markPaid=async id=>{try{await api.put(`/api/orders/${id}/pay`);loadOrders()}catch(e){console.error(e)}}
  const markDelivered=async id=>{try{await api.put(`/api/orders/${id}/deliver`);loadOrders()}catch(e){console.error(e)}}
  const bulkAction=async action=>{if(!selected.length)return;try{await api.put('/api/orders/bulk/update',{orderIds:selected,action});setSelected([]);loadOrders()}catch(e){console.error(e)}}

  const filtered=orders.filter(o=>{
    const mF=filter==='all'?true:filter==='pending'?(!o.isPaid&&!o.isDelivered):filter==='paid'?(o.isPaid&&!o.isDelivered):o.isDelivered
    const q=search.toLowerCase();const mS=!q||o._id.toLowerCase().includes(q)||o.user?.name?.toLowerCase().includes(q)||o.user?.email?.toLowerCase().includes(q)
    return mF&&mS
  })

  const counts={all:orders.length,pending:orders.filter(o=>!o.isPaid&&!o.isDelivered).length,paid:orders.filter(o=>o.isPaid&&!o.isDelivered).length,delivered:orders.filter(o=>o.isDelivered).length}
  const allSel=filtered.length>0&&filtered.every(o=>selected.includes(o._id))
  const toggleSel=id=>setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  const toggleAll=()=>setSelected(allSel?[]:filtered.map(o=>o._id))
  const printInv=async(id)=>{try{const res=await api.get(`/api/invoices/${id}`);openPrint(invoiceHTML({...orders.find(o=>o._id===id),...res.data}),INV_CSS,`Invoice ${id.slice(-8).toUpperCase()}`)}catch{const o=orders.find(o=>o._id===id);if(o)openPrint(invoiceHTML(o),INV_CSS,`Invoice`)}}
  const printLabel=id=>{const o=orders.find(o=>o._id===id);if(o)openPrint(labelHTML(o),LABEL_CSS,`Label`)}
  const printAllLabels=()=>{const targets=selected.length?orders.filter(o=>selected.includes(o._id)):filtered;if(targets.length)openPrint(targets.map(labelHTML).join(''),LABEL_CSS,`Labels (${targets.length})`)}
  const printAllInvoices=()=>{const targets=selected.length?orders.filter(o=>selected.includes(o._id)):filtered;if(targets.length)openPrint(targets.map(invoiceHTML).join(''),INV_CSS,`Invoices (${targets.length})`)}

  const aBtn=(bg,txt='#fff')=>({display:'inline-flex',alignItems:'center',gap:6,padding:isMobile?'7px 10px':'7px 14px',background:bg,border:'none',borderRadius:9,color:txt,fontSize:isMobile?11:12,fontWeight:700,cursor:'pointer',fontFamily:C.font})

  if(!user||user.role!=='admin')return<div style={{padding:40,textAlign:'center',color:C.red}}>Access denied. Admin only.</div>

  return(
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:C.font,color:C.text}}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Toast */}
      <AnimatePresence>
        {notification&&<motion.div initial={{x:120,opacity:0}} animate={{x:0,opacity:1}} exit={{x:120,opacity:0}} style={{position:'fixed',top:76,right:16,zIndex:9999,background:C.green,color:'#fff',padding:'11px 18px',borderRadius:12,boxShadow:C.shadowMd,display:'flex',alignItems:'center',gap:8,fontWeight:700,fontSize:13}}><FiBell/> 🎉 New Order!</motion.div>}
      </AnimatePresence>

      {/* Header */}
      <div style={{background:C.white,borderBottom:`1.5px solid ${C.border}`,padding:isMobile?'12px 14px':'18px 28px',boxShadow:C.shadow}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10,marginBottom:isMobile?12:16}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:isMobile?36:44,height:isMobile?36:44,background:C.orange,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}><FiPackage size={isMobile?18:22} color="#fff"/></div>
              <div>
                <h1 style={{margin:0,fontSize:isMobile?17:22,fontWeight:800}}>Manage Orders</h1>
                <p style={{margin:0,fontSize:12,color:C.textLight}}>{orders.length} orders{newCount>0?` · ${newCount} new`:''}</p>
              </div>
            </div>
            {/* Header actions */}
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {!isMobile&&<button onClick={printAllLabels} style={aBtn('#1a1a2e')}><FiTag size={13}/> Labels{selected.length>0?` (${selected.length})`:''}</button>}
              {!isMobile&&<button onClick={printAllInvoices} style={aBtn(C.gray)}><FiPrinter size={13}/> Invoices{selected.length>0?` (${selected.length})`:''}</button>}
              <button onClick={()=>loadOrders(true)} style={aBtn(C.orange)}><FiRefreshCw size={13}/> Refresh</button>
            </div>
          </div>

          {/* Search */}
          <div style={{position:'relative',marginBottom:12}}>
            <FiSearch size={13} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:C.textLight}}/>
            <input placeholder="Search order ID, customer, email…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{paddingLeft:32,paddingRight:12,paddingTop:9,paddingBottom:9,border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:13,color:C.text,outline:'none',fontFamily:C.font,width:'100%',boxSizing:'border-box',background:C.grayBg,transition:'border-color 0.2s'}}
              onFocus={e=>e.target.style.borderColor=C.orange} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>

          {/* Filter chips */}
          <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:2}}>
            {[{k:'all',l:`All (${counts.all})`},{k:'pending',l:`Pending (${counts.pending})`},{k:'paid',l:`Paid (${counts.paid})`},{k:'delivered',l:`Delivered (${counts.delivered})`}].map(f=>(
              <button key={f.k} onClick={()=>setFilter(f.k)}
                style={{padding:'6px 14px',borderRadius:20,background:filter===f.k?C.orange:C.white,border:`1.5px solid ${filter===f.k?C.orange:C.border}`,color:filter===f.k?'#fff':C.textMid,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:C.font,transition:'all 0.15s',whiteSpace:'nowrap',flexShrink:0}}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:isMobile?'12px 10px':'22px 24px'}}>

        {/* Bulk bar */}
        <AnimatePresence>
          {selected.length>0&&(
            <motion.div initial={{opacity:0,height:0,marginBottom:0}} animate={{opacity:1,height:'auto',marginBottom:14}} exit={{opacity:0,height:0,marginBottom:0}} style={{overflow:'hidden'}}>
              <div style={{background:C.orangeLight,border:`1.5px solid ${C.orangeMid}`,borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                <span style={{fontWeight:700,color:C.orange,fontSize:13}}>{selected.length} selected</span>
                <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                  <button onClick={()=>bulkAction('pay')} style={aBtn(C.green)}><FiDollarSign size={12}/> Paid</button>
                  <button onClick={()=>bulkAction('deliver')} style={aBtn(C.blue)}><FiTruck size={12}/> Delivered</button>
                  <button onClick={printAllLabels} style={aBtn('#1a1a2e')}><FiTag size={12}/> Labels</button>
                  <button onClick={printAllInvoices} style={aBtn(C.gray)}><FiPrinter size={12}/> Invoices</button>
                  <button onClick={()=>setSelected([])} style={aBtn(C.white,C.textMid)}><FiX size={12}/></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Select all */}
        {filtered.length>0&&(
          <div style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:10,padding:'9px 14px',marginBottom:10,display:'flex',alignItems:'center',gap:8,boxShadow:C.shadow}}>
            <button onClick={toggleAll} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:7,color:C.textMid,fontFamily:C.font,fontWeight:600,fontSize:13}}>
              {allSel?<FiCheckSquare size={17} style={{color:C.orange}}/>:<FiSquare size={17}/>}Select All ({filtered.length})
            </button>
            {/* Mobile print buttons here */}
            {isMobile&&selected.length>0&&(
              <div style={{marginLeft:'auto',display:'flex',gap:6}}>
                <button onClick={printAllLabels} style={aBtn('#1a1a2e')}><FiTag size={12}/></button>
                <button onClick={printAllInvoices} style={aBtn(C.gray)}><FiPrinter size={12}/></button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading?<div style={{textAlign:'center',padding:70,color:C.textLight}}><div style={{width:34,height:34,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.orange}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 12px'}}/>Loading orders…</div>
        :filtered.length===0?<div style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:14,padding:'52px 24px',textAlign:'center',boxShadow:C.shadow}}><FiPackage size={40} style={{color:C.border,marginBottom:12}}/><p style={{margin:0,fontSize:14,fontWeight:500}}>No orders found</p></div>
        :(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {filtered.map((order,i)=>{
              const isExp=expanded===order._id;const isSel=selected.includes(order._id);const s=orderStatus(order)
              return(
                <motion.div key={order._id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}>
                  <div style={{background:C.white,border:`1.5px solid ${isSel?C.orange+'80':isExp?C.orange+'50':C.border}`,borderRadius:14,overflow:'hidden',boxShadow:isExp?C.shadowMd:C.shadow,transition:'all 0.2s'}}>

                    {/* Order row */}
                    <div style={{padding:isMobile?'12px 12px':'14px 18px',display:'flex',alignItems:'center',gap:isMobile?8:12}}>
                      <button onClick={()=>toggleSel(order._id)} style={{background:'none',border:'none',cursor:'pointer',flexShrink:0,padding:0,display:'flex'}}>
                        {isSel?<FiCheckSquare size={18} style={{color:C.orange}}/>:<FiSquare size={18} style={{color:C.textLight}}/>}
                      </button>
                      <div style={{width:8,height:8,borderRadius:'50%',background:s.dot,flexShrink:0}}/>

                      {/* Info */}
                      <div style={{flex:1,cursor:'pointer',minWidth:0}} onClick={()=>setExpanded(isExp?null:order._id)}>
                        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
                          <span style={{fontWeight:800,fontSize:isMobile?13:15,color:C.text}}>#{order._id.slice(-8).toUpperCase()}</span>
                          <StatusPill order={order}/>
                          {!isMobile&&order.paymentMethod&&<span style={{fontSize:11,color:C.textLight,background:C.grayBg,padding:'2px 8px',borderRadius:9}}>{order.paymentMethod}</span>}
                        </div>
                        <div style={{display:'flex',gap:isMobile?8:14,flexWrap:'wrap'}}>
                          <span style={{fontSize:11,color:C.textLight,display:'flex',alignItems:'center',gap:3}}><FiUser size={10}/>{order.user?.name||'N/A'}</span>
                          {!isMobile&&<span style={{fontSize:11,color:C.textLight,display:'flex',alignItems:'center',gap:3}}><FiCalendar size={10}/>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>}
                          <span style={{fontSize:11,color:C.textLight}}>{order.orderItems?.length||0} item{order.orderItems?.length!==1?'s':''}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontWeight:800,fontSize:isMobile?14:16,color:C.orange}}>₹{Number(order.totalPrice||0).toFixed(2)}</div>
                      </div>

                      {/* Quick actions */}
                      <div style={{display:'flex',gap:5,flexShrink:0}}>
                        <button onClick={()=>printInv(order._id)} title="Invoice" style={{width:30,height:30,background:C.grayBg,border:`1.5px solid ${C.border}`,borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.textMid}}><FiPrinter size={13}/></button>
                        {!isMobile&&<button onClick={()=>printLabel(order._id)} title="Label" style={{width:30,height:30,background:C.grayBg,border:`1.5px solid ${C.border}`,borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.textMid}}><FiTag size={13}/></button>}
                        {!order.isPaid&&<button onClick={()=>markPaid(order._id)} title="Mark Paid" style={{width:30,height:30,background:C.greenBg,border:`1.5px solid ${C.greenMid}`,borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.green}}><FiDollarSign size={13}/></button>}
                        {order.isPaid&&!order.isDelivered&&<button onClick={()=>markDelivered(order._id)} title="Delivered" style={{width:30,height:30,background:C.blueBg,border:'1.5px solid #93c5fd',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.blue}}><FiTruck size={13}/></button>}
                      </div>

                      <button onClick={()=>setExpanded(isExp?null:order._id)} style={{background:'none',border:'none',cursor:'pointer',color:C.textLight,display:'flex',padding:0,flexShrink:0}}>
                        <motion.div animate={{rotate:isExp?180:0}} transition={{duration:0.22}}><FiChevronDown size={17}/></motion.div>
                      </button>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExp&&(
                        <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.26}} style={{overflow:'hidden'}}>
                          <div style={{borderTop:`1.5px solid ${C.border}`,background:'#fafbfc'}}>
                            {/* Responsive: stack on mobile, 2-col on desktop */}
                            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':isTablet?'1fr':'1fr 1fr',gap:0}}>

                              {/* Customer info */}
                              <div style={{padding:isMobile?'14px':'18px 20px',borderRight:isMobile?'none':`1.5px solid ${C.border}`,borderBottom:isMobile?`1.5px solid ${C.border}`:'none'}}>
                                <div style={{fontSize:11,fontWeight:700,color:C.orange,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Customer Info</div>
                                <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
                                  {[{icon:FiUser,label:'Name',val:order.user?.name||'N/A'},{icon:FiUser,label:'Email',val:order.user?.email||'N/A'},order.shippingAddress&&{icon:FiMapPin,label:'Address',val:`${order.shippingAddress.street||''}, ${order.shippingAddress.city||''}, ${order.shippingAddress.state||''} – ${order.shippingAddress.zipCode||''}`},{icon:FiDollarSign,label:'Payment',val:order.paymentMethod||'N/A'},order.isPaid&&{icon:FiCheckCircle,label:'Paid on',val:new Date(order.paidAt).toLocaleDateString('en-IN'),color:C.green},order.isDelivered&&{icon:FiTruck,label:'Delivered',val:new Date(order.deliveredAt).toLocaleDateString('en-IN'),color:C.blue}].filter(Boolean).map((r,idx)=>(
                                    <div key={idx} style={{display:'flex',gap:7,alignItems:'flex-start'}}>
                                      <r.icon size={12} style={{color:C.textLight,marginTop:2,flexShrink:0}}/>
                                      <div style={{fontSize:12}}><span style={{color:C.textLight}}>{r.label}: </span><span style={{fontWeight:600,color:r.color||C.text}}>{r.val}</span></div>
                                    </div>
                                  ))}
                                </div>
                                {/* Price */}
                                <div style={{padding:'10px 12px',background:C.white,border:`1.5px solid ${C.border}`,borderRadius:10}}>
                                  {[{l:'Items',v:`₹${Number(order.itemsPrice||0).toFixed(2)}`},{l:'Tax',v:`₹${Number(order.taxPrice||0).toFixed(2)}`},{l:'Shipping',v:`₹${Number(order.shippingPrice||0).toFixed(2)}`}].map(r=>(
                                    <div key={r.l} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'2px 0'}}><span style={{color:C.textLight}}>{r.l}</span><span style={{fontWeight:600,color:C.textMid}}>{r.v}</span></div>
                                  ))}
                                  <div style={{borderTop:`1.5px solid ${C.border}`,marginTop:6,paddingTop:6,display:'flex',justifyContent:'space-between'}}>
                                    <span style={{fontSize:13,fontWeight:800}}>Total</span>
                                    <span style={{fontSize:15,fontWeight:800,color:C.orange}}>₹{Number(order.totalPrice||0).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Items */}
                              <div style={{padding:isMobile?'14px':'18px 20px'}}>
                                <div style={{fontSize:11,fontWeight:700,color:C.orange,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Order Items ({order.orderItems?.length||0})</div>
                                <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:220,overflowY:'auto'}}>
                                  {(order.orderItems||[]).map((item,idx)=>(
                                    <div key={idx} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px',background:C.white,border:`1.5px solid ${C.border}`,borderRadius:10}}>
                                      {item.image&&<img src={item.image} alt={item.name} style={{width:38,height:38,objectFit:'cover',borderRadius:8,flexShrink:0}}/>}
                                      <div style={{flex:1,minWidth:0}}>
                                        <div style={{fontWeight:700,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
                                        <div style={{fontSize:11,color:C.textLight}}>×{item.quantity} @ ₹{Number(item.price).toFixed(2)}</div>
                                      </div>
                                      <div style={{fontWeight:800,fontSize:13,color:C.orange,flexShrink:0}}>₹{(item.price*item.quantity).toFixed(2)}</div>
                                    </div>
                                  ))}
                                </div>
                                {/* Action buttons */}
                                <div style={{marginTop:12,display:'flex',gap:7,flexWrap:'wrap'}}>
                                  <button onClick={()=>printInv(order._id)} style={aBtn('#1a1a2e')}><FiPrinter size={12}/> Invoice</button>
                                  <button onClick={()=>printLabel(order._id)} style={aBtn(C.gray)}><FiTag size={12}/> Label+QR</button>
                                  {!order.isPaid&&<button onClick={()=>markPaid(order._id)} style={aBtn(C.green)}><FiDollarSign size={12}/> Mark Paid</button>}
                                  {order.isPaid&&!order.isDelivered&&<button onClick={()=>markDelivered(order._id)} style={aBtn(C.blue)}><FiTruck size={12}/> Delivered</button>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageOrders
