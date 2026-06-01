import { useState, useEffect } from 'react';
import { 
  FiActivity, FiSearch, FiFilter, FiHash, FiClock, FiX, FiEye, 
  FiGlobe, FiSmartphone, FiDatabase, FiAlertCircle, FiRefreshCw,
  FiUser, FiMail, FiCalendar, FiBox, FiCheckCircle, FiShield,
  FiServer, FiLock
} from 'react-icons/fi';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import RestrictedAccess from '../../components/RestrictedAccess';
import { motion, AnimatePresence } from 'framer-motion';

// ── Shared Sub-Components ────────────────────────────────────────────────────────
const Badge = ({ children, color, bg }) => (
  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color, background: bg }}>
    {children}
  </span>
)

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AuditLogs = () => {
  const { user, hasPermission } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    if (hasPermission('superadmin_view')) fetchLogs();
    return () => window.removeEventListener('resize', handleResize);
  }, [hasPermission]);

  const fetchLogs = async () => {
    if (!hasPermission('superadmin_view')) return;
    try {
      setLoading(true);
      const res = await api.get('/api/admin/logs');
      setLogs(res.data);
    } catch (err) {
      toast.error('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionStyle = (action) => {
    if (action.includes('CREATE')) return { color: 'var(--success)', bg: 'rgba(56,161,105,0.1)' };
    if (action.includes('DELETE')) return { color: 'var(--danger)', bg: 'rgba(229,62,62,0.1)' };
    if (action.includes('UPDATE')) return { color: 'var(--info)', bg: 'rgba(49,130,206,0.1)' };
    if (action.includes('BLOCK'))  return { color: 'var(--warning)', bg: 'rgba(245,166,35,0.1)' };
    if (action.includes('TOGGLE')) return { color: '#8b5cf6', bg: '#f5f3ff' };
    return { color: 'var(--text-secondary)', bg: 'var(--bg-alt)' };
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.adminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetId && log.targetId.includes(searchTerm));
    
    const matchesFilter = filterAction === 'ALL' || log.action?.includes(filterAction);
    
    return matchesSearch && matchesFilter;
  });

  const uniqueActions = ['ALL', ...new Set(logs.map(l => l.action?.split('_')[0]))];

  if (!hasPermission('superadmin_view')) return (
    <RestrictedAccess 
      title="Audit Restricted" 
      message="Only Super Administrators with root oversight authority can access the mission-critical operation chronicles." 
    />
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', fontFamily: 'var(--font)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: `3px solid var(--brand-secondary)`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ color: 'var(--text-muted)', marginTop: 16, fontWeight: 700 }}>Decrypting Security Logs...</p>
        <style>{`@keyframes spin {to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font)', padding: '32px 24px' }}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
        .row-hover:hover { background: var(--bg-alt) !important; }
        .input-focus:focus { border-color: var(--brand-secondary) !important; box-shadow: 0 0 0 3px rgba(245,166,35,0.1) !important; }
        .panel-slide { box-shadow: -20px 0 40px rgba(0,0,0,0.1); }
      `}</style>

      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             <div style={{ width: 48, height: 48, background: 'var(--brand-secondary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 8px 16px rgba(245,166,35,0.3)` }}>
               <FiActivity size={24}/>
             </div>
             <div>
               <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Security Chronicle</h1>
               <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Real-time manifestation of administrative operations and system protocols.</p>
             </div>
          </div>
          <button onClick={fetchLogs} 
            style={{ padding: '12px 24px', background: 'var(--bg-card)', border: `1.5px solid var(--border-color)`, borderRadius: 12, color: 'var(--text-secondary)', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: '0.2s' }}>
            <FiRefreshCw size={16}/> Sync Feed
          </button>
        </div>

        {/* ── Filters & Search ── */}
        <div style={{ background: 'var(--bg-card)', border: `1.5px solid var(--border-color)`, borderRadius: 20, padding: 20, marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
           <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
             <FiSearch size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
             <input type="text" placeholder="Filter by admin, operation, or target ID…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
               style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--bg-base)', border: `1.5px solid var(--border-color)`, borderRadius: 14, outline: 'none', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }} className="input-focus" />
           </div>
           <div style={{ display: 'flex', gap: 8 }}>
             <FiFilter size={18} color="var(--text-muted)" style={{ alignSelf: 'center', marginRight: 8 }} />
             <div style={{ display: 'flex', gap: 6, background: 'var(--bg-alt)', padding: 4, borderRadius: 12 }}>
               {uniqueActions.slice(0, 5).map(a => (
                 <button key={a} onClick={() => setFilterAction(a)}
                   style={{ 
                     padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: '0.2s',
                     background: filterAction === a ? 'var(--bg-card)' : 'transparent',
                     color: filterAction === a ? 'var(--brand-secondary)' : 'var(--text-secondary)',
                     boxShadow: filterAction === a ? 'var(--shadow-sm)' : 'none'
                   }}>{a}</button>
               ))}
             </div>
           </div>
        </div>

        {/* ── Logs Matrix ── */}
        <div style={{ background: 'var(--bg-card)', border: `1.5px solid var(--border-color)`, borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid var(--border-color)`, background: 'var(--bg-alt)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Timestamp</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Operator</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action Workflow</th>
                {!isMobile && <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Environment</th>}
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 100, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FiDatabase size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                  <div style={{ fontWeight: 800, fontSize: 16 }}>Chronicle Empty</div>
                  <div style={{ fontSize: 13 }}>Adjust parameters to broaden discovery scope.</div>
                </td></tr>
              ) : filteredLogs.map((log, i) => {
                const s = getActionStyle(log.action);
                return (
                  <motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row-hover"
                    style={{ borderBottom: `1px solid var(--border-color)`, transition: '0.2s', cursor: 'pointer' }}
                    onClick={() => setSelectedLog(log)}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{format(new Date(log.createdAt), 'HH:mm:ss')}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{format(new Date(log.createdAt), 'dd MMM yyyy')}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(245,166,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-secondary)', fontWeight: 900, fontSize: 12 }}>{log.adminName?.charAt(0).toUpperCase()}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{log.adminName}</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <Badge color={s.color} bg={s.bg}>{log.action.replace(/_/g, ' ')}</Badge>
                    </td>
                    {!isMobile && (
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)' }}>
                          <FiGlobe size={14} title={log.ipAddress} />
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{log.ipAddress?.slice(0, 15)}...</span>
                        </div>
                      </td>
                    )}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                       <button style={{ background: 'var(--bg-alt)', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', cursor: 'pointer' }}>INSPECT</button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Side Drawer ── */}
      <AnimatePresence>
        {selectedLog && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLog(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="panel-slide"
              style={{ position: 'relative', width: '100%', maxWidth: 500, height: '100vh', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ padding: '32px', borderBottom: `1.5px solid var(--border-color)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>Operation Metadata</h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Protocol ID: {selectedLog._id.slice(-12).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedLog(null)} style={{ background: 'var(--bg-base)', border: 'none', borderRadius: 12, padding: 10, cursor: 'pointer', color: 'var(--text-secondary)' }}><FiX size={20}/></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                 
                 <div style={{ padding: '24px', borderRadius: 20, background: getActionStyle(selectedLog.action).bg, border: `1.5px solid ${getActionStyle(selectedLog.action).color}20`, marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                       <div style={{ width: 44, height: 44, borderRadius: 12, background: getActionStyle(selectedLog.action).color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <FiAlertCircle size={24}/>
                       </div>
                       <div>
                         <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>{selectedLog.action.replace(/_/g, ' ')}</div>
                         <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Captured at {format(new Date(selectedLog.createdAt), 'PPpp')}</div>
                       </div>
                    </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      { icon: FiUser, label: 'Originator', val: selectedLog.adminName },
                      { icon: FiMail, label: 'Identity Mail', val: selectedLog.adminEmail },
                      { icon: FiHash, label: 'Target Reference', val: selectedLog.targetId || 'SYSTEM_LEVEL', mono: true },
                      { icon: FiGlobe, label: 'Network Origin (IP)', val: selectedLog.ipAddress },
                      { icon: FiSmartphone, label: 'Access Interface', val: selectedLog.userAgent?.split(' ')[0] || 'Unknown' }
                    ].map((m, i) => (
                      <div key={i} style={{ display: 'flex', gap: 16 }}>
                         <m.icon size={18} color="var(--text-muted)" style={{ marginTop: 3 }} />
                         <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.label}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, fontFamily: m.mono ? 'monospace' : 'var(--font)' }}>{m.val}</div>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div style={{ marginTop: 40 }}>
                   <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Data Payload Manifest</div>
                   <div style={{ background: 'var(--bg-base)', padding: 24, borderRadius: 20, border: `1.5px solid var(--border-color)`, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                      {JSON.stringify(selectedLog.details || {}, null, 2)}
                   </div>
                 </div>
              </div>

              <div style={{ padding: '24px 32px', borderTop: `1.5px solid var(--border-color)`, display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-base)' }}>
                 <button onClick={() => setSelectedLog(null)} style={{ padding: '12px 32px', background: 'var(--bg-card)', border: `1.5px solid var(--border-color)`, borderRadius: 14, fontWeight: 800, color: 'var(--text-primary)', cursor: 'pointer' }}>Close Manifest</button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditLogs;
