import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers, FiSearch, FiLock, FiUnlock, FiX,
  FiShoppingBag, FiDollarSign, FiShield, FiMail,
  FiPhone, FiCalendar, FiChevronRight, FiRefreshCw,
  FiUserCheck, FiSlash, FiUser
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
  text: '#0f172a',
  textMid: '#475569',
  textDim: '#94a3b8',
  font: '"Inter", "DM Sans", sans-serif',
}

// ── Shared Components ────────────────────────────────────────────────────────
const Badge = ({ color, bg, children }) => (
  <span style={{
    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.04em',
    color, background: bg, display: 'inline-block'
  }}>{children}</span>
)

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    background: T.surface, border: `1.5px solid ${T.border}`,
    padding: '16px 20px', borderRadius: 16, flex: 1, minWidth: 200,
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color
    }}>
      <Icon size={20} />
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>{value}</div>
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AdminUsers = () => {
  const { user, hasPermission } = useAuth()
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => { 
    if (hasPermission('users')) fetchAllData() 
  }, [hasPermission])

  const fetchAllData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true)
      const token = localStorage.getItem('token')
      const h = { Authorization: `Bearer ${token}` }
      const [uRes, oRes] = await Promise.all([
        api.get('/api/auth/users', { headers: h }),
        api.get('/api/orders', { headers: h })
      ])
      setUsers(uRes.data || [])
      setOrders(oRes.data?.orders || [])
    } catch (e) {
      toast.error('Manifest synchronization failed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleToggleBlock = async (target) => {
    try {
      setProcessingId(target._id)
      const token = localStorage.getItem('token')
      const res = await api.put(
        `/api/auth/users/${target._id}/block`,
        { reason: target.isBlocked ? 'Unblocked by admin' : 'Blocked by admin' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const updated = { ...target, isBlocked: res.data.isBlocked }
      setUsers(u => u.map(x => x._id === target._id ? updated : x))
      if (selectedUser?._id === target._id) setSelectedUser(updated)
      toast.success(res.data.message)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
    const matchRole = filterRole === 'all' ? true :
      filterRole === 'blocked' ? u.isBlocked :
        u.role === filterRole
    return matchSearch && matchRole
  })

  const getUserOrders = (uid) =>
    orders.filter(o => (o.user && typeof o.user === 'object' ? o.user._id : o.user) === uid)

  // ── Render Helpers ─────────────────────────────────────────────────────────────

  if (!hasPermission('users')) {
    return <RestrictedAccess title="Directory Restricted" message="Your account lacks the clearance to monitor user identities. Contact a system administrator for elevated privileges." />
  }

  if (loading && !refreshing) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: T.font }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ color: T.textMid, marginTop: 16, fontWeight: 700, letterSpacing: '0.02em' }}>Fetching Identity Logs...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: T.font, color: T.text }}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 10px; }
        .row-hover:hover { background: #f8fafc !important; }
        .tab-btn:hover { background: ${T.accentDim} !important; color: ${T.accent} !important; }
        .action-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .close-btn:hover { background: ${T.surfaceHigh} !important; transform: rotate(90deg); }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .panel { max-width: 100% !important; border-radius: 0 !important; height: 100vh !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: T.surface, borderBottom: `1.5px solid ${T.border}`, padding: '24px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.02em' }}>
                <FiUsers color={T.accent} /> Identity Directory
              </h1>
              <p style={{ margin: '4px 0 0', color: T.textMid, fontSize: 13, fontWeight: 500 }}>Audit customer profiles, monitor engagement, and manage operational status.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: '8px 16px', minWidth: 320 }}>
                <FiSearch color={T.textDim} size={18} />
                <input type="text" placeholder="Search name, email, or phone…" value={search} onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0 12px', width: '100%', fontSize: 14, color: T.text, fontWeight: 500 }} />
              </div>
              <button onClick={() => fetchAllData(true)} disabled={refreshing}
                style={{ padding: '10px 16px', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, color: T.textMid, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, transition: 'all 0.2s' }}>
                <FiRefreshCw size={14} style={{ animation: refreshing ? 'spin 1.2s linear infinite' : 'none' }} />
                {refreshing ? 'Syncing…' : 'Refresh'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 16 }}>
             <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <StatCard icon={FiUsers} label="Total Users" value={users.length} color={T.accent} bg={T.accentDim} />
                <StatCard icon={FiLock} label="Blocked" value={users.filter(u => u.isBlocked).length} color={T.danger} bg={T.dangerDim} />
                <StatCard icon={FiShield} label="Admins" value={users.filter(u => u.role === 'admin').length} color={T.info} bg={T.infoDim} />
             </div>
             <div style={{ display: 'flex', gap: 6, background: T.surfaceHigh, padding: 6, borderRadius: 10 }}>
               {[
                 ['all', 'Global'],
                 ['user', 'Customers'],
                 ['admin', 'Admins'],
                 ['blocked', 'Blocked']
               ].map(([val, label]) => (
                <button key={val} className="tab-btn" onClick={() => setFilterRole(val)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                    background: filterRole === val ? T.surface : 'transparent',
                    color: filterRole === val ? T.accent : T.textMid,
                    boxShadow: filterRole === val ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                  }}>
                  {label}
                </button>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div style={{ maxWidth: 1280, margin: '32px auto', padding: '0 24px', pb: 60 }}>
        <div style={{ background: T.surface, borderRadius: 20, border: `1.5px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${T.border}`, background: '#fcfcfd' }}>
                  {['Entity Details', 'Role & Access', 'Membership', 'Requests', 'Total Value', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i >= 3 ? 'right' : 'left' }}
                        className={i === 2 ? 'hide-mobile' : ''}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 80, textAlign: 'center', color: T.textDim }}>
                    <FiUsers size={48} style={{ opacity: 0.1, display: 'block', margin: '0 auto 16px' }} />
                    <div style={{ fontSize: 16, fontWeight: 700 }}>No entries match criteria</div>
                    <div style={{ fontSize: 14, marginTop: 4 }}>Adjust your search or filter parameters.</div>
                  </td></tr>
                ) : filtered.map(u => (
                  <motion.tr key={u._id} className="row-hover"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ borderBottom: `1px solid ${T.border}`, transition: 'all 0.2s', cursor: 'pointer' }}
                    onClick={() => setSelectedUser(u)}>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: T.accentDim, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, border: `1.5px solid ${T.accent}20` }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{u.name}</div>
                          <div style={{ fontSize: 13, color: T.textMid }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Badge color={u.role === 'admin' ? T.info : T.textMid} bg={u.role === 'admin' ? T.infoDim : T.surfaceHigh}>{u.role}</Badge>
                        <Badge color={u.isBlocked ? T.danger : T.success} bg={u.isBlocked ? T.dangerDim : T.successDim}>{u.isBlocked ? 'Blocked' : 'Verified'}</Badge>
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px', color: T.textMid, fontSize: 14, fontWeight: 500 }} className="hide-mobile">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: 800, fontSize: 15, color: T.textMid }}>{u.totalOrders}</td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: 900, fontSize: 15, color: T.accent }}>₹{u.totalSpent.toFixed(0)}</td>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button onClick={e => { e.stopPropagation(); handleToggleBlock(u) }} disabled={processingId === u._id}
                          className="action-btn"
                          style={{
                            padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                            background: u.isBlocked ? T.success : T.dangerDim,
                            color: u.isBlocked ? T.white : T.danger,
                            opacity: processingId === u._id ? 0.6 : 1
                          }}>
                          {processingId === u._id ? '…' : u.isBlocked ? <><FiUnlock size={14} /> Unblock</> : <><FiSlash size={14} /> Terminate</>}
                        </button>
                        <FiChevronRight size={18} color={T.textDim} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Side-Drawer Panel ── */}
      <AnimatePresence>
        {selectedUser && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)' }} />

            <motion.div className="panel"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'relative', width: '100%', maxWidth: 540, height: '100vh',
                background: T.surface, boxShadow: '-20px 0 40px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
              }}>

              {/* Panel Header */}
              <div style={{ padding: '32px', borderBottom: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: T.accentDim, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, border: `2px solid ${T.accent}30` }}>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: '-0.02em' }}>{selectedUser.name}</h2>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <Badge color={T.accent} bg={T.accentDim}>{selectedUser.role}</Badge>
                      <Badge color={T.textMid} bg={T.surfaceHigh}>ID: {selectedUser._id.slice(-8).toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setSelectedUser(null)}
                  style={{ background: T.bg, border: 'none', borderRadius: 14, padding: 12, cursor: 'pointer', color: T.textMid, transition: 'all 0.3s' }}>
                  <FiX size={20} />
                </button>
              </div>

              {/* Panel Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                
                {/* Visual Status Banner */}
                <div style={{ 
                  padding: '24px', borderRadius: 20, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: selectedUser.isBlocked ? T.dangerDim : T.successDim,
                  border: `1.5px solid ${selectedUser.isBlocked ? T.danger : T.success}30`
                }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                     <div style={{ width: 44, height: 44, borderRadius: 12, background: selectedUser.isBlocked ? T.danger : T.success, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedUser.isBlocked ? <FiLock size={20}/> : <FiUserCheck size={20}/>}
                     </div>
                     <div>
                       <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Status: {selectedUser.isBlocked ? 'Blocked' : 'Operative'}</div>
                       <div style={{ fontSize: 13, color: T.textMid, fontWeight: 500 }}>{selectedUser.isBlocked ? 'Access via system credentials revoked.' : 'Verified credentials active.'}</div>
                     </div>
                  </div>
                  <button onClick={() => handleToggleBlock(selectedUser)} disabled={processingId === selectedUser._id}
                    style={{ 
                      padding: '10px 20px', borderRadius: 12, fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer',
                      background: selectedUser.isBlocked ? T.success : T.danger, color: '#fff',
                      boxShadow: `0 4px 12px ${selectedUser.isBlocked ? T.success : T.danger}40`
                    }}>
                    {processingId === selectedUser._id ? '…' : selectedUser.isBlocked ? 'Restore Access' : 'Inhibit Account'}
                  </button>
                </div>

                {/* Engagement Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                   <div style={{ padding: '20px', background: T.bg, borderRadius: 20, border: `1.5px solid ${T.border}` }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Commitments</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: T.text }}>{selectedUser.totalOrders} <span style={{ fontSize: 14, color: T.textMid }}>Orders</span></div>
                   </div>
                   <div style={{ padding: '20px', background: T.bg, borderRadius: 20, border: `1.5px solid ${T.border}` }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Lifecycle Value</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: T.accent }}>₹{selectedUser.totalSpent.toFixed(0)}</div>
                   </div>
                </div>

                {/* Identity Summary Card */}
                <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, overflow: 'hidden', marginBottom: 32 }}>
                   <div style={{ padding: '16px 24px', background: T.bg, borderBottom: `1.5px solid ${T.border}`, fontSize: 13, fontWeight: 800, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                     Identity Profile
                   </div>
                   <div style={{ padding: '0 24px' }}>
                     {[
                       { icon: FiMail, label: 'Primary Mail', val: selectedUser.email },
                       { icon: FiPhone, label: 'Secure Line', val: selectedUser.phone || 'N/A' },
                       { icon: FiShield, label: 'System Persona', val: selectedUser.role },
                       { icon: FiCalendar, label: 'Account Origin', val: new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }
                     ].map((item, idx) => (
                       <div key={idx} style={{ padding: '18px 0', borderBottom: idx === 3 ? 'none' : `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                           <item.icon color={T.accent} size={16} />
                           <span style={{ fontSize: 14, color: T.textMid, fontWeight: 500 }}>{item.label}</span>
                         </div>
                         <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{item.val}</span>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Recent Transaction Log */}
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: T.text, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FiShoppingBag color={T.accent} /> Transaction History
                      </h4>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.textDim }}>Latest Items</span>
                   </div>

                   {(() => {
                      const uOrders = getUserOrders(selectedUser._id)
                      if (!uOrders.length) return (
                        <div style={{ padding: '48px', textAlign: 'center', color: T.textDim, background: T.bg, borderRadius: 20, border: `2px dashed ${T.border}` }}>
                          No recorded transactions.
                        </div>
                      )
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {uOrders.slice(0, 5).map(o => (
                            <div key={o._id} style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <div>
                                 <div style={{ fontSize: 14, fontWeight: 800, color: T.text, fontFamily: 'monospace' }}>#{o._id.slice(-8).toUpperCase()}</div>
                                 <div style={{ fontSize: 12, color: T.textMid, marginTop: 4 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                               </div>
                               <div style={{ textAlign: 'right' }}>
                                 <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>₹{o.totalPrice?.toFixed(0)}</div>
                                 <div style={{ marginTop: 6 }}><Badge color={o.isDelivered ? T.success : T.info} bg={o.isDelivered ? T.successDim : T.infoDim}>{o.isDelivered ? 'Fulfilled' : 'Pending'}</Badge></div>
                               </div>
                            </div>
                          ))}
                        </div>
                      )
                   })()}
                </div>
              </div>

              {/* Panel Footer */}
              <div style={{ padding: '24px 32px', background: T.bg, borderTop: `1.5px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                 <button onClick={() => setSelectedUser(null)} style={{ padding: '12px 32px', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, fontSize: 14, fontWeight: 800, color: T.text, cursor: 'pointer' }}>Close Manifest</button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminUsers