import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage, FiPrinter, FiChevronDown, FiMapPin, FiCalendar,
  FiCreditCard, FiCheckCircle, FiTruck, FiClock, FiShoppingBag,
  FiTag, FiX, FiAlertCircle, FiRefreshCw
} from 'react-icons/fi'
import api from '../api/axios'

// ── Status Config ──────────────────────────────────────────────────────────────
const getStatus = (order) => {
  if (order.isDelivered) return { label: 'Delivered', color: 'var(--color-success)', bg: 'var(--color-success-dim)', dot: 'var(--color-success)', icon: FiCheckCircle }
  if (order.paymentStatus === 'CANCELLED') return { label: 'Cancelled', color: 'var(--color-text-dim)', bg: 'var(--color-surface-high)', dot: 'var(--color-text-dim)', icon: FiX }
  if (order.paymentStatus === 'FAILED') return { label: 'Failed', color: 'var(--color-danger)', bg: 'var(--color-danger-dim)', dot: 'var(--color-danger)', icon: FiAlertCircle }
  if (order.isPaid) return { label: 'Paid', color: 'var(--color-info)', bg: 'var(--color-info-dim)', dot: 'var(--color-info)', icon: FiTruck }
  if (order.paymentStatus === 'COD_CONFIRMED') return { label: 'Confirmed', color: 'var(--color-info)', bg: 'var(--color-info-dim)', dot: 'var(--color-info)', icon: FiClock }
  return { label: 'Pending', color: 'var(--color-warning)', bg: 'var(--color-warning-dim)', dot: 'var(--color-warning)', icon: FiClock }
}

