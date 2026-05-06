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

// ── Shared input style ──────────────────────────────────────────────────────
const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400'
const lbl = 'block text-sm font-medium text-gray-600 mb-1'

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
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`)
        const data = await res.json()
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
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your profile and delivery addresses</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left sidebar ── */}
          <div className="space-y-4">

            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-16 h-16 rounded-xl bg-gray-900 flex items-center justify-center text-xl font-bold text-white mx-auto mb-3">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
              <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full ${
                user.role === 'admin' || user.role === 'superadmin'
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  : 'bg-green-50 text-green-600 border border-green-100'
              }`}>
                {user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
            </div>

            {/* Nav links */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {[
                { label: 'My Orders', icon: FiPackage, to: '/orders' },
                { label: 'Sign Out', icon: FiLogOut, danger: true, action: () => { logout(); navigate('/') } },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action || (() => navigate(item.to))}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                    item.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={15} className={item.danger ? 'text-red-400' : 'text-gray-400'} />
                    {item.label}
                  </div>
                  <FiChevronRight size={14} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right main content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Profile form ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <FiUser size={16} className="text-orange-500" /> Personal Details
              </h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      maxLength={10}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      className={inp}
                    />
                    {phone && !/^[6-9][0-9]{9}$/.test(phone) && phone.length === 10 && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <FiAlertCircle size={11} /> Enter a valid Indian mobile number
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Email</label>
                  <input type="email" disabled value={user.email} className={`${inp} bg-gray-50 cursor-not-allowed text-gray-400`} />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={profLoading}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-orange-500 transition-all disabled:opacity-50"
                  >
                    {profLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Addresses ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FiMapPin size={16} className="text-orange-500" /> Saved Addresses
                </h2>
                {!showForm && (
                  <button
                    onClick={openNew}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-500 hover:text-white rounded-lg transition-all border border-orange-100 hover:border-orange-500"
                  >
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
                    className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">{editId ? 'Edit Address' : 'New Address'}</h3>
                      <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="text-gray-400 hover:text-gray-700 transition-colors">
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
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                                addrForm.label === l
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                              }`}
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

                      <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-white rounded-lg border border-gray-100">
                        <input
                          type="checkbox"
                          checked={addrForm.isDefault}
                          onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
                          className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">Set as my default address</span>
                      </label>

                      <div className="flex gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={addrLoading}
                          className="flex-1 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-orange-500 transition-all disabled:opacity-50"
                        >
                          {addrLoading ? 'Saving...' : editId ? 'Update Address' : 'Save Address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowForm(false); setEditId(null) }}
                          className="px-4 py-3 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors"
                        >
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
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start gap-3 transition-all ${
                            addr.isDefault ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className={`p-1.5 rounded-md ${addr.label === 'Home' ? 'bg-blue-100 text-blue-600' : addr.label === 'Work' ? 'bg-purple-100 text-purple-600' : 'bg-pink-100 text-pink-600'}`}>
                                {addr.label === 'Home' ? <FiHome size={12} /> : addr.label === 'Work' ? <FiBriefcase size={12} /> : <FiMapPin size={12} />}
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{addr.name}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {addr.street}<br />
                              {addr.city}{addr.district && `, ${addr.district}`} – {addr.zipCode}<br />
                              {addr.state} · {addr.phone}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefault(addr._id)}
                                title="Set as default"
                                className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all text-xs"
                              >
                                <FiStar size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => openEdit(addr)}
                              title="Edit"
                              className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr._id)}
                              title="Delete"
                              className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 transition-all"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl">
                      <FiMapPin size={28} className="text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No addresses saved yet</p>
                      <button onClick={openNew} className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium">
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
