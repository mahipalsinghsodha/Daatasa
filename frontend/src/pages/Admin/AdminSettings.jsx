import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FiPercent, FiTruck, FiSave, FiToggleLeft, FiToggleRight, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const Field = ({ label, icon: Icon, name, value, onChange, suffix, helpText, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className={`flex items-center gap-0 rounded-lg border overflow-hidden transition-all ${error ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100'}`}>
      <div className="px-3 py-3 bg-gray-50 border-r border-gray-200 text-gray-400">
        <Icon size={16} />
      </div>
      <input
        type="number"
        min="0"
        step={name === 'gstRate' ? '0.5' : '1'}
        value={value}
        onChange={e => onChange(name, Number(e.target.value))}
        className="flex-1 px-3 py-3 text-sm text-gray-900 outline-none bg-white"
      />
      {suffix && <span className="px-3 text-sm text-gray-400 bg-gray-50 border-l border-gray-200 py-3">{suffix}</span>}
    </div>
    {helpText && !error && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
    {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><FiAlertCircle size={11} />{error}</p>}
  </div>
)

const AdminSettings = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    gstRate: 5,
    gstEnabled: true,
    freeShippingThreshold: 500,
    shippingCharge: 50,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings')
      setSettings(res.data)
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
    try {
      const res = await api.patch('/api/settings', settings)
      setSettings(res.data.settings)
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally { setSaving(false) }
  }

  const handleFieldChange = (name, val) => {
    setSettings(p => ({ ...p, [name]: val }))
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pb-20" style={{ background: '#f8f9fa' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-3">Admin Panel</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>
            Platform Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">Configure GST rate and shipping charges. Changes apply to all new orders immediately.</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-xl space-y-6">

          {/* GST Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>GST Configuration</h2>
                <p className="text-xs text-gray-400 mt-0.5">Goods & Services Tax applied to all orders</p>
              </div>
              {/* Toggle GST on/off */}
              <button
                type="button"
                onClick={() => setSettings(p => ({ ...p, gstEnabled: !p.gstEnabled }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  settings.gstEnabled
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {settings.gstEnabled ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                {settings.gstEnabled ? 'GST Enabled' : 'GST Disabled'}
              </button>
            </div>
            <div className="p-6">
              <Field
                label="GST Rate"
                icon={FiPercent}
                name="gstRate"
                value={settings.gstRate}
                onChange={handleFieldChange}
                suffix="%"
                helpText="Standard rate for packaged food is 5%. Enter 0 to apply no GST."
                error={errors.gstRate}
              />
              {!settings.gstEnabled && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                    <FiAlertCircle size={13} /> GST is currently disabled. No tax will be charged on orders.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Shipping Configuration</h2>
              <p className="text-xs text-gray-400 mt-0.5">Free shipping threshold and default charge</p>
            </div>
            <div className="p-6 space-y-5">
              <Field
                label="Free Shipping Above (₹)"
                icon={FiTruck}
                name="freeShippingThreshold"
                value={settings.freeShippingThreshold}
                onChange={handleFieldChange}
                suffix="₹"
                helpText="Orders above this subtotal get free shipping."
                error={errors.freeShippingThreshold}
              />
              <Field
                label="Shipping Charge (₹)"
                icon={FiTruck}
                name="shippingCharge"
                value={settings.shippingCharge}
                onChange={handleFieldChange}
                suffix="₹"
                helpText="Fixed charge for orders below the free shipping threshold."
                error={errors.shippingCharge}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3">Live Preview</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Example subtotal</span>
                <span className="font-semibold text-gray-900">₹400</span>
              </div>
              {settings.gstEnabled && settings.gstRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">GST ({settings.gstRate}%)</span>
                  <span className="font-semibold text-gray-900">₹{(400 * settings.gstRate / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className={`font-semibold ${400 > settings.freeShippingThreshold ? 'text-green-600' : 'text-gray-900'}`}>
                  {400 > settings.freeShippingThreshold ? 'FREE' : `₹${settings.shippingCharge}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-orange-200 font-bold">
                <span className="text-gray-700">Total</span>
                <span className="text-orange-700">
                  ₹{(400 + (settings.gstEnabled ? 400 * settings.gstRate / 100 : 0) + (400 > settings.freeShippingThreshold ? 0 : settings.shippingCharge)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={() => { if(window.confirm('Save changes to platform-wide tax and shipping?')) handleSave() }}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl shadow-sm transition-all"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={16} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