const StatusPill = ({ order }) => {
  const s = getStatus(order)
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
      style={{ background: s.bg, color: s.color }}>
      <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

// ── Cancel Modal (Professional & Clean) ─────────────────────────────────────────
const CancelModal = ({ order, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('')
  const REASONS = [
    'Changed my mind',
    'Ordered by mistake',
    'Other'
  ]
  const willRefund = order.paymentStatus === 'PAID' && order.paymentMethod === 'Online'

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[32px] shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-red-50 rounded-2xl text-red-600">
              <FiPackage size={24} />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
              <FiX size={20} />
            </button>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2 font-head tracking-tight">Cancel Order?</h2>
          <p className="text-gray-500 text-sm font-medium mb-8">
            Order <span className="text-gray-900 font-bold">#{order._id.slice(-8).toUpperCase()}</span> will be permanently removed from processing.
          </p>

          {willRefund && (
            <div className="mb-8 p-4 bg-green-50 rounded-2xl border border-green-100 flex gap-3">
              <FiRefreshCw className="text-green-600 shrink-0 mt-0.5" size={16} />
              <div className="text-xs font-bold text-green-700 leading-relaxed">
                Full refund of ₹{Number(order.totalPrice).toFixed(2)} will be auto-initiated to your original bank account.
              </div>
            </div>
          )}

          <div className="space-y-3 mb-10 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Select Reason</label>
            {REASONS.map(r => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`w-full p-4 rounded-2xl text-left text-sm font-bold transition-all border-2 ${reason === r
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onClose}
              className="py-3.5 rounded-2xl text-sm font-black text-gray-400 bg-white border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              Keep Order
            </button>
            <button
              disabled={loading || !reason}
              onClick={() => onConfirm(reason)}
              className="py-3.5 rounded-2xl text-sm font-black text-white bg-red-600 shadow-xl shadow-red-200 hover:bg-red-700 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {loading ? 'Wait...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Print Helper ──────────────────────────────────────────────────────────────
const buildInvoiceHTML = (inv, order) => {
  const items = (inv.items || order.orderItems || []).map(i => `
    <tr><td>${i.name}</td><td style="text-align:center">${i.quantity}</td>
    <td style="text-align:right">₹${Number(i.price).toFixed(2)}</td>
    <td style="text-align:right">₹${(i.price * i.quantity).toFixed(2)}</td></tr>`).join('')
  const sub = Number(inv.subtotal ?? order.itemsPrice ?? 0).toFixed(2)
  const discount = Number(order.discount ?? 0)
  const tax = Number(inv.tax ?? order.taxPrice ?? 0).toFixed(2)
  const ship = Number(inv.shipping ?? order.shippingPrice ?? 0).toFixed(2)
  const tot = Number(inv.total ?? order.totalPrice ?? 0).toFixed(2)
  const cust = inv.customer || { name: '', email: '', address: {} }
  const addr = cust.address || order.shippingAddress || {}
  const discountRow = discount > 0 ? `<tr><td colspan="3" style="color:#10b981">Discount${order.coupon?.code ? ` (${order.coupon.code})` : ''}</td><td style="color:#10b981">-₹${discount.toFixed(2)}</td></tr>` : ''
  return `
    <div style="max-width:760px;margin:0 auto;padding:40px;font-family:sans-serif;color:#0f172a">
      <div style="display:flex;justify-content:space-between;margin-bottom:40px;border-bottom:3px solid #e8621a;padding-bottom:20px">
        <div><h1 style="color:#e8621a;margin:0">Ghee Store</h1><p style="color:#64748b;margin:5px 0">Pure & Natural Ghee</p></div>
        <div style="text-align:right"><h2 style="margin:0">INVOICE</h2><p style="color:#e8621a;font-weight:bold;margin:5px 0">#${(inv.invoiceNumber || order._id.slice(-10)).toUpperCase()}</p></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:40px">
        <div><p style="font-size:11px;color:#94a3b8;font-weight:bold;margin-bottom:8px">BILL TO</p><strong>${cust.name || ''}</strong><br/>${cust.email || ''}<br/>${addr.street || ''}<br/>${addr.city || ''}, ${addr.state || ''}</div>
        <div style="text-align:right"><p style="font-size:11px;color:#94a3b8;font-weight:bold;margin-bottom:8px">DATE</p>${new Date(order.createdAt).toLocaleDateString()}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:40px">
        <thead><tr style="background:#f1f5f9"><th style="padding:12px;text-align:left">ITEM</th><th style="padding:12px">QTY</th><th style="padding:12px;text-align:right">PRICE</th><th style="padding:12px;text-align:right">TOTAL</th></tr></thead>
        <tbody>${items}</tbody>
        <tfoot style="border-top:2px solid #e2e8f0"><tr style="font-weight:bold"><td></td><td></td><td style="padding:12px;text-align:right">SUBTOTAL</td><td style="padding:12px;text-align:right">₹${sub}</td></tr>${discountRow}<tr><td></td><td></td><td style="padding:12px;text-align:right">TAX</td><td style="padding:12px;text-align:right">₹${tax}</td></tr><tr><td></td><td></td><td style="padding:12px;text-align:right;font-size:20px;color:#e8621a">TOTAL</td><td style="padding:12px;text-align:right;font-size:20px;color:#e8621a">₹${tot}</td></tr></tfoot>
      </table>
    </div>`
}

const Orders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [printing, setPrinting] = useState(null)
  const [filter, setFilter] = useState('all')
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => { if (user) fetchOrders() }, [user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/orders/myorders')
      setOrders(res.data)
    } catch { toast.error('Failed to sync order history') }
    finally { setLoading(false) }
  }

  const printInvoice = async (order) => {
    setPrinting(order._id)
    try {
      let inv = {}
      try { const res = await api.get(`/api/invoices/${order._id}`); inv = res.data } catch { }
      const html = buildInvoiceHTML(inv, order)
      const win = window.open('', '_blank')
      win.document.write(`<!DOCTYPE html><html><head><title>Invoice</title></head><body onload="window.print()">${html}</body></html>`)
      win.document.close()
    } catch { toast.error('Print failure') }
    finally { setPrinting(null) }
  }

  const handleCancelOrder = async (reason) => {
    setCancelLoading(true)
    try {
      await api.post(`/api/orders/${cancelModal._id}/cancel`, { reason })
      toast.success('Order cancelled successfully')
      setCancelModal(null)
      fetchOrders()
    } catch { toast.error('Cancellation failed') }
    finally { setCancelLoading(false) }
  }

  const canCancel = (o) => !o.isDelivered && !['CANCELLED', 'FAILED'].includes(o.paymentStatus)

  const visible = orders.filter(o => {
    if (filter === 'all') return true
    if (filter === 'pending') return !o.isPaid && !o.isDelivered && !['CANCELLED', 'FAILED'].includes(o.paymentStatus)
    if (filter === 'paid') return o.isPaid && !o.isDelivered
    if (filter === 'success') return o.isDelivered
    if (filter === 'failed') return ['CANCELLED', 'FAILED'].includes(o.paymentStatus)
    return true
  })

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[var(--color-bg)]">
      <div className="w-10 h-10 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
      <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Retrieving history...</p>
    </div>
  )

  if (!user) return (navigate('/login') || null)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-20">

      {/* ── Header ── */}
      <div className="bg-white border-b border-[var(--color-border)] pt-12 pb-8 sm:pt-16 sm:pb-12 shadow-sm relative z-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-10">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-4">
                <FiShoppingBag size={14} className="text-orange-600" />
                <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">Consumer Account</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 font-head tracking-tight">Order History</h1>
              <p className="text-gray-500 font-medium max-w-lg mt-2">Manage your purchases, download invoices, and track your ghee journey.</p>
            </div>

            <div className="hidden sm:block text-right">
              <div className="text-[10px] uppercase tracking-widest font-black text-gray-300 mb-1">Lifetime Value</div>
              <div className="text-2xl font-black text-gray-900 font-head">₹{orders.reduce((acc, o) => acc + (o.paymentStatus !== 'CANCELLED' ? o.totalPrice : 0), 0).toLocaleString()}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {[
              { id: 'all', label: 'Everything', icon: FiPackage },
              { id: 'pending', label: 'Unpaid', icon: FiClock },
              { id: 'paid', label: 'Processing', icon: FiTruck },
              { id: 'success', label: 'Delivered', icon: FiCheckCircle },
              { id: 'failed', label: 'Cancelled', icon: FiX },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border-2 ${filter === f.id
                    ? 'border-gray-900 bg-gray-900 text-white shadow-xl shadow-gray-200'
                    : 'border-gray-50 bg-white text-gray-500 hover:border-gray-200'
                  }`}
              >
                <f.icon size={16} />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Order List ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {visible.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="py-24 bg-white rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center text-center p-12">
            <div className="text-6xl mb-6 opacity-20">📦</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 font-head">History is Clear</h2>
            <p className="text-gray-400 font-medium max-w-xs mx-auto">No orders found matching this filter. Ready to fill your pantry with pure ghee?</p>
            <button onClick={() => navigate('/products')} className="mt-8 px-8 py-3.5 bg-gray-900 text-white text-sm font-black rounded-2xl hover:bg-orange-600 transition-colors shadow-xl shadow-gray-900/10">Browse Store</button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            {visible.map((o, i) => {
              const isExp = expanded === o._id
              const state = getStatus(o)
              return (
                <motion.div
                  key={o._id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-[32px] border-2 transition-all duration-300 overflow-hidden ${isExp ? 'border-gray-900 shadow-2xl' : 'border-white shadow-lg hover:border-gray-100'
                    }`}
                >
                  <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-black text-gray-900 tracking-tight">#{o._id.slice(-8).toUpperCase()}</span>
                        <StatusPill order={o} />
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{o.paymentMethod}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                          <FiCalendar className="text-gray-300" />
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                          <FiPackage className="text-gray-300" />
                          {o.orderItems.length} Item{o.orderItems.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 justify-between border-t sm:border-0 pt-4 sm:pt-0">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Final Amount</div>
                        <div className={`text-3xl font-black font-head ${o.paymentStatus === 'CANCELLED' ? 'text-gray-300 line-through' : 'text-gray-900'}`}>
                          ₹{Number(o.totalPrice).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => setExpanded(isExp ? null : o._id)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isExp ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        <motion.div animate={{ rotate: isExp ? 180 : 0 }}><FiChevronDown size={20} /></motion.div>
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-gray-50/50">
                        <div className="p-6 sm:p-10 border-t border-gray-100">
                          <div className="grid lg:grid-cols-2 gap-10">
                            {/* Summary */}
                            <div className="space-y-6">
                              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Package Contents</h3>
                              <div className="space-y-3">
                                {o.orderItems.map(item => (
                                  <div key={item._id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-50 shadow-sm">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-black text-gray-900 text-sm truncate">{item.name}</div>
                                      <div className="text-[10px] font-bold text-gray-400">{item.quantity} × ₹{item.price}</div>
                                    </div>
                                    <div className="text-sm font-black text-gray-900">₹{(item.quantity * item.price).toLocaleString()}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Logistics */}
                            <div className="space-y-10">
                              <div className="bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600"><FiMapPin size={16} /></div>
                                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Delivery Route</h3>
                                </div>
                                <div className="text-sm font-medium text-gray-500 leading-relaxed uppercase tracking-wider">
                                  <strong className="text-gray-900">{o.shippingAddress.city} HUB</strong><br />
                                  {o.shippingAddress.street}, {o.shippingAddress.city}<br />
                                  {o.shippingAddress.state} – {o.shippingAddress.zipCode}
                                </div>
                              </div>

                              <div className="bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600"><FiCreditCard size={16} /></div>
                                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Pricing Matrix</h3>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-400">Cart Total</span>
                                    <span className="text-gray-900">₹{Number(o.itemsPrice).toLocaleString()}</span>
                                  </div>
                                  {o.discount > 0 && (
                                    <div className="flex justify-between text-sm font-bold text-green-600">
                                      <span>Discount Applied</span>
                                      <span>-₹{Number(o.discount).toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-400">Shipping (Pan India)</span>
                                    <span className={o.shippingPrice === 0 ? 'text-green-600 font-black text-[10px] tracking-widest' : 'text-gray-900'}>
                                      {o.shippingPrice === 0 ? 'FREE' : `₹${o.shippingPrice}`}
                                    </span>
                                  </div>
                                  <div className="h-[1px] bg-gray-50 my-2" />
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Final Amount</span>
                                    <span className="text-2xl font-black text-gray-900 font-head leading-none">₹{Number(o.totalPrice).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-12 flex flex-wrap gap-4 justify-end border-t border-gray-100 pt-8">
                            <button onClick={() => printInvoice(o)} disabled={printing === o._id}
                              className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                              <FiPrinter size={18} /> {printing === o._id ? 'Building PDF...' : 'Download Invoice'}
                            </button>
                            {canCancel(o) && (
                              <button onClick={() => setCancelModal(o)}
                                className="px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-black flex items-center gap-3 hover:bg-red-600 hover:text-white transition-all">
                                <FiX size={18} /> Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {cancelModal && (
          <CancelModal
            order={cancelModal}
            onClose={() => setCancelModal(null)}
            onConfirm={handleCancelOrder}
            loading={cancelLoading}
          />
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

export default Orders