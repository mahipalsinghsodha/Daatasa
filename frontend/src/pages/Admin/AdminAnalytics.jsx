import { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Customized
} from 'recharts'
import {
  FiTrendingUp, FiShoppingBag, FiUsers, FiPackage,
  FiDollarSign, FiAlertCircle, FiRefreshCw, FiClock,
  FiCheckCircle, FiTruck, FiBarChart2, FiCalendar
} from 'react-icons/fi'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// ── Design Tokens ──────────────────────────────────────────────────────────────
const T = {
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceHigh: '#f1f5f9',
  border: '#e2e8f0',
  accent: '#e8621a',
  accentDim: '#fff4ee',
  success: '#10b981',
  successDim: '#f0fdf4',
  danger: '#ef4444',
  dangerDim: '#fef2f2',
  info: '#3b82f6',
  infoDim: '#eff6ff',
  warning: '#f59e0b',
  warningDim: '#fffbeb',
  purple: '#a78bfa',
  purpleDim: '#f5f3ff',
  text: '#0f172a',
  textMid: '#475569',
  textDim: '#94a3b8',
  font: '"Inter", "DM Sans", sans-serif',
}

const fmt = (n) => Number(n || 0).toLocaleString('en-IN')
const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color, bg, prefix = '' }) => (
  <div style={{
    background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20,
    padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s',
  }}>
    <div style={{ width: 52, height: 52, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      <Icon size={22} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: T.text, letterSpacing: '-0.03em', lineHeight: 1 }}>{prefix}{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
)

// ── Section Header ─────────────────────────────────────────────────────────────
const SectionHead = ({ icon: Icon, title, sub }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
      <Icon size={18} />
    </div>
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: T.textDim, fontWeight: 500 }}>{sub}</div>}
    </div>
  </div>
)

// ── Card Container ─────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', ...style }}>
    {children}
  </div>
)

// ── Custom Tooltip for charts ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: T.text, color: '#fff', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
      <div style={{ color: T.textDim, fontSize: 11, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#fff' }}>
          {p.name}: {p.name === 'revenue' || p.name === 'Revenue' ? fmtINR(p.value) : p.value}
        </div>
      ))}
    </div>
  )
}

// ── Donut label ────────────────────────────────────────────────────────────────
const DonutLabel = ({ cx, cy, total, label }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 22, fontWeight: 900, fill: T.text }}>{total}</text>
    <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fontWeight: 700, fill: T.textDim }}>{label}</text>
  </>
)

