import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers, FiSearch, FiLock, FiUnlock, FiX,
  FiShoppingBag, FiShield, FiMail, FiPhone, FiCalendar,
  FiRefreshCw, FiUserCheck, FiUser, FiAlertCircle
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import RestrictedAccess from '../../components/RestrictedAccess'

const AdminUsers = () => {
  const { hasPermission } = useAuth()
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
      const [uRes, oRes] = await Promise.all([
        api.get('/api/auth/users'),
        api.get('/api/orders')
      ])
      setUsers(uRes.data || [])
      setOrders(oRes.data?.orders || [])
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleToggleBlock = async (target) => {
    try {
      setProcessingId(target._id)
      const res = await api.put(
        `/api/auth/users/${target._id}/block`,
        { reason: target.isBlocked ? 'Unblocked by admin' : 'Blocked by admin' }
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
      filterRole === 'blocked' ? u.isBlocked : u.role === filterRole
    return matchSearch && matchRole
  })

  const getUserOrders = (uid) =>
    orders.filter(o => (o.user && typeof o.user === 'object' ? o.user._id : o.user) === uid)

  if (!hasPermission('users')) return (
    <RestrictedAccess title="Access Restricted" message="You don't have permission to view users." />
  )

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center" style={{ background: '#f8f9fa' }}>
      <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pb-20" style={{ background: '#f8f9fa' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-3">Admin</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>
                Manage Users
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <FiSearch size={15} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search name, email, phone…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 w-52 placeholder:text-gray-400"
                />
              </div>
              <button onClick={() => fetchAllData(true)} disabled={refreshing} className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats + Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-lg">
                <FiUsers size={14} className="text-orange-500" />
                <span className="text-xs font-semibold text-orange-700">{users.length} Users</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                <FiLock size={14} className="text-red-500" />
                <span className="text-xs font-semibold text-red-700">{users.filter(u => u.isBlocked).length} Blocked</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                <FiShield size={14} className="text-blue-500" />
                <span className="text-xs font-semibold text-blue-700">{users.filter(u => u.role === 'admin').length} Admins</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1.5 flex-wrap">
              {[['all', 'All'], ['user', 'Customers'], ['admin', 'Admins'], ['blocked', 'Blocked']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilterRole(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterRole === val ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/80">
                  {['User', 'Role & Status', 'Joined', 'Orders', 'Total Spent', 'Action'].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i >= 3 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <FiUsers size={36} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-sm font-medium text-gray-400">No users found</p>
                    </td>
                  </tr>
                ) : filtered.map(u => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedUser(u)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${u.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' : u.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {u.role}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${u.isBlocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium text-gray-700">{u.totalOrders}</td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-orange-600">₹{u.totalSpent?.toFixed(0)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={e => { e.stopPropagation(); handleToggleBlock(u) }}
                          disabled={processingId === u._id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 ${u.isBlocked ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}
                        >
                          {processingId === u._id ? '…' : u.isBlocked ? <><FiUnlock size={12} /> Unblock</> : <><FiLock size={12} /> Block</>}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-full max-w-[500px] h-full bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{selectedUser.name}</h2>
                    <p className="text-xs text-gray-400">#{selectedUser._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <FiX size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Status Banner */}
                <div className={`flex items-center justify-between p-4 rounded-xl border ${selectedUser.isBlocked ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                  <div className="flex items-center gap-2.5">
                    {selectedUser.isBlocked ? <FiAlertCircle size={16} className="text-red-600" /> : <FiUserCheck size={16} className="text-green-600" />}
                    <span className={`text-sm font-semibold ${selectedUser.isBlocked ? 'text-red-700' : 'text-green-700'}`}>
                      {selectedUser.isBlocked ? 'Account Blocked' : 'Account Active'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleBlock(selectedUser)}
                    disabled={processingId === selectedUser._id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${selectedUser.isBlocked ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                  >
                    {processingId === selectedUser._id ? '…' : selectedUser.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                    <p className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{selectedUser.totalOrders}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                    <p className="text-2xl font-extrabold text-orange-500" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>₹{selectedUser.totalSpent?.toFixed(0)}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/60">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Account Details</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[
                      { icon: FiMail, label: 'Email', val: selectedUser.email },
                      { icon: FiPhone, label: 'Phone', val: selectedUser.phone || 'Not provided' },
                      { icon: FiShield, label: 'Role', val: selectedUser.role },
                      { icon: FiCalendar, label: 'Joined', val: new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    ].map((item, idx) => (
                      <div key={idx} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-xs text-gray-500">
                          <item.icon size={13} className="text-orange-400" /> {item.label}
                        </div>
                        <span className="text-xs font-semibold text-gray-800">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Recent Orders</h3>
                  {(() => {
                    const uOrders = getUserOrders(selectedUser._id)
                    if (!uOrders.length) return (
                      <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400">No orders placed yet</p>
                      </div>
                    )
                    return (
                      <div className="space-y-2">
                        {uOrders.slice(0, 5).map(o => (
                          <div key={o._id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                            <div>
                              <p className="text-xs font-bold text-gray-900 font-mono">#{o._id.slice(-8).toUpperCase()}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">₹{o.totalPrice?.toFixed(0)}</p>
                              <span className={`text-xs font-semibold ${o.isDelivered ? 'text-green-600' : 'text-blue-600'}`}>
                                {o.isDelivered ? 'Delivered' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-gray-100 bg-gray-50">
                <button onClick={() => setSelectedUser(null)} className="w-full py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminUsers