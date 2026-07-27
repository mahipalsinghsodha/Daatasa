import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiActivity, FiRefreshCw, FiSearch, FiShield,
  FiUser, FiMapPin, FiClock, FiLink, FiChevronRight,
  FiShoppingBag, FiLogIn, FiLogOut, FiX, FiCheckCircle,
  FiCalendar, FiFilter, FiAlertCircle
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const AdminUserActivity = () => {
  const { hasPermission } = useAuth()
  
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [selectedJourney, setSelectedJourney] = useState(null)
  
  // ── Card Filters ──
  const [activeCardFilter, setActiveCardFilter] = useState('ALL') // 'ALL', 'LOGINS', 'ORDERS', 'DROPOFFS'

  // ── Date Filters ──
  const [dateTab, setDateTab] = useState('7days') // 'today', 'yesterday', '7days', 'custom'
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  useEffect(() => { 
    fetchActivities() 
  }, [dateTab]) // Re-fetch when tab changes (custom handles its own fetch on submit)

  const fetchActivities = async () => {
    setLoading(true)
    try {
      let startDate = new Date()
      let endDate = new Date()

      if (dateTab === 'today') {
        startDate.setHours(0,0,0,0)
        endDate.setHours(23,59,59,999)
      } else if (dateTab === 'yesterday') {
        startDate.setDate(startDate.getDate() - 1)
        startDate.setHours(0,0,0,0)
        endDate.setDate(endDate.getDate() - 1)
        endDate.setHours(23,59,59,999)
      } else if (dateTab === '7days') {
        startDate.setDate(startDate.getDate() - 7)
        startDate.setHours(0,0,0,0)
        endDate.setHours(23,59,59,999)
      } else if (dateTab === 'custom') {
        if (!customStart || !customEnd) return // wait for search button
        startDate = new Date(customStart)
        startDate.setHours(0,0,0,0)
        endDate = new Date(customEnd)
        endDate.setHours(23,59,59,999)
      }

      const res = await api.get(`/api/activity/admin?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      setActivities(res.data)
    } catch { toast.error('Failed to load activity logs') }
    finally { setLoading(false); setSyncing(false) }
  }

  const handleCustomSearch = () => {
    if (customStart && customEnd) {
      setDateTab('custom')
      fetchActivities()
    } else {
      toast.warning('Please select both start and end dates.')
    }
  }

  // ── Group Logs into Journeys ──
  const groupedJourneys = useMemo(() => {
    const map = new Map();
    // Sort ascending for chronological processing
    const sorted = [...activities].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    sorted.forEach(a => {
      const key = a.user?._id || a.ipAddress || 'unknown';
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          user: a.user,
          ipAddress: a.ipAddress,
          location: a.location,
          firstSeen: a.createdAt,
          lastSeen: a.createdAt,
          totalPages: 0,
          loggedIn: false,
          placedOrder: false,
          actions: [] // chronological
        });
      }
      
      const group = map.get(key);
      group.lastSeen = a.createdAt;
      group.actions.push(a);
      
      if (a.action === 'PAGE_VISIT') group.totalPages += 1;
      if (a.action === 'LOGIN') group.loggedIn = true;
      if (a.action === 'ORDER_PLACED') group.placedOrder = true;
      
      if (!group.user && a.user) {
        group.user = a.user;
      }
    });
    
    return Array.from(map.values()).sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
  }, [activities]);

  // ── Filter Journeys by Search & Card Filter ──
  const filteredJourneys = groupedJourneys.filter(j => {
    // 1. Search Filter
    const q = search.toLowerCase()
    const matchesSearch = !q || (j.user?.name || 'Guest').toLowerCase().includes(q) 
      || j.ipAddress.includes(q)
      || j.location.toLowerCase().includes(q);
      
    // 2. Card Filter
    let matchesCard = true;
    if (activeCardFilter === 'LOGINS') matchesCard = j.loggedIn;
    if (activeCardFilter === 'ORDERS') matchesCard = j.placedOrder;
    if (activeCardFilter === 'DROPOFFS') matchesCard = (j.loggedIn && !j.placedOrder);
    
    return matchesSearch && matchesCard;
  })

  // ── Compute Summary Stats (Based on ALL grouped journeys, NOT filtered ones, so cards show total numbers) ──
  const stats = useMemo(() => {
    let visitors = groupedJourneys.length;
    let logins = groupedJourneys.filter(j => j.loggedIn).length;
    let orders = groupedJourneys.filter(j => j.placedOrder).length;
    let abandoned = groupedJourneys.filter(j => j.loggedIn && !j.placedOrder).length;

    return { visitors, logins, orders, abandoned };
  }, [groupedJourneys])

  // ── Compute Chart Data ──
  const chartData = useMemo(() => {
    const dayMap = new Map();
    activities.forEach(a => {
      const d = new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dayMap.has(d)) {
        dayMap.set(d, { date: d, timestamp: new Date(a.createdAt).setHours(0,0,0,0), views: 0, orders: 0, logins: 0 });
      }
      const dayData = dayMap.get(d);
      if (a.action === 'PAGE_VISIT') dayData.views += 1;
      if (a.action === 'ORDER_PLACED') dayData.orders += 1;
      if (a.action === 'LOGIN') dayData.logins += 1;
    });
    
    const sortedDays = Array.from(dayMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    return sortedDays;
  }, [activities])

  // ── Custom Tooltip for Chart ──
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl">
          <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 text-sm mb-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600 dark:text-gray-300 flex-1">{entry.name}:</span>
              <span className="font-bold text-gray-900 dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const getActionIcon = (action) => {
    if (action === 'LOGIN') return <FiLogIn className="text-green-500" />
    if (action === 'LOGOUT') return <FiLogOut className="text-orange-500" />
    if (action === 'ORDER_PLACED') return <FiShoppingBag className="text-brand-secondary" />
    return <FiLink className="text-blue-500" />
  }

  if (loading && activities.length === 0) return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="h-48 shimmer" />
      <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-3">
        <div className="h-24 shimmer rounded-xl mb-6" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 shimmer rounded-xl" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900 font-sans">
      {/* ── Premium Admin Header ── */}
      <div className="relative overflow-hidden bg-brand-primary border-b border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none bg-brand-secondary/20 blur-[60px]" />
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border border-brand-secondary/30 bg-brand-secondary/10 text-brand-secondary mb-3">
                <FiActivity size={12} /> Activity Analytics
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">User Journeys & Insights</h1>
            </div>
            
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-white/10 border border-white/10">
                <FiSearch size={14} className="text-white/50" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users/IP..."
                  className="bg-transparent outline-none text-sm w-48 text-white placeholder-white/50" />
              </div>
              <button onClick={() => { setSyncing(true); fetchActivities(); }} disabled={syncing}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl bg-white/10 border border-white/10 text-white/80 hover:bg-white/20 transition-all">
                <FiRefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* ── Tabs & Date Filters ── */}
          <div className="mt-8 flex flex-wrap items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5 w-max backdrop-blur-md">
            {['today', 'yesterday', '7days'].map(tab => (
              <button
                key={tab}
                onClick={() => setDateTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${dateTab === tab ? 'bg-brand-secondary text-brand-primary shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                {tab === 'today' ? 'Today' : tab === 'yesterday' ? 'Yesterday' : 'Last 7 Days'}
              </button>
            ))}
            
            <div className="h-6 w-px bg-white/20 mx-2" />
            
            {/* Custom Date Pickers */}
            <div className="flex items-center gap-2 text-sm text-white/70">
              <FiCalendar />
              <input 
                type="date" 
                value={customStart}
                onChange={e => { setCustomStart(e.target.value); setDateTab('custom'); }}
                className="bg-transparent outline-none border-b border-white/20 pb-0.5 text-white focus:border-brand-secondary [color-scheme:dark]"
              />
              <span className="opacity-50">to</span>
              <input 
                type="date" 
                value={customEnd}
                onChange={e => { setCustomEnd(e.target.value); setDateTab('custom'); }}
                className="bg-transparent outline-none border-b border-white/20 pb-0.5 text-white focus:border-brand-secondary [color-scheme:dark]"
              />
              <button 
                onClick={handleCustomSearch}
                className="ml-2 px-3 py-1 bg-white/10 hover:bg-brand-secondary hover:text-brand-primary text-white rounded-lg transition-all font-bold text-xs flex items-center gap-1"
              >
                <FiFilter size={12}/> Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 -mt-6 relative z-20">
        
        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveCardFilter(activeCardFilter === 'ALL' ? 'ALL' : 'ALL')}
            className={`p-6 rounded-2xl border shadow-sm flex flex-col relative overflow-hidden group cursor-pointer transition-all ${activeCardFilter === 'ALL' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-300'}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -z-10 group-hover:scale-125 transition-transform" />
            <span className="text-blue-500 mb-4"><FiUser size={24} /></span>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Visitors</p>
            <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{stats.visitors}</h3>
          </div>
          
          <div 
            onClick={() => setActiveCardFilter(activeCardFilter === 'LOGINS' ? 'ALL' : 'LOGINS')}
            className={`p-6 rounded-2xl border shadow-sm flex flex-col relative overflow-hidden group cursor-pointer transition-all ${activeCardFilter === 'LOGINS' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-green-300'}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -z-10 group-hover:scale-125 transition-transform" />
            <span className="text-green-500 mb-4"><FiLogIn size={24} /></span>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Unique Logins</p>
            <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{stats.logins}</h3>
          </div>

          <div 
            onClick={() => setActiveCardFilter(activeCardFilter === 'ORDERS' ? 'ALL' : 'ORDERS')}
            className={`p-6 rounded-2xl border shadow-sm flex flex-col relative overflow-hidden group cursor-pointer transition-all ${activeCardFilter === 'ORDERS' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-yellow-300'}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full -z-10 group-hover:scale-125 transition-transform" />
            <span className="text-yellow-500 mb-4"><FiShoppingBag size={24} /></span>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Orders Placed</p>
            <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{stats.orders}</h3>
          </div>

          <div 
            onClick={() => setActiveCardFilter(activeCardFilter === 'DROPOFFS' ? 'ALL' : 'DROPOFFS')}
            className={`p-6 rounded-2xl border shadow-sm flex flex-col relative overflow-hidden group cursor-pointer transition-all ${activeCardFilter === 'DROPOFFS' ? 'bg-red-50 dark:bg-red-900/20 border-red-400' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-red-300'}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -z-10 group-hover:scale-125 transition-transform" />
            <span className="text-red-500 mb-4"><FiAlertCircle size={24} /></span>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Drop-offs / Abandoned</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{stats.abandoned}</h3>
              <p className="text-[10px] text-gray-400 mb-1 leading-tight">Logged in,<br/>didn't order</p>
            </div>
          </div>
        </div>

        {/* ── Activity Chart ── */}
        {chartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-2">
              <FiActivity /> Activity Trends
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="views" name="Page Views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                  <Area type="monotone" dataKey="orders" name="Order Events" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                  <Area type="monotone" dataKey="logins" name="Login Events" stroke="#22c55e" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Journey List ── */}
        {filteredJourneys.length === 0 ? (
          <div className="p-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
              <FiActivity size={28} />
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-white mb-1">No user journeys found</p>
            <p className="text-sm text-gray-500">No activity logged for the selected dates.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">User / Session</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Engagement</th>
                    <th className="p-4">Milestones</th>
                    <th className="p-4 text-right">Last Active</th>
                    <th className="p-4 pr-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJourneys.map((j) => (
                    <tr 
                      key={j.id} 
                      onClick={() => setSelectedJourney(j)}
                      className="border-b last:border-b-0 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${j.user ? 'bg-brand-secondary/10 text-brand-secondary' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                            <FiUser size={18}/>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {j.user?.name || 'Guest User'}
                            </p>
                            <p className="text-[11px] font-mono text-gray-500">
                              {j.user?.email || j.ipAddress}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <FiMapPin size={12} className="text-gray-400"/> {j.location}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md">
                          {j.totalPages} {j.totalPages === 1 ? 'Page' : 'Pages'}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        {j.loggedIn && (
                          <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center tooltip" title="Logged In">
                            <FiLogIn size={14} />
                          </div>
                        )}
                        {j.placedOrder && (
                          <div className="w-7 h-7 rounded-full bg-brand-secondary/20 text-brand-secondary flex items-center justify-center tooltip" title="Placed Order">
                            <FiShoppingBag size={14} />
                          </div>
                        )}
                        {j.loggedIn && !j.placedOrder && (
                           <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center tooltip" title="Abandoned / Dropped Off">
                             <FiAlertCircle size={14} />
                           </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {new Date(j.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {new Date(j.lastSeen).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all ml-auto">
                          <FiChevronRight size={16} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Detailed Journey Modal ── */}
      <AnimatePresence>
        {selectedJourney && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedJourney(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col border-l border-white/10"
            >
              <div className="p-6 bg-brand-primary text-white relative">
                <button onClick={() => setSelectedJourney(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                  <FiX size={24} />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary">
                    <FiUser size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display">{selectedJourney.user?.name || 'Guest User'}</h2>
                    <p className="text-white/60 font-mono text-xs mt-1">{selectedJourney.user?.email || selectedJourney.ipAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-white/80">
                  <span className="flex items-center gap-1"><FiMapPin /> {selectedJourney.location}</span>
                  <span className="flex items-center gap-1"><FiClock /> {selectedJourney.actions.length} Actions</span>
                </div>
                {selectedJourney.loggedIn && !selectedJourney.placedOrder && (
                  <div className="mt-4 bg-red-500/20 text-red-100 px-3 py-2 rounded-lg text-xs font-bold border border-red-500/30 flex items-center gap-2">
                    <FiAlertCircle /> User dropped off before ordering
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <FiActivity /> Session Timeline
                </h3>
                
                <div className="relative border-l-2 border-brand-secondary/30 ml-3 space-y-8 pb-8">
                  {selectedJourney.actions.map((act, i) => (
                    <div key={act._id || i} className="relative pl-8">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-brand-secondary flex items-center justify-center shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase">
                            {getActionIcon(act.action)} {act.action.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(act.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {act.action === 'PAGE_VISIT' && (
                          <div className="text-sm font-medium text-brand-primary dark:text-white">
                            Visited: <span className="font-mono text-brand-secondary bg-brand-secondary/5 px-1.5 py-0.5 rounded">{act.details?.path || '/'}</span>
                          </div>
                        )}
                        
                        {act.action === 'ORDER_PLACED' && act.details && (
                          <div className="mt-2 p-3 bg-brand-secondary/10 rounded-lg border border-brand-secondary/20">
                            <p className="text-xs font-bold text-brand-primary dark:text-brand-secondary mb-1 flex items-center gap-1">
                              <FiCheckCircle size={12} /> Order Confirmed
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              Order: <span className="font-mono font-bold">{act.details.invoiceNumber}</span>
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              Total: ₹{act.details.totalPrice} ({act.details.paymentMethod})
                            </p>
                          </div>
                        )}
                        
                        {act.action === 'LOGIN' && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">User authenticated successfully.</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="relative pl-8 pt-4">
                    <div className="absolute -left-[5px] top-6 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="text-xs text-gray-400 font-medium">Session Started</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminUserActivity
