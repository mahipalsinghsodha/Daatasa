import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Customized
} from 'recharts'
import {
  FiTrendingUp, FiShoppingBag, FiUsers, FiPackage,
  FiDollarSign, FiAlertCircle, FiRefreshCw, FiClock,
  FiCheckCircle, FiBarChart2, FiCalendar, FiArrowUp, FiArrowDown
} from 'react-icons/fi'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const fmtINR = n => `₹${Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0})}`
const fmt    = n => Number(n||0).toLocaleString('en-IN')

// Date ranges
const RANGES = [
  { label: 'Today',     days: 0  },
  { label: 'Yesterday', days: 1  },
  { label: '2 Days',    days: 2  },
  { label: '3 Days',    days: 3  },
  { label: '4 Days',    days: 4  },
  { label: '7 Days',    days: 7  },
  { label: '14 Days',   days: 14 },
  { label: '3 Weeks',   days: 21 },
  { label: '1 Month',   days: 30 },
  { label: '4 Months',  days: 120 },
  { label: '6 Months',  days: 180 },
  { label: '1 Year',    days: 365 },
  { label: 'All Time',  days: -1 },
]

const orderStatus = o => {
  if (o.isDelivered)                     return { label:'Delivered',  dot:'bg-emerald-500', text:'text-emerald-700', bg:'bg-emerald-50' }
  if (o.paymentStatus==='CANCELLED')     return { label:'Cancelled',  dot:'bg-red-500',     text:'text-red-700',     bg:'bg-red-50'     }
  if (o.isPaid)                          return { label:'Processing', dot:'bg-blue-500',    text:'text-blue-700',    bg:'bg-blue-50'    }
  if (o.paymentStatus==='COD_CONFIRMED') return { label:'COD',        dot:'bg-amber-500',   text:'text-amber-700',   bg:'bg-amber-50'   }
  return                                        { label:'Pending',    dot:'bg-purple-500',  text:'text-purple-700',  bg:'bg-purple-50'  }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 text-white text-xs rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name==='Revenue' ? fmtINR(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

const DonutLabel = ({ cx, cy, total, label }) => {
  if (isNaN(cx)||isNaN(cy)) return null
  return (
    <>
      <text x={cx} y={cy-8} textAnchor="middle" dominantBaseline="middle" className="font-black" style={{fontSize:22,fontWeight:900,fill:'#0f172a'}}>{total}</text>
      <text x={cx} y={cy+12} textAnchor="middle" dominantBaseline="middle" style={{fontSize:11,fontWeight:700,fill:'#94a3b8'}}>{label}</text>
    </>
  )
}

export default function AdminAnalytics() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [range,   setRange]   = useState(30)

  const fetchAnalytics = useCallback(async (showLoad=true) => {
    showLoad ? setLoading(true) : setSyncing(true)
    try {
      const res = await api.get('/api/admin/analytics')
      setData(res.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false); setSyncing(false) }
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  // Filter chart data by selected range
  const chartData = useMemo(() => {
    if (!data?.revenueTrend) return []
    if (range === -1) return data.revenueTrend
    return data.revenueTrend.slice(-Math.max(range,1))
  }, [data, range])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 mt-4 text-sm font-medium">Loading Analytics...</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <FiAlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold mb-4">Could not load analytics</p>
        <button onClick={() => fetchAnalytics()} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold">Retry</button>
      </div>
    </div>
  )

  const { kpi, revenueTrend, statusBreakdown, paymentSplit, topProducts, weeklyOrders, recentOrders, lowStock } = data

  return (
    <div className="min-h-screen pb-12" style={{ background: '#f8fafc' }}>

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <FiBarChart2 size={19} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Analytics</h1>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
          </div>
        </div>
        <button onClick={() => fetchAnalytics(false)} disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
          <FiRefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Date Range Filter ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 shrink-0 px-2">
              <FiCalendar size={12} /> Filter:
            </span>
            {RANGES.map(r => (
              <button key={r.days} onClick={() => setRange(r.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  range === r.days
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { icon: FiDollarSign,  label: "Today's Revenue", value: fmtINR(kpi.todayRevenue),  sub: `${kpi.todayOrders} orders today`,     color: 'text-orange-500', bg: 'bg-orange-50',  border: 'border-orange-100' },
            { icon: FiTrendingUp,  label: 'Total Revenue',   value: fmtINR(kpi.totalRevenue),  sub: `${kpi.activeOrders} active orders`,   color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { icon: FiShoppingBag, label: 'Avg Order Value',  value: fmtINR(kpi.avgOrderValue), sub: 'per active order',                     color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100' },
            { icon: FiClock,       label: 'Pending Orders',   value: fmt(kpi.pendingOrders),    sub: 'awaiting delivery',                    color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-100' },
            { icon: FiPackage,     label: 'Total Products',   value: fmt(kpi.totalProducts),    sub: 'in catalogue',                         color: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-100' },
            { icon: FiUsers,       label: 'Total Customers',  value: fmt(kpi.totalUsers),       sub: 'registered users',                     color: 'text-gray-700',   bg: 'bg-gray-100',   border: 'border-gray-200' },
          ].map((c, i) => (
            <div key={i} className={`bg-white rounded-2xl border ${c.border} p-4 shadow-sm`}>
              <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
                <c.icon size={17} className={c.color} />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{c.label}</p>
              <p className="text-xl font-extrabold text-gray-900 leading-none mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{c.value}</p>
              <p className="text-[11px] text-gray-400 font-medium">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Revenue Trend ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
                <FiTrendingUp size={16} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Revenue Trend</p>
                <p className="text-xs text-gray-400">{RANGES.find(r=>r.days===range)?.label || 'All Time'}</p>
              </div>
            </div>
            <div className="flex gap-4">
              {[{color:'#f97316',label:'Revenue'},{color:'#3b82f6',label:'Orders'}].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <div className="w-4 h-0.5 rounded" style={{ background: l.color }} />{l.label}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top:5, right:10, left:10, bottom:5 }}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#94a3b8', fontWeight:600 }} tickLine={false} axisLine={false}
                interval={chartData.length > 30 ? Math.floor(chartData.length/10) : 0} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${v>=1000?(v/1000).toFixed(0)+'k':v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r:5, fill:'#f97316' }} />
              <Line type="monotone" dataKey="orders"  name="Orders"  stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 3" activeDot={{ r:4, fill:'#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Row: Weekly Bar + Status Donut + Payment Donut ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center"><FiCalendar size={15} className="text-orange-500" /></div>
              <div><p className="text-sm font-bold text-gray-900">This Week</p><p className="text-xs text-gray-400">Orders by day</p></div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyOrders} margin={{ top:5, right:5, left:0, bottom:5 }} barSize={24}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize:12, fill:'#94a3b8', fontWeight:700 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Orders" fill="#f97316" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center"><FiCheckCircle size={15} className="text-orange-500" /></div>
              <div><p className="text-sm font-bold text-gray-900">Order Status</p><p className="text-xs text-gray-400">All time breakdown</p></div>
            </div>
            {statusBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3}>
                      {statusBreakdown.map((s,i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                    <Customized component={({ width, height }) => (
                      <DonutLabel cx={width/2} cy={height/2} total={kpi.totalOrders} label="Total" />
                    )} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {statusBreakdown.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-gray-500">
                        <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.name}
                      </div>
                      <span className="font-bold text-gray-900">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-10">No orders yet</div>}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center"><FiDollarSign size={15} className="text-orange-500" /></div>
              <div><p className="text-sm font-bold text-gray-900">Payment Methods</p><p className="text-xs text-gray-400">Active orders only</p></div>
            </div>
            {paymentSplit.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={paymentSplit} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3}>
                      {paymentSplit.map((p,i) => <Cell key={i} fill={p.color} />)}
                    </Pie>
                    <Customized component={({ width, height }) => (
                      <DonutLabel cx={width/2} cy={height/2} total={kpi.activeOrders} label="Active" />
                    )} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {paymentSplit.map(p => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-gray-500">
                        <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />{p.name}
                      </div>
                      <span className="font-bold text-gray-900">{p.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-10">No orders yet</div>}
          </div>
        </div>

        {/* ── Top Products ── */}
        {topProducts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center"><FiPackage size={15} className="text-orange-500" /></div>
              <div><p className="text-sm font-bold text-gray-900">Top Products</p><p className="text-xs text-gray-400">By revenue generated</p></div>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(200, topProducts.length * 50)}>
              <BarChart data={topProducts} layout="vertical" margin={{ top:0, right:50, left:0, bottom:0 }} barSize={18}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${v>=1000?(v/1000).toFixed(0)+'k':v}`} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize:12, fill:'#64748b', fontWeight:600 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[0,8,8,0]}>
                  {topProducts.map((_,i) => (
                    <Cell key={i} fill={['#f97316','#3b82f6','#10b981','#a78bfa','#f59e0b'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Recent Orders + Low Stock ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Recent Orders */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center"><FiShoppingBag size={15} className="text-orange-500" /></div>
                <div><p className="text-sm font-bold text-gray-900">Recent Orders</p><p className="text-xs text-gray-400">Latest transactions</p></div>
              </div>
              <button onClick={() => navigate('/admin/orders')}
                className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {recentOrders.length === 0
                ? <div className="py-10 text-center text-gray-400 text-sm">No orders yet</div>
                : recentOrders.map(o => {
                  const s = orderStatus(o)
                  return (
                    <div key={o._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-orange-50/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900">#{o._id.slice(-8).toUpperCase()}</p>
                        <p className="text-[11px] text-gray-400 font-medium truncate">{o.user?.name || 'Customer'} · {o.user?.email || ''}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                      </span>
                      <p className="text-sm font-extrabold text-gray-900 shrink-0">{fmtINR(o.totalPrice)}</p>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Low Stock */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center"><FiAlertCircle size={15} className="text-red-500" /></div>
              <div><p className="text-sm font-bold text-gray-900">Low Stock Alert</p><p className="text-xs text-gray-400">≤ 10 units remaining</p></div>
            </div>
            {lowStock.length === 0 ? (
              <div className="py-10 text-center">
                <FiCheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-600">All products well stocked!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStock.map(p => (
                  <div key={p._id} className={`flex items-center gap-3 p-3 rounded-xl border ${p.stock === 0 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                    {p.image && <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{fmtINR(p.price)}</p>
                    </div>
                    <div className="text-center shrink-0">
                      <p className={`text-lg font-extrabold leading-none ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.stock}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">left</p>
                    </div>
                  </div>
                ))}
                <button onClick={() => navigate('/admin/products')}
                  className="w-full mt-2 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-orange-500 transition-colors">
                  Manage Inventory →
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
