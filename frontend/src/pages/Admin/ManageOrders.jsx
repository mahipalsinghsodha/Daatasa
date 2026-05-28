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
  if (o.isDelivered) return { label: 'Delivered', cls: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' }
  if (o.paymentStatus === 'CANCELLED') return { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' }
  if (o.paymentStatus === 'FAILED') return { label: 'Failed', cls: 'bg-red-100 text-red-600 border-red-200', dot: 'bg-red-500' }
  if (o.isPaid) return { label: 'Paid', cls: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' }
  if (o.paymentStatus === 'COD_CONFIRMED') return { label: 'Confirmed', cls: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' }
  return { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
}

const StatusBadge = ({ order }) => {
  const s = getStatus(order)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

const INV_CSS = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#111827}.inv{max-width:760px;margin:0 auto;padding:40px}.head{display:flex;justify-content:space-between;border-bottom:2px solid #f97316;padding-bottom:16px;margin-bottom:24px}.brand{font-size:22px;font-weight:800;color:#f97316}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{background:#f9fafb;padding:10px;text-align:left;font-size:12px}td{padding:10px;font-size:13px;border-bottom:1px solid #f3f4f6}.total{font-size:16px;font-weight:700;color:#f97316}@media print{button{display:none}}`
const openPrint = (body, title) => {
  const w = window.open('', '_blank')
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>${INV_CSS}</style></head><body>${body}<button onclick="window.print()" style="margin:20px;padding:10px 24px;background:#f97316;color:#fff;border:none;border-radius:8px;cursor:pointer">Print</button></body></html>`)
  w.document.close()
}
const invoiceHTML = (o) => `<div class="inv"><div class="head"><div><div class="brand">DhaniFresh</div><div style="color:#6b7280;font-size:13px">Pure &amp; Natural Ghee</div></div><div style="text-align:right"><div style="font-size:16px;font-weight:700">TAX INVOICE</div><div style="color:#f97316;font-weight:700">#${o._id.slice(-10).toUpperCase()}</div><div style="font-size:12px;color:#6b7280">${new Date(o.createdAt).toLocaleDateString('en-IN')}</div></div></div><div style="display:flex;justify-content:space-between;margin-bottom:24px"><div><p style="font-size:11px;color:#9ca3af;font-weight:700;margin-bottom:6px">SHIP TO</p><strong>${o.user?.name||'Customer'}</strong><br/>${o.shippingAddress?.street||''}, ${o.shippingAddress?.city||''}<br/>${o.shippingAddress?.state||''} - ${o.shippingAddress?.zipCode||''}</div><img src="${qrUrl(`ORDER:${o._id}`,90)}" width="80" height="80"/></div><table><thead><tr><th>Item</th><th>Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${(o.orderItems||[]).map(i=>`<tr><td>${i.name}</td><td>${i.quantity}</td><td style="text-align:right">₹${Number(i.price).toFixed(2)}</td><td style="text-align:right">₹${(i.price*i.quantity).toFixed(2)}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3">Subtotal</td><td style="text-align:right">₹${Number(o.itemsPrice||0).toFixed(2)}</td></tr><tr><td colspan="3">Tax</td><td style="text-align:right">₹${Number(o.taxPrice||0).toFixed(2)}</td></tr><tr><td colspan="3">Shipping</td><td style="text-align:right">₹${Number(o.shippingPrice||0).toFixed(2)}</td></tr><tr class="total"><td colspan="3"><strong>Total</strong></td><td style="text-align:right"><strong>₹${Number(o.totalPrice||0).toFixed(2)}</strong></td></tr></tfoot></table></div>`

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
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-48 shimmer rounded mb-2" />
          <div className="h-5 w-64 shimmer rounded" />
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
        {[...Array(5)].map((_,i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
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
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.6) 0%, transparent 70%)', filter: 'blur(50px)' }} />
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
                  className="bg-transparent outline-none text-sm w-48" style={{ color: '#FFF', caretColor: 'var(--gold)' }} />
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
          <div className="py-20 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
              <FiPackage size={28} />
            </div>
            <p className="text-base font-bold text-slate-400 mb-1">No orders found</p>
            <p className="text-sm text-slate-300">
              {search ? `No results for "${search}"` : `No ${filter === 'all' ? '' : filter} orders yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(o => {
              const isExp = expandedId === o._id
              return (
                <div key={o._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isExp ? 'border-gray-900' : 'border-gray-100'}`}>
                  {/* Row */}
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExp ? null : o._id)}>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold text-gray-900">#{o._id.slice(-8).toUpperCase()}</span>
                        <StatusBadge order={o} />
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{o.paymentMethod}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><FiUser size={11} />{o.user?.name || 'Customer'}</span>
                        <span className="flex items-center gap-1"><FiCalendar size={11} />{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><FiTag size={11} />{o.orderItems?.length || 0} items</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-lg font-extrabold ${isVoid(o) ? 'text-gray-300 line-through' : 'text-gray-900'}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {fmtINR(o.totalPrice)}
                      </p>
                    </div>
                    <button onClick={() => setExpandedId(isExp ? null : o._id)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${isExp ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      <motion.div animate={{ rotate: isExp ? 180 : 0 }}><FiChevronDown size={15} /></motion.div>
                    </button>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-5 py-5 border-t border-gray-50 bg-gray-50/50">
                          <div className="grid lg:grid-cols-2 gap-5">
                            {/* Left: Items */}
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h4>
                              <div className="space-y-2">
                                {(o.orderItems || []).map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                      <p className="text-xs text-gray-400">{item.quantity} × ₹{item.price}</p>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 shrink-0">{fmtINR(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Right: Details */}
                            <div className="space-y-3">
                              {/* Address */}
                              <div className="bg-white p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <FiMapPin size={13} className="text-orange-500" />
                                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Delivery Address</span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {o.user?.name && <strong className="block">{o.user.name}</strong>}
                                  {o.shippingAddress?.street}, {o.shippingAddress?.city}<br />
                                  {o.shippingAddress?.state} - {o.shippingAddress?.zipCode}
                                </p>
                              </div>

                              {/* Price */}
                              <div className="bg-white p-4 rounded-xl border border-gray-100">
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{fmtINR(o.itemsPrice)}</span></div>
                                  {o.discount > 0 && <div className="flex justify-between"><span className="text-green-600">Discount</span><span className="text-green-600 font-medium">-{fmtINR(o.discount)}</span></div>}
                                  <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-medium">{o.shippingPrice === 0 ? 'FREE' : fmtINR(o.shippingPrice)}</span></div>
                                  <div className="flex justify-between pt-2 border-t border-gray-50">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className={`font-bold ${isVoid(o) ? 'line-through text-gray-400' : 'text-gray-900'}`}>{fmtINR(o.totalPrice)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 pt-1">
                                <button onClick={() => openPrint(invoiceHTML(o), `Invoice #${o._id.slice(-8).toUpperCase()}`)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                  <FiPrinter size={13} /> Invoice
                                </button>
                                {!o.isPaid && !isVoid(o) && (
                                  <button onClick={() => markPaid(o._id)} className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors">
                                    <FiCheckCircle size={13} /> Mark Paid
                                  </button>
                                )}
                                {o.isPaid && !o.isDelivered && !isVoid(o) && (
                                  <button onClick={() => markDelivered(o._id)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors">
                                    <FiTruck size={13} /> Mark Delivered
                                  </button>
                                )}
                                {!o.isDelivered && !isVoid(o) && (
                                  <button onClick={() => setCancelModal(o)} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><FiAlertCircle size={18} className="text-red-600" /></div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Cancel Order</h3>
                    <p className="text-xs text-gray-400">#{cancelModal._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => setCancelModal(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"><FiX size={16} /></button>
              </div>
              <p className="text-sm text-gray-600 mb-4">This will cancel the order and trigger a refund if it was paid online.</p>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Reason</label>
              <select id="cancelReason" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-orange-400 mb-5">
                <option>Customer requested cancellation</option>
                <option>Administrative decision</option>
                <option>Item out of stock</option>
                <option>Suspected fraud</option>
              </select>
              <div className="flex gap-3">
                <button onClick={() => setCancelModal(null)} className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Keep Order</button>
                <button disabled={submitting} onClick={() => handleCancel(document.getElementById('cancelReason').value)} className="flex-[1.5] py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition-all">
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