import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { FiPackage, FiAlertCircle, FiLock } from 'react-icons/fi'
import CustomDropdown from '../../components/CustomDropdown'
import RestrictedAccess from '../../components/RestrictedAccess'

// ── Brand tokens (same as Support component) ──────────────────────────────────
const T = {
  bg: '#f8fafc', surface: '#ffffff', surfaceHigh: '#f1f5f9', border: '#e2e8f0',
  accent: '#e8621a', accentDim: '#fff4ee', success: '#10b981', successDim: '#f0fdf4',
  danger: '#ef4444', dangerDim: '#fef2f2', info: '#3b82f6', infoDim: '#eff6ff',
  text: '#0f172a', textMid: '#475569', textDim: '#94a3b8',
  white: '#ffffff',
  font: '"Inter", "DM Sans", sans-serif', radius: '16px',
};

/* ── Shared input style helpers ── */
const inputBase = {
  width: '100%', border: `1.5px solid ${T.border}`,
  borderRadius: 12, padding: '12px 14px',
  fontSize: 14, color: T.text, outline: 'none',
  fontFamily: T.font, boxSizing: 'border-box',
  background: T.white, transition: 'all 0.2s',
  fontWeight: 500,
}
const onFocus = e => {
  e.target.style.borderColor = T.accent
  e.target.style.boxShadow = `0 0 0 3px ${T.accentDim}`
}
const onBlur = e => {
  e.target.style.borderColor = T.border
  e.target.style.boxShadow = 'none'
}

/* ── Field wrapper ── */
const Field = ({ label, required, hint, half, children }) => (
  <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}{required && <span style={{ color: T.accent }}> *</span>}
    </label>
    {children}
    {hint && <p style={{ margin: '8px 0 0', fontSize: 13, color: T.textDim, fontWeight: 500 }}>{hint}</p>}
  </div>
)

