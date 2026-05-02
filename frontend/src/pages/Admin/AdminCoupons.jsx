import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiTag, FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, 
  FiCheck, FiCalendar, FiDollarSign, FiPercent, FiAlertTriangle,
  FiRefreshCw, FiCopy, FiInfo, FiActivity, FiToggleLeft, FiToggleRight
} from 'react-icons/fi'
import api from '../../api/axios'
import { toast } from 'react-toastify'
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

// ── Shared Sub-Components ────────────────────────────────────────────────────────
const Badge = ({ children, color, bg }) => (
  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color, background: bg }}>
    {children}
  </span>
)

const Label = ({ children, required }) => (
  <div style={{ fontSize: 11, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
    {children} {required && <span style={{ color: T.danger }}>*</span>}
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AdminCoupons = () => {
  const { hasPermission } = useAuth()
  const [coupons, setCoupons]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null) // 'add' | 'edit' | 'delete'
  const [editing, setEditing]     = useState(null)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({
    code: '', discountType: 'percentage', discountValue: '', maxDiscount: '', 
    minOrderValue: '', validFrom: '', validUntil: '', usageLimit: '', 
    usagePerUser: 1, description: '', isActive: true
  })

  useEffect(() => {
    if (hasPermission('coupons')) fetchCoupons()
  }, [hasPermission])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/coupons')
      setCoupons(res.data)
    } catch { toast.error('Failed to sync promotion registry') }
    finally { setLoading(false) }
  }

  const openAdd = () => {
    setForm({
      code: '', discountType: 'percentage', discountValue: '', maxDiscount: '', 
      minOrderValue: '', validFrom: '', validUntil: '', usageLimit: '', 
      usagePerUser: 1, description: '', isActive: true
    })
    setModal('add')
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      maxDiscount: c.maxDiscount || '', minOrderValue: c.minOrderValue || '',
      validFrom: c.validFrom ? c.validFrom.split('T')[0] : '',
      validUntil: c.validUntil ? c.validUntil.split('T')[0] : '',
      usageLimit: c.usageLimit || '', usagePerUser: c.usagePerUser || 1,
      description: c.description || '', isActive: c.isActive
    })
    setModal('edit')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'add') {
        await api.post('/api/coupons', form)
        toast.success('Promotion provisioned')
      } else {
        await api.put(`/api/coupons/${editing._id}`, form)
        toast.success('Promotion updated')
      }
      fetchCoupons()
      setModal(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await api.delete(`/api/coupons/${editing._id}`)
      toast.success('Promotion purged')
      fetchCoupons()
      setModal(null)
    } catch { toast.error('Purge failed') }
    finally { setSaving(false) }
  }

  const toggleActive = async (c) => {
    try {
      await api.put(`/api/coupons/${c._id}`, { ...c, isActive: !c.isActive })
      toast.success(c.isActive ? 'Promotion voided' : 'Promotion activated')
      fetchCoupons()
    } catch { toast.error('State transition failed') }
  }

  const filtered = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  if (!hasPermission('coupons')) return <RestrictedAccess title="Promotions Restricted" message="Your account lacks the clearance to manage administrative incentives and coupon logic." />

  if (loading && coupons.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ color: T.textMid, marginTop: 16, fontWeight: 700 }}>Orchestrating Promotion Matrix...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, padding: '32px 24px' }}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 10px; }
        .coupon-card:hover { transform: translateY(-3px); border-color: ${T.accent}40 !important; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
        .input-focus:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentDim} !important; }
        .action-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
      `}</style>

      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, background: T.accent, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 8px 16px ${T.accent}30` }}>
              <FiTag size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>Incentive Engine</h1>
              <p style={{ margin: 0, fontSize: 13, color: T.textDim, fontWeight: 500 }}>Manage yield-based promotions and redemption protocols.</p>
            </div>
          </div>
          <button onClick={openAdd} className="action-btn"
            style={{ 
               padding: '14px 28px', background: T.accent, color: '#fff', border: 'none', borderRadius: 14, 
               fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
               boxShadow: `0 8px 20px ${T.accent}30`, transition: 'all 0.2s' 
            }}>
            <FiPlus size={18} /> Provision Coupon
          </button>
        </div>

        {/* ── Search & Metrics ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 32 }}>
           <div style={{ position: 'relative' }}>
             <FiSearch size={18} color={T.textDim} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
             <input type="text" placeholder="Search operational codes or narratives…" value={search} onChange={e => setSearch(e.target.value)}
               style={{ width: '100%', padding: '14px 16px 14px 52px', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, outline: 'none', fontSize: 14, fontWeight: 500 }} className="input-focus" />
           </div>
           <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 20px' }}>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{coupons.length}</div>
                 <div style={{ fontSize: 10, fontWeight: 800, color: T.textDim, textTransform: 'uppercase' }}>Assets</div>
              </div>
              <div style={{ width: 1.5, height: 24, background: T.border }} />
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: 18, fontWeight: 900, color: T.success }}>{coupons.filter(c => c.isActive).length}</div>
                 <div style={{ fontSize: 10, fontWeight: 800, color: T.textDim, textTransform: 'uppercase' }}>Active</div>
              </div>
           </div>
        </div>

        {/* ── Coupon Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
          {filtered.map(c => {
            const isExpired = new Date(c.validUntil) < new Date();
            const usagePercent = c.usageLimit ? (c.redemptionsCount || 0) / c.usageLimit * 100 : 0;
            return (
              <motion.div layout key={c._id} className="coupon-card"
                style={{ 
                   background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: '24px', 
                   transition: 'all 0.3s', display: 'flex', flexDirection: 'column', gap: 20
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ padding: '8px 16px', background: T.accentDim, border: `1.5px solid ${T.accent}30`, borderRadius: 12, color: T.accent, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>
                        {c.code}
                      </div>
                      <Badge color={isExpired ? T.danger : c.isActive ? T.success : T.textDim} bg={isExpired ? T.dangerDim : c.isActive ? T.successDim : T.surfaceHigh}>
                        {isExpired ? 'Expired' : c.isActive ? 'Active' : 'Void'}
                      </Badge>
                   </div>
                   <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(c)} style={{ padding: 8, background: T.bg, border: 'none', borderRadius: 10, cursor: 'pointer', color: T.textMid }}><FiEdit2 size={16}/></button>
                      <button onClick={() => { setEditing(c); setModal('delete') }} style={{ padding: 8, background: T.dangerDim, border: 'none', borderRadius: 10, cursor: 'pointer', color: T.danger }}><FiTrash2 size={16}/></button>
                   </div>
                </div>

                <div style={{ flex: 1 }}>
                   <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{c.description || 'No asset narrative provided.'}</div>
                   <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', marginBottom: 2 }}>Discount</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: T.accent }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', marginBottom: 2 }}>Min Order</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>₹{c.minOrderValue || 0}</div>
                      </div>
                   </div>
                </div>

                {c.usageLimit && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800, color: T.textDim, marginBottom: 6, textTransform: 'uppercase' }}>
                      <span>Redemption Path</span>
                      <span>{c.redemptionsCount || 0} / {c.usageLimit}</span>
                    </div>
                    <div style={{ height: 6, background: T.bg, borderRadius: 10, overflow: 'hidden' }}>
                       <div style={{ height: '100%', width: `${usagePercent}%`, background: T.accent, borderRadius: 10 }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1.5px solid ${T.bg}` }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.textDim, fontSize: 12, fontWeight: 600 }}>
                      <FiCalendar size={14}/> {new Date(c.validUntil).toLocaleDateString()}
                   </div>
                   <button onClick={() => toggleActive(c)}
                      style={{ 
                         background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, 
                         color: c.isActive ? T.success : T.textDim, fontWeight: 800, fontSize: 12 
                      }}>
                     {c.isActive ? <><FiToggleRight size={22}/> ACTIVE</> : <><FiToggleLeft size={22}/> VOID</>}
                   </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
         {(modal === 'add' || modal === 'edit') && (
           <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                style={{ background: T.white, borderRadius: 32, maxWidth: 640, width: '100%', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', border: `1.5px solid ${T.border}` }}>
                
                <div style={{ padding: '24px 32px', borderBottom: `2.5px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{modal === 'add' ? 'PROVISION PROTOCOL' : 'MODIFY PROTOCOL'}</h2>
                   <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24}/></button>
                </div>

                <form onSubmit={handleSave} style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                     <div>
                       <Label required>Protocol Code</Label>
                       <input type="text" required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                         style={{ width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, outline: 'none', fontWeight: 800, letterSpacing: '0.05em' }} className="input-focus" />
                     </div>
                     <div>
                       <Label>Short Narrative</Label>
                       <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                         style={{ width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, outline: 'none' }} className="input-focus" />
                     </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <Label required>Valuation Logic</Label>
                    <div style={{ display: 'flex', gap: 12, background: T.bg, padding: 6, borderRadius: 16 }}>
                       {['percentage', 'fixed'].map(t => (
                         <button key={t} type="button" onClick={() => setForm({...form, discountType: t})}
                            style={{ 
                               flex: 1, padding: 12, borderRadius: 12, border: 'none', fontWeight: 800, cursor: 'pointer',
                               background: form.discountType === t ? T.white : 'transparent',
                               color: form.discountType === t ? T.accent : T.textDim,
                               boxShadow: form.discountType === t ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                             }}>
                           {t === 'percentage' ? <FiPercent style={{ mr: 8 }}/> : <FiDollarSign style={{ mr: 8 }}/>} {t.toUpperCase()}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                     <div>
                       <Label required>{form.discountType === 'percentage' ? 'Yield Value (%)' : 'Reduction Magnitude (₹)'}</Label>
                       <input type="number" required value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})}
                         style={{ width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, outline: 'none' }} className="input-focus" />
                     </div>
                     <div>
                       <Label>Min Order Magnitude (₹)</Label>
                       <input type="number" value={form.minOrderValue} onChange={e => setForm({...form, minOrderValue: e.target.value})}
                         style={{ width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, outline: 'none' }} className="input-focus" />
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                     <div>
                       <Label required>Temporal Termination</Label>
                       <input type="date" required value={form.validUntil} onChange={e => setForm({...form, validUntil: e.target.value})}
                         style={{ width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, outline: 'none' }} className="input-focus" />
                     </div>
                     <div>
                       <Label>Global Manifest Limit</Label>
                       <input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})}
                         style={{ width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, outline: 'none' }} className="input-focus" />
                     </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: form.isActive ? T.successDim : T.surfaceHigh, borderRadius: 16, border: `1.5px solid ${form.isActive ? T.success : T.border}40` }}>
                     <button type="button" onClick={() => setForm({...form, isActive: !form.isActive})} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {form.isActive ? <FiToggleRight size={32} color={T.success}/> : <FiToggleLeft size={32} color={T.textDim}/>}
                        <div style={{ textAlign: 'left' }}>
                           <div style={{ fontWeight: 800, fontSize: 14 }}>ACTIVE PROTOCOL</div>
                           <div style={{ fontSize: 12, color: T.textDim }}>Asset is authorized for redemption in global checkout.</div>
                        </div>
                     </button>
                  </div>
                </form>

                <div style={{ padding: '24px 32px', borderTop: `2px solid ${T.border}`, display: 'flex', gap: 12, justifyContent: 'flex-end', background: T.bg }}>
                   <button onClick={() => setModal(null)} style={{ padding: '12px 24px', background: 'transparent', border: `1.5px solid ${T.border}`, borderRadius: 12, fontWeight: 800, color: T.textMid }}>Abort</button>
                   <button onClick={handleSave} disabled={saving} style={{ padding: '12px 32px', background: T.accent, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 900, boxShadow: `0 8px 16px ${T.accent}30` }}>
                     {saving ? 'SYNCHRONIZING...' : 'COMMIT PROTOCOL'}
                   </button>
                </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {modal === 'delete' && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}>
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               style={{ background: T.white, borderRadius: 28, maxWidth: 460, width: '100%', padding: '40px 32px', textAlign: 'center', border: `1.5px solid ${T.border}` }}>
                <div style={{ width: 64, height: 64, background: T.dangerDim, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: T.danger }}>
                  <FiAlertTriangle size={32}/>
                </div>
                <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 900 }}>TERMINATE PROTOCOL?</h2>
                <p style={{ margin: '0 0 32px', fontSize: 14, color: T.textMid, lineHeight: 1.5 }}>Are you sure you want to purge <strong>{editing.code}</strong> from the promotion registry? This action cannot be reversed.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, fontWeight: 800 }}>Dismiss</button>
                  <button onClick={handleDelete} disabled={saving} style={{ flex: 1.5, padding: 14, borderRadius: 12, border: 'none', background: T.danger, color: '#fff', fontWeight: 900 }}>
                    {saving ? 'PURGING...' : 'CONFIRM PURGE'}
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminCoupons