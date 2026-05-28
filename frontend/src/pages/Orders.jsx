import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage, FiPrinter, FiChevronDown, FiMapPin, FiCalendar,
  FiCreditCard, FiCheckCircle, FiTruck, FiClock, FiShoppingBag,
  FiX, FiAlertCircle, FiRefreshCw, FiArrowRight, FiStar, FiHelpCircle, FiRotateCcw
} from 'react-icons/fi'
import api from '../api/axios'
import { useCart } from '../context/CartContext'

const getStatus = (order) => {
  if (order.isDelivered) return { label: 'Delivered', cls: 'badge-success', icon: FiCheckCircle }
  if (order.paymentStatus === 'CANCELLED') return { label: 'Cancelled', cls: 'badge-muted', icon: FiX }
  if (order.paymentStatus === 'FAILED') return { label: 'Failed', cls: 'badge-danger', icon: FiAlertCircle }
  if (order.paymentStatus === 'EXPIRED') return { label: 'Expired', cls: 'badge-muted', icon: FiClock }
  if (order.isPaid) return { label: 'Processing', cls: 'badge-info', icon: FiTruck }
  if (order.paymentStatus === 'COD_CONFIRMED') return { label: 'Confirmed', cls: 'badge-info', icon: FiClock }
  return { label: 'Pending', cls: 'badge-warning', icon: FiClock }
}

const StatusBadge = ({ order }) => {
  const s = getStatus(order)
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

// ── Star picker (interactive) ────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1.5">
    {[1,2,3,4,5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="transition-transform hover:scale-110 focus:outline-none"
      >
        <FiStar
          size={28}
          style={{
            color: n <= value ? 'var(--brand-primary)' : 'var(--border-color)',
            fill: n <= value ? 'var(--brand-primary)' : 'none',
            transition: 'all 0.15s ease'
          }}
        />
      </button>
    ))}
  </div>
)

