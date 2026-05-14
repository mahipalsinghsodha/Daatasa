import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage, FiPrinter, FiChevronDown, FiMapPin, FiCalendar,
  FiCreditCard, FiCheckCircle, FiTruck, FiClock, FiShoppingBag,
  FiX, FiAlertCircle, FiRefreshCw, FiArrowRight, FiStar, FiHelpCircle
} from 'react-icons/fi'
import api from '../api/axios'

const getStatus = (order) => {
  if (order.isDelivered) return { label: 'Delivered', cls: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', icon: FiCheckCircle }
  if (order.paymentStatus === 'CANCELLED') return { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400', icon: FiX }
  if (order.paymentStatus === 'FAILED') return { label: 'Failed', cls: 'bg-red-100 text-red-600 border-red-200', dot: 'bg-red-500', icon: FiAlertCircle }
  if (order.paymentStatus === 'EXPIRED') return { label: 'Expired', cls: 'bg-gray-100 text-gray-400 border-gray-200', dot: 'bg-gray-300', icon: FiClock }
  if (order.isPaid) return { label: 'Processing', cls: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: FiTruck }
  if (order.paymentStatus === 'COD_CONFIRMED') return { label: 'Confirmed', cls: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: FiClock }
  return { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: FiClock }
}


const StatusBadge = ({ order }) => {
  const s = getStatus(order)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
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
          className={n <= value
            ? 'text-orange-400 fill-orange-400'
            : 'text-gray-200 hover:text-orange-300 transition-colors'}
          style={{ fill: n <= value ? '#fb923c' : 'none' }}
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.93, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Rate Your Purchase
              </h2>
              <p className="text-xs text-gray-400 truncate max-w-[180px]">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Rating</label>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-semibold text-orange-500 mt-2"
              >
                {LABELS[rating]}
              </motion.p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Review</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What did you think about this product? Quality, taste, packaging..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none
                focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none
                placeholder:text-gray-300"
            />
            <p className="text-[11px] text-gray-400 mt-1">{comment.length}/500 characters</p>
          </div>

          {/* Verified badge note */}
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
            <FiCheckCircle size={13} className="text-green-600 shrink-0" />
            <p className="text-xs text-green-700">Your review will be marked as <strong>Verified Purchase</strong></p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-orange-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FiX size={18} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Cancel Order?</h2>
                <p className="text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
              <FiX size={18} />
            </button>
          </div>

          {willRefund && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-100 rounded-xl flex items-start gap-2.5">
              <FiRefreshCw size={14} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-green-700">A full refund of ₹{Number(order.totalPrice).toFixed(2)} will be initiated to your original payment method.</p>
            </div>
          )}

          <div className="space-y-2 mb-5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Reason for cancellation</label>
            {REASONS.map(r => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`w-full p-3 rounded-lg text-left text-sm font-medium transition-all border ${
                  reason === r ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClose} className="py-3 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
              Keep Order
            </button>
            <button
              disabled={loading || !reason}
              onClick={() => onConfirm(reason)}
              className="py-3 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-all"
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <FiRefreshCw size={18} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Request Return</h2>
                <p className="text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
              <FiX size={18} />
            </button>
          </div>

          <div className="mb-4 p-3.5 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-2.5">
            <FiAlertCircle size={14} className="text-orange-600 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-800">Return requests must be submitted within 7 days of delivery. Once approved, our delivery executive will pick up the item.</p>
          </div>

          <div className="space-y-2 mb-5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Reason for Return</label>
            {REASONS.map(r => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`w-full p-3 rounded-lg text-left text-sm font-medium transition-all border ${
                  reason === r ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClose} className="py-3 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              disabled={loading || !reason}
              onClick={() => onConfirm(reason)}
              className="py-3 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-orange-500 disabled:opacity-50 transition-all"
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
    <div style="display:flex;justify-content:space-between;margin-bottom:32px;border-bottom:2px solid #f97316;padding-bottom:16px">
      <div><h1 style="color:#f97316;margin:0">DhaniFresh</h1><p style="color:#6b7280;margin:4px 0">Pure & Natural Ghee</p></div>
      <div style="text-align:right"><h2 style="margin:0">INVOICE</h2><p style="color:#f97316;font-weight:bold;margin:4px 0">#${(inv.invoiceNumber || order._id.slice(-10)).toUpperCase()}</p></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:32px">
      <div><p style="font-size:11px;color:#9ca3af;font-weight:bold;margin-bottom:6px">BILL TO</p><strong>${cust.name || ''}</strong><br/>${cust.email || ''}<br/>${addr.street || ''}<br/>${addr.city || ''}, ${addr.state || ''}</div>
      <div style="text-align:right"><p style="font-size:11px;color:#9ca3af;font-weight:bold;margin-bottom:6px">DATE</p>${new Date(order.createdAt).toLocaleDateString()}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:32px">
      <thead><tr style="background:#f9fafb"><th style="padding:10px;text-align:left">Item</th><th style="padding:10px">Qty</th><th style="padding:10px;text-align:right">Price</th><th style="padding:10px;text-align:right">Total</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot style="border-top:1px solid #e5e7eb"><tr><td></td><td></td><td style="padding:10px;text-align:right">Subtotal</td><td style="padding:10px;text-align:right">₹${sub}</td></tr>${discountRow}<tr><td></td><td></td><td style="padding:10px;text-align:right">Tax</td><td style="padding:10px;text-align:right">₹${tax}</td></tr><tr><td></td><td></td><td style="padding:10px;text-align:right;color:#f97316;font-weight:bold">Total</td><td style="padding:10px;text-align:right;color:#f97316;font-weight:bold">₹${tot}</td></tr></tfoot>
    </table></div>`
}

const Orders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders,        setOrders]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [expanded,      setExpanded]      = useState(null)
  const [printing,      setPrinting]      = useState(null)
  const [filter,        setFilter]        = useState('all')
  const [cancelModal,   setCancelModal]   = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [returnModal,   setReturnModal]   = useState(null)
  const [returnLoading, setReturnLoading] = useState(false)
  // Review modal state
  const [reviewModal,   setReviewModal]   = useState(null)  // { product, name, image }
  // Track which productIds have already been reviewed (per session)
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
    <div className="min-h-screen pb-20" style={{ background: '#f8f9fa' }}>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="h-5 w-24 bg-gray-100 rounded-full mb-3 animate-pulse" />
          <div className="h-9 w-56 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
            <div className="flex gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="h-5 w-20 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-20" style={{ background: '#f8f9fa' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-3">My Orders</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>Order History</h1>
              <p className="text-sm text-gray-500 mt-1">Track and manage your purchases</p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-400 mb-1">Total Spent</p>
              <p className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
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
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f.id ? 'bg-gray-900 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
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
            className="py-24 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center text-center p-10"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
              <FiPackage size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No orders found</h2>
            <p className="text-sm text-gray-400 max-w-xs mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Link to="/products" className="px-6 py-3 bg-gray-900 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-all inline-flex items-center gap-2">
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
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${isExp ? 'border-gray-900' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  {/* Order Row */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <span className="text-sm font-bold text-gray-900">#{o._id.slice(-8).toUpperCase()}</span>
                        <StatusBadge order={o} />
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{o.paymentMethod}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
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
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-0.5">Total</p>
                        <p className={`text-lg font-extrabold ${o.paymentStatus === 'CANCELLED' ? 'text-gray-300 line-through' : 'text-gray-900'}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          ₹{Number(o.totalPrice).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpanded(isExp ? null : o._id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${isExp ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
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
                        <div className="p-5 sm:p-6 border-t border-gray-50 bg-gray-50/50">
                          <div className="grid lg:grid-cols-2 gap-6">
                            {/* Items */}
                            <div>
                              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
                              <div className="space-y-2">
                                {o.orderItems.map(item => {
                                  // Safely resolve product ID whether it's a string or populated object
                                  const productId = String(item.product?._id || item.product || '')
                                  const alreadyReviewed = reviewedIds.has(productId)
                                  return (
                                    <div key={item._id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-400 mb-1.5">{item.quantity} × ₹{item.price}</p>
                                        {/* Rate button — only for delivered orders */}
                                        {o.isDelivered && (
                                          alreadyReviewed ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
                                              <FiCheckCircle size={11} /> Reviewed
                                            </span>
                                          ) : (
                                            <button
                                              onClick={() => setReviewModal({ productId, name: item.name, image: item.image })}
                                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                                            >
                                              <FiStar size={11} /> Rate this product
                                            </button>
                                          )
                                        )}
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 shrink-0">₹{(item.quantity * item.price).toLocaleString('en-IN')}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                              {/* Tracking Timeline */}
                              <div className="bg-white p-4 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2"><FiTruck size={13} className="text-orange-500" /> Order Status</h4>
                                <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pb-2">
                                  <div className="relative pl-6">
                                    <div className="absolute w-4 h-4 bg-orange-500 rounded-full border-4 border-white -left-[9px] top-0 shadow-sm" />
                                    <p className="text-sm font-bold text-gray-900">Order Placed</p>
                                    <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                  </div>
                                  {(o.isPaid || o.paymentStatus === 'COD_CONFIRMED') && !['CANCELLED', 'FAILED'].includes(o.paymentStatus) && (
                                    <div className="relative pl-6">
                                      <div className="absolute w-4 h-4 bg-orange-500 rounded-full border-4 border-white -left-[9px] top-0 shadow-sm" />
                                      <p className="text-sm font-bold text-gray-900">{o.isPaid ? 'Payment Received' : 'Order Confirmed'}</p>
                                      <p className="text-xs text-gray-400">{o.isPaid ? new Date(o.paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Processing order'}</p>
                                    </div>
                                  )}
                                  {o.isDelivered && (
                                    <div className="relative pl-6">
                                      <div className="absolute w-4 h-4 bg-green-500 rounded-full border-4 border-white -left-[9px] top-0 shadow-sm" />
                                      <p className="text-sm font-bold text-green-600">Delivered</p>
                                      <p className="text-xs text-gray-400">{new Date(o.deliveredAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                  )}
                                  {['CANCELLED', 'FAILED'].includes(o.paymentStatus) && (
                                    <div className="relative pl-6">
                                      <div className="absolute w-4 h-4 bg-red-500 rounded-full border-4 border-white -left-[9px] top-0 shadow-sm" />
                                      <p className="text-sm font-bold text-red-600">Cancelled / Failed</p>
                                      <p className="text-xs text-gray-400">{o.cancelReason || 'Order cancelled'}</p>
                                    </div>
                                  )}
                                  {o.returnRequest && (
                                    <div className="relative pl-6">
                                      <div className="absolute w-4 h-4 bg-purple-500 rounded-full border-4 border-white -left-[9px] top-0 shadow-sm" />
                                      <p className="text-sm font-bold text-purple-600">Return {o.returnRequest.status}</p>
                                      <p className="text-xs text-gray-400">{o.returnRequest.reason}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Delivery Address */}
                              <div className="bg-white p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                  <FiMapPin size={13} className="text-orange-500" />
                                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Delivery Address</h4>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {o.shippingAddress.name && <strong className="block text-gray-900">{o.shippingAddress.name}</strong>}
                                  {o.shippingAddress.street}, {o.shippingAddress.city}<br />
                                  {o.shippingAddress.state} – {o.shippingAddress.zipCode}
                                </p>
                              </div>

                              {/* Price Breakdown */}
                              <div className="bg-white p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                  <FiCreditCard size={13} className="text-orange-500" />
                                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Price Details</h4>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">₹{Number(o.itemsPrice).toLocaleString('en-IN')}</span></div>
                                  {o.discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount</span><span className="text-green-600">-₹{Number(o.discount).toLocaleString('en-IN')}</span></div>}
                                  <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span className={o.shippingPrice === 0 ? 'text-green-600' : 'text-gray-900'}>{o.shippingPrice === 0 ? 'FREE' : `₹${o.shippingPrice}`}</span></div>
                                  <div className="flex justify-between pt-2 border-t border-gray-50">
                                    <span className="text-sm font-bold text-gray-900">Total</span>
                                    <span className="text-sm font-bold text-gray-900">₹{Number(o.totalPrice).toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-5 flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-100">
                            <Link
                              to={`/support?orderId=${o._id}`}
                              className="px-5 py-2.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
                            >
                              <FiHelpCircle size={15} /> Need Help?
                            </Link>
                            {(!['PENDING', 'CANCELLED', 'FAILED'].includes(o.paymentStatus)) && (
                              <button
                                onClick={() => printInvoice(o)}
                                disabled={printing === o._id}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                              >
                                <FiPrinter size={15} /> {printing === o._id ? 'Preparing...' : 'Download Invoice'}
                              </button>
                            )}
                            {canReturn(o) && (
                              <button
                                onClick={() => setReturnModal(o)}
                                className="px-5 py-2.5 bg-white text-orange-600 border border-orange-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-orange-50 transition-all"
                              >
                                <FiRefreshCw size={15} /> Request Return
                              </button>
                            )}
                            {canCancel(o) && (
                              <button
                                onClick={() => setCancelModal(o)}
                                className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
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