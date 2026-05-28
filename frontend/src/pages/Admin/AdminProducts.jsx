import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus, FiSearch, FiBox, FiTrash2, FiSave,
  FiToggleLeft, FiToggleRight, FiArrowLeft, FiTag
} from 'react-icons/fi'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import CustomDropdown from '../../components/CustomDropdown'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import RestrictedAccess from '../../components/RestrictedAccess'

const inputCls = "input-base"
const labelCls = "label"

const WEIGHT_OPTIONS = ['250g', '500g', '1kg', '3kg', '5kg', '10kg', '15kg']

const AdminProducts = () => {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (hasPermission('products')) fetchData()
  }, [hasPermission])

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([api.get('/api/products?all=true'), api.get('/api/categories')])
      // API returns an object { products, total, ... }. Extract the array.
      setProducts(pRes.data.products)
      setCategories(cRes.data)
    } catch {
      toast.error('Failed to load products')
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
        mrp: prod.mrp ?? '',
        stock: prod.stock,
        category: prod.category,
        weight: prod.weight || '',
        isActive: prod.isActive ?? true,
      })
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) return toast.error('Name, price, and category are required');
    if (form.mrp && Number(form.mrp) < Number(form.price)) return toast.error('MRP must be greater than or equal to price');
    if (!window.confirm(`Save changes to "${form.name}"?`)) return
    setSaving(true)
    try {
      await api.put(`/api/products/${selectedProduct._id}`, form)
      toast.success('Product updated successfully')
      fetchData()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return
    try {
      await api.delete(`/api/products/${id}`)
      toast.success('Product deleted')
      fetchData()
      if (selectedProduct?._id === id) setSelectedProduct(null)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const categoryOptions = categories.map(c => ({
    value: c.slug,
    label: c.name,
    icon: c.image ? <img src={c.image} alt={c.name} className="w-4 h-4 rounded object-cover" /> : <span className="text-sm">{c.emoji || '🏷️'}</span>
  }))

  if (!hasPermission('products')) return (
    <RestrictedAccess title="Access Restricted" message="You don't have permission to manage products." />
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* ── Premium Admin Header ── */}
      <div className="shrink-0 relative overflow-hidden" style={{ background: 'var(--gradient-hero)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.6) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,166,35,0.20)', border: '1px solid rgba(245,166,35,0.35)' }}>
              <FiBox size={18} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>Manage Products</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{products.length} products in catalogue</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/add-product')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'var(--gold)', color: 'var(--navy)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.45)' }}>
            <FiPlus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Product List */}
        <div className={`w-full lg:w-[380px] bg-white border-r border-gray-100 flex flex-col shrink-0 ${selectedProduct ? 'hidden lg:flex' : 'flex'}`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-50">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
              <FiSearch size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">No products found</div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map(p => {
                  const isActive = selectedProduct?._id === p._id
                  return (
                    <div
                      key={p._id}
                      onClick={() => handleSelect(p)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50 border border-transparent'} ${p.isActive === false ? 'opacity-60' : ''}`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-orange-600' : 'text-gray-900'}`}>{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 font-medium">₹{p.price?.toLocaleString('en-IN')}</span>
                          {p.weight && <span className="text-[10px] bg-orange-50 text-orange-600 border border-orange-100 px-1.5 py-0.5 rounded font-semibold">{p.weight}</span>}
                          {p.isActive === false && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Inactive</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Edit Panel */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${!selectedProduct ? 'hidden lg:flex' : 'flex'} flex-col`}>
          <AnimatePresence mode="wait">
            {!selectedProduct ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <FiBox size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">Select a product to edit</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedProduct._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full mx-auto"
              >
                {/* Mobile Back */}
                <button onClick={() => setSelectedProduct(null)} className="lg:hidden flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                  <FiArrowLeft size={14} /> Back to products
                </button>

                {/* Product Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{selectedProduct.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
                          <FiTag size={10} /> {selectedProduct.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${form.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(selectedProduct._id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <FiTrash2 size={18} />
                  </button>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                  <div>
                    <label className={labelCls}>Product Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Category</label>
                    <CustomDropdown
                      options={categoryOptions}
                      value={form.category}
                      onChange={val => setForm({ ...form, category: val })}
                      placeholder="Select category"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Price (₹)</label>
                      <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>MRP (₹)</label>
                      <input type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} className={inputCls} placeholder="Optional" />
                    </div>
                    <div>
                      <label className={labelCls}>Stock Quantity</label>
                      <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Weight / Size</label>
                    <select
                      value={form.weight || ''}
                      onChange={e => setForm({ ...form, weight: e.target.value })}
                      className={inputCls}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="" disabled>Select weight</option>
                      {WEIGHT_OPTIONS.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !form.isActive;
                        if (window.confirm(`Mark product as ${next ? 'ACTIVE' : 'INACTIVE'}? ${next ? 'Customers will see it.' : 'It will be hidden from the store.'}`)) {
                          setForm({ ...form, isActive: next })
                        }
                      }}
                      className="flex items-center"
                    >
                      {form.isActive
                        ? <FiToggleRight size={28} className="text-green-500" />
                        : <FiToggleLeft size={28} className="text-gray-400" />
                      }
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Product Visibility</p>
                      <p className="text-xs text-gray-500">{form.isActive ? 'Visible to customers in the store' : 'Hidden from the store'}</p>
                    </div>
                  </label>

                  <div className="flex gap-3 pt-2 border-t border-gray-50">
                    <button onClick={() => setSelectedProduct(null)} className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex-[2] py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={15} />}
                      {saving ? 'Saving…' : 'Save Changes'}
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

export default AdminProducts