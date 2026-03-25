import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { FiPackage, FiAlertCircle, FiLock } from 'react-icons/fi'

// ── Brand tokens (same as Support component) ──────────────────────────────────
const C = {
  orange:      '#e8621a',
  orangeHov:   '#cf561a',
  orangeLight: '#fff4ee',
  orangeMid:   '#fddcca',
  bg:          '#f2f4f6',
  white:       '#ffffff',
  text:        '#1a1a2e',
  textMid:     '#555566',
  textLight:   '#8899aa',
  border:      '#e4e9f0',
  shadow:      '0 2px 12px rgba(0,0,0,0.07)',
  shadowMd:    '0 6px 24px rgba(0,0,0,0.11)',
  green:       '#16a34a', greenBg: '#dcfce7',
  red:         '#dc2626', redBg:   '#fee2e2',
  grayBg:      '#f1f5f9',
  font:        "'Inter', system-ui, sans-serif",
}

/* ── Shared input style helpers ── */
const inputBase = {
  width: '100%', border: `1.5px solid ${C.border}`,
  borderRadius: 10, padding: '10px 13px',
  fontSize: 14, color: C.text, outline: 'none',
  fontFamily: C.font, boxSizing: 'border-box',
  background: C.white, transition: 'border-color 0.2s, box-shadow 0.2s',
}
const onFocus = e => {
  e.target.style.borderColor = C.orange
  e.target.style.boxShadow = '0 0 0 3px rgba(232,98,26,0.12)'
}
const onBlur = e => {
  e.target.style.borderColor = C.border
  e.target.style.boxShadow = 'none'
}

/* ── Field wrapper ── */
const Field = ({ label, required, hint, half, children }) => (
  <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}{required && <span style={{ color: C.orange }}> *</span>}
    </label>
    {children}
    {hint && <p style={{ margin: '6px 0 0', fontSize: 12, color: C.textLight }}>{hint}</p>}
  </div>
)

