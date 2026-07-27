import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage, FiCheckCircle, FiRefreshCw,
  FiX, FiSearch, FiChevronDown, FiAlertCircle, FiShield,
  FiCheckSquare, FiSquare
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import RestrictedAccess from '../../components/RestrictedAccess'

const fmtINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`

const AdminReturns = () => {
  const { hasPermission } = useAuth()
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [syncing, setSyncing] = useState(false)

  const [resolveModal, setResolveModal] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [resolveStatus, setResolveStatus] = useState('') // 'APPROVED' or 'REJECTED'

  useEffect(() => { 
    if (hasPermission('orders')) fetchReturns(true) 
  }, [hasPermission])

  const fetchReturns = async (showLoad = false) => {
    if (showLoad) setLoading(true); else setSyncing(true)
    try {
      const res = await api.get('/api/orders/admin/returns')
      setOrders(res.data)
    } catch { toast.error('Failed to load returns') }
    finally { setLoading(false); setSyncing(false) }
  }

  const handleResolve = async (e) => {
    e.preventDefault()
    setSyncing(true)
    try {
      await api.put(`/api/orders/${resolveModal._id}/return-status`, {
        status: resolveStatus,
        adminNote
      })
      toast.success(`Return ${resolveStatus.toLowerCase()} successfully`)
      setResolveModal(null)
      setAdminNote('')
      fetchReturns(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update return')
    } finally {
      setSyncing(false)
    }
  }

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase()
    return !q || o._id.toLowerCase().includes(q) || (o.user?.name || '').toLowerCase().includes(q)
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
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: 20 }} className="h-20 shimmer" />
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border mb-3"
                style={{ background: 'rgba(245,197,24,0.18)', color: 'var(--gold)', borderColor: 'rgba(245,197,24,0.35)' }}>
                <FiShield size={10} /> Admin Panel
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>Manage Returns</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <FiSearch size={14} style={{ color: 'rgba(255,255,255,0.55)' }} className="shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search returns…"
                  className="bg-transparent outline-none text-sm w-48" style={{ color: '#FFF', caretColor: 'var(--gold)', fontFamily: 'var(--font)' }} />
              </div>
              <button onClick={() => fetchReturns(true)} disabled={syncing}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.80)' }}>
                <FiRefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Return List */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '80px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)' }}>
              <FiRefreshCw size={28} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>No returns found</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {search ? `No results for "${search}"` : `All good! No return requests pending.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(o => {
              const isExp = expandedId === o._id
              const rStatus = o.returnRequest?.status || 'UNKNOWN'
              
              const statusColors = {
                PENDING: { color: 'var(--warning)', bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.25)' },
                APPROVED: { color: 'var(--success)', bg: 'rgba(56,161,105,0.08)', border: 'rgba(56,161,105,0.25)' },
                REJECTED: { color: 'var(--danger)', bg: 'rgba(229,62,62,0.08)', border: 'rgba(229,62,62,0.25)' }
              }
              const sColor = statusColors[rStatus] || statusColors.PENDING

              return (
                <div key={o._id} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: `1.5px solid ${isExp ? 'var(--brand-secondary)' : 'var(--border-color)'}`, boxShadow: 'var(--shadow-sm)', overflow: 'hidden', transition: 'all 0.2s' }}>
                  {/* Row */}
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    
                    <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpandedId(isExp ? null : o._id)}>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>#{o._id.slice(-8).toUpperCase()}</span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                          borderRadius: 99, fontSize: 11, fontWeight: 800, background: sColor.bg, color: sColor.color, border: `1.5px solid ${sColor.border}`
                        }}>
                          {rStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><FiAlertCircle size={11} style={{ color: 'var(--brand-secondary)' }} />Reason: {o.returnRequest?.reason}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
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
                            {/* Left: Return Details */}
                            <div>
                               <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Return Request Details</h4>
                               <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-[var(--border-color)]">
                                  <p className="text-sm font-semibold mb-1">Customer Reason:</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">{o.returnRequest?.reason}</p>
                                  <p className="text-xs text-gray-500 mt-2">Requested on: {new Date(o.returnRequest?.requestedAt).toLocaleString()}</p>
                                  
                                  {rStatus !== 'PENDING' && (
                                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                          <p className="text-sm font-semibold mb-1">Admin Note:</p>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">{o.returnRequest?.adminNote || 'No note provided.'}</p>
                                      </div>
                                  )}
                               </div>

                               {rStatus === 'PENDING' && (
                                   <div className="mt-4 flex gap-3">
                                       <button onClick={() => { setResolveModal(o); setResolveStatus('APPROVED') }} className="px-4 py-2 bg-[var(--success)] text-white rounded-lg text-sm font-bold flex-1 hover:opacity-90 transition-opacity">
                                           Approve Return
                                       </button>
                                       <button onClick={() => { setResolveModal(o); setResolveStatus('REJECTED') }} className="px-4 py-2 bg-[var(--danger)] text-white rounded-lg text-sm font-bold flex-1 hover:opacity-90 transition-opacity">
                                           Reject Return
                                       </button>
                                   </div>
                               )}
                            </div>
                            
                            {/* Right: Order Items */}
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
                                  </div>
                                ))}
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

      {/* Resolve Modal */}
      <AnimatePresence>
        {resolveModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(27,47,110,0.45)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 440, padding: 24, boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
                  {resolveStatus === 'APPROVED' ? 'Approve Return' : 'Reject Return'}
                </h3>
                <button onClick={() => setResolveModal(null)} style={{ padding: 8, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 8 }}><FiX size={16} /></button>
              </div>
              <form onSubmit={handleResolve} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Admin Note (Optional)</label>
                  <textarea 
                    value={adminNote} 
                    onChange={e=>setAdminNote(e.target.value)} 
                    placeholder="E.g. Refund initiated / Item not eligible" 
                    className="w-full p-3 border rounded-xl outline-none focus:ring-1 focus:ring-brand-secondary"
                    rows="3"
                  />
                </div>
                
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button type="button" onClick={() => setResolveModal(null)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  <button type="submit" disabled={syncing}
                    style={{ flex: 1.5, padding: '12px', background: resolveStatus === 'APPROVED' ? 'var(--success)' : 'var(--danger)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: syncing ? 0.7 : 1 }}>
                    {syncing ? 'Processing…' : `Confirm ${resolveStatus}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default AdminReturns
