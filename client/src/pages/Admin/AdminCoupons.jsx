import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiTag, FiPlus, FiSearch, FiEdit2, FiTrash2, FiX,
  FiCalendar, FiAlertTriangle, FiToggleLeft, FiToggleRight,
  FiPercent, FiDollarSign,
} from 'react-icons/fi'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import RestrictedAccess from '../../components/RestrictedAccess'

const BLANK = {
  code: '', discountType: 'percentage', discountValue: '',
  maxDiscount: '', minOrderValue: '', validFrom: '', validUntil: '',
  usageLimit: '', usagePerUser: 1, description: '', isActive: true,
}

/* ── Shared field label ── */
const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
    {children}
  </label>
)

/* ── Shared input ── */
const inputSty = {
  width: '100%', padding: '10px 13px', border: '1.5px solid var(--border-color)',
  borderRadius: 'var(--radius-input)', fontSize: 14, color: 'var(--text-primary)',
  background: 'var(--bg-surface)', outline: 'none', fontFamily: 'var(--font)', fontWeight: 500,
  transition: 'all 0.2s',
}
const onFocus = e => { e.target.style.borderColor = 'var(--brand-secondary)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.15)' }
const onBlur = e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none' }

const AdminCoupons = () => {
  const { hasPermission } = useAuth()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(BLANK)

  useEffect(() => { if (hasPermission('coupons')) loadCoupons() }, [hasPermission])

  const loadCoupons = async () => {
    try { setLoading(true); const r = await api.get('/api/coupons'); setCoupons(r.data) }
    catch { toast.error('Failed to load coupons') }
    finally { setLoading(false) }
  }

  const openAdd = () => { setForm(BLANK); setModal('add') }
  const openEdit = (c) => {
    setEditing(c)
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      maxDiscount: c.maxDiscount || '', minOrderValue: c.minOrderValue || '',
      validFrom: c.validFrom?.split('T')[0] || '', validUntil: c.validUntil?.split('T')[0] || '',
      usageLimit: c.usageLimit || '', usagePerUser: c.usagePerUser || 1,
      description: c.description || '', isActive: c.isActive,
    })
    setModal('edit')
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (modal === 'add') { await api.post('/api/coupons', form); toast.success('Coupon created ✓') }
      else { await api.put(`/api/coupons/${editing._id}`, form); toast.success('Coupon updated ✓') }
      loadCoupons(); setModal(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await api.delete(`/api/coupons/${editing._id}`); toast.success('Coupon deleted'); loadCoupons(); setModal(null) }
    catch { toast.error('Delete failed') }
    finally { setSaving(false) }
  }

  const toggleActive = async (c) => {
    try {
      await api.put(`/api/coupons/${c._id}`, { ...c, isActive: !c.isActive })
      toast.success(c.isActive ? 'Deactivated' : 'Activated')
      loadCoupons()
    } catch { toast.error('Update failed') }
  }

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  if (!hasPermission('coupons')) return (
    <RestrictedAccess title="Access Restricted" message="You don't have permission to manage coupons." />
  )

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--brand-secondary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font)', fontWeight: 600, textAlign: 'center' }}>Loading coupons…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-base)' }}>

      {/* ── Premium Admin Header ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.6 }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border mb-3"
                style={{ background: 'rgba(245,197,24,0.18)', color: 'var(--gold)', borderColor: 'rgba(245,197,24,0.35)' }}>
                <FiTag size={10} /> Promotions
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>
                Manage Coupons
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{coupons.length} total</span>
                <span className="text-sm font-bold" style={{ color: '#6EE7B7' }}>
                  {coupons.filter(c => c.isActive).length} active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <FiSearch size={14} style={{ color: 'rgba(255,255,255,0.55)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupons…"
                  className="bg-transparent outline-none text-sm w-36" style={{ color: '#FFF', fontFamily: 'var(--font)' }} />
              </div>
              {/* Add */}
              <button onClick={openAdd} id="add-coupon-btn"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'var(--gold)', color: 'var(--navy)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.45)' }}>
                <FiPlus size={15} /> Add Coupon
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(245,166,35,0.10)', border: '1.5px solid rgba(245,166,35,0.20)' }}>
              <FiTag size={24} style={{ color: 'var(--brand-secondary)' }} />
            </div>
            <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {search ? 'No coupons match your search' : 'No coupons yet'}
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Try a different keyword.' : 'Create your first coupon to offer discounts.'}
            </p>
            {!search && (
              <button onClick={openAdd} className="btn btn-primary" id="add-first-coupon-btn">
                <FiPlus size={15} /> Create First Coupon
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((c, idx) => {
                const expired = new Date(c.validUntil) < new Date()
                const usagePct = c.usageLimit ? Math.min(((c.redemptionsCount || 0) / c.usageLimit) * 100, 100) : 0
                return (
                  <motion.div key={c._id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-card)', padding: '20px',
                      boxShadow: 'var(--shadow-card)',
                      display: 'flex', flexDirection: 'column', gap: 14,
                      transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'none' }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Code badge */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-sm tracking-wider"
                          style={{ background: 'rgba(245,166,35,0.10)', color: 'var(--brand-secondary)', border: '1.5px solid rgba(245,166,35,0.25)', fontFamily: 'monospace' }}>
                          <FiTag size={11} /> {c.code}
                        </span>
                        {/* Status */}
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold border"
                          style={expired
                            ? { background: 'rgba(229,62,62,0.08)', color: 'var(--danger)', borderColor: 'rgba(229,62,62,0.20)' }
                            : c.isActive
                              ? { background: 'rgba(56,161,105,0.08)', color: 'var(--success)', borderColor: 'rgba(56,161,105,0.20)' }
                              : { background: 'var(--bg-alt)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }
                          }>
                          {expired ? 'Expired' : c.isActive ? '● Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEdit(c)} title="Edit"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => { setEditing(c); setModal('delete') }} title="Delete"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,62,62,0.08)'; e.currentTarget.style.color = 'var(--danger)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {c.description && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{c.description}</p>
                    )}

                    {/* Discount + Min order */}
                    <div className="flex gap-6">
                      <div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discount</p>
                        <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--brand-secondary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                          {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min Order</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>₹{c.minOrderValue || 0}</p>
                      </div>
                    </div>

                    {/* Usage bar */}
                    {c.usageLimit > 0 && (
                      <div>
                        <div className="flex justify-between mb-1.5" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          <span>Usage</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {c.redemptionsCount || 0} / {c.usageLimit}
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${usagePct}%`,
                              background: usagePct > 90 ? 'var(--danger)' : usagePct > 60 ? 'var(--warning)' : 'var(--brand-secondary)',
                            }} />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        <FiCalendar size={11} />
                        {new Date(c.validUntil).toLocaleDateString('en-IN')}
                      </span>
                      <button onClick={() => toggleActive(c)} className="flex items-center gap-1.5 text-xs font-semibold transition-colors">
                        {c.isActive
                          ? <><FiToggleRight size={20} style={{ color: 'var(--success)' }} /><span style={{ color: 'var(--success)' }}>Active</span></>
                          : <><FiToggleLeft size={20} style={{ color: 'var(--text-muted)' }} /><span style={{ color: 'var(--text-muted)' }}>Inactive</span></>
                        }
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ══ ADD / EDIT MODAL ══ */}
      <AnimatePresence>
        {(modal === 'add' || modal === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(27,47,110,0.45)', backdropFilter: 'blur(12px)' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 520,
                maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)' }}>
                    <FiTag size={14} style={{ color: 'var(--brand-secondary)' }} />
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
                    {modal === 'add' ? 'Create Coupon' : 'Edit Coupon'}
                  </h2>
                </div>
                <button onClick={() => setModal(null)} className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                  <FiX size={16} />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Code *</Label>
                    <input required value={form.code}
                      onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      style={{ ...inputSty, fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'monospace' }}
                      onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <input value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="e.g. Summer sale"
                      style={inputSty} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>

                {/* Discount type toggle */}
                <div>
                  <Label>Discount Type *</Label>
                  <div className="flex gap-2">
                    {[
                      { key: 'percentage', label: 'Percentage (%)', icon: FiPercent },
                      { key: 'fixed', label: 'Fixed (₹)', icon: FiDollarSign },
                    ].map(t => (
                      <button key={t.key} type="button"
                        onClick={() => setForm({ ...form, discountType: t.key })}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                        style={form.discountType === t.key
                          ? { background: 'var(--brand-gradient)', color: '#fff', border: 'none', boxShadow: 'var(--shadow-brand)' }
                          : { background: 'var(--bg-alt)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }
                        }>
                        <t.icon size={13} /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Value *</Label>
                    <input type="number" required value={form.discountValue}
                      onChange={e => setForm({ ...form, discountValue: e.target.value })}
                      placeholder="e.g. 20"
                      style={inputSty} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div>
                    <Label>Min Order (₹)</Label>
                    <input type="number" value={form.minOrderValue}
                      onChange={e => setForm({ ...form, minOrderValue: e.target.value })}
                      placeholder="0"
                      style={inputSty} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valid Until *</Label>
                    <input type="date" required value={form.validUntil}
                      onChange={e => setForm({ ...form, validUntil: e.target.value })}
                      style={inputSty} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div>
                    <Label>Usage Limit</Label>
                    <input type="number" value={form.usageLimit}
                      onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                      placeholder="Unlimited"
                      style={inputSty} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: form.isActive ? 'rgba(56,161,105,0.07)' : 'var(--bg-alt)',
                    border: `1.5px solid ${form.isActive ? 'rgba(56,161,105,0.25)' : 'var(--border-color)'}`,
                  }}>
                  <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                    {form.isActive
                      ? <FiToggleRight size={26} style={{ color: 'var(--success)' }} />
                      : <FiToggleLeft size={26} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  <span style={{ fontSize: 14, fontWeight: 600, color: form.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                    {form.isActive ? 'Active — Customers can redeem this coupon' : 'Inactive — Coupon is disabled'}
                  </span>
                </label>
              </form>

              {/* Modal footer */}
              <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-alt)' }}>
                <button type="button" onClick={() => setModal(null)}
                  className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                  id="save-coupon-btn">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                    : modal === 'add' ? 'Create Coupon' : 'Save Changes'
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ DELETE CONFIRM ══ */}
      <AnimatePresence>
        {modal === 'delete' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(27,47,110,0.45)', backdropFilter: 'blur(12px)' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-card)', width: '100%', maxWidth: 380,
                padding: '32px 28px', boxShadow: 'var(--shadow-lg)', textAlign: 'center',
              }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(229,62,62,0.08)', border: '1.5px solid rgba(229,62,62,0.18)' }}>
                <FiAlertTriangle size={22} style={{ color: 'var(--danger)' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: '0 0 8px' }}>
                Delete Coupon?
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
                Permanently delete <strong style={{ color: 'var(--brand-secondary)', fontFamily: 'monospace' }}>{editing?.code}</strong>. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={saving} className="btn btn-danger"
                  style={{ flex: 1, justifyContent: 'center', height: 48, padding: '0 20px', opacity: saving ? 0.7 : 1,
                    background: 'rgba(229,62,62,0.08)', color: 'var(--danger)', border: '1.5px solid rgba(229,62,62,0.22)' }}
                  id="delete-coupon-btn">
                  {saving ? 'Deleting…' : 'Delete'}
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