import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  FiUser, FiMapPin, FiPlus, FiEdit2, FiTrash2,
  FiX, FiHome, FiBriefcase, FiStar, FiSearch,
  FiChevronRight, FiPackage, FiLogOut, FiCheck,
  FiAlertCircle
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'

const STATES = [
  'Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam',
  'Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir',
  'Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry',
  'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
]

const emptyAddr = {
  label: 'Home', name: '', phone: '', street: '',
  city: '', district: '', state: '', zipCode: '', country: 'India', isDefault: false,
}

// ── Shared input style (uses global design system) ────────────────────────────────
const inp = 'input-base'
const lbl = 'label'

const Profile = () => {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [profLoading, setProfLoading] = useState(false)

  const [addresses, setAddresses] = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState(null)
  const [addrForm, setAddrForm]   = useState(emptyAddr)
  const [addrLoading, setAddrLoading] = useState(false)
  const [pinLoading, setPinLoading]   = useState(false)
  const [pinError, setPinError]       = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      fetchAddresses()
    }
  }, [user])

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/auth/me')
      setAddresses(res.data.addresses || [])
    } catch {}
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (phone && !/^[6-9][0-9]{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number')
      return
    }
    setProfLoading(true)
    try {
      const res = await api.put('/api/auth/profile', { name, phone })
      setUser(prev => ({ ...prev, name: res.data.name, phone: res.data.phone }))
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setProfLoading(false)
    }
  }

  // ── PIN lookup with auto-fill ──────────────────────────────────────────────
  const handlePinChange = async (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6)
    setPinError('')
    setAddrForm(p => ({ ...p, zipCode: cleaned }))
    if (cleaned.length === 6) {
      setPinLoading(true)
      try {
        const res = await api.get(`/api/pincode/${cleaned}`)
        const data = res.data
        if (data[0]?.Status === 'Success' && data[0].PostOffice?.length) {
          const po = data[0].PostOffice[0]
          setAddrForm(p => ({
            ...p,
            zipCode: cleaned,
            state:    po.State,
            district: po.District,
            city:     po.Division || po.District,
          }))
          toast.success(`PIN found: ${po.District}, ${po.State}`)
        } else {
          setPinError('PIN code not found. Please fill details manually.')
        }
      } catch {
        setPinError('Could not fetch PIN data. Please fill manually.')
      } finally {
        setPinLoading(false)
      }
    }
  }

  const handleAddrSubmit = async (e) => {
    e.preventDefault()
    if (!/^[6-9][0-9]{9}$/.test(addrForm.phone)) {
      toast.error('Enter a valid 10-digit mobile number')
      return
    }
    if (!/^[0-9]{6}$/.test(addrForm.zipCode)) {
      toast.error('Enter a valid 6-digit PIN code')
      return
    }
    setAddrLoading(true)
    try {
      const res = editId
        ? await api.put(`/api/auth/addresses/${editId}`, addrForm)
        : await api.post('/api/auth/addresses', addrForm)
      setAddresses(res.data.addresses)
      setShowForm(false)
      setEditId(null)
      setAddrForm(emptyAddr)
      toast.success(editId ? 'Address updated!' : 'Address saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save address')
    } finally {
      setAddrLoading(false)
    }
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return
    try {
      const res = await api.delete(`/api/auth/addresses/${id}`)
      setAddresses(res.data.addresses)
      toast.success('Address removed')
    } catch {
      toast.error('Could not delete address')
    }
  }

  const handleSetDefault = async (id) => {
    try {
      const res = await api.patch(`/api/auth/addresses/${id}/default`)
      setAddresses(res.data.addresses)
      toast.success('Default address updated')
    } catch {
      toast.error('Failed to set default')
    }
  }

  const openEdit = (addr) => {
    setAddrForm(addr)
    setEditId(addr._id)
    setShowForm(true)
    setPinError('')
  }

  const openNew = () => {
    setAddrForm(emptyAddr)
    setEditId(null)
    setShowForm(true)
    setPinError('')
  }

  if (!user) return null

  return (
    <div className="min-h-screen pb-16" style={{ background: 'var(--bg-base)' }}>

      {/* ── Page header ── */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>My Account</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your profile and delivery addresses</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left sidebar ── */}
          <div className="space-y-4">

            {/* Avatar card */}
            <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-3"
                style={{ background: 'var(--brand-gradient)', color: 'var(--brand-text)' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full"
                style={user.role === 'admin' || user.role === 'superadmin'
                  ? { background: 'rgba(139,92,246,0.10)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }
                  : { background: 'rgba(245,197,24,0.10)', color: 'var(--brand-secondary)', border: '1px solid rgba(245,197,24,0.25)' }
                }>
                {user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
            </div>

            {/* Nav links */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              {[
                { label: 'My Orders', icon: FiPackage, to: '/orders' },
                { label: 'Sign Out', icon: FiLogOut, danger: true, action: () => { logout(); navigate('/') } },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action || (() => navigate(item.to))}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors"
                  style={{ borderBottom: '1px solid var(--border-color)', color: item.danger ? 'var(--danger)' : 'var(--text-primary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.05)' : 'var(--bg-base)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={15} style={{ color: item.danger ? 'var(--danger)' : 'var(--text-muted)' }} />
                    {item.label}
                  </div>
                  <FiChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right main content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Profile form ── */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FiUser size={16} style={{ color: 'var(--brand-secondary)' }} /> Personal Details
              </h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Phone Number</label>
                    <input type="tel" value={phone} maxLength={10} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" inputMode="numeric" className={inp} />
                    {phone && !/^[6-9][0-9]{9}$/.test(phone) && phone.length === 10 && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}><FiAlertCircle size={11} /> Enter a valid Indian mobile number</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Email</label>
                  <input type="email" disabled value={user.email} className={inp} style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={profLoading} className="btn-primary text-sm">
                    {profLoading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Addresses ── */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <FiMapPin size={16} style={{ color: 'var(--brand-secondary)' }} /> Saved Addresses
                </h2>
                {!showForm && (
                  <button onClick={openNew} className="btn-secondary text-[13px]">
                    <FiPlus size={14} /> Add Address
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">

                {/* ── Address Form ── */}
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl p-5 mb-4"
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{editId ? 'Edit Address' : 'New Address'}</h3>
                      <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} style={{ color: 'var(--text-muted)' }}>
                        <FiX size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleAddrSubmit} className="space-y-4">

                      {/* Label selector */}
                      <div>
                        <label className={lbl}>Address Type</label>
                        <div className="flex gap-2">
                          {['Home', 'Work', 'Other'].map(l => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => setAddrForm(p => ({ ...p, label: l }))}
                              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                              style={addrForm.label === l
                                ? { background: 'var(--brand-gradient)', color: 'var(--brand-text)', border: '1px solid transparent' }
                                : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                              }
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className={lbl}>Full Name</label>
                          <input
                            type="text"
                            required
                            value={addrForm.name}
                            onChange={e => setAddrForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="Recipient name"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className={lbl}>Phone Number</label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            inputMode="numeric"
                            value={addrForm.phone}
                            onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                            placeholder="10-digit mobile number"
                            className={inp}
                          />
                          {addrForm.phone && !/^[6-9][0-9]{9}$/.test(addrForm.phone) && addrForm.phone.length === 10 && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <FiAlertCircle size={11} /> Invalid number
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className={lbl}>Street Address</label>
                        <input
                          type="text"
                          required
                          value={addrForm.street}
                          onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))}
                          placeholder="House no., street, area, landmark"
                          className={inp}
                        />
                      </div>

                      {/* PIN code with auto-fill */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className={lbl}>PIN Code</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={6}
                              inputMode="numeric"
                              value={addrForm.zipCode}
                              onChange={e => handlePinChange(e.target.value)}
                              placeholder="6-digit PIN code"
                              className={`${inp} pr-10`}
                            />
                            {pinLoading && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-orange-400/30 border-t-orange-500 rounded-full animate-spin" />
                            )}
                            {!pinLoading && addrForm.zipCode.length === 6 && !pinError && addrForm.city && (
                              <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={15} />
                            )}
                          </div>
                          {pinError && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                              <FiAlertCircle size={11} /> {pinError}
                            </p>
                          )}
                          {!pinError && addrForm.city && addrForm.zipCode.length === 6 && (
                            <p className="text-xs text-green-600 mt-1">✓ Auto-filled from PIN</p>
                          )}
                        </div>
                        <div>
                          <label className={lbl}>City</label>
                          <input
                            type="text"
                            required
                            value={addrForm.city}
                            onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))}
                            placeholder="City"
                            className={inp}
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className={lbl}>District</label>
                          <input
                            type="text"
                            value={addrForm.district}
                            onChange={e => setAddrForm(p => ({ ...p, district: e.target.value }))}
                            placeholder="District (auto-filled)"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className={lbl}>State</label>
                          <select
                            required
                            value={addrForm.state}
                            onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))}
                            className={inp}
                          >
                            <option value="">Select State</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-color)' }}>
                        <input
                          type="checkbox"
                          checked={addrForm.isDefault}
                          onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
                          className="w-4 h-4 rounded cursor-pointer accent-orange-500"
                        />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Set as my default address</span>
                      </label>

                      <div className="flex gap-3 pt-1">
                        <button type="submit" disabled={addrLoading} className="btn-primary flex-1">
                          {addrLoading ? 'Saving…' : editId ? 'Update Address' : 'Save Address'}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary px-5">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* ── Address list ── */}
                {!showForm && (
                  addresses.length > 0 ? (
                    <div className="space-y-3">
                      {addresses.map(addr => (
                        <motion.div
                          key={addr._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-3 transition-all"
                          style={addr.isDefault
                            ? { background: 'rgba(245,197,24,0.06)', border: '1px solid rgba(245,197,24,0.30)' }
                            : { background: 'var(--bg-base)', border: '1px solid var(--border-color)' }
                          }
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="p-1.5 rounded-md"
                                style={{ background: addr.label === 'Home' ? 'rgba(59,130,246,0.12)' : addr.label === 'Work' ? 'rgba(139,92,246,0.12)' : 'rgba(245,197,24,0.12)',
                                  color: addr.label === 'Home' ? '#3B82F6' : addr.label === 'Work' ? '#8B5CF6' : 'var(--brand-secondary)' }}>
                                {addr.label === 'Home' ? <FiHome size={12} /> : addr.label === 'Work' ? <FiBriefcase size={12} /> : <FiMapPin size={12} />}
                              </div>
                              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{addr.name}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--brand-gradient)', color: 'var(--brand-text)' }}>Default</span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                              {addr.street}<br />
                              {addr.city}{addr.district && `, ${addr.district}`} – {addr.zipCode}<br />
                              {addr.state} · {addr.phone}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {!addr.isDefault && (
                              <button onClick={() => handleSetDefault(addr._id)} title="Set as default" className="btn-icon">
                                <FiStar size={14} />
                              </button>
                            )}
                            <button onClick={() => openEdit(addr)} title="Edit" className="btn-icon">
                              <FiEdit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteAddress(addr._id)} title="Delete" className="btn-icon"
                              style={{ color: 'var(--danger)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center rounded-xl" style={{ border: '2px dashed var(--border-color)' }}>
                      <FiMapPin size={28} className="mx-auto mb-2" style={{ color: 'var(--border-color)' }} />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No addresses saved yet</p>
                      <button onClick={openNew} className="mt-3 text-sm font-medium" style={{ color: 'var(--brand-secondary)' }}>
                        + Add your first address
                      </button>
                    </div>
                  )
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