const AddProduct = () => {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const { id }     = useParams()
  const isEdit     = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'a1',
    price: '', stock: '', weight: '', image: '', featured: false,
  })

  useEffect(() => {
    if (isEdit) axios.get(`/api/products/${id}`).then(res => setFormData(res.data))
  }, [id])

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
        await axios.put(`/api/products/${id}`, payload, { headers })
      } else {
        await axios.post('/api/products', payload, { headers })
      }
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* ── Guard card ── */
  const GuardCard = ({ icon: Icon, iconBg, iconColor, title, children }) => (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: C.font }}>
      <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '36px 32px', maxWidth: 400, width: '100%', boxShadow: C.shadowMd }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon size={24} style={{ color: iconColor }} />
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: C.text }}>{title}</h2>
        {children}
      </div>
    </div>
  )

  /* ── Not logged in ── */
  if (!user) return (
    <GuardCard icon={FiLock} iconBg={C.orangeLight} iconColor={C.orange} title="Please Login">
      <p style={{ margin: '0 0 20px', fontSize: 14, color: C.textLight }}>You must be logged in to access this page.</p>
      <button onClick={() => navigate('/login')}
        style={{ width: '100%', padding: '12px', background: C.orange, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: C.font }}
        onMouseEnter={e => e.currentTarget.style.background = C.orangeHov}
        onMouseLeave={e => e.currentTarget.style.background = C.orange}>
        Go to Login
      </button>
    </GuardCard>
  )

  /* ── Not admin ── */
  if (user.role !== 'admin') return (
    <GuardCard icon={FiAlertCircle} iconBg={C.redBg} iconColor={C.red} title="Access Denied">
      <p style={{ margin: '0 0 16px', fontSize: 14, color: C.textLight }}>You need admin privileges to manage products.</p>
      <div style={{ background: C.grayBg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
        <p style={{ margin: '0 0 4px', color: C.textLight }}>Role: <strong style={{ color: C.text }}>{user.role || 'user'}</strong></p>
        <p style={{ margin: 0, color: C.textLight }}>Email: <strong style={{ color: C.text }}>{user.email}</strong></p>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Run in backend folder:</p>
      <code style={{ display: 'block', background: '#1a1a2e', color: '#4ade80', padding: '10px 14px', borderRadius: 10, fontSize: 12, fontFamily: 'monospace' }}>
        npm run make-admin {user.email}
      </code>
    </GuardCard>
  )

  /* ── Main form ── */
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font }}>

      {/* Sub-header */}
      <div style={{ background: C.white, borderBottom: `1.5px solid ${C.border}`, padding: '20px 32px', boxShadow: C.shadow }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, background: C.orange, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiPackage size={18} style={{ color: '#fff' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Panel</p>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div style={{ maxWidth: 800, margin: '32px auto', padding: '0 32px 60px' }}>
        <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '32px 36px', boxShadow: C.shadowMd }}>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.redBg, color: C.red, border: `1.5px solid ${C.red}30`, borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14 }}>
              <FiAlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>

              {/* Name */}
              <Field label="Product Name" required>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  required placeholder="e.g., Bilona A2 Desi Ghee"
                  style={inputBase} onFocus={onFocus} onBlur={onBlur} />
              </Field>

              {/* Description */}
              <Field label="Description" required>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  required rows={4} placeholder="Describe the origin, taste, and benefits…"
                  style={{ ...inputBase, resize: 'vertical', minHeight: 100 }} onFocus={onFocus} onBlur={onBlur} />
              </Field>

              {/* Category */}
              <Field label="Category" required half>
                <select name="category" value={formData.category} onChange={handleChange}
                  required style={{ ...inputBase, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="a1">A1 Ghee</option>
                  <option value="a2">A2 Ghee</option>
                </select>
              </Field>

              {/* Weight */}
              <Field label="Weight" required half>
                <input type="text" name="weight" value={formData.weight} onChange={handleChange}
                  required placeholder="e.g., 500g, 1kg"
                  style={inputBase} onFocus={onFocus} onBlur={onBlur} />
              </Field>

              {/* Price */}
              <Field label="Price (₹)" required half>
                <input type="number" name="price" value={formData.price} onChange={handleChange}
                  required min="0" step="0.01" placeholder="0.00"
                  style={inputBase} onFocus={onFocus} onBlur={onBlur} />
              </Field>

              {/* Stock */}
              <Field label="Stock Quantity" required half>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange}
                  required min="0" placeholder="0"
                  style={inputBase} onFocus={onFocus} onBlur={onBlur} />
              </Field>

              {/* Image URL */}
              <Field label="Image URL" hint="Leave empty to use the default placeholder image.">
                <input type="url" name="image" value={formData.image} onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  style={inputBase} onFocus={onFocus} onBlur={onBlur} />
              </Field>

              {/* Featured checkbox */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  background: C.orangeLight, border: `1.5px solid ${C.orangeMid}`,
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <input type="checkbox" name="featured" id="featured"
                    checked={formData.featured} onChange={handleChange}
                    style={{ width: 16, height: 16, accentColor: C.orange, cursor: 'pointer' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>Mark as Featured Product</p>
                    <p style={{ margin: 0, fontSize: 12, color: C.textLight }}>Shows in the homepage featured section</p>
                  </div>
                </label>
              </div>

            </div>

            {/* Divider */}
            <div style={{ height: 1, background: C.border, margin: '28px 0' }} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" disabled={loading}
                style={{
                  flex: 1, padding: '13px', background: loading ? '#f0a070' : C.orange,
                  border: 'none', borderRadius: 12, color: '#fff',
                  fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: C.font, transition: 'background 0.2s',
                  boxShadow: '0 4px 16px rgba(232,98,26,0.25)',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.orangeHov }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading ? '#f0a070' : C.orange }}
              >
                {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={() => navigate('/products')}
                style={{
                  padding: '13px 24px', background: C.grayBg, border: `1.5px solid ${C.border}`,
                  borderRadius: 12, color: C.textMid, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', fontFamily: C.font, transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.border}
                onMouseLeave={e => e.currentTarget.style.background = C.grayBg}
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
