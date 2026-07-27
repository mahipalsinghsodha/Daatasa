import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  FiUser, FiMapPin, FiChevronRight, FiPackage, FiLogOut, FiLock, FiEye, FiEyeOff
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

const ChangePassword = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  if (!user) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match')
    }
    
    setLoading(true)
    try {
      const res = await api.post('/api/auth/change-password', {
        oldPassword, newPassword
      })
      toast.success(res.data.message || 'Password changed successfully')
      logout()
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const InputField = ({ label, value, onChange, show, setShow }) => (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text/40">
          <FiLock size={16} />
        </div>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          className="w-full h-[52px] pl-[42px] pr-[44px] rounded-[1rem] bg-[var(--ivory)] border border-brand-primary/10 focus:border-brand-secondary focus:bg-white focus:ring-1 focus:ring-brand-secondary outline-none transition-all text-sm font-medium text-brand-primary"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text/40 hover:text-brand-primary transition-colors"
        >
          {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-16 bg-[var(--ivory)] font-sans text-brand-text">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-brand-primary/10 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold font-display text-brand-primary">Change Password</h1>
          <p className="text-base mt-3 text-brand-text/60 font-medium">Update your account security</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* ── Left sidebar ── */}
          <div className="space-y-6">
            {/* Avatar card */}
            <div className="rounded-[2rem] p-8 text-center shadow-sm bg-white border border-brand-primary/10">
              <div className="w-24 h-24 rounded-[1.5rem] flex items-center justify-center text-4xl font-bold mx-auto mb-5 shadow-sm bg-brand-primary text-white">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <p className="text-xl font-bold font-display text-brand-primary">{user.name}</p>
              <p className="text-sm mt-1 text-brand-text/60">{user.email}</p>
            </div>

            {/* Nav links */}
            <div className="rounded-[2rem] overflow-hidden shadow-sm bg-white border border-brand-primary/10">
              {[
                { label: 'Profile', icon: FiUser, to: '/profile' },
                { label: 'My Addresses', icon: FiMapPin, to: '/addresses' },
                { label: 'My Orders', icon: FiPackage, to: '/orders' },
                { label: 'Change Password', icon: FiLock, to: '/change-password', active: true },
                { label: 'Sign Out', icon: FiLogOut, danger: true, action: () => { logout(); navigate('/') } },
              ].map((item, i, arr) => (
                <button
                  key={i}
                  onClick={item.action || (() => navigate(item.to))}
                  className="w-full flex items-center justify-between px-6 py-5 text-sm font-bold transition-all hover:bg-[var(--ivory)]"
                  style={{ 
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(27, 47, 110, 0.05)' : 'none', 
                    color: item.danger ? '#ef4444' : (item.active ? 'var(--brand-secondary)' : 'var(--brand-primary)'),
                    background: item.active ? 'var(--ivory)' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={item.danger ? 'text-red-500' : (item.active ? 'text-brand-secondary' : 'text-brand-text/40')} />
                    {item.label}
                  </div>
                  {!item.active && <FiChevronRight size={18} className="text-brand-text/30" />}
                </button>
              ))}
            </div>
          </div>

          {/* ── Right main content ── */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-[2rem] p-8 lg:p-10 shadow-sm bg-white border border-brand-primary/10">
              <h2 className="text-xl font-bold font-display text-brand-primary mb-8 flex items-center gap-3 border-b border-brand-primary/5 pb-4">
                <FiLock size={20} className="text-brand-secondary" /> Update Password
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                
                <InputField 
                  label="Current Password" 
                  value={oldPassword} 
                  onChange={e => setOldPassword(e.target.value)} 
                  show={showOld} 
                  setShow={setShowOld} 
                />

                <InputField 
                  label="New Password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  show={showNew} 
                  setShow={setShowNew} 
                />

                <InputField 
                  label="Confirm New Password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  show={showNew} 
                  setShow={setShowNew} 
                />

                <div className="pt-6">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading} 
                    className="w-full btn btn-primary h-14 rounded-full flex items-center justify-center font-bold text-base"
                  >
                    {loading ? 'Updating...' : 'Change Password'}
                  </motion.button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ChangePassword
