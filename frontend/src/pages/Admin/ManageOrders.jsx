import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage, FiCheckCircle, FiTruck, FiDollarSign, FiRefreshCw,
  FiBell, FiPrinter, FiCheckSquare, FiSquare, FiX, FiSearch,
  FiChevronDown, FiTag, FiUser, FiMapPin, FiCalendar, FiAlertCircle,
  FiSlash, FiUserCheck, FiFilter, FiMaximize2, FiMinimize2
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import RestrictedAccess from '../../components/RestrictedAccess'

// ── Design Tokens ──────────────────────────────────────────────────────────────
const T = {
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceHigh: '#f1f5f9',
  border: '#e2e8f0',
  accent: '#e8621a',
  accentDim: '#fff4ee',
  success: '#10b981',
  successDim: '#f0fdf4',
  danger: '#ef4444',
  dangerDim: '#fef2f2',
  info: '#3b82f6',
  infoDim: '#eff6ff',
  warning: '#f59e0b',
  warningDim: '#fff7ed',
  text: '#0f172a',
  textMid: '#475569',
  textDim: '#94a3b8',
  white: '#ffffff',
  font: '"Inter", "Plus Jakarta Sans", sans-serif',
}

// ── Utilities ────────────────────────────────────────────────────────────────
const fmtINR = (val) => Number(val || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })
const qrUrl = (data, size = 120) => `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=6`

const orderStatusMapping = (o) => {
  if (o.isDelivered) return { label: 'Delivered', color: T.success, bg: T.successDim, dot: T.success }
  if (o.paymentStatus === 'CANCELLED') return { label: 'Cancelled', color: T.textDim, bg: T.bg, dot: T.textDim }
  if (o.paymentStatus === 'FAILED') return { label: 'Failed', color: T.danger, bg: T.dangerDim, dot: T.danger }
  if (o.isPaid) return { label: 'Paid', color: T.info, bg: T.infoDim, dot: T.info }
  if (o.paymentStatus === 'COD_CONFIRMED') return { label: 'Confirmed', color: T.info, bg: T.infoDim, dot: T.info }
  return { label: 'Pending', color: T.warning, bg: T.warningDim, dot: T.warning }
}

// ── Shared Sub-Components ─────────────────────────────────────────────────────
const StatusPill = ({ order }) => {
  const s = orderStatusMapping(order)
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 12,
      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-flex',
      alignItems: 'center', gap: 6, border: `1px solid ${s.color}20`
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  )
}

const Badge = ({ children, color, bg }) => (
  <span style={{ padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color, background: bg, letterSpacing: '0.04em' }}>
    {children}
  </span>
)

// ── Print Templates ───────────────────────────────────────────────────────────
const INV_CSS = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#1a1a2e}.inv-page{max-width:760px;margin:0 auto;padding:32px;page-break-after:always}.inv-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:18px;border-bottom:3px solid #e8621a}.brand{font-size:24px;font-weight:800;color:#e8621a}.inv-meta{text-align:right}.inv-title{font-size:18px;font-weight:700;letter-spacing:2px}.inv-id{font-size:13px;font-weight:700;color:#e8621a;margin-top:3px}.inv-info{display:flex;justify-content:space-between;margin-bottom:24px;gap:20px}.bill-box{flex:1}.box-label{font-size:10px;font-weight:700;letter-spacing:2px;color:#e8621a;margin-bottom:7px;text-transform:uppercase}.box-name{font-size:15px;font-weight:700}.inv-table{width:100%;border-collapse:collapse;margin-bottom:20px}.inv-table th{background:#f2f4f6;padding:9px;font-size:11px;font-weight:700;text-transform:uppercase;border-bottom:2px solid #e4e9f0}.inv-table td{padding:9px;font-size:13px;border-bottom:1px solid #f0f2f4}.total-row td{font-size:14px;font-weight:700;padding-top:11px;border-top:2px solid #1a1a2e}.pay-badge{padding:5px 16px;border-radius:20px;font-size:11px;font-weight:800}.pay-badge.paid{background:#dcfce7;color:#16a34a}.pay-badge.unpaid{background:#fee2e2;color:#dc2626}.print-btn{display:block;margin:20px auto;padding:11px 28px;background:#e8621a;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer}@media print{.print-btn{display:none}}`
const LABEL_CSS = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#fff}.label-page{width:100mm;min-height:140mm;border:2px solid #1a1a2e;border-radius:8px;margin:10px auto;overflow:hidden;page-break-after:always}.label-header{background:#1a1a2e;color:#fff;padding:9px 13px;display:flex;justify-content:space-between;align-items:center}.label-brand{font-size:14px;font-weight:800}.label-body{display:flex;padding:11px;gap:9px}.label-qr{display:flex;flex-direction:column;align-items:center;justify-content:center}.label-footer{background:#f2f4f6;border-top:1.5px solid #e4e9f0;padding:7px 13px;display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:#444}.print-btn{display:block;margin:16px auto;padding:9px 24px;background:#e8621a;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer}@media print{.print-btn{display:none}.label-page{margin:0;border-radius:0}}`

