import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiPlus, FiSearch, FiBox, FiTrash2, FiX, FiSave, 
  FiToggleLeft, FiToggleRight, FiChevronLeft, FiPlusCircle,
  FiEdit, FiEye, FiArchive, FiDollarSign, FiTag
} from 'react-icons/fi'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import CustomDropdown from '../../components/CustomDropdown'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import RestrictedAccess from '../../components/RestrictedAccess'

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
  radius: '16px',
}

// ── Shared Sub-Components ────────────────────────────────────────────────────────
const Badge = ({ children, color, bg }) => (
  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color, background: bg }}>
    {children}
  </span>
)

const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 800, color: T.textDim, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>{children}</div>
)

const Input = ({ ...props }) => (
  <input {...props} style={{ 
    width: '100%', padding: '12px 14px', border: `1.5px solid ${T.border}`, 
    borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: T.font, 
    color: T.text, background: T.white, boxSizing: 'border-box', 
    fontWeight: 500, transition: 'all 0.2s', ...props.style 
  }} className="input-focus" />
)

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AdminProducts = () => {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [catMap, setCatMap] = useState({})       // slug → category object
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'detail'

  useEffect(() => {
    if (hasPermission('products')) fetchData()
  }, [hasPermission])

  const fetchData = async () => {
    if (!hasPermission('products')) return
    try {
      const [pRes, cRes] = await Promise.all([api.get('/api/products?all=true'), api.get('/api/categories')])
      setProducts(pRes.data)
      setCategories(cRes.data)
      const map = {}
      cRes.data.forEach(c => { map[c.slug] = c })
      setCatMap(map)
    } catch { 
      toast.error('Failed to sync master catalogue') 
    } finally { 
      setLoading(false) 
    }
  }

  const handleSelect = (prod) => {
    setSelectedProduct(prod)
    setForm({ 
      name: prod.name, 
      description: prod.description, 
      price: prod.price, 
      stock: prod.stock, 
      category: prod.category, 
      weight: prod.weight || '', 
      isActive: prod.isActive ?? true 
    })
    setMobileView('detail')
  }

  const handleBack = () => { 
    setSelectedProduct(null)
    setMobileView('list') 
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) return toast.error('Name, price, and category are mandatory')
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      await api.put(`/api/products/${selectedProduct._id}`, form, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Asset manifest updated')
      fetchData()
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Failed to persist changes') 
    } finally { 
      setSaving(false) 
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate this asset from the global catalogue permanently?')) return
    try {
      const token = localStorage.getItem('token')
      await api.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Asset terminated')
      fetchData()
      if (selectedProduct?._id === id) handleBack()
    } catch { 
      toast.error('Failed to terminate asset') 
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const categoryOptions = categories.map(c => ({
    value: c.slug,
    label: c.name,
    icon: c.image ? (
      <img src={c.image} alt={c.name} style={{ width: 18, height: 18, borderRadius: 4, objectFit: 'cover' }} />
    ) : (
      <span style={{ fontSize: 14 }}>{c.emoji || '🏷️'}</span>
    )
  }))

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  if (!hasPermission('products')) return (
    <RestrictedAccess 
      title="Catalogue Restricted" 
      message="Your account lacks the clearance to modify the global product inventory. Contact system manager for vault access." 
    />
  )

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.font, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 10px; }
        .prod-list-item:hover { background: ${T.surfaceHigh} !important; }
        .input-focus:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentDim} !important; }
        .action-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
        .ghost-btn:hover { background: ${T.surfaceHigh}; }
        @media (max-width: 1023px) {
          .split-container { flex-direction: column !important; }
          .left-panel { width: 100% !important; border-right: none !important; border-bottom: 2px solid ${T.border}; }
          .mobile-hide { display: none !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: T.surface, borderBottom: `2px solid ${T.border}`, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, sticky: 'top', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isMobile && mobileView === 'detail' && (
            <button onClick={handleBack} style={{ background: T.surfaceHigh, border: 'none', borderRadius: 12, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: T.textMid }}>
              <FiChevronLeft size={18}/> Back
            </button>
          )}
          <div style={{ width: 48, height: 48, background: T.accentDim, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiBox size={24} color={T.accent} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.02em' }}>Asset Catalogue</h1>
            <p style={{ margin: 0, fontSize: 13, color: T.textDim, fontWeight: 500 }}>Monitor and orchestrate global inventory nodes.</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin/add-product')} className="action-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.accent, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 14, fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: `0 8px 16px ${T.accent}30`, transition: '0.2s' }}>
          <FiPlusCircle size={18} /> Provision Asset
        </button>
      </div>

      <div className="split-container" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT: Index Panel */}
        <div className="left-panel" style={{ 
          width: 400, background: T.surface, borderRight: `2px solid ${T.border}`, display: (isMobile && mobileView === 'detail') ? 'none' : 'flex', 
          flexDirection: 'column', flexShrink: 0 
        }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, background: T.bg }}>
            <div style={{ position: 'relative' }}>
              <FiSearch size={16} color={T.textDim} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search Master Index…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 14px 12px 42px', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, outline: 'none', fontSize: 14, fontWeight: 500 }} className="input-focus" />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: 'center', color: T.textDim, fontWeight: 600 }}>Syncing Index…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: T.textDim, fontWeight: 600 }}>No entries match parameters.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map(p => {
                  const active = selectedProduct?._id === p._id
                  const isLive = p.isActive !== false
                  return (
                    <div key={p._id} className="prod-list-item" onClick={() => handleSelect(p)}
                      style={{
                        padding: '12px', borderRadius: 16, border: `1.5px solid ${active ? T.accent : 'transparent'}`,
                        background: active ? T.accentDim : 'transparent', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 14, opacity: isLive ? 1 : 0.6
                      }}>
                      <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}`, flexShrink: 0, background: T.bg }}>
                        <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: active ? T.accent : T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.textMid }}>₹{p.price.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: T.textDim }}>ID: {p._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                      {!isLive && <Badge color={T.textDim} bg={T.border}>Archived</Badge>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Calibration Panel */}
        <div style={{ flex: 1, background: T.bg, padding: '32px', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            {!selectedProduct ? (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.textDim }}>
                <FiBox size={60} style={{ opacity: 0.1, marginBottom: 20 }} />
                <div style={{ fontWeight: 800, fontSize: 18 }}>Master Console Standby</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Select an entry from the index to begin calibration.</div>
              </motion.div>
            ) : (
              <motion.div key="selected" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ maxWidth: 900, margin: '0 auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div style={{ width: 140, height: 140, borderRadius: 24, overflow: 'hidden', border: `2px solid ${T.border}`, background: T.white, flexShrink: 0, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                       <img src={selectedProduct.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ color: T.textDim, fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>System Resource</div>
                      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: T.text, letterSpacing: '-0.02em' }}>{selectedProduct.name}</h2>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <StatusPill label={selectedProduct.category}/>
                        <Badge color={form.isActive ? T.success : T.danger} bg={form.isActive ? T.successDim : T.dangerDim}>
                          {form.isActive ? 'Active Node' : 'Suspended Node'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(selectedProduct._id)} className="ghost-btn"
                    style={{ padding: '12px', background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 14, color: T.danger, cursor: 'pointer', transition: '0.2s' }}>
                    <FiTrash2 size={20}/>
                  </button>
                </div>

                <div style={{ background: T.white, border: `2px solid ${T.border}`, borderRadius: 24, padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <Label>Primary Designation</Label>
                      <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    
                    <div>
                      <Label>Operational Category</Label>
                      <CustomDropdown 
                        options={categoryOptions}
                        value={form.category}
                        onChange={val => setForm({...form, category: val})}
                        placeholder="Select Sector"
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                       <div><Label>Yield Price</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
                       <div><Label>Stock Volume</Label><Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <Label>Diagnostic Context / Description</Label>
                      <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                        style={{ width: '100%', height: 120, padding: '12px 14px', border: `1.5px solid ${T.border}`, borderRadius: 12, outline: 'none', fontFamily: T.font, fontSize: 14, fontWeight: 500, resize: 'none' }} className="input-focus" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, gridColumn: 'span 2', padding: '20px', background: T.bg, borderRadius: 16, border: `1px solid ${T.border}` }}>
                      <button onClick={() => setForm({...form, isActive: !form.isActive})}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {form.isActive ? <FiToggleRight size={32} color={T.success}/> : <FiToggleLeft size={32} color={T.textDim}/>}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: T.text }}>Public Availability</div>
                          <div style={{ fontSize: 12, color: T.textMid }}>Determine if node is visible in global frontend discovery.</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 40, borderTop: `2px solid ${T.border}`, pt: 32, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                     <button onClick={handleBack} style={{ padding: '14px 28px', background: 'transparent', border: `1.5px solid ${T.border}`, borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', color: T.textMid }}>Dismiss Changes</button>
                     <button onClick={handleSave} disabled={saving} className="action-btn"
                        style={{ padding: '14px 32px', background: T.accent, color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 900, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', boxShadow: `0 8px 20px ${T.accent}30` }}>
                        {saving ? 'Syncing Vault…' : <><FiSave size={18}/> Commit Calibration</>}
                     </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

const StatusPill = ({ label }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.infoDim, color: T.info, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
    <FiTag size={12}/> {label}
  </div>
)

export default AdminProducts