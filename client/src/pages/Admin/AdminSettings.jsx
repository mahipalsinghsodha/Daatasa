import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FiPercent, FiTruck, FiSave, FiToggleLeft, FiToggleRight, FiAlertCircle, FiMapPin } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

/* ── Field component using CSS tokens ── */
const Field = ({ label, icon: Icon, name, value, onChange, suffix, helpText, error }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </label>
    <div style={{
      display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-input)',
      border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
      overflow: 'hidden', transition: 'all 0.2s',
      boxShadow: error ? '0 0 0 3px rgba(229,62,62,0.12)' : 'none',
    }}
      onFocusCapture={e => { if (!error) { e.currentTarget.style.borderColor = 'var(--brand-secondary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.15)' } }}
      onBlurCapture={e => { e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border-color)'; e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(229,62,62,0.12)' : 'none' }}
    >
      <div style={{ padding: '11px 12px', background: 'var(--bg-alt)', borderRight: '1.5px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
        <Icon size={15} />
      </div>
      <input
        type="number" min="0"
        step={name === 'gstRate' ? '0.5' : '1'}
        value={value}
        onChange={e => onChange(name, Number(e.target.value))}
        style={{ flex: 1, padding: '11px 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', border: 'none', fontFamily: 'var(--font)', fontWeight: 600 }}
      />
      {suffix && (
        <span style={{ padding: '11px 12px', fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-alt)', borderLeft: '1.5px solid var(--border-color)' }}>
          {suffix}
        </span>
      )}
    </div>
    {helpText && !error && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{helpText}</p>}
    {error && (
      <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        <FiAlertCircle size={11} />{error}
      </p>
    )}
  </div>
)

const AdminSettings = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    gstRate: 5,
    gstEnabled: true,
    freeShippingThreshold: 500,
    shippingCharge: 50,
    serviceablePincodes: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [pincodeInput, setPincodeInput] = useState('')

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings')
      setSettings(res.data)
      setPincodeInput(res.data.serviceablePincodes?.join(', ') || '')
    } catch { toast.error('Failed to load settings') }
    finally { setLoading(false) }
  }

  const validate = () => {
    const e = {}
    if (settings.gstRate < 0 || settings.gstRate > 100) e.gstRate = 'GST must be 0–100%'
    if (settings.freeShippingThreshold < 0) e.freeShippingThreshold = 'Cannot be negative'
    if (settings.shippingCharge < 0) e.shippingCharge = 'Cannot be negative'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    
    // Process pincodes
    const parsedPincodes = pincodeInput.split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      
    try {
      const res = await api.patch('/api/settings', { ...settings, serviceablePincodes: parsedPincodes })
      setSettings(res.data.settings)
      setPincodeInput(res.data.settings.serviceablePincodes?.join(', ') || '')
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally { setSaving(false) }
  }

  const handleFieldChange = (name, val) => {
    setSettings(p => ({ ...p, [name]: val }))
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto"
          style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--brand-secondary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12, textAlign: 'center', fontWeight: 600 }}>Loading settings…</p>
      </div>
    </div>
  )

  const totalExample = 400 + (settings.gstEnabled ? 400 * settings.gstRate / 100 : 0) + (400 > settings.freeShippingThreshold ? 0 : settings.shippingCharge)

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-base)' }}>

      {/* ── Premium Admin Header ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.7 }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border mb-3"
            style={{ background: 'rgba(245,197,24,0.18)', color: 'var(--gold)', borderColor: 'rgba(245,197,24,0.35)' }}>
            ⚙ Admin Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>
            Platform Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.60)' }}>
            Configure GST rate and shipping charges. Changes apply to all new orders immediately.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-xl space-y-5">

          {/* ── GST Settings ── */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>GST Configuration</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Goods &amp; Services Tax applied to all orders</p>
              </div>
              {/* Toggle */}
              <button
                type="button"
                onClick={() => setSettings(p => ({ ...p, gstEnabled: !p.gstEnabled }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s', border: '1px solid',
                  ...(settings.gstEnabled
                    ? { background: 'rgba(56,161,105,0.08)', color: 'var(--success)', borderColor: 'rgba(56,161,105,0.25)' }
                    : { background: 'var(--bg-surface)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }
                  )
                }}
              >
                {settings.gstEnabled ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                {settings.gstEnabled ? 'GST Enabled' : 'GST Disabled'}
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <Field
                label="GST Rate" icon={FiPercent} name="gstRate"
                value={settings.gstRate} onChange={handleFieldChange} suffix="%"
                helpText="Standard rate for packaged food is 5%. Enter 0 to apply no GST."
                error={errors.gstRate}
              />
              {!settings.gstEnabled && (
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.20)', borderRadius: 10 }}>
                  <p style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiAlertCircle size={13} /> GST is currently disabled. No tax will be charged on orders.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Shipping Settings ── */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-alt)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>Shipping Configuration</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Free shipping threshold and default charge</p>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field
                label="Free Shipping Above (₹)" icon={FiTruck} name="freeShippingThreshold"
                value={settings.freeShippingThreshold} onChange={handleFieldChange} suffix="₹"
                helpText="Orders above this subtotal get free shipping."
                error={errors.freeShippingThreshold}
              />
              <Field
                label="Shipping Charge (₹)" icon={FiTruck} name="shippingCharge"
                value={settings.shippingCharge} onChange={handleFieldChange} suffix="₹"
                helpText="Fixed charge for orders below the free shipping threshold."
                error={errors.shippingCharge}
              />
            </div>
          </div>

          {/* ── Pincode Settings ── */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-alt)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>Serviceable Pincodes</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Limit delivery to specific ZIP codes</p>
            </div>
            <div style={{ padding: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Allowed Pincodes (comma separated)
              </label>
              <div style={{
                display: 'flex', borderRadius: 'var(--radius-input)',
                border: '1.5px solid var(--border-color)', overflow: 'hidden',
              }}>
                <div style={{ padding: '12px', background: 'var(--bg-alt)', borderRight: '1.5px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start' }}>
                  <FiMapPin size={15} style={{ marginTop: 2 }} />
                </div>
                <textarea
                  value={pincodeInput}
                  onChange={e => setPincodeInput(e.target.value)}
                  placeholder="e.g. 110001, 400001, 560001"
                  rows={4}
                  style={{ flex: 1, padding: '12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', border: 'none', resize: 'vertical' }}
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Leave empty to allow delivery to all pincodes globally.</p>
            </div>
          </div>

          {/* ── Live Preview ── */}
          <div style={{ background: 'rgba(245,166,35,0.06)', border: '1.5px solid rgba(245,166,35,0.20)', borderRadius: 'var(--radius-card)', padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
              Live Preview
            </p>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Example subtotal', val: '₹400', color: 'var(--text-primary)' },
                ...(settings.gstEnabled && settings.gstRate > 0
                  ? [{ label: `GST (${settings.gstRate}%)`, val: `₹${(400 * settings.gstRate / 100).toFixed(2)}`, color: 'var(--text-primary)' }]
                  : []
                ),
                { label: 'Shipping', val: 400 > settings.freeShippingThreshold ? 'FREE' : `₹${settings.shippingCharge}`, color: 400 > settings.freeShippingThreshold ? 'var(--success)' : 'var(--text-primary)' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.color, fontSize: 13 }}>{row.val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(245,166,35,0.25)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>Total</span>
                <span style={{ fontWeight: 800, color: 'var(--brand-secondary)', fontSize: 14 }}>₹{totalExample.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ── Save Button ── */}
          <button
            onClick={() => { if (window.confirm('Save changes to platform-wide tax and shipping?')) handleSave() }}
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', opacity: saving ? 0.7 : 1 }}
            id="save-settings-btn"
          >
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <><FiSave size={16} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
