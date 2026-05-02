import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiPlus, FiUsers, FiKey, FiActivity, FiMail, 
  FiTrash2, FiClock, FiCheck, FiX, FiShieldOff, FiUserCheck,
  FiChevronRight, FiLock, FiUnlock, FiCheckCircle
} from 'react-icons/fi';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import RestrictedAccess from '../../components/RestrictedAccess';

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
  text: '#0f172a',
  textMid: '#475569',
  textDim: '#94a3b8',
  white: '#ffffff',
  font: '"Inter", "DM Sans", sans-serif',
};

// ── Primitives ─────────────────────────────────────────────────────────────────
const Badge = ({ children, color, bg }) => (
  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color, background: bg }}>
    {children}
  </span>
);

const StatChip = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: T.surface, border: `1.5px solid ${T.border}`, padding: '16px 20px', borderRadius: 16, minWidth: 220, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      <Icon size={20} />
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{value}</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AdminManagement = () => {
  const { user, hasPermission } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', permissions: [] });

  const PERMISSIONS = [
    { id: 'dashboard',  label: 'Analytics',     desc: 'System performance & stats' },
    { id: 'products',   label: 'Catalogue',     desc: 'Inventory & pricing' },
    { id: 'orders',     label: 'Logistics',     desc: 'Fulfillment & fulfillment cycles' },
    { id: 'users',      label: 'Directory',     desc: 'Customer identity management' },
    { id: 'coupons',    label: 'Promotions',    desc: 'Coupon & incentive logic' },
    { id: 'categories', label: 'Taxonomy',      desc: 'Classification & structure' },
    { id: 'support',    label: 'Support',       desc: 'Helpdesk ticket orchestration' },
  ];

  useEffect(() => {
    if (user?.role === 'superadmin') fetchAdmins();
  }, [user]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/admins');
      setAdmins(res.data);
    } catch (err) {
      toast.error('Manifest synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/admin/create-admin', formData);
      toast.success('Personnel account provisioned');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', permissions: [] });
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Provisioning failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePermission = async (adminId, permId, currentPerms) => {
    try {
      const newPerms = currentPerms.includes(permId)
        ? currentPerms.filter(p => p !== permId)
        : [...currentPerms, permId];

      await api.patch(`/api/admin/update-access/${adminId}`, { permissions: newPerms });
      toast.success('Authority permissions updated');
      setAdmins(prev => prev.map(a => a._id === adminId ? { ...a, permissions: newPerms } : a));
    } catch (err) {
      toast.error('Authority transition failed');
    }
  };

  const handleDeleteAdmin = async (id, name) => {
    if (!window.confirm(`Permanently revoke all administrative access for ${name}?`)) return;
    try {
      await api.delete(`/api/admin/${id}`);
      toast.success('Access revoked');
      fetchAdmins();
    } catch (err) {
      toast.error('Revocation failed');
    }
  };

  const toggleFormPermission = (id) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id) 
        ? prev.permissions.filter(p => p !== id)
        : [...prev.permissions, id]
    }));
  };

  if (user?.role !== 'superadmin') {
    return <RestrictedAccess title="Root Authority Required" message="Only Super Administrators can manage administrative personnel and access control levels." />;
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ color: T.textMid, marginTop: 16, fontWeight: 700 }}>Synchronizing Root Identity List...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, padding: '32px 24px' }}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 10px; }
        .card-hover:hover { transform: translateY(-2px); border-color: ${T.accent}40 !important; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
        .input-focus:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentDim} !important; }
        .perm-btn:hover { background: ${T.surfaceHigh}; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, background: T.accent, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 8px 16px ${T.accent}30` }}>
              <FiShield size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>Administrative Access</h1>
              <p style={{ margin: 0, fontSize: 13, color: T.textDim, fontWeight: 500 }}>Monitor authority levels and orchestrate personnel permissions.</p>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            style={{ 
               padding: '14px 28px', background: T.accent, color: '#fff', border: 'none', borderRadius: 14, 
               fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
               boxShadow: `0 8px 20px ${T.accent}30`, transition: 'all 0.2s' 
            }}>
            <FiPlus size={18} /> Provision Admin
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 40, overflowX: 'auto', paddingBottom: 10 }}>
          <StatChip icon={FiUsers} label="Active Personnel" value={admins.length} color={T.accent} bg={T.accentDim} />
          <StatChip icon={FiKey} label="Unique Personas" value="Manager" color={T.info} bg={T.infoDim} />
          <StatChip icon={FiActivity} label="System Security" value="Encrypted" color={T.success} bg={T.successDim} />
        </div>

        {/* ── Personnel Index ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {admins.map(admin => (
            <motion.div layout key={admin._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-hover"
              style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: '24px 32px', transition: 'all 0.3s' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: T.surfaceHigh, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, border: `1.5px solid ${T.border}` }}>
                      {admin.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{admin.name}</h3>
                          <Badge color={admin.role === 'superadmin' ? T.accent : T.info} bg={admin.role === 'superadmin' ? T.accentDim : T.infoDim}>
                            {admin.role === 'superadmin' ? 'Root Authority' : 'Manager'}
                          </Badge>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.textDim, fontSize: 13, fontWeight: 500 }}>
                          <FiMail size={14}/> {admin.email}
                       </div>
                    </div>
                 </div>

                 {admin.role !== 'superadmin' && (
                    <button onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                      style={{ padding: '10px', borderRadius: 10, background: T.dangerDim, color: T.danger, border: 'none', cursor: 'pointer', transition: '0.2s' }}>
                      <FiTrash2 size={20}/>
                    </button>
                 )}
              </div>

              {admin.role !== 'superadmin' && (
                <div style={{ marginTop: 24, borderTop: `1px solid ${T.border}`, pt: 24 }}>
                   <div style={{ fontSize: 11, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Authorized Modules</div>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {PERMISSIONS.map(p => {
                        const has = admin.permissions.includes(p.id);
                        return (
                          <button key={p.id} onClick={() => handleTogglePermission(admin._id, p.id, admin.permissions)}
                            style={{ 
                               padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: '0.2s',
                               background: has ? T.successDim : T.surfaceHigh,
                               color: has ? T.success : T.textDim,
                               border: `1.5px solid ${has ? T.success : T.border}40`
                            }}>
                            {has ? <FiCheckCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }}/> : null}
                            {p.label}
                          </button>
                        )
                      })}
                   </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Provisioning Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: T.white, borderRadius: 28, maxWidth: 600, width: '100%', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', border: `1.5px solid ${T.border}` }}>
              
              <div style={{ padding: '24px 32px', borderBottom: `2.5px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, background: T.accentDim, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}><FiPlus size={22}/></div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Provision Personnel</h2>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textDim }}><FiX size={24}/></button>
              </div>

              <form onSubmit={handleCreateAdmin} style={{ padding: '32px' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                    <div>
                       <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textDim, marginBottom: 8, textTransform: 'uppercase' }}>Full Name</label>
                       <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                         style={{ width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, outline: 'none' }} className="input-focus" />
                    </div>
                    <div>
                       <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textDim, marginBottom: 8, textTransform: 'uppercase' }}>Corporate Mail</label>
                       <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                         style={{ width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, outline: 'none' }} className="input-focus" />
                    </div>
                 </div>

                 <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textDim, marginBottom: 8, textTransform: 'uppercase' }}>Access Credential (Password)</label>
                    <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                      style={{ width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, outline: 'none' }} className="input-focus" />
                 </div>

                 <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textDim, marginBottom: 12, textTransform: 'uppercase' }}>Permission Matrix</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                       {PERMISSIONS.map(p => {
                         const has = formData.permissions.includes(p.id);
                         return (
                           <div key={p.id} onClick={() => toggleFormPermission(p.id)}
                             style={{ 
                                padding: '12px', borderRadius: 12, border: `1.5px solid ${has ? T.accent : T.border}`, 
                                background: has ? T.accentDim : T.surface, cursor: 'pointer', transition: '0.2s',
                                display: 'flex', alignItems: 'center', gap: 10
                             }}>
                             <div style={{ width: 14, height: 14, border: `1.5px solid ${has ? T.accent : T.textDim}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: has ? T.accent : 'transparent' }}>
                               {has && <FiCheck size={10} color="#fff"/>}
                             </div>
                             <span style={{ fontSize: 13, fontWeight: 700, color: has ? T.accent : T.textMid }}>{p.label}</span>
                           </div>
                         )
                       })}
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: 14, background: 'transparent', border: `1.5px solid ${T.border}`, borderRadius: 12, fontWeight: 800, color: T.textMid, cursor: 'pointer' }}>Dismiss</button>
                    <button type="submit" disabled={submitting} 
                      style={{ flex: 1.5, padding: 14, background: T.accent, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: 'pointer', boxShadow: `0 8px 16px ${T.accent}30` }}>
                      {submitting ? 'Provisioning…' : 'Finalize Account'}
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManagement;
