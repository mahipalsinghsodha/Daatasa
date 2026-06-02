import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  FiUser, FiMapPin, FiPlus, FiEdit2, FiTrash2,
  FiX, FiHome, FiBriefcase, FiStar, FiSearch,
  FiChevronRight, FiPackage, FiLogOut, FiCheck,
  FiAlertCircle, FiPhone, FiMail, FiChevronDown,
  FiFileText, FiRefreshCw, FiClock
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

// ── Shared Floating Input System ────────────────────────────────
const FloatingInput = ({ id, label, type = 'text', value, onChange, icon: Icon, rightElement, autoComplete, required, disabled, maxLength, inputMode }) => {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative w-full">
      <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
            style={{ color: focused ? 'var(--gold)' : 'var(--text-muted)' }}>
            <Icon size={16} />
          </div>
        )}
        <input
          id={id} type={type} value={value} onChange={onChange}
          autoComplete={autoComplete} required={required} disabled={disabled}
          maxLength={maxLength} inputMode={inputMode} placeholder={`Enter ${label.toLowerCase()}`}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full rounded-xl text-[14px] font-medium outline-none transition-all"
          style={{
            height: '52px',
            paddingLeft: Icon ? '42px' : '14px',
            paddingRight: rightElement ? '44px' : '14px',
            background: disabled ? 'var(--bg-surface)' : (focused ? '#FEFEFE' : '#F7F9FC'),
            border: `2px solid ${focused ? 'var(--gold)' : '#E2E8F0'}`,
            color: 'var(--navy)',
            boxShadow: focused ? '0 0 0 4px rgba(245,166,35,0.12), 0 2px 8px rgba(245,166,35,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
            borderRadius: '14px',
            opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  )
}

const FloatingSelect = ({ id, label, value, onChange, required, children, icon: Icon }) => {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative w-full">
      <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
            style={{ color: focused ? 'var(--gold)' : 'var(--text-muted)' }}>
            <Icon size={16} />
          </div>
        )}
        <select
          id={id} value={value} onChange={onChange} required={required}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full rounded-xl text-[14px] font-medium outline-none transition-all appearance-none"
          style={{
            height: '52px',
            paddingLeft: Icon ? '42px' : '14px', paddingRight: '44px',
            background: focused ? '#FEFEFE' : '#F7F9FC',
            border: `2px solid ${focused ? 'var(--gold)' : '#E2E8F0'}`,
            color: 'var(--navy)',
            boxShadow: focused ? '0 0 0 4px rgba(245,166,35,0.12), 0 2px 8px rgba(245,166,35,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
            borderRadius: '14px',
          }}
        >
          {children}
        </select>
        <FiChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  )
}