// ── Status Pill ────────────────────────────────────────────────────────────────
const orderStatus = (o) => {
  if (o.isDelivered)                    return { label: 'Delivered',  bg: T.successDim, color: T.success }
  if (o.paymentStatus === 'CANCELLED')  return { label: 'Cancelled',  bg: T.dangerDim,  color: T.danger }
  if (o.isPaid)                         return { label: 'Paid',       bg: T.infoDim,    color: T.info }
  if (o.paymentStatus === 'COD_CONFIRMED') return { label: 'COD',     bg: T.warningDim, color: T.warning }
  return                                       { label: 'Pending',    bg: T.purpleDim,  color: T.purple }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const AdminAnalytics = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [range, setRange] = useState('30') // '7' | '30'

  const fetchAnalytics = useCallback(async (showLoad = true) => {
    showLoad ? setLoading(true) : setSyncing(true)
    try {
      const res = await api.get('/api/admin/analytics')
      setData(res.data)
    } catch (e) {
      console.error('Analytics fetch error', e)
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: T.font }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ color: T.textMid, marginTop: 16, fontWeight: 700, fontSize: 15 }}>Loading Analytics…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: T.font }}>
      <div style={{ textAlign: 'center', color: T.textDim }}>
        <FiAlertCircle size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <div style={{ fontWeight: 700, fontSize: 18 }}>Could not load analytics</div>
        <button onClick={() => fetchAnalytics()} style={{ marginTop: 16, padding: '10px 24px', background: T.accent, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  )

  const { kpi, revenueTrend, statusBreakdown, paymentSplit, topProducts, weeklyOrders, recentOrders, lowStock } = data
  const chartData = range === '7' ? revenueTrend.slice(-7) : revenueTrend

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.font, color: T.text }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 10px; }
      `}</style>

      {/* ── Sticky Header ── */}
      <div style={{ background: T.surface, borderBottom: `1.5px solid ${T.border}`, padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiBarChart2 color={T.accent} /> Analytics
            </h1>
            <p style={{ margin: '3px 0 0', color: T.textMid, fontSize: 13, fontWeight: 500 }}>
              Live business intelligence — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Range Switcher */}
            <div style={{ display: 'flex', background: T.surfaceHigh, padding: 4, borderRadius: 10, gap: 4 }}>
              {[['7', '7 Days'], ['30', '30 Days']].map(([v, l]) => (
                <button key={v} onClick={() => setRange(v)} style={{
                  padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800, transition: 'all 0.2s',
                  background: range === v ? T.surface : 'transparent',
                  color: range === v ? T.accent : T.textMid,
                  boxShadow: range === v ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                }}>{l}</button>
              ))}
            </div>
            <button onClick={() => fetchAnalytics(false)} disabled={syncing} style={{ padding: '9px 16px', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, color: T.textMid, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
              <FiRefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? 'Syncing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1380, margin: '0 auto', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── KPI Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          <KpiCard icon={FiDollarSign}    label="Today's Revenue"   value={fmtINR(kpi.todayRevenue)}     sub={`${kpi.todayOrders} order${kpi.todayOrders !== 1 ? 's' : ''} today`}  color={T.accent}   bg={T.accentDim}  />
          <KpiCard icon={FiTrendingUp}    label="Total Revenue"     value={fmtINR(kpi.totalRevenue)}     sub={`${kpi.activeOrders} active orders`}                                    color={T.success}  bg={T.successDim} />
          <KpiCard icon={FiShoppingBag}   label="Avg Order Value"   value={fmtINR(kpi.avgOrderValue)}    sub="per active order"                                                       color={T.info}     bg={T.infoDim}    />
          <KpiCard icon={FiClock}         label="Pending Orders"    value={fmt(kpi.pendingOrders)}       sub="awaiting delivery"                                                      color={T.warning}  bg={T.warningDim} />
          <KpiCard icon={FiPackage}       label="Total Products"    value={fmt(kpi.totalProducts)}       sub="in catalogue"                                                           color={T.purple}   bg={T.purpleDim}  />
          <KpiCard icon={FiUsers}         label="Customers"         value={fmt(kpi.totalUsers)}          sub="registered users"                                                       color={T.text}     bg={T.surfaceHigh}/>
        </div>

        {/* ── Revenue Trend (line chart) ── */}
        <Card>
          <SectionHead icon={FiTrendingUp} title="Revenue Trend" sub={`Last ${range} days`} />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.accent} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={T.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: T.textDim, fontWeight: 600 }} tickLine={false} axisLine={false} interval={range === '30' ? 4 : 0} />
              <YAxis tick={{ fontSize: 11, fill: T.textDim, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke={T.accent} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: T.accent }} />
              <Line type="monotone" dataKey="orders" name="Orders" stroke={T.info} strokeWidth={2} dot={false} strokeDasharray="5 3" activeDot={{ r: 4, fill: T.info }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
            {[{ color: T.accent, label: 'Revenue (₹)' }, { color: T.info, label: 'Orders' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.textMid }}>
                <div style={{ width: 20, height: 2, background: l.color, borderRadius: 2 }} />{l.label}
              </div>
            ))}
          </div>
        </Card>

        {/* ── Row: Weekly Bar + Status Donut + Payment Donut ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 20 }}>

          {/* Weekly Bar */}
          <Card>
            <SectionHead icon={FiCalendar} title="This Week" sub="Orders & revenue by day" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyOrders} margin={{ top: 5, right: 5, left: 0, bottom: 5 }} barSize={28}>
                <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: T.textDim, fontWeight: 700 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: T.textDim }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Orders" fill={T.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Status Donut */}
          <Card style={{ display: 'flex', flexDirection: 'column' }}>
            <SectionHead icon={FiCheckCircle} title="Order Status" sub="All time breakdown" />
            {statusBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3}>
                      {statusBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                    <Customized component={({ width, height }) => (
                      <DonutLabel cx={width / 2} cy={height / 2} total={kpi.totalOrders} label="Total" />
                    )} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {statusBreakdown.map(s => (
                    <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: T.textMid }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />{s.name}
                      </div>
                      <span style={{ fontWeight: 800, color: T.text }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textDim, fontSize: 13 }}>No orders yet</div>}
          </Card>

          {/* Payment Donut */}
          <Card style={{ display: 'flex', flexDirection: 'column' }}>
            <SectionHead icon={FiDollarSign} title="Payment Methods" sub="Active orders only" />
            {paymentSplit.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={paymentSplit} dataKey="value" cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3}>
                      {paymentSplit.map((p, i) => <Cell key={i} fill={p.color} />)}
                    </Pie>
                    <Customized component={({ width, height }) => (
                      <DonutLabel cx={width / 2} cy={height / 2} total={kpi.activeOrders} label="Active" />
                    )} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {paymentSplit.map(p => (
                    <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: T.textMid }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />{p.name}
                      </div>
                      <span style={{ fontWeight: 800, color: T.text }}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textDim, fontSize: 13 }}>No orders yet</div>}
          </Card>
        </div>

        {/* ── Top Products Horizontal Bar ── */}
        {topProducts.length > 0 && (
          <Card>
            <SectionHead icon={FiPackage} title="Top Products" sub="By revenue generated" />
            <ResponsiveContainer width="100%" height={Math.max(220, topProducts.length * 52)}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} barSize={20}>
                <CartesianGrid stroke={T.border} strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: T.textDim }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12, fill: T.textMid, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 8, 8, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? T.accent : i === 1 ? T.info : i === 2 ? T.success : T.purple} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* ── Bottom Row: Recent Orders + Low Stock ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>

          {/* Recent Orders Table */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <SectionHead icon={FiShoppingBag} title="Recent Orders" sub="Last 5 transactions" />
              <button onClick={() => navigate('/admin/orders')} style={{ fontSize: 12, fontWeight: 700, color: T.accent, cursor: 'pointer', padding: '6px 12px', borderRadius: 8, background: T.accentDim, border: 'none' }}>
                View All →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentOrders.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: T.textDim, fontSize: 14 }}>No orders yet</div>
              ) : recentOrders.map(o => {
                const s = orderStatus(o)
                return (
                  <div key={o._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: T.bg, borderRadius: 14, border: `1px solid ${T.border}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 2 }}>#{o._id.slice(-8).toUpperCase()}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.textDim }}>{o.user?.name || 'Customer'}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s.label}</span>
                    <div style={{ fontSize: 14, fontWeight: 900, color: T.text, minWidth: 70, textAlign: 'right' }}>{fmtINR(o.totalPrice)}</div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <SectionHead icon={FiAlertCircle} title="Low Stock Alert" sub="Products with ≤ 10 units" />
            {lowStock.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.success }}>
                <FiCheckCircle size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div style={{ fontWeight: 700, fontSize: 14 }}>All products well stocked!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lowStock.map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: p.stock === 0 ? T.dangerDim : T.warningDim, borderRadius: 14, border: `1px solid ${p.stock === 0 ? T.danger : T.warning}20` }}>
                    {p.image && <img src={p.image} alt={p.name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.textDim }}>{fmtINR(p.price)}</div>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: p.stock === 0 ? T.danger : T.warning, lineHeight: 1 }}>{p.stock}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: T.textDim, textTransform: 'uppercase' }}>left</div>
                    </div>
                  </div>
                ))}
                <button onClick={() => navigate('/admin/products')} style={{ marginTop: 8, padding: '10px', background: T.accent, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer', width: '100%' }}>
                  Manage Inventory →
                </button>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}

export default AdminAnalytics
