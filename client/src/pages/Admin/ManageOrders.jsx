import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage, FiCheckCircle, FiTruck, FiRefreshCw,
  FiPrinter, FiX, FiSearch, FiChevronDown, FiTag,
  FiUser, FiMapPin, FiCalendar, FiAlertCircle, FiShield
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import RestrictedAccess from '../../components/RestrictedAccess'

const fmtINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`
const qrUrl = (data, size = 120) => `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=6`

const getStatus = (o) => {
  if (o.isDelivered) return { label: 'Delivered', color: 'var(--success)', bg: 'rgba(56,161,105,0.08)', border: 'rgba(56,161,105,0.25)' }
  if (o.paymentStatus === 'CANCELLED') return { label: 'Cancelled', color: 'var(--text-muted)', bg: 'var(--bg-alt)', border: 'var(--border-color)' }
  if (o.paymentStatus === 'FAILED') return { label: 'Failed', color: 'var(--danger)', bg: 'rgba(229,62,62,0.08)', border: 'rgba(229,62,62,0.25)' }
  if (o.isPaid) return { label: 'Paid', color: 'var(--info)', bg: 'rgba(49,130,206,0.08)', border: 'rgba(49,130,206,0.25)' }
  if (o.paymentStatus === 'COD_CONFIRMED') return { label: 'Confirmed', color: 'var(--info)', bg: 'rgba(49,130,206,0.08)', border: 'rgba(49,130,206,0.25)' }
  return { label: 'Pending', color: 'var(--warning)', bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.25)' }
}

const StatusBadge = ({ order }) => {
  const s = getStatus(order)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
      borderRadius: 99, fontSize: 11, fontWeight: 800, background: s.bg, color: s.color, border: `1.5px solid ${s.border}`
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  )
}

const INV_CSS = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#111827}.inv{max-width:760px;margin:0 auto;padding:40px}.head{display:flex;justify-content:space-between;border-bottom:2px solid #F5A623;padding-bottom:16px;margin-bottom:24px}.brand{font-size:22px;font-weight:800;color:#1B2F6E}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{background:#f9fafb;padding:10px;text-align:left;font-size:12px}td{padding:10px;font-size:13px;border-bottom:1px solid #f3f4f6}.total{font-size:16px;font-weight:700;color:#F5A623}@media print{button{display:none}}`
const openPrint = (body, title) => {
  const w = window.open('', '_blank')
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>${INV_CSS}</style></head><body>${body}<button onclick="window.print()" style="margin:20px;padding:10px 24px;background:#1B2F6E;color:#fff;border:none;border-radius:8px;cursor:pointer">Print</button></body></html>`)
  w.document.close()
}
const invoiceHTML = (o) => `<div class="inv"><div class="head"><div><div class="brand">DhaniFresh</div><div style="color:#6b7280;font-size:13px">Premium Quality</div></div><div style="text-align:right"><div style="font-size:16px;font-weight:700">TAX INVOICE</div><div style="color:#F5A623;font-weight:700">#${o._id.slice(-10).toUpperCase()}</div><div style="font-size:12px;color:#6b7280">${new Date(o.createdAt).toLocaleDateString('en-IN')}</div></div></div><div style="display:flex;justify-content:space-between;margin-bottom:24px"><div><p style="font-size:11px;color:#9ca3af;font-weight:700;margin-bottom:6px">SHIP TO</p><strong>${o.user?.name||'Customer'}</strong><br/>${o.shippingAddress?.street||''}, ${o.shippingAddress?.city||''}<br/>${o.shippingAddress?.state||''} - ${o.shippingAddress?.zipCode||''}</div><img src="${qrUrl(`ORDER:${o._id}`,90)}" width="80" height="80"/></div><table><thead><tr><th>Item</th><th>Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${(o.orderItems||[]).map(i=>`<tr><td>${i.name}</td><td>${i.quantity}</td><td style="text-align:right">₹${Number(i.price).toFixed(2)}</td><td style="text-align:right">₹${(i.price*i.quantity).toFixed(2)}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3">Subtotal</td><td style="text-align:right">₹${Number(o.itemsPrice||0).toFixed(2)}</td></tr><tr><td colspan="3">Tax</td><td style="text-align:right">₹${Number(o.taxPrice||0).toFixed(2)}</td></tr><tr><td colspan="3">Shipping</td><td style="text-align:right">₹${Number(o.shippingPrice||0).toFixed(2)}</td></tr><tr class="total"><td colspan="3"><strong>Total</strong></td><td style="text-align:right"><strong>₹${Number(o.totalPrice||0).toFixed(2)}</strong></td></tr></tfoot></table></div>`

const ManageOrders = () => {
  const { hasPermission } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => { if (hasPermission('orders')) fetchOrders(true) }, [hasPermission])

  const fetchOrders = async (showLoad = false) => {
    if (showLoad) setLoading(true); else setSyncing(true)
    try {
      const res = await api.get('/api/orders')
      setOrders(res.data.orders || res.data || [])
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false); setSyncing(false) }
  }

  const markPaid = async (id) => {
    if (!window.confirm('Mark this order as PAID?')) return
    try { await api.put(`/api/orders/${id}/pay`); fetchOrders(); toast.success('Order marked as paid') }
    catch { toast.error('Failed to update') }
  }

  const markDelivered = async (id) => {
    if (!window.confirm('Mark this order as DELIVERED? This cannot be undone.')) return
    try { await api.put(`/api/orders/${id}/deliver`); fetchOrders(); toast.success('Order marked as delivered') }
    catch { toast.error('Failed to update') }
  }

  const handleCancel = async (reason) => {
    setSubmitting(true)
    try { await api.post(`/api/orders/${cancelModal._id}/cancel`, { reason }); toast.success('Order cancelled'); setCancelModal(null); fetchOrders() }
    catch { toast.error('Cancellation failed') }
    finally { setSubmitting(false) }
  }

  const isVoid = (o) => ['CANCELLED', 'FAILED'].includes(o.paymentStatus)

  const counts = {
    all: orders.length,
    pending: orders.filter(o => !o.isPaid && !o.isDelivered && !isVoid(o) && o.paymentStatus !== 'COD_CONFIRMED').length,
    cod: orders.filter(o => o.paymentStatus === 'COD_CONFIRMED' && !o.isDelivered).length,
    paid: orders.filter(o => o.isPaid && !o.isDelivered).length,
    delivered: orders.filter(o => o.isDelivered).length,
    cancelled: orders.filter(isVoid).length,
  }

  const filteredOrders = orders.filter(o => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'pending' ? (!o.isPaid && !o.isDelivered && !isVoid(o) && o.paymentStatus !== 'COD_CONFIRMED') :
      filter === 'cod' ? (o.paymentStatus === 'COD_CONFIRMED' && !o.isDelivered) :
      filter === 'paid' ? (o.isPaid && !o.isDelivered) :
      filter === 'delivered' ? o.isDelivered :
      isVoid(o)
    const q = search.toLowerCase()
    const matchSearch = !q || o._id.toLowerCase().includes(q) || (o.user?.name || '').toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  if (!hasPermission('orders')) return <RestrictedAccess title="Access Restricted" message="You don't have permission to manage orders." />

  if (loading) return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-base)' }}>
      <div style={{ background: 'var(--gradient-hero)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-48 shimmer rounded mb-2" />
          <div className="h-5 w-64 shimmer rounded" />
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: 20 }} className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 shimmer rounded" />
              <div className="h-3 w-48 shimmer rounded" />
            </div>
            <div className="h-6 w-20 shimmer rounded-full" />
            <div className="h-8 w-24 shimmer rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-base)' }}>
      {/* ── Premium Admin Header ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.7 }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border mb-3"
                style={{ background: 'rgba(245,197,24,0.18)', color: 'var(--gold)', borderColor: 'rgba(245,197,24,0.35)' }}>
                <FiShield size={10} /> Admin Panel
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>Manage Orders</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <FiSearch size={14} style={{ color: 'rgba(255,255,255,0.55)' }} className="shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…"
                  className="bg-transparent outline-none text-sm w-48" style={{ color: '#FFF', caretColor: 'var(--gold)', fontFamily: 'var(--font)' }} />
              </div>
              <button onClick={() => fetchOrders()} disabled={syncing}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.80)' }}>
                <FiRefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { v: 'all',       l: 'All',       c: counts.all },
              { v: 'pending',   l: 'Pending',   c: counts.pending },
              { v: 'cod',       l: 'COD',       c: counts.cod },
              { v: 'paid',      l: 'Paid',      c: counts.paid },
              { v: 'delivered', l: 'Delivered', c: counts.delivered },
              { v: 'cancelled', l: 'Cancelled', c: counts.cancelled },
            ].map(({ v, l, c }) => (
              <button key={v} onClick={() => setFilter(v)}
                className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                style={filter === v
                  ? { background: 'var(--gold)', color: 'var(--navy)', border: 'none' }
                  : { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.75)' }
                }>
                {l}
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                  style={filter === v
                    ? { background: 'rgba(27,47,110,0.25)', color: 'var(--navy)' }
                    : { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }
                  }>{c}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '80px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)' }}>
              <FiPackage size={28} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>No orders found</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {search ? `No results for "${search}"` : `No ${filter === 'all' ? '' : filter} orders yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(o => {
              const isExp = expandedId === o._id
              return (
                <div key={o._id} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: `1.5px solid ${isExp ? 'var(--brand-secondary)' : 'var(--border-color)'}`, boxShadow: 'var(--shadow-sm)', overflow: 'hidden', transition: 'all 0.2s' }}>
                  {/* Row */}
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpandedId(isExp ? null : o._id)}>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>#{o._id.slice(-8).toUpperCase()}</span>
                        <StatusBadge order={o} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-alt)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border-color)' }}>{o.paymentMethod}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><FiUser size={11} style={{ color: 'var(--brand-secondary)' }} />{o.user?.name || 'Customer'}</span>
                        <span className="flex items-center gap-1"><FiCalendar size={11} style={{ color: 'var(--brand-secondary)' }} />{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><FiTag size={11} style={{ color: 'var(--brand-secondary)' }} />{o.orderItems?.length || 0} items</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 18, fontWeight: 900, color: isVoid(o) ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isVoid(o) ? 'line-through' : 'none', fontFamily: 'var(--font-display)' }}>
                        {fmtINR(o.totalPrice)}
                      </p>
                    </div>
                    <button onClick={() => setExpandedId(isExp ? null : o._id)}
                      style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0, border: 'none', cursor: 'pointer', ...(isExp ? { background: 'var(--brand-secondary)', color: '#fff' } : { background: 'var(--bg-alt)', color: 'var(--text-muted)' }) }}>
                      <motion.div animate={{ rotate: isExp ? 180 : 0 }}><FiChevronDown size={15} /></motion.div>
                    </button>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: 20, borderTop: '1px solid var(--border-color)', background: 'var(--bg-alt)' }}>
                          <div className="grid lg:grid-cols-2 gap-6">
                            {/* Left: Items */}
                            <div>
                              <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Order Items</h4>
                              <div className="space-y-2">
                                {(o.orderItems || []).map((item, idx) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
                                    <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.quantity} × ₹{item.price}</p>
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', flexShrink: 0 }}>{fmtINR(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Right: Details */}
                            <div className="space-y-4">
                              {/* Address */}
                              <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <FiMapPin size={13} style={{ color: 'var(--brand-secondary)' }} />
                                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Delivery Address</span>
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                                  {o.user?.name && <strong style={{ display: 'block', fontWeight: 700, marginBottom: 2 }}>{o.user.name}</strong>}
                                  {o.shippingAddress?.street}, {o.shippingAddress?.city}<br />
                                  {o.shippingAddress?.state} - {o.shippingAddress?.zipCode}
                                </p>
                              </div>

                              {/* Price */}
                              <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
                                <div className="space-y-2 text-sm">
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmtINR(o.itemsPrice)}</span></div>
                                  {o.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--success)' }}>Discount</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>-{fmtINR(o.discount)}</span></div>}
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Shipping</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.shippingPrice === 0 ? 'FREE' : fmtINR(o.shippingPrice)}</span></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 15 }}>Total</span>
                                    <span style={{ fontWeight: 900, fontSize: 15, color: isVoid(o) ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isVoid(o) ? 'line-through' : 'none' }}>{fmtINR(o.totalPrice)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}>
                                <button onClick={() => openPrint(invoiceHTML(o), `Invoice #${o._id.slice(-8).toUpperCase()}`)} className="btn btn-secondary">
                                  <FiPrinter size={13} /> Invoice
                                </button>
                                {!o.isPaid && !isVoid(o) && (
                                  <button onClick={() => markPaid(o._id)} style={{ padding: '8px 14px', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                    <FiCheckCircle size={13} /> Mark Paid
                                  </button>
                                )}
                                {o.isPaid && !o.isDelivered && !isVoid(o) && (
                                  <button onClick={() => markDelivered(o._id)} style={{ padding: '8px 14px', background: 'var(--info)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                    <FiTruck size={13} /> Mark Delivered
                                  </button>
                                )}
                                {!o.isDelivered && !isVoid(o) && (
                                  <button onClick={() => setCancelModal(o)} style={{ padding: '8px 14px', background: 'rgba(229,62,62,0.1)', color: 'var(--danger)', border: '1.5px solid rgba(229,62,62,0.25)', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                    <FiX size={13} /> Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(27,47,110,0.45)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 440, padding: 24, boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 44, height: 44, background: 'rgba(229,62,62,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiAlertCircle size={20} style={{ color: 'var(--danger)' }} /></div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>Cancel Order</h3>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>#{cancelModal._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => setCancelModal(null)} style={{ padding: 8, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 8 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}><FiX size={16} /></button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>This will cancel the order and trigger a refund if it was paid online.</p>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Reason</label>
              <select id="cancelReason" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-input)', border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)', fontSize: 14, color: 'var(--text-primary)', outline: 'none', marginBottom: 24, fontFamily: 'var(--font)' }}>
                <option>Customer requested cancellation</option>
                <option>Administrative decision</option>
                <option>Item out of stock</option>
                <option>Suspected fraud</option>
              </select>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setCancelModal(null)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Keep Order</button>
                <button disabled={submitting} onClick={() => handleCancel(document.getElementById('cancelReason').value)}
                  style={{ flex: 1.5, padding: '12px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1, transition: 'all 0.2s', fontFamily: 'var(--font)' }}>
                  {submitting ? 'Cancelling…' : 'Confirm Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ManageOrders