const AddProduct = () => {
  const { user, hasPermission }   = useAuth()
  const navigate   = useNavigate()
  const { id }     = useParams()
  const isEdit     = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [fetchingConfig, setFetchingConfig] = useState(true)
  const [error, setError]     = useState('')
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '', description: '', category: '',
    price: '', stock: '', weight: '500g', image: '', featured: false,
  })

  const WEIGHT_OPTIONS = [
    '250g', '500g', '1kg', '3kg', '5kg', '10kg', '15kg'
  ]

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.get('/api/categories');
        setCategories(catRes.data);
        if (isEdit) {
           const res = await api.get(`/api/products/${id}`)
           setFormData(res.data)
        } else if (catRes.data.length > 0) {
           setFormData(prev => ({...prev, category: catRes.data[0].slug}))
        }
      } catch(e) {
        setError('Failed to fetch data');
      } finally {
        setFetchingConfig(false);
      }
    }
    init()
  }, [id, isEdit])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock) }
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
      if (isEdit) {
        await api.put(`/api/products/${id}`, payload, { headers })
      } else {
        await api.post('/api/products', payload, { headers })
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* ── Guard card ── */
  const GuardCard = ({ icon: Icon, iconBg, iconColor, title, children }) => (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: T.font }}>
      <div style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: '40px', maxWidth: 420, width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: `1.5px solid ${iconColor}20` }}>
          <Icon size={28} style={{ color: iconColor }} />
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: '-0.02em' }}>{title}</h2>
        <div style={{ color: T.textMid, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          {children}
        </div>
      </div>
    </div>
  )

  /* ── Not logged in ── */
  if (!user) return (
    <GuardCard icon={FiLock} iconBg={T.accentDim} iconColor={T.accent} title="Access Restricted">
      <p style={{ margin: 0 }}>Authentication is required to access the administrative inventory protocols.</p>
      <button onClick={() => navigate('/login')}
        style={{ width: '100%', padding: '14px', background: T.accent, border: 'none', borderRadius: 14, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: T.font, boxShadow: `0 8px 20px ${T.accent}30`, transition: 'all 0.2s', marginTop: 24 }}>
        Establish Connection
      </button>
    </GuardCard>
  )

  /* ── Not Authorized ── */
  if (user.role !== 'admin' && user.role !== 'superadmin') return (
    <GuardCard icon={FiAlertCircle} iconBg={T.dangerDim} iconColor={T.danger} title="Insufficient Authority">
      <p style={{ margin: 0 }}>Your current clearance level does not permit modification of store assets.</p>
    </GuardCard>
  )

  if (!hasPermission('products')) return (
    <RestrictedAccess 
      title="Inventory Restricted" 
      message="You do not have the required permissions to create or modify store products. Please consult your administrator." 
    />
  )

  if (fetchingConfig) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: T.bg, fontFamily: T.font, color: T.textDim, fontWeight: 600 }}>Synchronizing...</div>
  }

  const categoryOptions = categories.map(c => ({ 
    value: c.slug, 
    label: c.name, 
    icon: c.image ? <img src={c.image} alt="" style={{width: 20, height: 20, borderRadius: 4, objectFit: 'cover'}} /> : '🗂️' 
  }))

  /* ── Main form ── */
  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.font }}>

      {/* Sub-header */}
      <div style={{ background: T.white, borderBottom: `2.5px solid ${T.border}`, padding: '24px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, background: T.accentDim, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiPackage size={22} style={{ color: T.accent }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product Management</p>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.02em' }}>
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px 80px' }}>
        <div style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}>

          {/* Error Intercept */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: T.dangerDim, color: T.danger, border: `1.5px solid ${T.danger}20`, borderRadius: 14, padding: '16px 20px', marginBottom: 32, fontSize: 14, fontWeight: 600 }}>
              <FiAlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px' }}>

              {/* Product Name */}
              <Field label="Product Name" required>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  required placeholder="e.g., Pure Organic Bilona Ghee"
                  style={inputBase} onFocus={onFocus} onBlur={onBlur} className="input-focus" />
              </Field>

              {/* Description */}
              <Field label="Description" required>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  required rows={5} placeholder="Describe the product — origin, health benefits, quality..."
                  style={{ ...inputBase, resize: 'vertical', minHeight: 120, lineHeight: 1.6 }} onFocus={onFocus} onBlur={onBlur} className="input-focus" />
              </Field>

              {/* Category */}
              <Field label="Category" required half>
                <CustomDropdown options={categoryOptions} value={formData.category} onChange={(val) => setFormData({...formData, category: val})} />
              </Field>

              {/* Weight / Size */}
              <Field label="Weight / Size" required half>
                <select
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  style={{ ...inputBase, cursor: 'pointer', appearance: 'auto' }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  <option value="" disabled>Select weight</option>
                  {WEIGHT_OPTIONS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </Field>

              {/* Price */}
              <Field label="Price (₹)" required half>
                <input type="number" name="price" value={formData.price} onChange={handleChange}
                  required min="0" step="0.01" placeholder="0.00"
                  style={inputBase} onFocus={onFocus} onBlur={onBlur} className="input-focus" />
              </Field>

              {/* Stock */}
              <Field label="Stock (Units)" required half>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange}
                  required min="0" placeholder="0"
                  style={inputBase} onFocus={onFocus} onBlur={onBlur} className="input-focus" />
              </Field>

              {/* Image URL */}
              <Field label="Image URL" hint="Paste a Cloudinary or any public image link. Leave blank to use a default placeholder.">
                <input type="url" name="image" value={formData.image} onChange={handleChange}
                  placeholder="https://res.cloudinary.com/..."
                  style={inputBase} onFocus={onFocus} onBlur={onBlur} className="input-focus" />
              </Field>

              {/* Featured */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                  background: formData.featured ? T.accentDim : T.surfaceHigh, border: `1.5px solid ${formData.featured ? T.accent : T.border}40`,
                  borderRadius: 16, padding: '20px', transition: 'all 0.2s'
                }}>
                  <input type="checkbox" name="featured" id="featured"
                    checked={formData.featured} onChange={handleChange}
                    style={{ width: 18, height: 18, accentColor: T.accent, cursor: 'pointer' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: formData.featured ? T.accent : T.text }}>Featured Product</p>
                    <p style={{ margin: 0, fontSize: 13, color: T.textMid, fontWeight: 500, marginTop: 2 }}>Show this product in the homepage featured section.</p>
                  </div>
                </label>
              </div>

            </div>

            {/* Logistics Orchestration Divider */}
            <div style={{ height: '1.5px', background: T.border, margin: '32px 0' }} />

            {/* Authoritative Actions */}
            <div style={{ display: 'flex', gap: 16 }}>
              <button type="submit" disabled={loading}
                style={{
                  flex: 1, padding: '16px', background: loading ? T.textDim : T.accent,
                  border: 'none', borderRadius: 14, color: '#fff',
                  fontWeight: 900, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: T.font, transition: 'all 0.2s',
                  boxShadow: `0 8px 16px ${T.accent}30`,
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.transform = 'none' }}
              >
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
              </button>
              <button type="button" onClick={() => navigate('/admin/products')}
                style={{
                  padding: '16px 28px', background: T.surfaceHigh, border: `1.5px solid ${T.border}`,
                  borderRadius: 14, color: T.textMid, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: T.font, transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.border}
                onMouseLeave={e => e.currentTarget.style.background = T.surfaceHigh}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct
