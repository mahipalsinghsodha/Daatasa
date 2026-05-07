import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Customized
} from 'recharts';
import {
  FiTrendingUp, FiShoppingBag, FiUsers, FiPackage,
  FiDollarSign, FiAlertCircle, FiRefreshCw, FiClock,
  FiCheckCircle, FiBarChart2, FiCalendar, FiArrowUpRight, FiArrowDownRight,
  FiDownload, FiBell, FiMoreVertical, FiActivity, FiZap, FiBox, FiCpu
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const fmtINR = n => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmt = n => Number(n || 0).toLocaleString('en-IN');

// Date ranges
const RANGES = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: '7 Days', days: 7 },
  { label: '15 Days', days: 15 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '1 Year', days: 365 },
  { label: 'All Time', days: -1 },
];

const COLORS = {
  primary: '#f97316',   // Orange
  secondary: '#3b82f6', // Blue
  success: '#10b981',   // Emerald
  danger: '#ef4444',    // Red
  warning: '#f59e0b',   // Amber
  purple: '#8b5cf6',    // Violet
  dark: '#0f172a',      // Slate 900
};

// -- Mock Data for Enterprise Features --
const MOCK_AI_INSIGHTS = [
  { id: 1, text: "Revenue increased 18% compared to last week. High demand observed in Deshi Ghee category.", type: "success", icon: FiTrendingUp },
  { id: 2, text: "Peak order time detected between 7 PM and 9 PM. Consider scheduling promotions during this window.", type: "info", icon: FiClock },
  { id: 3, text: "A2 Cow Ghee (1kg) stock might deplete in 3 days based on current velocity.", type: "warning", icon: FiAlertCircle },
  { id: 4, text: "COD rejection rate spiked by 2.4% today in metro regions.", type: "danger", icon: FiZap },
];

const MOCK_REALTIME_FEED = [
  { id: 1, type: 'order', msg: "New order #ORD-8923 placed by Rahul Sharma", time: "Just now", status: "success" },
  { id: 2, type: 'payment', msg: "Payment ₹1,450 successful via UPI", time: "2 mins ago", status: "success" },
  { id: 3, type: 'user', msg: "New user registered: priya.k@email.com", time: "15 mins ago", status: "info" },
  { id: 4, type: 'alert', msg: "Order #ORD-8910 cancelled by user", time: "32 mins ago", status: "danger" },
  { id: 5, type: 'delivery', msg: "Order #ORD-8850 delivered successfully", time: "1 hr ago", status: "success" },
];

