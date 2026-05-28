import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, Legend,
} from 'recharts';
import {
  FiTrendingUp, FiShoppingBag, FiUsers, FiPackage,
  FiDollarSign, FiAlertCircle, FiRefreshCw, FiClock,
  FiCheckCircle, FiCalendar, FiArrowUpRight, FiArrowDownRight,
  FiActivity, FiBox, FiChevronLeft, FiChevronRight,
  FiExternalLink, FiFilter, FiTag, FiPieChart, FiBarChart2,
  FiTarget, FiZap, FiTrendingDown, FiStar,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import RestrictedAccess from '../../components/RestrictedAccess';

/* ─── Formatters ──────────────────────────────────────────────────────────── */
const fmtINR = n => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmt = n => Number(n || 0).toLocaleString('en-IN');
const fmtK = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;

/* ─── Config ──────────────────────────────────────────────────────────────── */
const RANGES = [
  { label: 'Today', days: 0 },
  { label: '7 Days', days: 7 },
  { label: '15 Days', days: 15 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '1 Year', days: 365 },
  { label: 'All Time', days: -1 },
];

const ORDER_FILTERS = [
  { label: 'All', value: 'all', color: 'bg-slate-800 text-white' },
  { label: 'Pending', value: 'pending', color: 'bg-amber-500 text-white' },
  { label: 'COD', value: 'cod', color: 'bg-blue-500 text-white' },
  { label: 'Paid', value: 'paid', color: 'bg-indigo-500 text-white' },
  { label: 'Delivered', value: 'delivered', color: 'bg-emerald-500 text-white' },
  { label: 'Cancelled', value: 'cancelled', color: 'bg-red-500 text-white' },
];

const PALETTE = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

/* ─── Shared Tooltip ──────────────────────────────────────────────────────── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] text-white text-xs rounded-2xl px-4 py-3.5 shadow-2xl border border-white/10 pointer-events-none min-w-[160px]">
      <p className="text-slate-400 mb-2.5 text-[10px] font-black uppercase tracking-widest">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-5 mb-1.5 last:mb-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-slate-300 text-[11px]">{p.name}</span>
          </div>
          <span className="font-black text-white tabular-nums">
            {String(p.name).toLowerCase().includes('revenue') || String(p.name).toLowerCase().includes('value') || String(p.name).toLowerCase().includes('discount')
              ? fmtINR(p.value) : fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── Section Header ──────────────────────────────────────────────────────── */
const SectionTitle = ({ icon: Icon, title, sub, action }) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div>
      <div className="flex items-center gap-2 mb-0.5">
        {Icon && <Icon size={15} className="text-orange-500" />}
        <h2 className="text-[15px] font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h2>
      </div>
      {sub && <p className="text-[11px] text-slate-400 font-medium">{sub}</p>}
    </div>
    {action}
  </div>
);

/* ─── Shimmer ─────────────────────────────────────────────────────────────── */
const Sh = ({ h = 'h-4', w = 'w-full', extra = '' }) =>
  <div className={`shimmer rounded-xl ${h} ${w} ${extra}`} />;

