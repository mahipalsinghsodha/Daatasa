import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiPlus, FiPackage, FiShoppingBag, FiAlertCircle, FiTag,
  FiUsers, FiShield, FiActivity, FiBarChart2, FiTrendingUp,
  FiArrowRight, FiBox, FiSettings
} from 'react-icons/fi'
import api from '../../api/axios'

const useCountUp = (end, duration = 800) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!end) { setCount(0); return }
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return count
}

const StatCard = ({ title, value, icon: Icon, colorCls = 'bg-gray-100 text-gray-500' }) => {
  const animated = useCountUp(value)
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{animated}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorCls}`}>
        <Icon size={20} />
      </div>
    </div>
  )
}

const QuickCard = ({ title, desc, icon: Icon, to, accent }) => (
  <Link
    to={to}
    className={`flex items-center gap-4 p-5 rounded-xl border transition-all group ${
      accent ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
    }`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-all'}`}>
      <Icon size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <FiArrowRight size={15} className={`shrink-0 transition-colors ${accent ? 'text-orange-400' : 'text-gray-300 group-hover:text-gray-600'}`} />
  </Link>
)

const AdminDashboard = () => {
  const { user, hasPermission } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, pendingOrders: 0, activeCoupons: 0, totalUsers: 0, blockedUsers: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superadmin') fetchStats()
    else setLoading(false)
  }, [user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const promises = []
      const indexMap = {}
      if (hasPermission('products')) { indexMap.products = promises.length; promises.push(api.get('/api/products').catch(() => ({ data: [] }))) }
      if (hasPermission('orders')) { indexMap.orders = promises.length; promises.push(api.get('/api/orders').catch(() => ({ data: { orders: [] } }))) }
      if (hasPermission('coupons')) { indexMap.coupons = promises.length; promises.push(api.get('/api/coupons').catch(() => ({ data: [] }))) }
      if (hasPermission('users')) { indexMap.users = promises.length; promises.push(api.get('/api/auth/users').catch(() => ({ data: [] }))) }

      const results = await Promise.all(promises)
      const products = indexMap.products !== undefined ? results[indexMap.products]?.data || [] : []
      const orders   = indexMap.orders !== undefined ? results[indexMap.orders]?.data?.orders || [] : []
      const coupons  = indexMap.coupons !== undefined ? results[indexMap.coupons]?.data || [] : []
      const users    = indexMap.users !== undefined ? results[indexMap.users]?.data || [] : []
      const now = new Date()

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => !o.isPaid || !o.isDelivered).length,
        activeCoupons: coupons.filter(c => c.isActive && new Date(c.validUntil) > now).length,
        totalUsers: users.length,
        blockedUsers: users.filter(u => u.isBlocked).length,
      })
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <Navigate to="/login" />
  if (user.role !== 'admin' && user.role !== 'superadmin') return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl max-w-md w-full">
        <h2 className="font-bold text-base mb-1">Access Denied</h2>
        <p className="text-sm">You must be an admin to access this page.</p>
      </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center" style={{ background: '#f8f9fa' }}>
      <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl max-w-md w-full flex items-center gap-3">
        <FiAlertCircle size={20} /> {error}
      </div>
    </div>
  )

  const isSuperAdmin = user.role === 'superadmin'

  return (
    <div className="min-h-screen pb-20" style={{ background: '#f8f9fa' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border mb-3 ${isSuperAdmin ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                {isSuperAdmin ? 'Super Admin' : 'Admin Panel'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>
                {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, <span className="font-semibold text-gray-800">{user.name}</span></p>
            </div>
            <div className="flex items-center gap-2">
              {hasPermission('products') && (
                <button onClick={() => navigate('/admin/add-product')} className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-all">
                  <FiPlus size={15} /> Add Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {hasPermission('products') && <StatCard title="Products" value={stats.totalProducts} icon={FiBox} colorCls="bg-blue-50 text-blue-500" />}
          {hasPermission('orders') && <>
            <StatCard title="Total Orders" value={stats.totalOrders} icon={FiShoppingBag} colorCls="bg-green-50 text-green-500" />
            <StatCard title="Pending Orders" value={stats.pendingOrders} icon={FiAlertCircle} colorCls="bg-amber-50 text-amber-500" />
          </>}
          {hasPermission('coupons') && <StatCard title="Active Coupons" value={stats.activeCoupons} icon={FiTag} colorCls="bg-purple-50 text-purple-500" />}
          {hasPermission('users') && <>
            <StatCard title="Total Users" value={stats.totalUsers} icon={FiUsers} colorCls="bg-indigo-50 text-indigo-500" />
            <StatCard title="Blocked Users" value={stats.blockedUsers} icon={FiAlertCircle} colorCls="bg-red-50 text-red-500" />
          </>}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Management */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Management</h2>
            </div>
            <div className="p-4 space-y-2">
              {hasPermission('products') && <QuickCard title="Manage Products" desc="Add, edit, or remove products" icon={FiPackage} to="/admin/products" />}
              {hasPermission('orders') && <QuickCard title="Manage Orders" desc="View and update order status" icon={FiShoppingBag} to="/admin/orders" />}
              {hasPermission('users') && <QuickCard title="Manage Users" desc="View users, block/unblock accounts" icon={FiUsers} to="/admin/users" />}
              {hasPermission('coupons') && <QuickCard title="Manage Coupons" desc="Create and manage discount codes" icon={FiTag} to="/admin/coupons" />}
              {hasPermission('categories') && <QuickCard title="Manage Categories" desc="Organize product categories" icon={FiBox} to="/admin/categories" />}
            </div>
          </div>

          {/* Analytics & Admin tools */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Analytics & Tools</h2>
            </div>
            <div className="p-4 space-y-2">
              <QuickCard title="Analytics" desc="Sales reports and insights" icon={FiBarChart2} to="/admin/analytics" accent />
              <QuickCard title="Support Tickets" desc="Customer support messages" icon={FiActivity} to="/admin/support" />
              <QuickCard title="Platform Settings" desc="GST rate and shipping config" icon={FiSettings} to="/admin/settings" />
              {isSuperAdmin && (
                <>
                  <QuickCard title="Admin Management" desc="Manage admin accounts and permissions" icon={FiShield} to="/admin/manage-admins" accent />
                  <QuickCard title="Audit Logs" desc="System activity and security logs" icon={FiTrendingUp} to="/admin/audit-logs" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard