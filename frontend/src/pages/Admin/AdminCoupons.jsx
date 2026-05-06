import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTag, FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiCalendar, FiAlertTriangle, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import RestrictedAccess from '../../components/RestrictedAccess'

const iCls = "w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none text-sm text-gray-800 transition-all"
const lCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
const BLANK = { code: '', discountType: 'percentage', discountValue: '', maxDiscount: '', minOrderValue: '', validFrom: '', validUntil: '', usageLimit: '', usagePerUser: 1, description: '', isActive: true }

const AdminCoupons = () => {
  const { hasPermission } = useAuth()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(BLANK)

  useEffect(() => { if (hasPermission('coupons')) fetch() }, [hasPermission])

  const fetch = async () => {
    try { setLoading(true); const r = await api.get('/api/coupons'); setCoupons(r.data) }
    catch { toast.error('Failed to load coupons') }
    finally { setLoading(false) }
  }

  const openAdd = () => { setForm(BLANK); setModal('add') }
  const openEdit = (c) => {
    setEditing(c)
    setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, maxDiscount: c.maxDiscount || '', minOrderValue: c.minOrderValue || '', validFrom: c.validFrom?.split('T')[0] || '', validUntil: c.validUntil?.split('T')[0] || '', usageLimit: c.usageLimit || '', usagePerUser: c.usagePerUser || 1, description: c.description || '', isActive: c.isActive })
    setModal('edit')
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (modal === 'add') { await api.post('/api/coupons', form); toast.success('Coupon created') }
      else { await api.put(`/api/coupons/${editing._id}`, form); toast.success('Coupon updated') }
      fetch(); setModal(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await api.delete(`/api/coupons/${editing._id}`); toast.success('Coupon deleted'); fetch(); setModal(null) }
    catch { toast.error('Delete failed') }
    finally { setSaving(false) }
  }

  const toggleActive = async (c) => {
    try { await api.put(`/api/coupons/${c._id}`, { ...c, isActive: !c.isActive }); toast.success(c.isActive ? 'Deactivated' : 'Activated'); fetch() }
    catch { toast.error('Update failed') }
  }

  const filtered = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase()))

  if (!hasPermission('coupons')) return <RestrictedAccess title="Access Restricted" message="You don't have permission to manage coupons." />
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center" style={{ background: '#f8f9fa' }}><div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen pb-20" style={{ background: '#f8f9fa' }}>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-3">Admin</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>Manage Coupons</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <FiSearch size={14} className="text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="bg-transparent outline-none text-sm w-36 placeholder:text-gray-400" />
              </div>
              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-all">
                <FiPlus size={15} /> Add Coupon
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{coupons.length} total</span>
            <span className="text-green-600 font-semibold">{coupons.filter(c => c.isActive).length} active</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const expired = new Date(c.validUntil) < new Date()
            return (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg font-extrabold text-orange-700 text-sm tracking-wider">
                      <FiTag size={12} />{c.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${expired ? 'bg-red-50 text-red-600 border-red-200' : c.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {expired ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(c)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"><FiEdit2 size={13} /></button>
                    <button onClick={() => { setEditing(c); setModal('delete') }} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><FiTrash2 size={13} /></button>
                  </div>
                </div>
                {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                <div className="flex gap-6">
                  <div><p className="text-xs text-gray-400 mb-0.5">Discount</p><p className="text-xl font-extrabold text-orange-500">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Min Order</p><p className="text-xl font-bold text-gray-800">₹{c.minOrderValue || 0}</p></div>
                </div>
                {c.usageLimit && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Usage</span><span>{c.redemptionsCount || 0}/{c.usageLimit}</span></div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.min(((c.redemptionsCount || 0) / c.usageLimit) * 100, 100)}%` }} /></div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="flex items-center gap-1 text-xs text-gray-400"><FiCalendar size={11} />{new Date(c.validUntil).toLocaleDateString('en-IN')}</span>
                  <button onClick={() => toggleActive(c)} className="flex items-center gap-1.5 text-xs font-semibold">
                    {c.isActive ? <><FiToggleRight size={18} className="text-green-500" /><span className="text-green-600">Active</span></> : <><FiToggleLeft size={18} className="text-gray-400" /><span className="text-gray-500">Inactive</span></>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {(modal === 'add' || modal === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">{modal === 'add' ? 'Create Coupon' : 'Edit Coupon'}</h2>
                <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><FiX size={16} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lCls}>Code *</label><input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className={iCls + " font-bold tracking-wider"} /></div>
                  <div><label className={lCls}>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={iCls} /></div>
                </div>
                <div>
                  <label className={lCls}>Type *</label>
                  <div className="flex gap-2">
                    {['percentage', 'fixed'].map(t => (
                      <button key={t} type="button" onClick={() => setForm({ ...form, discountType: t })} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${form.discountType === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {t === 'percentage' ? 'Percentage (%)' : 'Fixed (₹)'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lCls}>Value *</label><input type="number" required value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} className={iCls} /></div>
                  <div><label className={lCls}>Min Order (₹)</label><input type="number" value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })} className={iCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lCls}>Valid Until *</label><input type="date" required value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} className={iCls} /></div>
                  <div><label className={lCls}>Usage Limit</label><input type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} className={iCls} /></div>
                </div>
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                  <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                    {form.isActive ? <FiToggleRight size={24} className="text-green-500" /> : <FiToggleLeft size={24} className="text-gray-400" />}
                  </button>
                  <span className="text-sm font-semibold text-gray-700">{form.isActive ? 'Active — Customers can redeem' : 'Inactive — Coupon disabled'}</span>
                </label>
              </form>
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-[2] py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-lg transition-all">
                  {saving ? 'Saving…' : modal === 'add' ? 'Create Coupon' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal === 'delete' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><FiAlertTriangle size={20} className="text-red-600" /></div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Delete Coupon?</h3>
              <p className="text-sm text-gray-500 mb-5">Permanently delete <strong>{editing?.code}</strong>. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg">Cancel</button>
                <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition-all">{saving ? 'Deleting…' : 'Delete'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminCoupons