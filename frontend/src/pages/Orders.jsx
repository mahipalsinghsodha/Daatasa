import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage, FiPrinter, FiChevronDown, FiMapPin,
  FiCalendar, FiCreditCard, FiCheckCircle, FiTruck,
  FiClock, FiShoppingBag,
} from 'react-icons/fi'
import api from '../api/axios'

// ── Brand Tokens ──────────────────────────────────────────────────────────────
const C = {
  orange:      '#e8621a',
  orangeLight: '#fff4ee',
  orangeMid:   '#fddcca',
  bg:          '#f2f4f6',
  white:       '#ffffff',
  text:        '#1a1a2e',
  textMid:     '#444455',
  textLight:   '#8899aa',
  border:      '#e4e9f0',
  shadow:      '0 2px 12px rgba(0,0,0,0.07)',
  shadowMd:    '0 6px 28px rgba(0,0,0,0.11)',
  green:       '#16a34a', greenBg: '#dcfce7', greenMid: '#86efac',
  blue:        '#1d4ed8', blueBg:  '#dbeafe',
  yellow:      '#b45309', yellowBg:'#fef3c7',
  red:         '#dc2626', redBg:   '#fee2e2',
  gray:        '#64748b', grayBg:  '#f1f5f9',
  font:        "'Plus Jakarta Sans', system-ui, sans-serif",
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

// ── Status helpers ────────────────────────────────────────────────────────────
const getStatus = (order) => {
  if (order.isDelivered) return { label: 'Delivered', color: C.green,  bg: C.greenBg,  dot: '#16a34a', icon: FiCheckCircle }
  if (order.isPaid)      return { label: 'Paid',      color: C.blue,   bg: C.blueBg,   dot: '#1d4ed8', icon: FiTruck }
  return                        { label: 'Pending',   color: C.yellow, bg: C.yellowBg, dot: '#d97706', icon: FiClock }
}

const StatusPill = ({ order }) => {
  const s = getStatus(order)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      padding: '4px 12px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  )
}

// ── Invoice print CSS ─────────────────────────────────────────────────────────
const INV_CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',sans-serif;background:#fff;color:#1a1a2e}
  .page{max-width:760px;margin:0 auto;padding:36px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #e8621a}
  .brand{font-size:26px;font-weight:800;color:#e8621a}
  .brand-sub{font-size:12px;color:#888;margin-top:2px}
  .inv-right{text-align:right}
  .inv-title{font-size:20px;font-weight:700;letter-spacing:2px;color:#1a1a2e}
  .inv-id{font-size:14px;font-weight:700;color:#e8621a;margin-top:4px}
  .inv-date{font-size:12px;color:#888;margin-top:2px}
  .info{display:flex;justify-content:space-between;margin-bottom:28px;gap:20px}
  .bill{flex:1}.bill-label{font-size:10px;font-weight:700;letter-spacing:2px;color:#e8621a;text-transform:uppercase;margin-bottom:8px}
  .bill-name{font-size:16px;font-weight:700;margin-bottom:4px}
  .bill-detail{font-size:13px;color:#555;line-height:1.7}
  .qr{text-align:center}.qr-label{font-size:10px;color:#888;margin-top:5px}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  th{background:#f2f4f6;padding:10px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;border-bottom:2px solid #e4e9f0}
  td{padding:10px 12px;font-size:13px;border-bottom:1px solid #f0f2f4}
  tbody tr:last-child td{border-bottom:2px solid #e4e9f0}
  tfoot td{padding:8px 12px;font-size:13px;color:#555}
  .total-row td{font-size:15px;font-weight:700;padding-top:12px;border-top:2px solid #1a1a2e}
  .foot{display:flex;align-items:center;justify-content:space-between;margin-top:28px;padding-top:16px;border-top:1px solid #e4e9f0;flex-wrap:wrap;gap:10px}
  .pay-badge{padding:6px 18px;border-radius:20px;font-size:12px;font-weight:800;letter-spacing:1px}
  .paid{background:#dcfce7;color:#16a34a}.unpaid{background:#fee2e2;color:#dc2626}
  .foot-note{font-size:12px;color:#888}
  .print-btn{display:block;margin:24px auto;padding:12px 32px;background:#e8621a;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer}
  @media print{.print-btn{display:none}}
`

const qrUrl = (data) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(data)}&margin=6`

const buildInvoiceHTML = (inv, order) => {
  const items = (inv.items || order.orderItems || []).map(i => `
    <tr>
      <td>${i.name}</td>
      <td style="text-align:center">${i.quantity}</td>
      <td style="text-align:right">₹${Number(i.price).toFixed(2)}</td>
      <td style="text-align:right">₹${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`).join('')

  const sub  = Number(inv.subtotal  ?? order.itemsPrice   ?? 0).toFixed(2)
  const tax  = Number(inv.tax       ?? order.taxPrice      ?? 0).toFixed(2)
  const ship = Number(inv.shipping  ?? order.shippingPrice ?? 0).toFixed(2)
  const tot  = Number(inv.total     ?? order.totalPrice    ?? 0).toFixed(2)
  const paid = order.isPaid

  const cust = inv.customer || { name: '', email: '', address: {} }
  const addr = cust.address || order.shippingAddress || {}

  return `
  <div class="page">
    <div class="head">
      <div><div class="brand">🧈 Ghee Store</div><div class="brand-sub">Pure &amp; Natural A1 Ghee</div></div>
      <div class="inv-right">
        <div class="inv-title">TAX INVOICE</div>
        <div class="inv-id">#${(inv.invoiceNumber || order._id.slice(-10)).toUpperCase()}</div>
        <div class="inv-date">${new Date(inv.date || order.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>
      </div>
    </div>
    <div class="info">
      <div class="bill">
        <div class="bill-label">BILL TO</div>
        <div class="bill-name">${cust.name || ''}</div>
        <div class="bill-detail">${cust.email || ''}</div>
        <div class="bill-detail">${addr.street || ''}</div>
        <div class="bill-detail">${addr.city || ''}, ${addr.state || ''} – ${addr.zipCode || ''}</div>
        <div class="bill-detail">${addr.country || ''}</div>
      </div>
      <div class="qr">
        <img src="${qrUrl(`ORDER:${order._id}`)}" width="90" height="90" alt="QR"/>
        <div class="qr-label">Scan to track</div>
      </div>
    </div>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot>
        <tr><td colspan="3">Subtotal</td><td>₹${sub}</td></tr>
        <tr><td colspan="3">Tax (18% GST)</td><td>₹${tax}</td></tr>
        <tr><td colspan="3">Shipping</td><td>₹${ship}</td></tr>
        <tr class="total-row"><td colspan="3"><strong>TOTAL</strong></td><td><strong>₹${tot}</strong></td></tr>
      </tfoot>
    </table>
    <div class="foot">
      <div class="pay-badge ${paid ? 'paid' : 'unpaid'}">${paid ? '✓ PAID' : '⚠ PAYMENT PENDING'}</div>
      <div class="foot-note">Payment: ${inv.paymentMethod || order.paymentMethod || 'N/A'} &nbsp;|&nbsp; Thank you for choosing Ghee Store!</div>
    </div>
  </div>`
}

// ── Main Component ────────────────────────────────────────────────────────────
const Orders = () => {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const w           = useW()
  const isMobile    = w < 640
  const isDesktop   = w >= 1024

  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [printing, setPrinting] = useState(null)
  const [filter, setFilter]     = useState('all')

  useEffect(() => { if (user) fetchOrders() }, [user])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders/myorders')
      setOrders(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const printInvoice = async (order) => {
    setPrinting(order._id)
    try {
      let inv = {}
      try { const res = await api.get(`/api/invoices/${order._id}`); inv = res.data } catch {}
      const html = buildInvoiceHTML(inv, order)
      const win = window.open('', '_blank')
      win.document.write(`<!DOCTYPE html><html><head><title>Invoice</title><style>${INV_CSS}</style></head><body>${html}<button class="print-btn" onclick="window.print()">🖨 Print Invoice</button></body></html>`)
      win.document.close()
    } catch (e) { console.error(e) }
    finally { setPrinting(null) }
  }

  // ── Filter ──────────────────────────────────────────────────────────────────
  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => !o.isPaid && !o.isDelivered).length,
    paid:      orders.filter(o => o.isPaid && !o.isDelivered).length,
    delivered: orders.filter(o => o.isDelivered).length,
  }
  const visible = orders.filter(o => {
    if (filter === 'all')       return true
    if (filter === 'pending')   return !o.isPaid && !o.isDelivered
    if (filter === 'paid')      return o.isPaid && !o.isDelivered
    if (filter === 'delivered') return o.isDelivered
    return true
  })

  // ── Summary stat ────────────────────────────────────────────────────────────
  const totalSpent = orders.reduce((s, o) => s + (o.isPaid ? o.totalPrice : 0), 0)

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: C.font }}>
      <FiPackage size={48} style={{ color: C.border, marginBottom: 16 }} />
      <p style={{ color: C.textLight, fontSize: 15, marginBottom: 20 }}>Please log in to view your orders</p>
      <button onClick={() => navigate('/login')} style={{ padding: '11px 24px', background: C.orange, border: 'none', borderRadius: 11, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: C.font }}>
        Login
      </button>
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ width: 38, height: 38, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.orange}`, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{ background: C.white, borderBottom: `1.5px solid ${C.border}`, padding: isMobile ? '14px 16px' : '20px 28px', boxShadow: C.shadow }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: isMobile ? 38 : 44, height: isMobile ? 38 : 44, background: C.orange, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiShoppingBag size={isMobile ? 18 : 21} color="#fff" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800 }}>My Orders</h1>
                <p style={{ margin: 0, fontSize: 12, color: C.textLight }}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
              </div>
            </div>

            {/* Total spent badge */}
            {totalSpent > 0 && (
              <div style={{ background: C.orangeLight, border: `1.5px solid ${C.orangeMid}`, borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>Total Spent</div>
                <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: C.orange }}>₹{totalSpent.toFixed(2)}</div>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(4, 1fr)`, gap: 10 }}>
            {[
              { key: 'all',       label: 'All',       val: counts.all,       color: C.orange, bg: C.orangeLight },
              { key: 'pending',   label: 'Pending',   val: counts.pending,   color: C.yellow, bg: C.yellowBg },
              { key: 'paid',      label: 'Paid',      val: counts.paid,      color: C.blue,   bg: C.blueBg },
              { key: 'delivered', label: 'Delivered', val: counts.delivered, color: C.green,  bg: C.greenBg },
            ].map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                style={{ background: filter === tab.key ? tab.bg : C.white, border: `1.5px solid ${filter === tab.key ? tab.color + '50' : C.border}`, borderRadius: 12, padding: isMobile ? '10px 6px' : '12px 8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s', fontFamily: C.font }}>
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: filter === tab.key ? tab.color : C.text }}>{tab.val}</div>
                <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 600, color: filter === tab.key ? tab.color : C.textLight, marginTop: 2 }}>{tab.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 24px' }}>

        {/* Empty state */}
        {visible.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: isMobile ? '52px 20px' : '80px 24px', textAlign: 'center', boxShadow: C.shadow }}>
            <div style={{ width: 72, height: 72, background: C.orangeLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <FiPackage size={32} style={{ color: C.orange }} />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p style={{ color: C.textLight, fontSize: 14, marginBottom: 22 }}>
              {filter === 'all' ? "You haven't placed any orders. Start shopping!" : 'Try a different filter.'}
            </p>
            {filter === 'all' && (
              <button onClick={() => navigate('/products')}
                style={{ padding: '11px 24px', background: C.orange, border: 'none', borderRadius: 11, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: C.font }}>
                Browse Products
              </button>
            )}
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {visible.map((order, i) => {
              const isExp  = expanded === order._id
              const status = getStatus(order)

              return (
                <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div style={{ background: C.white, border: `1.5px solid ${isExp ? C.orange + '55' : C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: isExp ? C.shadowMd : C.shadow, transition: 'all 0.2s' }}>

                    {/* ── Order Header Row ──────────────────────────────── */}
                    <div style={{ padding: isMobile ? '14px 14px' : '18px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* ID + Status */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: isMobile ? 14 : 16, color: C.text }}>
                              Order #{order._id.slice(-8).toUpperCase()}
                            </span>
                            <StatusPill order={order} />
                            <span style={{ fontSize: 11, background: C.grayBg, color: C.textLight, padding: '2px 9px', borderRadius: 9, fontWeight: 600 }}>
                              {order.paymentMethod}
                            </span>
                          </div>
                          {/* Meta */}
                          <div style={{ display: 'flex', gap: isMobile ? 10 : 18, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textLight }}>
                              <FiCalendar size={11} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textLight }}>
                              <FiPackage size={11} /> {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}
                            </span>
                            {order.shippingAddress?.city && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textLight }}>
                                <FiMapPin size={11} /> {order.shippingAddress.city}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price + Print */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 900, fontSize: isMobile ? 16 : 20, color: C.orange }}>
                            ₹{Number(order.totalPrice).toFixed(2)}
                          </div>
                          <button
                            onClick={() => printInvoice(order)}
                            disabled={printing === order._id}
                            style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: C.orangeLight, border: `1.5px solid ${C.orangeMid}`, borderRadius: 8, color: C.orange, fontSize: 12, fontWeight: 700, cursor: printing === order._id ? 'not-allowed' : 'pointer', fontFamily: C.font }}>
                            {printing === order._id
                              ? <><div style={{ width: 12, height: 12, border: `2px solid ${C.orangeMid}`, borderTop: `2px solid ${C.orange}`, borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Loading…</>
                              : <><FiPrinter size={12} /> Invoice</>}
                          </button>
                        </div>
                      </div>

                      {/* Product thumbnails preview */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {order.orderItems.slice(0, isMobile ? 3 : 5).map((item, idx) => (
                          <div key={idx} style={{ width: isMobile ? 44 : 52, height: isMobile ? 44 : 52, borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.border}`, flexShrink: 0 }}>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                        {order.orderItems.length > (isMobile ? 3 : 5) && (
                          <div style={{ width: isMobile ? 44 : 52, height: isMobile ? 44 : 52, borderRadius: 10, background: C.grayBg, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: C.textLight }}>
                            +{order.orderItems.length - (isMobile ? 3 : 5)}
                          </div>
                        )}
                        {/* Expand button */}
                        <button
                          onClick={() => setExpanded(isExp ? null : order._id)}
                          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: C.textMid, fontSize: 12, fontWeight: 600, fontFamily: C.font }}>
                          <motion.div animate={{ rotate: isExp ? 180 : 0 }} transition={{ duration: 0.22 }}>
                            <FiChevronDown size={14} />
                          </motion.div>
                          {isExp ? 'Less' : 'Details'}
                        </button>
                      </div>
                    </div>

                    {/* ── Expanded Detail ───────────────────────────────── */}
                    <AnimatePresence>
                      {isExp && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.26 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ borderTop: `1.5px solid ${C.border}`, background: '#fafbfc' }}>

                            {/* Grid: items + info */}
                            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 0 }}>

                              {/* Order Items */}
                              <div style={{ padding: isMobile ? '16px' : '20px 22px', borderRight: isDesktop ? `1.5px solid ${C.border}` : 'none', borderBottom: isDesktop ? 'none' : `1.5px solid ${C.border}` }}>
                                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                  Items ({order.orderItems.length})
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                  {order.orderItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 13px', background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12 }}>
                                      <div style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.border}`, flexShrink: 0 }}>
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.text }}>{item.name}</div>
                                        <div style={{ fontSize: 12, color: C.textLight, marginTop: 3 }}>Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}</div>
                                      </div>
                                      <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 15, color: C.orange, flexShrink: 0 }}>
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Info */}
                              <div style={{ padding: isMobile ? '16px' : '20px 22px' }}>
                                {/* Shipping address */}
                                {order.shippingAddress && (
                                  <div style={{ marginBottom: 16 }}>
                                    <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Shipping Address</p>
                                    <div style={{ padding: '12px 14px', background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12 }}>
                                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <FiMapPin size={13} style={{ color: C.orange, marginTop: 2, flexShrink: 0 }} />
                                        <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>
                                          {order.shippingAddress.street},<br />
                                          {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.zipCode},<br />
                                          {order.shippingAddress.country}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Price breakdown */}
                                <div style={{ marginBottom: 16 }}>
                                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Price Breakdown</p>
                                  <div style={{ padding: '12px 14px', background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12 }}>
                                    {[
                                      { label: 'Items Total', val: `₹${Number(order.itemsPrice || 0).toFixed(2)}` },
                                      { label: 'Tax (18% GST)', val: `₹${Number(order.taxPrice || 0).toFixed(2)}` },
                                      { label: 'Shipping', val: order.shippingPrice > 0 ? `₹${order.shippingPrice.toFixed(2)}` : 'FREE' },
                                    ].map(r => (
                                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                                        <span style={{ color: C.textLight }}>{r.label}</span>
                                        <span style={{ fontWeight: 600, color: r.val === 'FREE' ? C.green : C.textMid }}>{r.val}</span>
                                      </div>
                                    ))}
                                    <div style={{ borderTop: `1.5px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontWeight: 800, fontSize: 14 }}>Total</span>
                                      <span style={{ fontWeight: 900, fontSize: 16, color: C.orange }}>₹{Number(order.totalPrice).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Timestamps */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.textLight }}>
                                    <FiCalendar size={12} style={{ color: C.orange }} />
                                    <span>Ordered: <strong style={{ color: C.textMid }}>{new Date(order.createdAt).toLocaleString('en-IN')}</strong></span>
                                  </div>
                                  {order.isPaid && order.paidAt && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.textLight }}>
                                      <FiCreditCard size={12} style={{ color: C.green }} />
                                      <span>Paid: <strong style={{ color: C.green }}>{new Date(order.paidAt).toLocaleString('en-IN')}</strong></span>
                                    </div>
                                  )}
                                  {order.isDelivered && order.deliveredAt && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.textLight }}>
                                      <FiTruck size={12} style={{ color: C.blue }} />
                                      <span>Delivered: <strong style={{ color: C.blue }}>{new Date(order.deliveredAt).toLocaleString('en-IN')}</strong></span>
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>

                            {/* Footer strip */}
                            <div style={{ borderTop: `1.5px solid ${C.border}`, padding: isMobile ? '12px 16px' : '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, background: C.grayBg }}>
                              <button
                                onClick={() => printInvoice(order)}
                                disabled={printing === order._id}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: C.orange, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: printing === order._id ? 'not-allowed' : 'pointer', fontFamily: C.font, opacity: printing === order._id ? 0.7 : 1 }}>
                                <FiPrinter size={14} /> {printing === order._id ? 'Generating…' : 'Print Invoice'}
                              </button>
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

export default Orders