const invoiceHTML = (o) => `<div class="inv-page"><div class="inv-head"><div><div class="brand">🧈 DhaniFresh</div><div class="brand-sub">Pure & Naturals</div></div><div class="inv-meta"><div class="inv-title">TAX INVOICE</div><div class="inv-id">#${o._id.slice(-10).toUpperCase()}</div><div class="inv-date">${new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div></div></div><div class="inv-info"><div class="bill-box"><div class="box-label">SHIP TO</div><div class="box-name">${o.user?.name || 'Customer'}</div>${o.shippingAddress ? `<div class="box-detail">${o.shippingAddress.street || ''}, ${o.shippingAddress.city || ''}</div><div class="box-detail">${o.shippingAddress.state || ''} – ${o.shippingAddress.zipCode || ''}</div>` : ''}</div><div class="qr-box"><img src="${qrUrl(`ORDER:${o._id}`, 90)}" width="80" height="80" alt="QR"/></div></div><table class="inv-table"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${(o.orderItems || []).map(i => `<tr><td>${i.name}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">₹${Number(i.price).toFixed(2)}</td><td style="text-align:right">₹${(i.price * i.quantity).toFixed(2)}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3">Items Subtotal</td><td style="text-align:right">₹${Number(o.itemsPrice || 0).toFixed(2)}</td></tr><tr><td colspan="3">Tax & Tariff</td><td style="text-align:right">₹${Number(o.taxPrice || 0).toFixed(2)}</td></tr><tr><td colspan="3">Shipping Fee</td><td style="text-align:right">₹${Number(o.shippingPrice || 0).toFixed(2)}</td></tr><tr class="total-row"><td colspan="3"><strong>GRAND TOTAL</strong></td><td style="text-align:right"><strong>₹${Number(o.totalPrice || 0).toFixed(2)}</strong></td></tr></tfoot></table><div class="pay-badge ${o.isPaid ? 'paid' : 'unpaid'}">${o.isPaid ? '✓ PAID' : '⚠ PENDING'}</div></div>`
const labelHTML = (o) => `<div class="label-page"><div class="label-header"><div class="label-brand">🧈 DhaniFresh</div><div class="label-id">#${o._id.slice(-8).toUpperCase()}</div></div><div class="label-body"><div class="label-ship"><div style="font-size:9px;font-weight:700;color:#e8621a;margin-bottom:4px">SHIP TO</div><div class="label-name">${o.user?.name || 'Customer'}</div><div style="font-size:11px;color:#444">${o.shippingAddress?.street || ''}, ${o.shippingAddress?.city || ''}</div><div style="font-size:11px;color:#444">${o.shippingAddress?.state || ''} - ${o.shippingAddress?.zipCode || ''}</div></div><div class="label-qr"><img src="${qrUrl(`ORDER:${o._id}`, 100)}" width="90" height="90"/></div></div><div class="label-footer"><div>${(o.orderItems || []).length} items | ₹${Number(o.totalPrice || 0).toFixed(2)}</div><div>${o.isPaid ? 'PAID' : 'COD'}</div></div></div>`