// -- Sub-components --

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-xl px-4 py-3 shadow-2xl border border-slate-700">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-300">{p.name}</span>
          </div>
          <span className="font-bold">{p.name.toLowerCase().includes('revenue') ? fmtINR(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const DonutLabel = ({ cx, cy, total, label }) => {
  if (isNaN(cx)||isNaN(cy)) return null
  return (
    <>
      <text x={cx} y={cy-8} textAnchor="middle" dominantBaseline="middle" className="font-black" style={{fontSize:22,fontWeight:900,fill:'#0f172a'}}>{total}</text>
      <text x={cx} y={cy+12} textAnchor="middle" dominantBaseline="middle" style={{fontSize:11,fontWeight:700,fill:'#94a3b8'}}>{label}</text>
    </>
  )
}

const KpiCard = ({ title, value, prevValue, type, icon: Icon, colorClass, bgClass, sparklineData }) => {
  const isPositive = true; // Mock calculation for UI
  const percent = '12.5%';

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
      {/* Background glow effect */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bgClass} opacity-50 blur-2xl group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <FiArrowUpRight size={12} /> : <FiArrowDownRight size={12} />}
          {percent}
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value}</p>
        <p className="text-xs text-slate-400 mt-1 font-medium">vs prev. {prevValue}</p>
      </div>

      <div className="h-10 mt-4 -mx-2 relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <Line type="monotone" dataKey="val" stroke={COLORS[type]} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// -- Main Page Component --

export default function AdminAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [range, setRange] = useState(30);

  const fetchAnalytics = async (showLoad = true) => {
    showLoad ? setLoading(true) : setSyncing(true);
    try {
      const res = await api.get(`/api/admin/analytics?days=${range}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [range]);

  const chartData = useMemo(() => {
    if (!data?.revenueTrend) return [];
    return data.revenueTrend; // Backend now returns exact sliced data
  }, [data]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-semibold animate-pulse">Initializing Enterprise Analytics...</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <FiAlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 font-bold text-lg mb-4">Analytics Engine Unavailable</p>
        <button onClick={() => fetchAnalytics()} className="px-6 py-3 bg-slate-900 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-colors">Retry Connection</button>
      </div>
    </div>
  );

  const { kpi, revenueTrend, statusBreakdown, paymentSplit, topProducts, weeklyOrders, recentOrders, lowStock } = data;

  // Mock sparkline data based on trend
  const sparkDataRev = revenueTrend.slice(-10).map(d => ({ val: d.revenue }));
  const sparkDataOrd = revenueTrend.slice(-10).map(d => ({ val: d.orders }));

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans text-slate-800">
      
      {/* ── Top Header (Glassmorphism) ── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <FiActivity className="text-white" size={16} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Enterprise Analytics</h1>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{new Date().toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors">
              <FiDownload size={14} /> Export Report
            </button>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <FiBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-2 pl-1 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=0f172a&color=fff`} alt="Admin" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── AI Insights Banner ── */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-1 relative overflow-hidden shadow-xl shadow-slate-900/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                <FiCpu size={20} className="text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">AI System Insights <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] rounded uppercase tracking-wider font-extrabold">Live</span></h3>
                <p className="text-xs text-slate-400 mt-0.5">{MOCK_AI_INSIGHTS[0].text}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all whitespace-nowrap">
              View All Insights
            </button>
          </div>
        </div>

        {/* ── Smart Filter Bar ── */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
            <div className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
              <FiCalendar size={14} /> Range
            </div>
            {RANGES.map(r => (
              <button key={r.days} onClick={() => setRange(r.days)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  range === r.days
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto px-2">
            <button onClick={() => fetchAnalytics(false)} disabled={syncing}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-xl text-xs font-bold transition-colors border border-slate-200 hover:border-orange-200">
              <FiRefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>
        </div>

        {/* ── Live KPI Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <KpiCard title="Total Revenue" value={fmtINR(kpi.totalRevenue)} prevValue={fmtINR(kpi.totalRevenue * 0.88)} type="primary" icon={FiDollarSign} colorClass="text-orange-600" bgClass="bg-orange-100" sparklineData={sparkDataRev} />
          <KpiCard title="Total Orders" value={fmt(kpi.totalOrders)} prevValue={fmt(Math.floor(kpi.totalOrders * 0.9))} type="secondary" icon={FiShoppingBag} colorClass="text-blue-600" bgClass="bg-blue-100" sparklineData={sparkDataOrd} />
          <KpiCard title="Active Customers" value={fmt(kpi.totalUsers)} prevValue={fmt(Math.floor(kpi.totalUsers * 0.8))} type="success" icon={FiUsers} colorClass="text-emerald-600" bgClass="bg-emerald-100" sparklineData={sparkDataRev} />
          <KpiCard title="Pending Fulfillment" value={fmt(kpi.pendingOrders)} prevValue={fmt(kpi.pendingOrders + 5)} type="warning" icon={FiClock} colorClass="text-amber-600" bgClass="bg-amber-100" sparklineData={sparkDataOrd} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* ── Main Revenue Chart (Interactive) ── */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Revenue & Order Analytics</h2>
                <p className="text-xs text-slate-400 mt-1">Multi-metric comparison over selected period</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 px-2"><div className="w-3 h-3 rounded bg-orange-500" /> Revenue</div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 px-2"><div className="w-3 h-3 rounded bg-blue-500" /> Orders</div>
              </div>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} interval="preserveStartEnd" minTickGap={30} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v>=1000?(v/1000).toFixed(0)+'k':v}`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Bar yAxisId="right" dataKey="orders" name="Orders" fill={COLORS.secondary} radius={[4, 4, 0, 0]} barSize={max => max < 20 ? 12 : 6} opacity={0.8} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Realtime Activity Feed ── */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                Live Activity Stream
              </h2>
              <FiMoreVertical className="text-slate-400" />
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {MOCK_REALTIME_FEED.map((feed, i) => (
                <div key={feed.id} className="flex gap-3 relative">
                  {i !== MOCK_REALTIME_FEED.length - 1 && <div className="absolute top-8 left-3.5 bottom-[-20px] w-px bg-slate-100" />}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    feed.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                    feed.status === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {feed.type === 'order' ? <FiShoppingBag size={12} /> :
                     feed.type === 'payment' ? <FiDollarSign size={12} /> :
                     feed.type === 'alert' ? <FiAlertCircle size={12} /> : <FiUsers size={12} />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{feed.msg}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{feed.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Advanced Breakdowns Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Order Status Donut */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Order Fulfillment</h2>
            <p className="text-xs text-slate-400 mb-6">Distribution by current status</p>
            <div className="h-48 relative">
              {statusBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4}>
                      {statusBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Customized component={({ width, height }) => <DonutLabel cx={width/2} cy={height/2} total={kpi.totalOrders} label="Orders" />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-xs text-slate-400">No data</div>}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
               {statusBreakdown?.map(s => (
                 <div key={s.name} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                   <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><div className="w-2 h-2 rounded-full" style={{ background: s.color }}/>{s.name}</div>
                   <span className="text-xs font-bold text-slate-900">{s.value}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Payment Donut */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Payment Modes</h2>
            <p className="text-xs text-slate-400 mb-6">Revenue split by payment type</p>
            <div className="h-48 relative">
              {paymentSplit?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentSplit} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4}>
                      {paymentSplit.map((p, i) => <Cell key={i} fill={p.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Customized component={({ width, height }) => <DonutLabel cx={width/2} cy={height/2} total={kpi.activeOrders} label="Active" />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-xs text-slate-400">No data</div>}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
               {paymentSplit?.map(p => (
                 <div key={p.name} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                   <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><div className="w-2 h-2 rounded-full" style={{ background: p.color }}/>{p.name}</div>
                   <span className="text-xs font-bold text-slate-900">{p.value}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Top Products Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Top Performers</h2>
            <p className="text-xs text-slate-400 mb-6">Highest revenue generating products</p>
            <div className="h-[250px]">
              {topProducts?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                      {topProducts.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? COLORS.primary : i === 1 ? COLORS.secondary : i === 2 ? COLORS.success : COLORS.purple} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-xs text-slate-400">No data</div>}
            </div>
          </div>

        </div>

        {/* ── Bottom Section: Pending Orders & Low Stock ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Recent/Pending Orders Table */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage and track latest orders</p>
              </div>
              <button onClick={() => navigate('/admin/orders')} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                View Complete Log
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-5 py-4">Order ID</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders?.length > 0 ? recentOrders.slice(0, 6).map((o, i) => {
                    // Status logic matching the app's internal logic
                    let statusInfo = { label: 'Pending', badge: 'bg-purple-100 text-purple-700' };
                    if (o.isDelivered) statusInfo = { label: 'Delivered', badge: 'bg-emerald-100 text-emerald-700' };
                    else if (o.paymentStatus === 'CANCELLED') statusInfo = { label: 'Cancelled', badge: 'bg-red-100 text-red-700' };
                    else if (o.isPaid) statusInfo = { label: 'Processing', badge: 'bg-blue-100 text-blue-700' };
                    else if (o.paymentStatus === 'COD_CONFIRMED') statusInfo = { label: 'COD', badge: 'bg-amber-100 text-amber-700' };

                    return (
                      <motion.tr key={o._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 text-xs font-bold text-slate-900">#{o._id.slice(-8).toUpperCase()}</td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-slate-800">{o.user?.name || 'Guest User'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{o.user?.email || 'N/A'}</p>
                        </td>
                        <td className="px-5 py-4 text-sm font-extrabold text-slate-900">{fmtINR(o.totalPrice)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${statusInfo.badge}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  }) : (
                    <tr><td colSpan="4" className="px-5 py-12 text-center text-sm text-slate-400">No recent orders</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><FiPackage className="text-orange-500"/> Inventory Alerts</h2>
                <p className="text-xs text-slate-400 mt-0.5">Products requiring attention</p>
              </div>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              {lowStock?.length > 0 ? (
                <div className="space-y-3">
                  {lowStock.map(p => (
                    <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center"><FiBox className="text-slate-400"/></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{fmtINR(p.price)}</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg text-center ${p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        <p className="text-sm font-black leading-none">{p.stock}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Left</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => navigate('/admin/products')} className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-colors">
                    Manage Inventory
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                    <FiCheckCircle size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Inventory Healthy</p>
                  <p className="text-xs text-slate-400 mt-1">No low stock alerts at the moment.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