/* ─── KPI Card ────────────────────────────────────────────────────────────── */
const KpiCard = ({ title, value, sub, delta, icon: Icon, gradient, spark }) => {
  const up = delta == null || delta >= 0;
  return (
    <motion.div whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative overflow-hidden rounded-2xl p-5 shadow-lg will-change-transform"
      style={{ background: gradient }}>
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-4 -bottom-6 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none" />
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
          <Icon size={18} />
        </div>
        {delta != null && (
          <div className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-white/20 text-white">
            {up ? <FiArrowUpRight size={10} /> : <FiArrowDownRight size={10} />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-white tabular-nums leading-none mb-1"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value}</p>
        {sub && <p className="text-white/55 text-[10px] font-semibold mt-1">{sub}</p>}
      </div>
      {spark?.length > 0 && (
        <div className="h-8 mt-3 -mx-1 opacity-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark}>
              <defs>
                <linearGradient id={`sp-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="white" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="val" stroke="white" strokeWidth={1.5}
                fill={`url(#sp-${title})`} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

/* ─── Status badge ────────────────────────────────────────────────────────── */
const badge = o => {
  if (o.isDelivered) return { label: 'Delivered', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  if (o.paymentStatus === 'CANCELLED') return { label: 'Cancelled', cls: 'bg-red-100 text-red-600 border-red-200' };
  if (o.paymentStatus === 'FAILED') return { label: 'Failed', cls: 'bg-red-100 text-red-500 border-red-200' };
  if (o.isPaid) return { label: 'Processing', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
  if (o.paymentStatus === 'COD_CONFIRMED') return { label: 'COD', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: 'Pending', cls: 'bg-purple-100 text-purple-700 border-purple-200' };
};

/* ══════════════════════════════════════════════════════════════════════════ */
export default function AdminAnalytics() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [range, setRange] = useState(30);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderPage, setOrderPage] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // overview | orders | products | customers
  const PER_PAGE = 10;

  const fetchAnalytics = useCallback(async ({ showLoad = true, force = false } = {}) => {
    showLoad ? setLoading(true) : setSyncing(true);
    try {
      const p = new URLSearchParams({ days: range, page: orderPage, limit: PER_PAGE, statusFilter: orderFilter, ...(force ? { force: '1' } : {}) });
      const res = await api.get(`/api/admin/analytics?${p}`);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setSyncing(false); }
  }, [range, orderPage, orderFilter]);

  useEffect(() => { fetchAnalytics({ showLoad: true }); }, [range, orderPage, orderFilter]);

  const sparkRev = useMemo(() => (data?.revenueTrend || []).slice(-12).map(d => ({ val: d.revenue })), [data]);
  const sparkOrd = useMemo(() => (data?.revenueTrend || []).slice(-12).map(d => ({ val: d.orders })), [data]);

  if (!hasPermission('orders') && user?.role !== 'admin' && user?.role !== 'superadmin')
    return <RestrictedAccess title="Access Restricted" message="No permission to view analytics." />;

  /* ── Skeleton ─────────────────────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen pb-24" style={{ background: '#f0f2f5' }}>
      <div className="bg-[#0f172a] h-48" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-14 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-100 p-5 space-y-3 shadow-sm">
              <Sh h="h-10" w="w-10" /><Sh h="h-8" w="w-28" /><Sh h="h-8" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => <Sh key={i} h={i < 2 ? 'h-80' : 'h-64'} extra="bg-white" />)}
        </div>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f2f5' }}>
      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl text-center max-w-sm w-full mx-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle size={28} className="text-red-400" />
        </div>
        <p className="font-extrabold text-slate-800 text-lg mb-1">Analytics Unavailable</p>
        <p className="text-slate-400 text-sm mb-6">Unable to load data.</p>
        <button onClick={() => fetchAnalytics({ showLoad: true, force: true })}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_rgb(249_115_22_/_0.35)]">
          Retry
        </button>
      </div>
    </div>
  );

  const {
    kpi, revenueTrend, hourlyDistribution, dayOfWeekData,
    statusBreakdown, paymentSplit, topProducts, categoryRevenue,
    couponStats, weeklyOrders, customerGrowth,
    recentOrders, totalOrderCount, totalOrderPages, currentPage, lowStock,
  } = data;

  const KPI_DEFS = [
    { title: 'Total Revenue', value: fmtINR(kpi.totalRevenue), sub: `Today: ${fmtINR(kpi.todayRevenue)}`, delta: kpi.revenueDelta, icon: FiDollarSign, gradient: 'linear-gradient(135deg,#f97316,#dc2626)', spark: sparkRev },
    { title: 'Total Orders', value: fmt(kpi.totalOrders), sub: `Today: ${fmt(kpi.todayOrders)}`, delta: kpi.ordersDelta, icon: FiShoppingBag, gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', spark: sparkOrd },
    { title: 'Avg. Order Value', value: fmtINR(kpi.avgOrderValue), sub: `${fmt(kpi.activeOrders)} active`, delta: null, icon: FiTarget, gradient: 'linear-gradient(135deg,#10b981,#0891b2)', spark: sparkRev },
    { title: 'Pending Orders', value: fmt(kpi.pendingOrders), sub: `${fmt(kpi.totalUsers)} customers`, delta: null, icon: FiClock, gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', spark: sparkOrd },
  ];

  const weekRevTotal = (weeklyOrders || []).reduce((s, d) => s + d.revenue, 0);
  const weekOrdTotal = (weeklyOrders || []).reduce((s, d) => s + d.orders, 0);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: FiPieChart },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'products', label: 'Products', icon: FiPackage },
    { id: 'customers', label: 'Customers', icon: FiUsers },
  ];

  return (
    <div className="min-h-screen pb-24 font-sans" style={{ background: '#f0f2f5' }}>

      {/* ══ DARK HERO HEADER ══════════════════════════════════════════════ */}
      <div className="relative bg-[#0f172a] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)' }} />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/15 border border-orange-500/25 rounded-full mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative rounded-full h-2 w-2 bg-orange-400" />
                </span>
                <span className="text-orange-300 text-[10px] font-black uppercase tracking-[0.15em]">Enterprise Analytics</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.03em' }}>
                Business Intelligence
              </h1>
              <p className="text-slate-400 text-sm mt-2.5 font-medium flex items-center gap-2">
                {data.fromCache
                  ? <><span className="text-amber-400">⚡ Cached</span> · <span className="text-orange-400 cursor-pointer font-bold hover:underline" onClick={() => fetchAnalytics({ showLoad: false, force: true })}>Force refresh</span></>
                  : <><span className="text-emerald-400">●</span> Live · Updated {new Date(data.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</>
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => fetchAnalytics({ showLoad: false, force: true })} disabled={syncing}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 text-white rounded-xl text-sm font-bold transition-all backdrop-blur-sm">
                <FiRefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* ── Summary strip ── */}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {[
              { label: 'Products', val: fmt(kpi.totalProducts), color: 'text-blue-400' },
              { label: 'Customers', val: fmt(kpi.totalUsers), color: 'text-emerald-400' },
              { label: 'Active Coupons', val: fmt(kpi.activeCoupons), color: 'text-amber-400' },
              { label: 'Discounts Given', val: fmtINR(kpi.totalDiscount), color: 'text-purple-400' },
              { label: 'Delivered', val: fmt(kpi.deliveredOrders), color: 'text-teal-400' },
              { label: 'Cancelled', val: fmt(kpi.cancelledOrders), color: 'text-red-400' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                <p className={`text-lg font-black tabular-nums ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══ KPI CARDS (overlap header) ════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-14 mb-8">
          {KPI_DEFS.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <KpiCard {...c} />
            </motion.div>
          ))}
        </div>

        {/* ══ FILTER + TABS ═════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Date range */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
              <FiCalendar size={11} /> Period
            </div>
            <div className="h-4 w-px bg-slate-100 mx-0.5 shrink-0" />
            {RANGES.map(r => (
              <button key={r.days} onClick={() => { setRange(r.days); setOrderPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${range === r.days ? 'bg-orange-500 text-white shadow-[0_2px_8px_rgb(249_115_22_/_0.4)]' : 'text-slate-500 hover:bg-slate-100'
                  }`}>{r.label}</button>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex items-center gap-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === t.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                }`}>
                <t.icon size={12} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

              {/* Row 1: Revenue + Weekly */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Revenue & Orders Area */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle icon={FiTrendingUp} title="Revenue & Order Trend"
                    sub="Daily breakdown over selected period"
                    action={
                      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-500" />Revenue</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-400" />Orders</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-400" />Avg. Order</div>
                      </div>
                }
                  />
                  <div className="h-[300px]">
                    {revenueTrend?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={revenueTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gAvg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} interval="preserveStartEnd" minTickGap={30} />
                          <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                          <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <Tooltip content={<Tip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                          <Area yAxisId="l" type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#gRev)" activeDot={{ r: 5, strokeWidth: 0 }} />
                          <Area yAxisId="l" type="monotone" dataKey="avgOrder" name="Avg. Order Value" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#gAvg)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                          <Bar yAxisId="r" dataKey="orders" name="Orders" fill="#93c5fd" radius={[3, 3, 0, 0]} opacity={0.9}
                            barSize={revenueTrend.length > 60 ? 3 : revenueTrend.length > 30 ? 5 : 10} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-sm text-slate-300">No data for period</div>}
                  </div>
                </div>

                {/* Weekly Summary */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle icon={FiCalendar} title="This Week" sub="Orders & revenue · last 7 days" />
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyOrders} margin={{ top: 0, right: 5, left: -22, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="orders" name="Orders" radius={[5, 5, 0, 0]} barSize={30}>
                          {(weeklyOrders || []).map((_, i) => (
                            <Cell key={i} fill={i === (weeklyOrders.length - 1) ? '#f97316' : '#e2e8f0'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                      <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Orders</p>
                      <p className="text-xl font-black text-orange-600 tabular-nums">{fmt(weekOrdTotal)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</p>
                      <p className="text-xl font-black text-slate-700 tabular-nums">{fmtK(weekRevTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Status + Payment + Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Order Status Donut */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle icon={FiPieChart} title="Order Status" sub="Fulfillment distribution" />
                  <div className="h-44 relative">
                    {statusBreakdown?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusBreakdown} dataKey="value" cx="50%" cy="50%"
                            innerRadius={54} outerRadius={76} paddingAngle={3} startAngle={90} endAngle={-270}>
                            {statusBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
                          </Pie>
                          <Tooltip content={<Tip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-xs text-slate-300">No data</div>}
                    {statusBreakdown?.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-2xl font-black text-slate-900 tabular-nums">{fmt(kpi.totalOrders)}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {statusBreakdown?.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />{s.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 rounded-full bg-slate-100 overflow-hidden w-14">
                        <div className="h-full rounded-full" style={{ width: `${kpi.totalOrders ? (s.value / kpi.totalOrders) * 100 : 0}%`, background: s.color }} />
                      </div>
                      <span className="text-[11px] font-black text-slate-900 tabular-nums w-6 text-right">{s.value}</span>
                    </div>
                  </div>
                ))}
                  </div>
                </div>

                {/* Payment Split */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle icon={FiTag} title="Payment Methods" sub="Order split by payment type" />
                  <div className="h-44 relative">
                    {paymentSplit?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={paymentSplit} dataKey="value" cx="50%" cy="50%"
                            innerRadius={54} outerRadius={76} paddingAngle={3} startAngle={90} endAngle={-270}>
                            {paymentSplit.map((p, i) => <Cell key={i} fill={p.color} />)}
                          </Pie>
                          <Tooltip content={<Tip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-xs text-slate-300">No data</div>}
                    {paymentSplit?.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-2xl font-black text-slate-900 tabular-nums">{fmt(kpi.activeOrders)}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {paymentSplit?.map(p => {
                      const pct = kpi.totalOrders ? Math.round((p.value / kpi.totalOrders) * 100) : 0;
                      return (
                        <div key={p.name}>
                          <div className="flex justify-between mb-1">
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />{p.name}
                            </div>
                            <span className="text-[11px] font-black text-slate-900">{p.value} <span className="text-slate-400">({pct}%)</span></span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }} style={{ background: p.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Revenue */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle icon={FiBarChart2} title="Category Revenue" sub="Revenue by product category" />
                  {categoryRevenue?.length > 0 ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryRevenue} layout="vertical" barSize={12} margin={{ top: 0, right: 35, left: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
                          <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                            {categoryRevenue.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="space-y-2.5 mt-2">
                      {topProducts?.slice(0, 5).map((p, i) => {
                        const max = topProducts[0]?.revenue || 1;
                        return (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="text-[11px] font-bold text-slate-600 truncate max-w-[120px]">{p.name}</span>
                              <span className="text-[11px] font-black text-slate-900">{fmtINR(p.revenue)}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(p.revenue / max) * 100}%` }}
                                transition={{ duration: 0.7, delay: i * 0.05 }} style={{ background: PALETTE[i] }} />
                            </div>
                          </div>
                    );
                  })}
                      </div>
                  )}
            </div>
          </div>

              {/* Row 3: Hourly + Day-of-Week */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Hourly Distribution */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle icon={FiClock} title="Hourly Order Distribution" sub="Orders by hour of day (IST)" />
                  <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyDistribution} margin={{ top: 0, right: 5, left: -22, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false}
                          interval={2} tickFormatter={h => h.split(':')[0]} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="orders" name="Orders" radius={[3, 3, 0, 0]} barSize={9}>
                          {hourlyDistribution.map((_, i) => {
                            const h = parseInt(_.hour);
                            const peak = h >= 19 && h <= 21;
                            return <Cell key={i} fill={peak ? '#f97316' : h >= 9 && h <= 18 ? '#93c5fd' : '#e2e8f0'} />;
                          })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-[10px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-orange-500" />Peak hours</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-blue-300" />Business hours</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-slate-200" />Off hours</div>
                  </div>
                </div>

                {/* Day of Week */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle icon={FiActivity} title="Revenue by Day of Week" sub="Average revenue per weekday" />
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dayOfWeekData} margin={{ top: 0, right: 5, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                        <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="revenue" name="Revenue" radius={[5, 5, 0, 0]} barSize={32}>
                          {(dayOfWeekData || []).map((_, i) => {
                            const maxR = Math.max(...(dayOfWeekData || []).map(d => d.revenue), 1);
                            const pct = _.revenue / maxR;
                            const col = pct > 0.8 ? '#f97316' : pct > 0.5 ? '#fb923c' : '#fed7aa';
                            return <Cell key={i} fill={col} />;
                          })}
                        </Bar>
                        <Line type="monotone" dataKey="orders" name="Orders" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} yAxisId={undefined} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    🔶 Orange bars = higher revenue days · Purple line = order count
                  </p>
            </div>
          </div>

              {/* Row 4: Coupon stats */}
              {couponStats?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle icon={FiTag} title="Coupon Performance" sub="Usage & revenue contribution per coupon code" />
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['Coupon Code', 'Times Used', 'Total Discount', 'Revenue Generated'].map(h => (
                            <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {couponStats.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-black font-mono">{c.code}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden w-24">
                                  <div className="h-full rounded-full bg-blue-400"
                                    style={{ width: `${(c.used / Math.max(...couponStats.map(x => x.used), 1)) * 100}%` }} />
                                </div>
                                <span className="text-sm font-bold text-slate-800 tabular-nums">{c.used}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-red-600 tabular-nums">-{fmtINR(c.discount)}</td>
                            <td className="px-4 py-3 text-sm font-bold text-emerald-600 tabular-nums">{fmtINR(c.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
            TAB: ORDERS
        ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Orders table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
              <div>
                    <h2 className="text-base font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>All Orders</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">{fmt(totalOrderCount)} total · Page {currentPage} of {Math.max(1, totalOrderPages)}</p>
              </div>
                  <button onClick={() => navigate('/admin/orders')}
                    className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
                    <FiExternalLink size={12} /> Orders Manager
              </button>
            </div>

                {/* Filter pills */}
                <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-50/50">
                  <FiFilter size={11} className="text-slate-400 shrink-0" />
                  {ORDER_FILTERS.map(f => (
                    <button key={f.value} onClick={() => { setOrderFilter(f.value); setOrderPage(1); }}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${orderFilter === f.value ? f.color + ' shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}>{f.label}</button>
                  ))}
                </div>

            <div className="overflow-x-auto">
                  <table className="w-full text-left">
                <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        {['Order ID', 'Customer', 'Items', 'Amount', 'Discount', 'Method', 'Status', 'Date'].map(h => (
                          <th key={h} className="px-5 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400 whitespace-nowrap">{h}</th>
                        ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                      <AnimatePresence mode="wait">
                        {recentOrders?.length > 0 ? recentOrders.map((o, i) => {
                          const s = badge(o);
                          const itemCount = (o.orderItems || []).reduce((sum, it) => sum + it.quantity, 0);
                          return (
                        <motion.tr key={o._id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                          onClick={() => navigate('/admin/orders')} className="hover:bg-orange-50/30 transition-colors cursor-pointer group">
                          <td className="px-5 py-4">
                            <span className="text-xs font-black text-slate-800 group-hover:text-orange-600 transition-colors font-mono">
                              #{o._id.slice(-8).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[110px]">{o.user?.name || 'Guest'}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{o.user?.email || '—'}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-extrabold text-slate-900 tabular-nums">{fmtINR(o.totalPrice)}</span>
                          </td>
                          <td className="px-5 py-4">
                            {o.discount > 0
                              ? <span className="text-xs font-bold text-red-500">-{fmtINR(o.discount)}</span>
                              : <span className="text-xs text-slate-300">—</span>
                            }
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{o.paymentMethod}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full border ${s.cls}`}>{s.label}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    }) : (
                          <tr><td colSpan={8} className="py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
                                <FiShoppingBag size={22} className="text-slate-300" />
                              </div>
                              <p className="text-sm font-bold text-slate-400">No orders found</p>
                            </div>
                          </td></tr>
                        )}
                      </AnimatePresence>
                </tbody>
              </table>
            </div>

                {/* Pagination */}
                {totalOrderPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <p className="text-[11px] text-slate-400 hidden sm:block">
                      <span className="font-bold text-slate-700">{(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, totalOrderCount)}</span> of <span className="font-bold text-slate-700">{fmt(totalOrderCount)}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
                      <button onClick={() => setOrderPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-orange-400 hover:text-orange-600 disabled:opacity-35 transition-all">
                        <FiChevronLeft size={14} />
                      </button>
                      {[...Array(Math.min(5, totalOrderPages))].map((_, idx) => {
                        const tp = totalOrderPages, cp = currentPage;
                        let p; if (tp <= 5) p = idx + 1; else if (cp <= 3) p = idx + 1; else if (cp >= tp - 2) p = tp - 4 + idx; else p = cp - 2 + idx;
                        return (
                          <button key={p} onClick={() => setOrderPage(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === currentPage ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-400'}`}>
                            {p}
                          </button>
                        );
                      })}
                      <button onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))} disabled={currentPage >= totalOrderPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-orange-400 hover:text-orange-600 disabled:opacity-35 transition-all">
                        <FiChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
          </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
            TAB: PRODUCTS
        ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top products ranked */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle icon={FiStar} title="Top Products by Revenue" sub="Highest earning products in period" />
                  <div className="space-y-3">
                    {(topProducts || []).slice(0, 8).map((p, i) => {
                      const max = topProducts[0]?.revenue || 1;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0"
                            style={{ background: PALETTE[i % PALETTE.length] }}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{p.name}</span>
                              <div className="flex items-center gap-3 shrink-0 ml-2">
                                <span className="text-[10px] text-slate-400 font-semibold">{p.qty} sold</span>
                                <span className="text-xs font-black text-slate-900 tabular-nums">{fmtINR(p.revenue)}</span>
                              </div>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                                animate={{ width: `${(p.revenue / max) * 100}%` }}
                                transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
                                style={{ background: PALETTE[i % PALETTE.length] }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>

                {/* Low stock */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle icon={FiPackage} title="Inventory Alerts"
                    sub="Products below threshold"
                    action={lowStock?.length > 0 && <span className="w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{lowStock.length}</span>}
                  />
              {lowStock?.length > 0 ? (
                    <div className="space-y-2">
                      {lowStock.map((p, i) => (
                        <motion.div key={p._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          onClick={() => navigate('/admin/products')}
                          className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer group">
                          {p.image
                            ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                            : <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><FiBox size={14} className="text-slate-400" /></div>
                          }
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-orange-700">{p.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{fmtINR(p.price)}</p>
                      </div>
                      <div className={`shrink-0 px-3 py-2 rounded-xl text-center ${p.stock === 0 ? 'bg-red-100 border border-red-200 text-red-600' : p.stock <= 5 ? 'bg-orange-100 border border-orange-200 text-orange-600' : 'bg-amber-50 border border-amber-200 text-amber-600'}`}>
                        <p className="text-base font-black leading-none">{p.stock}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5">left</p>
                      </div>
                    </motion.div>
                  ))}
                      <button onClick={() => navigate('/admin/products')}
                        className="w-full mt-2 py-3 bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all">
                        Manage Inventory →
                  </button>
                </div>
              ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-3">
                        <FiCheckCircle size={26} />
                      </div>
                      <p className="font-extrabold text-slate-700 mb-1">All Stock Healthy</p>
                      <p className="text-xs text-slate-400">No products below threshold.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
            TAB: CUSTOMERS
        ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'customers' && (
            <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Customer Growth Chart */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <SectionTitle icon={FiUsers} title="Customer Growth" sub="New user registrations over selected period" />
                <div className="h-[280px]">
                  {customerGrowth?.some(d => d.newUsers > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={customerGrowth} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gCust" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} interval="preserveStartEnd" minTickGap={30} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<Tip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="newUsers" name="New Customers" stroke="#8b5cf6" strokeWidth={2.5}
                          fillOpacity={1} fill="url(#gCust)" activeDot={{ r: 5, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                      <FiUsers size={28} className="text-slate-200" />
                      <p className="text-sm text-slate-400">No new customer registrations in this period</p>
                </div>
              )}
            </div>
          </div>

              {/* Customer stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { title: 'Total Customers', value: fmt(kpi.totalUsers), icon: FiUsers, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                  { title: 'New This Period', value: fmt((customerGrowth || []).reduce((s, d) => s + d.newUsers, 0)), icon: FiTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                  { title: 'Avg. Orders/Customer', value: kpi.totalUsers ? (kpi.totalOrders / kpi.totalUsers).toFixed(1) : '0', icon: FiShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                ].map(s => (
                  <div key={s.title} className={`bg-white rounded-2xl border ${s.border} shadow-sm p-6`}>
                    <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}>
                      <s.icon size={22} />
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.title}</p>
                <p className="text-4xl font-black tabular-nums" style={{ color: '#0f172a', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</p>
              </div>
            ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
