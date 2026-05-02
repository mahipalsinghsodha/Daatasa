import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiPlus, FiPackage, FiShoppingBag, FiAlertCircle, FiTag, FiUsers, FiShield, FiActivity, FiBarChart2
} from 'react-icons/fi'
import api from '../../api/axios'

/* ── Counter animation hook ─────────────────────────────────────────────── */
const useCountUp = (end, duration = 600) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else { setCount(Math.floor(start)) }
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return count
}

const T = {
  bg: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  accent: '#e8621a',
  text: '#0f172a',
  textMid: '#64748b',
  textL: '#94a3b8',
  success: '#10b981',
  danger: '#ef4444',
  font: '"Inter", "DM Sans", sans-serif',
}

/* ── Main component ─────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const { user, hasPermission } = useAuth()
  const navigate   = useNavigate()

  const [stats,   setStats]   = useState({ totalProducts: 0, totalOrders: 0, pendingOrders: 0, totalCoupons: 0, activeCoupons: 0, totalUsers: 0, blockedUsers: 0 })
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superadmin') fetchStats()
    else setLoading(false)
  }, [user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      const promises = []
      const indexMap = {}

      if (hasPermission('products')) {
        indexMap.products = promises.length
        promises.push(api.get('/api/products').catch(() => ({ data: [] })))
      }
      if (hasPermission('orders')) {
        indexMap.orders = promises.length
        promises.push(api.get('/api/orders').catch(() => ({ data: { orders: [] } })))
      }
      if (hasPermission('coupons')) {
        indexMap.coupons = promises.length
        promises.push(api.get('/api/coupons').catch(() => ({ data: [] })))
      }
      if (hasPermission('users')) {
        indexMap.users = promises.length
        promises.push(api.get('/api/auth/users').catch(() => ({ data: [] })))
      }

      const results = await Promise.all(promises)
      
      const products = indexMap.products !== undefined ? results[indexMap.products]?.data || [] : []
      const orders   = indexMap.orders !== undefined ? results[indexMap.orders]?.data?.orders || [] : []
      const coupons  = indexMap.coupons !== undefined ? results[indexMap.coupons]?.data || [] : []
      const users    = indexMap.users !== undefined ? results[indexMap.users]?.data || [] : []
      const now      = new Date()

      setStats({
        totalProducts:  products.length,
        totalOrders:    orders.length,
        pendingOrders:  orders.filter(o => !o.isPaid || !o.isDelivered).length,
        totalCoupons:   coupons.length,
        activeCoupons:  coupons.filter(c => c.isActive && new Date(c.validUntil) > now).length,
        totalUsers:     users.length,
        blockedUsers:   users.filter(u => u.isBlocked).length
      })
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  /* ── Guards ─────────────────────────────────────────────────────────── */
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-6 rounded-xl max-w-md w-full">
        <h2 className="font-bold text-lg mb-2">Please Login</h2>
        <p>You must be logged in to access the admin panel.</p>
      </div>
    </div>
  )

  if (user.role !== 'admin' && user.role !== 'superadmin') return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-xl max-w-lg w-full">
        <h2 className="font-bold text-lg mb-2">Access Denied</h2>
        <p>You must be an admin to access this page.</p>
        <div className="mt-4 text-sm">
          <p>Your role: <strong>{user.role}</strong></p>
          <p>Email: <strong>{user.email}</strong></p>
        </div>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: T.font }}>
      <p style={{ fontSize: 16, fontWeight: 600, color: T.textMid, animation: 'pulse 1.5s infinite' }}>Synchronizing Dashboard...</p>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-red-50 border border-red-300 text-red-700 p-6 rounded-xl max-w-md w-full flex items-center gap-3">
        <FiAlertCircle className="text-2xl" />
        <span>{error}</span>
      </div>
    </div>
  )

  /* ── Dashboard ──────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.font, color: T.text, padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
            {user.role === 'superadmin' ? 'Super Admin Overview' : 'Admin Overview'}
          </h1>
          <p style={{ margin: '4px 0 0', color: T.textMid, fontSize: 14 }}>
            Control center for <span style={{ fontWeight: 600, color: T.text }}>DhaniFresh</span> operations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {hasPermission('users') && (
            <button onClick={() => navigate('/admin/users')}
              style={{ padding: '10px 18px', background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, color: T.textMid, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
              <FiUsers size={16} /> Users
            </button>
          )}
          {hasPermission('products') && (
            <button onClick={() => navigate('/admin/add-product')}
              style={{ padding: '10px 18px', background: T.accent, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(232,98,26,0.2)' }}>
              <FiPlus size={16} /> New Product
            </button>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24, marginBottom: 48 }}>
        {hasPermission('products') && <StatCard title="Total Products" value={stats.totalProducts} icon={<FiPackage />} />}
        {hasPermission('users') && (
          <>
            <StatCard title="Total Users" value={stats.totalUsers} icon={<FiUsers />} color="blue" />
            <StatCard title="Blocked Accounts" value={stats.blockedUsers} icon={<FiAlertCircle />} color="red" />
          </>
        )}
        {hasPermission('orders') && (
          <>
            <StatCard title="Pending Orders" value={stats.pendingOrders} icon={<FiAlertCircle />} color="orange" />
            <StatCard title="Total Volume" value={stats.totalOrders} icon={<FiShoppingBag />} />
          </>
        )}
        {hasPermission('coupons') && <StatCard title="Active Promotions" value={stats.activeCoupons} icon={<FiTag />} color="green" />}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administrative Modules</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {hasPermission('products') && (
            <QuickCard title="Products" icon={<FiPackage />} onClick={() => navigate('/admin/products')} />
          )}
          {hasPermission('orders') && (
            <QuickCard title="Orders" icon={<FiShoppingBag />} onClick={() => navigate('/admin/orders')} />
          )}
          {hasPermission('users') && (
            <QuickCard title="User Base" icon={<FiUsers />} onClick={() => navigate('/admin/users')} />
          )}
          {hasPermission('coupons') && (
            <QuickCard title="Promotions" icon={<FiTag />} onClick={() => navigate('/admin/coupons')} />
          )}
          {hasPermission('categories') && (
            <QuickCard title="Categories" icon={<FiPackage />} onClick={() => navigate('/admin/categories')} />
          )}
          <QuickCard title="Analytics" icon={<FiBarChart2 />} onClick={() => navigate('/admin/analytics')} accent />
          {user.role === 'superadmin' && (
            <>
              <QuickCard title="Access Control" icon={<FiShield />} onClick={() => navigate('/admin/manage-admins')} accent />
              <QuickCard title="System Audit" icon={<FiActivity />} onClick={() => navigate('/admin/audit-logs')} accent />
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

/* ── Stat card ──────────────────────────────────────────────────────────── */
const StatCard = ({ title, value, icon, color }) => {
  const animatedValue = useCountUp(value)
  const colors = {
    blue: { soft: '#eff6ff', deep: '#3b82f6' },
    red: { soft: '#fef2f2', deep: '#ef4444' },
    orange: { soft: '#fff7ed', deep: '#f97316' },
    green: { soft: '#f0fdf4', deep: '#22c55e' },
    default: { soft: '#f8fafc', deep: '#64748b' }
  }
  const c = colors[color] || colors.default

  return (
    <div style={{ background: T.surface, padding: 24, borderRadius: 20, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div>
        <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: T.textMid }}>{title}</p>
        <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: T.text }}>{animatedValue}</p>
      </div>
      <div style={{ width: 52, height: 52, background: c.soft, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.deep }}>
        {icon}
      </div>
    </div>
  )
}

/* ── Quick action card ──────────────────────────────────────────────────── */
const QuickCard = ({ title, icon, onClick, accent }) => (
  <button onClick={onClick}
    style={{
      padding: 20, borderRadius: 16, background: accent ? 'rgba(232,98,26,0.05)' : T.surface,
      border: `1px solid ${accent ? 'rgba(232,98,26,0.15)' : T.border}`, textAlign: 'left',
      cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16
    }}
  >
    <div style={{ width: 40, height: 40, background: accent ? T.accent : T.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent ? '#fff' : T.textMid }}>
      {icon}
    </div>
    <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{title}</span>
  </button>
)

export default AdminDashboard