// ── Review Modal ──────────────────────────────────────────────────────────────
const ReviewModal = ({ item, onClose, onSubmitted }) => {
  const [rating,      setRating]      = useState(0)
  const [comment,     setComment]     = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0)        { toast.error('Please select a star rating'); return }
    if (!comment.trim())     { toast.error('Please write your review'); return }
    setSubmitting(true)
    try {
      await api.post(`/api/products/${item.productId}/reviews`, { rating, comment })
      toast.success('🎉 Review submitted! Thank you.')
      onSubmitted(item.productId)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 40 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.96, opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="modal-box sm:rounded-3xl rounded-t-3xl w-full sm:max-w-md overflow-hidden"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-color)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 sm:pt-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0" style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color)' }}>
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                Rate Your Purchase
              </h2>
              <p className="text-xs truncate max-w-[180px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Your Rating</label>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <motion.p
                key={rating}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-bold mt-2" style={{ color: 'var(--brand-secondary)' }}
              >
                {LABELS[rating]} ✦
              </motion.p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Your Review</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What did you think? Quality, taste, packaging..."
              className="textarea-base"
            />
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{comment.length}/500 characters</p>
          </div>

          {/* Verified badge note */}
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <FiCheckCircle size={14} style={{ color: 'var(--success)' }} className="shrink-0" />
            <p className="text-xs" style={{ color: 'var(--success)' }}>Your review will be marked as <strong>Verified Purchase ✓</strong></p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary justify-center">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary justify-center">
              {submitting
                ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                : <FiStar size={14} />
              }
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const CancelModal = ({ order, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('')
  const REASONS = ['Changed my mind', 'Ordered by mistake', 'Found a better deal', 'Other']
  const willRefund = order.paymentStatus === 'PAID' && order.paymentMethod === 'Online'

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="modal-box w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.10)', color: 'var(--danger)' }}>
                <FiX size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Cancel Order?</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>#{order._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon">
              <FiX size={18} />
            </button>
          </div>

          {willRefund && (
            <div className="mb-4 p-3.5 rounded-xl flex items-start gap-2.5"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <FiRefreshCw size={14} style={{ color: 'var(--success)' }} className="shrink-0 mt-0.5" />
              <p className="text-xs" style={{ color: 'var(--success)' }}>A full refund of ₹{Number(order.totalPrice).toFixed(2)} will be initiated to your original payment method.</p>
            </div>
          )}

          <div className="space-y-2 mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Reason for cancellation</label>
            {REASONS.map(r => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className="w-full p-3 rounded-lg text-left text-sm font-medium transition-all"
                style={reason === r
                  ? { background: 'rgba(245,197,24,0.10)', color: 'var(--brand-secondary)', border: '1px solid rgba(245,197,24,0.35)' }
                  : { background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                }
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClose} className="btn-secondary justify-center">
              Keep Order
            </button>
            <button
              disabled={loading || !reason}
              onClick={() => onConfirm(reason)}
              className="btn-danger justify-center font-semibold"
              style={{ height: '48px' }}
            >
              {loading ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const ReturnModal = ({ order, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('')
  const REASONS = ['Defective/Damaged product', 'Quality not as expected', 'Received wrong item', 'Item arrived too late', 'Other']

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="modal-box w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,197,24,0.10)', color: 'var(--brand-secondary)' }}>
                <FiRefreshCw size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Request Return</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>#{order._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon">
              <FiX size={18} />
            </button>
          </div>

          <div className="mb-4 p-3.5 rounded-xl flex items-start gap-2.5"
            style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.15)' }}>
            <FiAlertCircle size={14} style={{ color: 'var(--brand-secondary)' }} className="shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Return requests must be submitted within 7 days of delivery. Once approved, our delivery executive will pick up the item.</p>
          </div>

          <div className="space-y-2 mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Reason for Return</label>
            {REASONS.map(r => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className="w-full p-3 rounded-lg text-left text-sm font-medium transition-all"
                style={reason === r
                  ? { background: 'rgba(245,197,24,0.10)', color: 'var(--brand-secondary)', border: '1px solid rgba(245,197,24,0.35)' }
                  : { background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                }
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClose} className="btn-secondary justify-center">
              Cancel
            </button>
            <button
              disabled={loading || !reason}
              onClick={() => onConfirm(reason)}
              className="btn-primary justify-center"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const buildInvoiceHTML = (inv, order) => {
  const items = (inv.items || order.orderItems || []).map(i =>
    `<tr><td style="padding:10px">${i.name}</td><td style="padding:10px;text-align:center">${i.quantity}</td>
    <td style="padding:10px;text-align:right">₹${Number(i.price).toFixed(2)}</td>
    <td style="padding:10px;text-align:right">₹${(i.price * i.quantity).toFixed(2)}</td></tr>`).join('')
  const sub = Number(inv.subtotal ?? order.itemsPrice ?? 0).toFixed(2)
  const discount = Number(order.discount ?? 0)
  const tax = Number(inv.tax ?? order.taxPrice ?? 0).toFixed(2)
  const ship = Number(inv.shipping ?? order.shippingPrice ?? 0).toFixed(2)
  const tot = Number(inv.total ?? order.totalPrice ?? 0).toFixed(2)
  const cust = inv.customer || { name: '', email: '', address: {} }
  const addr = cust.address || order.shippingAddress || {}
  const discountRow = discount > 0 ? `<tr><td colspan="3" style="color:#10b981">Discount</td><td style="color:#10b981">-₹${discount.toFixed(2)}</td></tr>` : ''
  return `<div style="max-width:760px;margin:0 auto;padding:40px;font-family:sans-serif;color:#111827">
    <div style="display:flex;justify-content:space-between;margin-bottom:32px;border-bottom:2px solid #E6A800;padding-bottom:16px">
      <div><h1 style="color:#E6A800;margin:0">DhaniFresh</h1><p style="color:#6b7280;margin:4px 0">Pure & Natural Ghee</p></div>
      <div style="text-align:right"><h2 style="margin:0">INVOICE</h2><p style="color:#E6A800;font-weight:bold;margin:4px 0">#${(inv.invoiceNumber || order._id.slice(-10)).toUpperCase()}</p></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:32px">
      <div><p style="font-size:11px;color:#9ca3af;font-weight:bold;margin-bottom:6px">BILL TO</p><strong>${cust.name || ''}</strong><br/>${cust.email || ''}<br/>${addr.street || ''}<br/>${addr.city || ''}, ${addr.state || ''}</div>
      <div style="text-align:right"><p style="font-size:11px;color:#9ca3af;font-weight:bold;margin-bottom:6px">DATE</p>${new Date(order.createdAt).toLocaleDateString()}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:32px">
      <thead><tr style="background:#f9fafb"><th style="padding:10px;text-align:left">Item</th><th style="padding:10px">Qty</th><th style="padding:10px;text-align:right">Price</th><th style="padding:10px;text-align:right">Total</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot style="border-top:1px solid #e5e7eb"><tr><td></td><td></td><td style="padding:10px;text-align:right">Subtotal</td><td style="padding:10px;text-align:right">₹${sub}</td></tr>${discountRow}<tr><td></td><td></td><td style="padding:10px;text-align:right">Tax</td><td style="padding:10px;text-align:right">₹${tax}</td></tr><tr><td></td><td></td><td style="padding:10px;text-align:right;color:#E6A800;font-weight:bold">Total</td><td style="padding:10px;text-align:right;color:#E6A800;font-weight:bold">₹${tot}</td></tr></tfoot>
    </table></div>`
}

const Orders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { fetchCartCount } = useCart()
  const [orders,        setOrders]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [expanded,      setExpanded]      = useState(null)
  const [printing,      setPrinting]      = useState(null)
  const [reordering,    setReordering]    = useState(null)
  const [filter,        setFilter]        = useState('all')
  const [cancelModal,   setCancelModal]   = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [returnModal,   setReturnModal]   = useState(null)
  const [returnLoading, setReturnLoading] = useState(false)
  const [reviewModal,   setReviewModal]   = useState(null)
  const [reviewedIds,   setReviewedIds]   = useState(new Set())

  useEffect(() => { if (user) fetchOrders() }, [user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/orders/myorders')
      setOrders(res.data)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  const printInvoice = async (order) => {
    setPrinting(order._id)
    try {
      let inv = {}
      try { const res = await api.get(`/api/invoices/${order._id}`); inv = res.data } catch {}
      const html = buildInvoiceHTML(inv, order)
      const win = window.open('', '_blank')
      win.document.write(`<!DOCTYPE html><html><head><title>Invoice</title></head><body onload="window.print()">${html}</body></html>`)
      win.document.close()
    } catch { toast.error('Print failed') }
    finally { setPrinting(null) }
  }

  const handleCancelOrder = async (reason) => {
    setCancelLoading(true)
    try {
      await api.post(`/api/orders/${cancelModal._id}/cancel`, { reason })
      toast.success('Order cancelled')
      setCancelModal(null)
      fetchOrders()
    } catch { toast.error('Cancellation failed') }
    finally { setCancelLoading(false) }
  }

  const handleReturnRequest = async (reason) => {
    setReturnLoading(true)
    try {
      await api.post(`/api/orders/${returnModal._id}/return-request`, { reason })
      toast.success('Return request submitted')
      setReturnModal(null)
      fetchOrders()
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to submit return request') }
    finally { setReturnLoading(false) }
  }

  // ✅ P1: Reorder — add all items back to cart in one click
  const handleReorder = async (order) => {
    setReordering(order._id)
    let added = 0
    try {
      for (const item of order.orderItems) {
        const productId = String(item.product?._id || item.product)
        try {
          await api.post('/api/cart/items', { productId, quantity: item.quantity })
          added++
        } catch {} // skip unavailable items silently
      }
      await fetchCartCount()
      if (added > 0) {
        toast.success(`${added} item${added !== 1 ? 's' : ''} added to cart!`)
        navigate('/cart')
      } else {
        toast.error('Could not reorder — some items may be out of stock')
      }
    } catch {
      toast.error('Reorder failed. Please try again.')
    } finally {
      setReordering(null)
    }
  }

  const canCancel = (o) => !o.isDelivered && !['CANCELLED', 'FAILED'].includes(o.paymentStatus)
  const canReturn = (o) => o.isDelivered && !o.returnRequest && (Date.now() - new Date(o.deliveredAt).getTime()) / (1000 * 60 * 60 * 24) <= 7

  const visible = orders.filter(o => {
    if (filter === 'all') return true
    if (filter === 'pending') return !o.isPaid && !o.isDelivered && !['CANCELLED', 'FAILED'].includes(o.paymentStatus)
    if (filter === 'paid') return o.isPaid && !o.isDelivered
    if (filter === 'delivered') return o.isDelivered
    if (filter === 'cancelled') return ['CANCELLED', 'FAILED'].includes(o.paymentStatus)
    return true
  })

  // Guard: redirect unauthenticated users BEFORE any early returns (React hooks rule)
  if (!user && !loading) return (navigate('/login', { state: { from: '/orders' } }) || null)

  if (loading) return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-base)' }}>
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="h-5 w-24 skeleton rounded-full mb-3" />
          <div className="h-9 w-56 skeleton rounded-lg" />
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-32 skeleton rounded" />
              <div className="h-6 w-20 skeleton rounded-full" />
            </div>
            <div className="flex gap-3">
              <div className="w-14 h-14 skeleton rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton rounded w-2/3" />
                <div className="h-3 skeleton rounded w-1/3" />
              </div>
              <div className="h-5 w-20 skeleton rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-base)' }}>
      <Helmet>
        <title>My Orders — DhaniFresh</title>
        <meta name="description" content="Track and manage your DhaniFresh orders. View order history, cancel, return, or reorder with one click." />
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full border mb-3"
                style={{ background: 'rgba(245,197,24,0.10)', color: 'var(--brand-secondary)', borderColor: 'rgba(245,197,24,0.25)' }}>My Orders</span>
              <h1 className="text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>Order History</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track and manage your purchases</p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Spent</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                ₹{orders.reduce((acc, o) => acc + (o.paymentStatus !== 'CANCELLED' ? o.totalPrice : 0), 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Pending' },
              { id: 'paid', label: 'Processing' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`chip ${filter === f.id ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 rounded-2xl flex flex-col items-center text-center p-10"
            style={{ background: 'var(--bg-card)', border: '2px dashed var(--border-color)' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
              <FiPackage size={24} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No orders found</h2>
            <p className="text-sm max-w-xs mb-6" style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Link to="/products" className="btn-primary text-[13.5px]">
              Browse Products <FiArrowRight size={14} />
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((o, i) => {
              const isExp = expanded === o._id
              return (
                <motion.div
                  key={o._id}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl transition-all duration-200 overflow-hidden"
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${isExp ? 'var(--brand-secondary)' : 'var(--border-color)'}`,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Order Row */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>#{o._id.slice(-8).toUpperCase()}</span>
                        <StatusBadge order={o} />
                        <span className="badge badge-muted text-[11px]">{o.paymentMethod}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1.5">
                          <FiCalendar size={11} />
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiPackage size={11} />
                          {o.orderItems.length} item{o.orderItems.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {['COD_CONFIRMED', 'PAID'].includes(o.paymentStatus) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReorder(o) }}
                          disabled={reordering === o._id}
                          className="hidden sm:flex btn-secondary text-[12px]"
                          style={{ height: '36px', padding: '0 14px' }}
                        >
                          {reordering === o._id ? (
                            <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : (
                            <FiRotateCcw size={12} />
                          )}
                          Buy Again
                        </button>
                      )}
                      <div className="text-right">
                        <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Total</p>
                        <p className="text-lg font-bold" style={{
                          color: o.paymentStatus === 'CANCELLED' ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: o.paymentStatus === 'CANCELLED' ? 'line-through' : 'none'
                        }}>
                          ₹{Number(o.totalPrice).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpanded(isExp ? null : o._id)}
                        className="btn-icon"
                        style={isExp ? { background: 'var(--brand-gradient)', color: 'var(--brand-text)', borderColor: 'transparent' } : {}}
                      >
                        <motion.div animate={{ rotate: isExp ? 180 : 0 }}><FiChevronDown size={16} /></motion.div>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExp && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 sm:p-6" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-base)' }}>
                          <div className="grid lg:grid-cols-2 gap-6">
                            {/* Items */}
                            <div>
                              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Order Items</h3>
                              <div className="space-y-2">
                                {o.orderItems.map(item => {
                                  const productId = String(item.product?._id || item.product || '')
                                  const alreadyReviewed = reviewedIds.has(productId)
                                  return (
                                    <div key={item._id} className="flex items-start gap-3 p-3 rounded-xl"
                                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--bg-base)' }}>
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                                        <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{item.quantity} × ₹{item.price}</p>
                                        {o.isDelivered && (
                                          alreadyReviewed ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--success)' }}>
                                              <FiCheckCircle size={11} /> Reviewed
                                            </span>
                                          ) : (
                                            <button
                                              onClick={() => setReviewModal({ productId, name: item.name, image: item.image })}
                                              className="inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
                                              style={{ color: 'var(--brand-secondary)' }}
                                            >
                                              <FiStar size={11} /> Rate this product
                                            </button>
                                          )
                                        )}
                                      </div>
                                      <span className="text-sm font-bold shrink-0" style={{ color: 'var(--text-primary)' }}>₹{(item.quantity * item.price).toLocaleString('en-IN')}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                              {/* Tracking Timeline */}
                              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                <h4 className="text-xs font-semibold uppercase tracking-wide mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                  <FiTruck size={13} style={{ color: 'var(--brand-secondary)' }} /> Order Tracking
                                </h4>

                                {/* Progress bar */}
                                {!['CANCELLED', 'FAILED'].includes(o.paymentStatus) && (() => {
                                  const steps = [1, 2, 3, 4]
                                  const current = o.isDelivered ? 4 : (o.isPaid || o.paymentStatus === 'COD_CONFIRMED') ? 2 : 1
                                  return (
                                    <div className="flex items-center gap-0 mb-5">
                                      {steps.map((s, i) => (
                                        <div key={s} className="flex items-center flex-1">
                                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 transition-all"
                                            style={s <= current
                                              ? { background: 'var(--brand-gradient)', borderColor: 'var(--brand-primary)', color: 'var(--brand-text)' }
                                              : { background: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }
                                            }>
                                            {s <= current ? '✓' : s}
                                          </div>
                                          {i < steps.length - 1 && (
                                            <div className="flex-1 h-0.5" style={{ background: s < current ? 'var(--brand-primary)' : 'var(--border-color)' }} />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )
                                })()}

                                <div className="relative ml-3 space-y-5 pb-2" style={{ borderLeft: '2px solid var(--border-color)' }}>
                                  <div className="relative pl-6">
                                    <div className="absolute w-4 h-4 rounded-full border-4 -left-[9px] top-0"
                                      style={{ background: 'var(--brand-primary)', borderColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }} />
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Order Placed</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                  </div>
                                  {(o.isPaid || o.paymentStatus === 'COD_CONFIRMED') && !['CANCELLED', 'FAILED'].includes(o.paymentStatus) && (
                                    <div className="relative pl-6">
                                      <div className="absolute w-4 h-4 rounded-full border-4 -left-[9px] top-0"
                                        style={{ background: 'var(--brand-primary)', borderColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }} />
                                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{o.isPaid ? 'Payment Confirmed' : 'Order Confirmed (COD)'}</p>
                                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.isPaid ? new Date(o.paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Your order is being prepared'}</p>
                                    </div>
                                  )}
                                  {(o.isPaid || o.paymentStatus === 'COD_CONFIRMED') && !o.isDelivered && !['CANCELLED', 'FAILED'].includes(o.paymentStatus) && (
                                    <div className="relative pl-6">
                                      <div className="absolute w-4 h-4 rounded-full border-4 -left-[9px] top-0 animate-pulse"
                                        style={{ background: 'var(--info)', borderColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }} />
                                      <p className="text-sm font-bold" style={{ color: 'var(--info)' }}>In Transit</p>
                                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your package is on its way</p>
                                    </div>
                                  )}
                                  {o.isDelivered && (
                                    <div className="relative pl-6">
                                      <div className="absolute w-4 h-4 rounded-full border-4 -left-[9px] top-0"
                                        style={{ background: 'var(--success)', borderColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }} />
                                      <p className="text-sm font-bold" style={{ color: 'var(--success)' }}>Delivered ✓</p>
                                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(o.deliveredAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                  )}
                                  {['CANCELLED', 'FAILED'].includes(o.paymentStatus) && (
                                    <div className="relative pl-6">
                                      <div className="absolute w-4 h-4 rounded-full border-4 -left-[9px] top-0"
                                        style={{ background: 'var(--danger)', borderColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }} />
                                      <p className="text-sm font-bold" style={{ color: 'var(--danger)' }}>Cancelled / Failed</p>
                                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.cancelReason || 'Order cancelled'}</p>
                                    </div>
                                  )}
                                  {o.returnRequest && (
                                    <div className="relative pl-6">
                                      <div className="absolute w-4 h-4 rounded-full border-4 -left-[9px] top-0"
                                        style={{ background: '#8B5CF6', borderColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }} />
                                      <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>Return {o.returnRequest.status}</p>
                                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.returnRequest.reason}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Delivery Address */}
                              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                <div className="flex items-center gap-2 mb-3">
                                  <FiMapPin size={13} style={{ color: 'var(--brand-secondary)' }} />
                                  <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Delivery Address</h4>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                  {o.shippingAddress.name && <strong style={{ color: 'var(--text-primary)' }} className="block">{o.shippingAddress.name}</strong>}
                                  {o.shippingAddress.street}, {o.shippingAddress.city}<br />
                                  {o.shippingAddress.state} – {o.shippingAddress.zipCode}
                                </p>
                              </div>

                              {/* Price Breakdown */}
                              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                <div className="flex items-center gap-2 mb-3">
                                  <FiCreditCard size={13} style={{ color: 'var(--brand-secondary)' }} />
                                  <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Price Details</h4>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span style={{ color: 'var(--text-primary)' }}>₹{Number(o.itemsPrice).toLocaleString('en-IN')}</span></div>
                                  {o.discount > 0 && <div className="flex justify-between text-sm"><span style={{ color: 'var(--success)' }}>Discount</span><span style={{ color: 'var(--success)' }}>-₹{Number(o.discount).toLocaleString('en-IN')}</span></div>}
                                  <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-muted)' }}>Shipping</span><span style={{ color: o.shippingPrice === 0 ? 'var(--success)' : 'var(--text-primary)' }}>{o.shippingPrice === 0 ? 'FREE' : `₹${o.shippingPrice}`}</span></div>
                                  <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹{Number(o.totalPrice).toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-5 flex flex-wrap gap-3 justify-end pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                            {/* Reorder button */}
                            {['COD_CONFIRMED', 'PAID'].includes(o.paymentStatus) && (
                              <button
                                onClick={() => handleReorder(o)}
                                disabled={reordering === o._id}
                                className="btn-primary text-sm"
                              >
                                {reordering === o._id
                                  ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                  : <FiRotateCcw size={14} />}
                                {reordering === o._id ? 'Adding...' : 'Reorder'}
                              </button>
                            )}
                            <Link
                              to={`/support?orderId=${o._id}`}
                              className="btn-secondary text-sm"
                            >
                              <FiHelpCircle size={15} /> Need Help?
                            </Link>
                            {(!['PENDING', 'CANCELLED', 'FAILED'].includes(o.paymentStatus)) && (
                              <button
                                onClick={() => printInvoice(o)}
                                disabled={printing === o._id}
                                className="btn-secondary text-sm"
                              >
                                <FiPrinter size={15} /> {printing === o._id ? 'Preparing...' : 'Download Invoice'}
                              </button>
                            )}
                            {canReturn(o) && (
                              <button
                                onClick={() => setReturnModal(o)}
                                className="btn-secondary text-sm"
                              >
                                <FiRefreshCw size={15} /> Request Return
                              </button>
                            )}
                            {canCancel(o) && (
                              <button
                                onClick={() => setCancelModal(o)}
                                className="btn-danger text-sm"
                              >
                                <FiX size={15} /> Cancel Order
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

      <AnimatePresence>
        {returnModal && (
          <ReturnModal
            order={returnModal}
            onClose={() => setReturnModal(null)}
            onConfirm={handleReturnRequest}
            loading={returnLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reviewModal && (
          <ReviewModal
            item={reviewModal}
            onClose={() => setReviewModal(null)}
            onSubmitted={(productId) => {
              setReviewedIds(prev => new Set(prev).add(String(productId)))
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Orders