const Profile = () => {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [profLoading, setProfLoading] = useState(false)
  const [subscriptions, setSubscriptions] = useState([])

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
      fetchSubscriptions()
    }
  }, [user])

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/api/subscriptions/my')
      setSubscriptions(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/auth/me')
      setAddresses(res.data.addresses || [])
    } catch {}
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.put('/api/auth/profile', formData)
      updateUser({ name: res.data.name, phone: res.data.phone })
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
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
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your profile and delivery addresses</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left sidebar ── */}
          <div className="space-y-4">

            {/* Avatar card */}
            <div className="rounded-2xl p-6 text-center shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--gold) 0%, #D4AF37 100%)', color: '#FFF' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              <span className="inline-block mt-3 px-3 py-1 text-xs font-bold rounded-full shadow-sm"
                style={user.role === 'admin' || user.role === 'superadmin'
                  ? { background: 'rgba(139,92,246,0.10)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }
                  : { background: 'rgba(245,197,24,0.10)', color: 'var(--gold)', border: '1px solid rgba(245,197,24,0.25)' }
                }>
                {user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
            </div>

            {/* Nav links */}
            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              {[
                { label: 'My Orders', icon: FiPackage, to: '/orders' },
                { label: 'My Subscriptions', icon: FiRefreshCw, action: () => document.getElementById('subscriptions-section').scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Sign Out', icon: FiLogOut, danger: true, action: () => { logout(); navigate('/') } },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action || (() => navigate(item.to))}
                  className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold transition-all"
                  style={{ borderBottom: i === 0 ? '1px solid var(--border-color)' : 'none', color: item.danger ? 'var(--danger)' : 'var(--text-primary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.05)' : 'var(--bg-base)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} style={{ color: item.danger ? 'var(--danger)' : 'var(--text-muted)' }} />
                    {item.label}
                  </div>
                  <FiChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right main content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Profile form ── */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FiUser size={18} style={{ color: 'var(--gold)' }} /> Personal Details
              </h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <FloatingInput id="name" label="Full Name" icon={FiUser} required value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <FloatingInput id="phone" label="Phone Number" icon={FiPhone} value={phone} maxLength={10} inputMode="numeric" onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                    {phone && !/^[6-9][0-9]{9}$/.test(phone) && phone.length === 10 && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}><FiAlertCircle size={11} /> Enter a valid Indian mobile number</p>
                    )}
                  </div>
                </div>
                <div>
                  <FloatingInput id="email" label="Email Address (cannot be changed)" icon={FiMail} type="email" disabled value={user.email} />
                </div>
                <div className="flex justify-end pt-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" disabled={profLoading} 
                    className="flex items-center justify-center gap-2 px-8 font-bold text-white shadow-lg transition-all"
                    style={{
                      height: '48px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--gold) 0%, #D4AF37 100%)',
                      opacity: profLoading ? 0.7 : 1
                    }}>
                    {profLoading ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* ── Addresses ── */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <FiMapPin size={18} style={{ color: 'var(--gold)' }} /> Saved Addresses
                </h2>
                {!showForm && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openNew} 
                    className="flex items-center gap-2 px-5 py-2.5 font-bold text-white shadow-md transition-all text-sm"
                    style={{
                      borderRadius: '10px',
                      background: 'var(--navy)',
                    }}>
                    <FiPlus size={16} /> Add Address
                  </motion.button>
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
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Address Type</label>
                        <div className="flex gap-3">
                          {['Home', 'Work', 'Other'].map(l => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => setAddrForm(p => ({ ...p, label: l }))}
                              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
                              style={addrForm.label === l
                                ? { background: 'linear-gradient(135deg, var(--gold) 0%, #D4AF37 100%)', color: '#FFF', border: '1px solid transparent' }
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
                          <FloatingInput
                            id="addr_name"
                            label="Recipient Name"
                            icon={FiUser}
                            required
                            value={addrForm.name}
                            onChange={e => setAddrForm(p => ({ ...p, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <FloatingInput
                            id="addr_phone"
                            label="Phone Number"
                            icon={FiPhone}
                            type="tel"
                            required
                            maxLength={10}
                            inputMode="numeric"
                            value={addrForm.phone}
                            onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                          />
                          {addrForm.phone && !/^[6-9][0-9]{9}$/.test(addrForm.phone) && addrForm.phone.length === 10 && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <FiAlertCircle size={11} /> Invalid number
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <FloatingInput
                          id="addr_street"
                          label="Street Address (House no., street, area)"
                          icon={FiMapPin}
                          required
                          value={addrForm.street}
                          onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <div className="relative">
                            <FloatingInput
                              id="addr_pin"
                              label="PIN Code"
                              type="text"
                              required
                              maxLength={6}
                              inputMode="numeric"
                              value={addrForm.zipCode}
                              onChange={e => handlePinChange(e.target.value)}
                              rightElement={
                                pinLoading ? (
                                  <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-500 rounded-full animate-spin" />
                                ) : (!pinLoading && addrForm.zipCode.length === 6 && !pinError && addrForm.city ? (
                                  <FiCheck className="text-green-500" size={16} />
                                ) : null)
                              }
                            />
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
                          <FloatingInput
                            id="addr_city"
                            label="City"
                            type="text"
                            required
                            value={addrForm.city}
                            onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <FloatingInput
                            id="addr_district"
                            label="District"
                            type="text"
                            value={addrForm.district}
                            onChange={e => setAddrForm(p => ({ ...p, district: e.target.value }))}
                          />
                        </div>
                        <div>
                          <FloatingSelect
                            id="addr_state"
                            label="State"
                            required
                            value={addrForm.state}
                            onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))}
                          >
                            <option value="" disabled hidden></option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </FloatingSelect>
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

                      <div className="flex gap-3 pt-3">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit" disabled={addrLoading} 
                          className="flex-1 flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all"
                          style={{
                            height: '52px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, var(--gold) 0%, #D4AF37 100%)',
                            opacity: addrLoading ? 0.7 : 1
                          }}>
                          {addrLoading ? 'Saving...' : editId ? 'Update Address' : 'Save Address'}
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button" onClick={() => { setShowForm(false); setEditId(null) }} 
                          className="px-6 flex items-center justify-center font-bold shadow-sm transition-all"
                          style={{
                            height: '52px', borderRadius: '14px',
                            background: 'var(--bg-base)', border: '2px solid var(--border-color)', color: 'var(--text-primary)'
                          }}>
                          Cancel
                        </motion.button>
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
                    <div className="py-14 text-center rounded-2xl" style={{ border: '2px dashed var(--border-color)', background: 'var(--bg-base)' }}>
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
                        <FiMapPin size={28} style={{ color: 'var(--gold)' }} />
                      </div>
                      <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No addresses saved yet</p>
                      <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>Add an address for faster checkout</p>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openNew} 
                        className="mx-auto flex items-center gap-2 px-6 py-3 font-bold text-white shadow-lg transition-all text-sm"
                        style={{
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, var(--gold) 0%, #D4AF37 100%)',
                        }}>
                        <FiPlus size={16} /> Add your first address
                      </motion.button>
                    </div>
                  )
                )}
              </AnimatePresence>
            </div>

            {/* ── Subscriptions ── */}
            <div id="subscriptions-section" className="rounded-2xl p-6 lg:p-8 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <FiRefreshCw size={18} style={{ color: 'var(--gold)' }} /> My Subscriptions
                </h2>
              </div>
              
              {subscriptions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">You don't have any active subscriptions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map(sub => (
                    <div key={sub._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <img src={sub.plan?.product?.image || sub.plan?.product?.images?.[0]} alt="" className="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-gray-100" />
                        <div>
                          <p className="font-bold text-gray-900">{sub.plan?.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">₹{sub.plan?.price} / {sub.plan?.period}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sub.status === 'active' || sub.status === 'authenticated' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                              {sub.status.toUpperCase()}
                            </span>
                            {sub.nextBillingDate && sub.status === 'active' && (
                              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <FiClock size={10} /> Next bill: {new Date(sub.nextBillingDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {sub.status === 'active' && (
                        <button 
                          onClick={async () => {
                            if(window.confirm('Are you sure you want to cancel this subscription?')) {
                              try {
                                await api.post('/api/subscriptions/cancel', { subscriptionId: sub._id });
                                toast.success('Subscription cancelled');
                                fetchSubscriptions();
                              } catch(e) { toast.error('Failed to cancel'); }
                            }
                          }}
                          className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
