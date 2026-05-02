import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import {
  FiUser, FiMapPin, FiPhone, FiMail, FiPlus, FiEdit2,
  FiTrash2, FiCheck, FiX, FiHome, FiBriefcase,
  FiAlertCircle, FiCheckCircle, FiStar, FiSearch,
  FiCamera, FiLock, FiChevronRight
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

const Profile = () => {
  const { user, setUser } = useAuth()
  
  // Profile States
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [profLoading, setProfLoading] = useState(false)

  // Address States
  const [addresses, setAddresses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [addrForm, setAddrForm] = useState(emptyAddr)
  const [addrLoading, setAddrLoading] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)

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
    } catch (e) {
      console.error('Error fetching addresses:', e)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfLoading(true)
    try {
      const res = await api.put('/api/auth/profile', { name, phone })
      setUser(prev => ({ ...prev, name: res.data.name, phone: res.data.phone }))
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setProfLoading(false)
    }
  }

  const handlePinLookup = async (pin) => {
    const cleaned = pin.replace(/\D/g, '').slice(0, 6)
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
            state: po.State, 
            district: po.District, 
            city: po.Division || po.District 
          }))
        }
      } catch (e) {
        console.error('PIN lookup error:', e)
      } finally {
        setPinLoading(false)
      }
    }
  }

  const handleAddrSubmit = async (e) => {
    e.preventDefault()
    setAddrLoading(true)
    try {
      const res = editId
        ? await api.put(`/api/auth/addresses/${editId}`, addrForm)
        : await api.post('/api/auth/addresses', addrForm)
      setAddresses(res.data.addresses)
      setShowForm(false)
      setEditId(null)
      setAddrForm(emptyAddr)
      toast.success(editId ? 'Address updated' : 'Address added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address')
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
    } catch (e) {
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefault = async (id) => {
    try {
      const res = await api.patch(`/api/auth/addresses/${id}/default`)
      setAddresses(res.data.addresses)
      toast.success('Default address updated')
    } catch (e) {
      toast.error('Failed to set default')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-32">
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-[var(--color-border)] pt-12 pb-8 sm:pt-16 sm:pb-12 shadow-sm relative z-10">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-4">
              <FiUser size={14} className="text-orange-600" />
              <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">Personal Management</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 font-head tracking-tight">Account Settings</h1>
            <p className="text-gray-500 font-medium max-w-lg">Manage your identity, security preferences, and delivery coordinates.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* ── Left Column: Identity Card ── */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-32 bg-orange-600/5" />
              
              <div className="relative z-10">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-[32px] bg-gray-900 flex items-center justify-center text-3xl font-black text-white font-head shadow-2xl">
                    {user.name?.[0].toUpperCase()}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-600 text-white rounded-2xl border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <FiCamera size={16} />
                  </button>
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-1 font-head">{user.name}</h3>
                <p className="text-sm font-bold text-gray-400 mb-6">{user.email}</p>
                
                <div className="flex flex-col gap-2">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block ${
                    user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-green-50 text-green-600 border border-green-100'
                  }`}>
                    {user.role === 'admin' ? 'System Admin' : 'Verified Customer'}
                  </span>
                  <div className="h-0.5 w-12 bg-gray-100 mx-auto my-2" />
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Member since {new Date(user.createdAt).getFullYear()}</p>
                </div>
              </div>
            </div>

            {/* Account Quick Links */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-4 space-y-1">
               {[
                { label: 'My Orders', icon: FiPackage, link: '/orders' },
                { label: 'Wishlist', icon: FiStar, link: '/wishlist' },
                { label: 'Logout', icon: FiX, action: () => { localStorage.clear(); window.location.href = '/' }, danger: true }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.action || (() => window.location.href = item.link)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    item.danger ? 'hover:bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={item.danger ? 'text-red-500' : 'text-orange-500'} />
                    <span className="text-sm font-black">{item.label}</span>
                  </div>
                  <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right Column: Configuration ── */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Profile Form */}
            <section className="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-12 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                  <FiEdit2 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 font-head">Identity Info</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Personal Details</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-bold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    disabled={profLoading}
                    className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-200 hover:bg-orange-600 transition-all disabled:opacity-50"
                  >
                    {profLoading ? 'Processing...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </section>

            {/* Address Management */}
            <section className="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-12 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 font-head">Delivery Vault</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saved Addresses</p>
                  </div>
                </div>
                {!showForm && (
                  <button 
                    onClick={() => { setShowForm(true); setEditId(null); setAddrForm(emptyAddr) }}
                    className="flex items-center gap-2 px-5 py-3 bg-orange-50 text-orange-600 rounded-xl text-xs font-black hover:bg-orange-600 hover:text-white transition-all"
                  >
                    <FiPlus size={14} /> New Address
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {showForm ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gray-50 rounded-[32px] p-8 border border-gray-100"
                  >
                    <form onSubmit={handleAddrSubmit} className="space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">{editId ? 'Modify Locale' : 'Add Locale'}</h4>
                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><FiX size={20} /></button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Label Selector */}
                        <div className="sm:col-span-2 flex gap-2">
                           {['Home', 'Work', 'Other'].map(l => (
                             <button
                               key={l}
                               type="button"
                               onClick={() => setAddrForm(p => ({ ...p, label: l }))}
                               className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border-2 ${
                                 addrForm.label === l ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-white text-gray-400 hover:border-gray-200'
                               }`}
                             >
                               {l}
                             </button>
                           ))}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recipient Name</label>
                          <input type="text" required value={addrForm.name} onChange={e => setAddrForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 outline-none text-sm font-bold focus:border-orange-500 transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Phone</label>
                          <input type="tel" required value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 outline-none text-sm font-bold focus:border-orange-500 transition-all" />
                        </div>
                        
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                          <input type="text" required value={addrForm.street} onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 outline-none text-sm font-bold focus:border-orange-500 transition-all" />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PIN Code</label>
                          <div className="relative">
                            <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${pinLoading ? 'animate-pulse text-orange-500' : 'text-gray-300'}`} />
                            <input 
                              type="text" 
                              required 
                              maxLength={6}
                              value={addrForm.zipCode} 
                              onChange={e => handlePinLookup(e.target.value)} 
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none text-sm font-bold focus:border-orange-500 transition-all" 
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State / UT</label>
                          <select required value={addrForm.state} onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 outline-none text-sm font-bold focus:border-orange-500 transition-all appearance-none cursor-pointer">
                            <option value="">Select State</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City / Hub</label>
                          <input type="text" required value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 outline-none text-sm font-bold focus:border-orange-500 transition-all" />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 mt-2">
                           <input 
                            type="checkbox" 
                            id="def"
                            checked={addrForm.isDefault} 
                            onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
                            className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                           />
                           <label htmlFor="def" className="text-xs font-black text-gray-700 cursor-pointer">Mark as Primary Address</label>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button 
                          disabled={addrLoading}
                          className="flex-1 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-200 transition-all hover:bg-orange-600"
                        >
                          {addrLoading ? 'Processing...' : editId ? 'Verify & Update' : 'Secure & Save'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.map((addr) => (
                      <motion.div 
                        key={addr._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-6 rounded-[32px] border-2 transition-all flex flex-col sm:flex-row justify-between items-start gap-4 ${
                          addr.isDefault 
                            ? 'bg-orange-50/30 border-orange-200' 
                            : 'bg-white border-gray-50 hover:border-gray-100'
                        }`}
                      >
                         <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-xl ${addr.label === 'Home' ? 'bg-blue-50 text-blue-600' : addr.label === 'Work' ? 'bg-purple-50 text-purple-600' : 'bg-pink-50 text-pink-600'}`}>
                                  {addr.label === 'Home' ? <FiHome size={14}/> : addr.label === 'Work' ? <FiBriefcase size={14}/> : <FiMapPin size={14}/>}
                               </div>
                               <span className="text-sm font-black text-gray-900 font-head">{addr.name}</span>
                               {addr.isDefault && <span className="bg-orange-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">Primary</span>}
                            </div>
                            <div className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-tighter">
                               {addr.street}<br/>
                               {addr.city}, {addr.state} — {addr.zipCode}
                            </div>
                         </div>

                         <div className="flex items-center gap-2 self-end sm:self-center">
                            {!addr.isDefault && (
                              <button onClick={() => handleSetDefault(addr._id)} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-orange-600 hover:border-orange-100 transition-all shadow-sm" title="Set Default">
                                <FiStar size={16} />
                              </button>
                            )}
                            <button onClick={() => { setAddrForm(addr); setEditId(addr._id); setShowForm(true) }} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm" title="Edit Locale">
                               <FiEdit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteAddress(addr._id)} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm" title="Expunge">
                               <FiTrash2 size={16} />
                            </button>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 bg-gray-50 rounded-[32px] border border-dashed border-gray-200 flex flex-col items-center text-center p-8">
                     <div className="text-4xl mb-4 grayscale opacity-20">📍</div>
                     <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Locales Saved</p>
                  </div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