const openPrint = (body, css, title) => {
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>${css}</style></head><body>${body}<button class="print-btn" onclick="window.print()">Print Document</button></body></html>`);
  w.document.close();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const ManageOrders = () => {
  const { user, hasPermission } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [blockingId, setBlockingId] = useState(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (hasPermission('orders')) fetchOrders(true)
  }, [hasPermission])

  const fetchOrders = async (showLoad = false) => {
    if (showLoad) setLoading(true)
    else setSyncing(true)
    try {
      const res = await api.get('/api/orders')
      const data = res.data.orders || res.data || []
      setOrders(data)
    } catch (e) {
      toast.error('Failed to sync master ledger')
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }

  const markPaid = async id => {
    try {
      await api.put(`/api/orders/${id}/pay`)
      fetchOrders()
      toast.success('Transaction secured: Paid')
    } catch (e) { toast.error('Payment commit failed') }
  }

  const markDelivered = async id => {
    try {
      await api.put(`/api/orders/${id}/deliver`)
      fetchOrders()
      toast.success('Logistics finalized: Delivered')
    } catch (e) { toast.error('Delivery commit failed') }
  }

  const handleCancel = async (reason) => {
    setSubmitting(true)
    try {
      await api.post(`/api/orders/${cancelModal._id}/cancel`, { reason })
      toast.success('Operation terminated: Order Cancelled')
      setCancelModal(null)
      fetchOrders()
    } catch (e) { toast.error('Termination failed') }
    finally { setSubmitting(false) }
  }

  const toggleBlock = async (uid, block) => {
    setBlockingId(uid)
    try {
      await api.put(`/api/auth/users/${uid}/block`, { reason: block ? 'Administrative lock' : '' })
      toast.success(block ? 'User Restricted' : 'Access Restored')
      fetchOrders()
    } catch (e) { toast.error('User state update failed') }
    finally { setBlockingId(null) }
  }

  const printInv = (id) => {
    const o = orders.find(x => x._id === id)
    if (o) openPrint(invoiceHTML(o), INV_CSS, `Invoice #${o._id.slice(-8).toUpperCase()}`)
  }

  const printLabel = (id) => {
    const o = orders.find(x => x._id === id)
    if (o) openPrint(labelHTML(o), LABEL_CSS, `Label #${o._id.slice(-8).toUpperCase()}`)
  }

  // ── Selection Logic ──
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelectedIds(selectedIds.length === filteredOrders.length ? [] : filteredOrders.map(o => o._id))

  // ── Filter Logic ──
  const isVoid = (o) => ['CANCELLED', 'FAILED'].includes(o.paymentStatus)
  const filteredOrders = orders.filter(o => {
    const matchFilter = filter === 'all' ? true :
      filter === 'pending' ? (!o.isPaid && !o.isDelivered && !isVoid(o) && o.paymentStatus !== 'COD_CONFIRMED') :
        filter === 'cod' ? (o.paymentStatus === 'COD_CONFIRMED' && !o.isDelivered) :
          filter === 'paid' ? (o.isPaid && !o.isDelivered) :
            filter === 'delivered' ? o.isDelivered :
              filter === 'void' ? isVoid(o) : true
    const q = search.toLowerCase()
    const matchSearch = !q || o._id.toLowerCase().includes(q) || (o.user?.name || '').toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const counts = {
    all: orders.length,
    pending: orders.filter(o => !o.isPaid && !o.isDelivered && !isVoid(o) && o.paymentStatus !== 'COD_CONFIRMED').length,
    cod: orders.filter(o => o.paymentStatus === 'COD_CONFIRMED' && !o.isDelivered).length,
    paid: orders.filter(o => o.isPaid && !o.isDelivered).length,
    delivered: orders.filter(o => o.isDelivered).length,
    void: orders.filter(isVoid).length,
  }

  if (!hasPermission('orders')) return <RestrictedAccess title="Order Ledger Restricted" message="Your account lacks the clearance to manage operational transactions. Contact system admin." />

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: T.font }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ color: T.textMid, marginTop: 16, fontWeight: 700 }}>Synchronizing Global Ledger...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: T.font, color: T.text, paddingBottom: 60 }}>
      {/* ── Header ── */}
      <div style={{ background: T.surface, borderBottom: `1.5px solid ${T.border}`, padding: '24px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 12 }}>
                <FiPackage color={T.accent} /> Master Ledger
              </h1>
              <p style={{ margin: '4px 0 0', color: T.textMid, fontSize: 13, fontWeight: 500 }}>Manage fulfillment cycles, audit payments, and orchestrate logistics.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: '8px 16px', minWidth: 320 }}>
                <FiSearch color={T.textDim} size={18} />
                <input type="text" placeholder="Search ID, Customer, or Email…" value={search} onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0 12px', width: '100%', fontSize: 14, color: T.text, fontWeight: 500 }} />
              </div>
              <button onClick={() => fetchOrders()} disabled={syncing}
                style={{ padding: '10px 16px', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, color: T.textMid, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, transition: 'all 0.2s' }}>
                <FiRefreshCw size={14} style={{ animation: syncing ? 'spin 1.2s linear infinite' : 'none' }} />
                {syncing ? 'Syncing…' : 'Refresh'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 6, background: T.surfaceHigh, padding: 6, borderRadius: 12 }}>
              {[
                ['all', 'Global', counts.all],
                ['pending', 'Pending', counts.pending],
                ['cod', 'COD', counts.cod],
                ['paid', 'Paid', counts.paid],
                ['delivered', 'Delivered', counts.delivered],
                ['void', 'Void', counts.void]
              ].map(([v, l, c]) => (
                <button key={v} onClick={() => setFilter(v)}
                  style={{
                    padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                    background: filter === v ? T.surface : 'transparent',
                    color: filter === v ? T.accent : T.textMid,
                    boxShadow: filter === v ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                  }}>
                  {l} <span style={{ opacity: 0.5, marginLeft: 4 }}>{c}</span>
                </button>
              ))}
            </div>
            {selectedIds.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 12px', background: T.accentDim, borderRadius: 12, border: `1.5px solid ${T.accent}20` }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: T.accent }}>{selectedIds.length} Selected</span>
                <div style={{ width: 1.5, height: 16, background: `${T.accent}30` }} />
                <button onClick={() => openPrint(orders.filter(o => selectedIds.includes(o._id)).map(invoiceHTML).join(''), INV_CSS, 'Batch Invoices')}
                  style={{ background: 'none', border: 'none', color: T.accent, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiPrinter size={14} /> Batch Print
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Order Matrix ── */}
      <div style={{ maxWidth: 1300, margin: '32px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredOrders.length === 0 ? (
            <div style={{ padding: 100, textAlign: 'center', background: T.surface, borderRadius: 24, border: `2px dashed ${T.border}`, color: T.textDim }}>
              <FiPackage size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
              <div style={{ fontSize: 18, fontWeight: 800 }}>No entities found</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Adjust parameters or clear search filters.</div>
            </div>
          ) : filteredOrders.map(o => {
            const isExp = expandedId === o._id
            const isSel = selectedIds.includes(o._id)
            return (
              <motion.div key={o._id} layout
                style={{
                  background: T.surface, border: `1.5px solid ${isSel ? T.accent : isExp ? T.accent + '40' : T.border}`,
                  borderRadius: 20, overflow: 'hidden', transition: 'all 0.3s',
                  boxShadow: isExp ? '0 10px 30px rgba(0,0,0,0.05)' : 'none'
                }}>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                  <button onClick={(e) => { e.stopPropagation(); toggleSelect(o._id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', p: 0 }}>
                    {isSel ? <FiCheckSquare size={20} color={T.accent} /> : <FiSquare size={20} color={T.textDim} />}
                  </button>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpandedId(isExp ? null : o._id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <span style={{ fontWeight: 900, fontSize: 16, color: T.text, letterSpacing: '-0.02em' }}>#{o._id.slice(-8).toUpperCase()}</span>
                      <StatusPill order={o} />
                      <Badge color={T.textMid} bg={T.surfaceHigh}>{o.paymentMethod || 'Manual'}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: T.textMid, display: 'flex', gap: 6, alignItems: 'center' }}><FiUser size={14} />{o.user?.name || 'Anonymous'}</span>
                      <span style={{ fontSize: 13, color: T.textMid, display: 'flex', gap: 6, alignItems: 'center' }}><FiCalendar size={14} />{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span style={{ fontSize: 13, color: T.textMid }}><FiTag size={13} style={{ marginRight: 6 }} />{o.orderItems?.length || 0} items</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{fmtINR(o.totalPrice)}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', mt: 2 }}>Settlement Total</div>
                  </div>
                  <button onClick={() => setExpandedId(isExp ? null : o._id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <FiChevronDown size={20} color={T.textDim} style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                  </button>
                </div>

                {/* Expanded Section */}
                <AnimatePresence>
                  {isExp && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', borderTop: `1.5px solid ${T.border}`, background: '#fcfcfd' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 0 }}>
                        {/* Column 1: Logistics & Context */}
                        <div style={{ padding: 32, borderRight: `1.5px solid ${T.border}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Entity Fulfillment</div>
                            {o.user && (
                              <button onClick={() => toggleBlock(o.user?._id || o.user, o.user?.isBlocked)} disabled={blockingId === (o.user?._id || o.user)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer', border: 'none',
                                  background: o.user?.isBlocked ? T.successDim : T.dangerDim, color: o.user?.isBlocked ? T.success : T.danger
                                }}>
                                {o.user?.isBlocked ? <><FiUserCheck size={14} /> Restore Origin</> : <><FiSlash size={14} /> Restrict Origin</>}
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                              { icon: FiUser, label: 'Verified Mail', val: o.user?.email || 'N/A' },
                              { icon: FiMapPin, label: 'Dispatch Destination', val: `${o.shippingAddress?.street}, ${o.shippingAddress?.city}, ${o.shippingAddress?.state} - ${o.shippingAddress?.zipCode}` },
                              { icon: FiDollarSign, label: 'Gateway Identity', val: o.paymentMethod || 'COD' },
                              o.isPaid && { icon: FiCheckCircle, label: 'Auth Settle Date', val: new Date(o.paidAt).toLocaleDateString(), col: T.success },
                              o.isDelivered && { icon: FiTruck, label: 'Logistics Finalized', val: new Date(o.deliveredAt).toLocaleDateString(), col: T.info },
                              isVoid(o) && { icon: FiAlertCircle, label: 'Termination Hook', val: o.paymentStatus, col: T.danger }
                            ].filter(Boolean).map((r, i) => (
                              <div key={i} style={{ display: 'flex', gap: 12 }}>
                                <r.icon size={16} color={T.textDim} style={{ mt: 3 }} />
                                <div>
                                  <div style={{ fontSize: 10, color: T.textDim, fontWeight: 800, textTransform: 'uppercase' }}>{r.label}</div>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: r.col || T.text, lineHeight: 1.4 }}>{r.val}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Fiscal Ledger */}
                          <div style={{ marginTop: 32, padding: 24, background: T.white, borderRadius: 20, border: `1.5px solid ${T.border}` }}>
                             {[
                               { l: 'Merchandise Base', v: fmtINR(o.itemsPrice) },
                               { l: 'System Tariff (GST)', v: fmtINR(o.taxPrice) },
                               { l: 'Logistics Dispatch', v: fmtINR(o.shippingPrice) },
                               o.discount > 0 && { l: 'Yield Incentive', v: `-${fmtINR(o.discount)}`, c: T.success }
                             ].filter(Boolean).map(r => (
                               <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                                 <span style={{ color: r.c || T.textMid, fontWeight: 600 }}>{r.l}</span>
                                 <span style={{ fontWeight: 700, color: r.c || T.text }}>{r.v}</span>
                               </div>
                             ))}
                             <div style={{ borderTop: `1.5px solid ${T.border}`, pt: 12, mt: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <span style={{ fontSize: 14, fontWeight: 800 }}>Settlement Total</span>
                               <span style={{ fontSize: 20, fontWeight: 900, color: isVoid(o) ? T.textDim : T.accent, textDecoration: isVoid(o) ? 'line-through' : 'none' }}>{fmtINR(o.totalPrice)}</span>
                             </div>
                          </div>
                        </div>

                        {/* Column 2: Manifest & Actions */}
                        <div style={{ padding: 32 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
                            Manifest Details ({o.orderItems?.length || 0} artifacts)
                          </div>
                          <div style={{ maxHeight: 300, overflowY: 'auto', pr: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                             {(o.orderItems || []).map((item, idx) => (
                               <div key={idx} style={{ padding: 12, background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                                  <img src={item.image} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{item.name}</div>
                                    <div style={{ fontSize: 11, color: T.textMid, fontWeight: 600 }}>{item.quantity} x {fmtINR(item.price)}</div>
                                  </div>
                                  <div style={{ fontSize: 14, fontWeight: 800 }}>{fmtINR(item.price * item.quantity)}</div>
                               </div>
                             ))}
                          </div>

                          {/* Orchestration Controls */}
                          <div style={{ marginTop: 32, display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: `1.5px solid ${T.border}`, pt: 24 }}>
                             <button onClick={() => printInv(o._id)} style={{ padding: '10px 18px', background: T.text, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                               <FiPrinter size={14}/> Dispatch Invoice
                             </button>
                             <button onClick={() => printLabel(o._id)} style={{ padding: '10px 18px', background: T.surface, color: T.text, border: `1.5px solid ${T.border}`, borderRadius: 12, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                               <FiTag size={14}/> Identity Label
                             </button>
                             <div style={{ flex: 1 }} />
                             {!o.isPaid && !isVoid(o) && (
                               <button onClick={() => markPaid(o._id)} style={{ padding: '10px 18px', background: T.success, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                                 Commit Settle
                               </button>
                             )}
                             {o.isPaid && !o.isDelivered && !isVoid(o) && (
                               <button onClick={() => markDelivered(o._id)} style={{ padding: '10px 18px', background: T.info, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                                 Finalize Handoff
                               </button>
                             )}
                             {(!o.isDelivered && !isVoid(o)) && (
                               <button onClick={() => setCancelModal(o)} style={{ padding: '10px 18px', background: T.dangerDim, color: T.danger, border: `1.5px solid ${T.danger}20`, borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                                 Terminate Order
                               </button>
                             )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Cancellation Overlay ── */}
      <AnimatePresence>
        {cancelModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: T.white, borderRadius: 24, maxWidth: 460, width: '100%', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', borderBottom: `1.5px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Order Termination</h3>
                 <button onClick={() => setCancelModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20}/></button>
              </div>
              <div style={{ padding: 32 }}>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: T.textMid, lineHeight: 1.6 }}>Are you sure you want to terminate <strong>#{cancelModal._id.slice(-8).toUpperCase()}</strong>? This action may initiate an automatic refund if paid online.</p>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textDim, marginBottom: 8, textTransform: 'uppercase' }}>CANCELLATION REASON</label>
                <select id="cancelReason" style={{ width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, outline: 'none', marginBottom: 24, fontFamily: T.font, fontWeight: 600 }}>
                  <option>Customer Decision</option>
                  <option>Administrative Policy</option>
                  <option>Item Unavailability</option>
                  <option>Fraud Mitigation</option>
                </select>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setCancelModal(null)} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, fontWeight: 700, cursor: 'pointer' }}>Dismiss</button>
                  <button disabled={submitting} onClick={() => handleCancel(document.getElementById('cancelReason').value)} style={{ flex: 1.5, padding: 14, borderRadius: 12, border: 'none', background: T.danger, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                    {submitting ? 'Terminating…' : 'Confirm Termination'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ManageOrders