import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  Star, ShoppingCart, Minus, Plus, ChevronLeft,
  Save, Tag, Hash, FileText, Box, ShieldCheck, FileEdit, Truck, Shield, RefreshCw
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
})

// ── Admin Inline Edit Panel ────────────────────────────────────────────────
const AdminQuickEdit = ({ product, onUpdate }) => {
  const [form, setForm] = useState({
    name: product.name || '',
    price: product.price || 0,
    stock: product.stock || 0,
    description: product.description || ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      name: product.name, price: product.price, stock: product.stock, description: product.description
    })
  }, [product])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await api.put(`/api/products/${product._id}`, form)
      toast.success('Product updated')
      onUpdate()
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-8 mb-12 shadow-xl shadow-indigo-900/5"
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-100/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-indigo-950 font-head">Admin Quick Management</h3>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Instant state override</p>
          </div>
        </div>
        <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-lg">
          ID: {product._id.slice(-8)}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Product Title</label>
          <input 
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white border border-indigo-100 focus:border-indigo-500 outline-none text-sm font-bold transition-all shadow-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Stock Level</label>
            <input 
              type="number"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-indigo-100 focus:border-indigo-500 outline-none text-sm font-bold transition-all shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Unit Price (₹)</label>
            <input 
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-indigo-100 focus:border-indigo-500 outline-none text-sm font-bold transition-all shadow-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mb-8">
        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Detailed Description</label>
        <textarea 
          rows={3}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-white border border-indigo-100 focus:border-indigo-500 outline-none text-sm font-bold transition-all shadow-sm resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleUpdate}
          disabled={saving}
          className="px-8 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { fetchCartCount } = useCart()

  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get(`/api/products/${id}`),
        api.get('/api/categories')
      ])
      setProduct(prodRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await api.post('/api/cart/items', {
        productId: product._id,
        quantity,
      })
      fetchCartCount()
      toast.success('Successfully added to your cart!')
    } catch {
      toast.error('Failed to update cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[var(--color-bg)]">
      <div className="w-10 h-10 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
      <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning artifacts...</p>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center">
        <div className="text-6xl mb-4 grayscale opacity-20">🍯</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Item Disappeared</h2>
        <p className="text-gray-400 font-medium mb-8">This product may have been archived or removed from nuestra inventory.</p>
        <Link to="/products" className="px-8 py-3 bg-gray-900 text-white text-sm font-black rounded-2xl shadow-xl shadow-gray-200">Return to Store</Link>
      </div>
    </div>
  )

  const catName = categories.find(c => c.slug === product.category)?.name || product.category

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-32">
      
      {/* ── Breadcrumbs & Back ── */}
      <div className="bg-white border-b border-[var(--color-border)] py-4 sticky top-16 z-30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400">
            <button onClick={() => navigate('/products')} className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
              <ChevronLeft size={14} /> Back
            </button>
            <span className="text-gray-200">/</span>
            <span className="text-gray-900 truncate max-w-[200px] font-head">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Admin Layer */}
        {user?.role === 'admin' && (
           <AdminQuickEdit product={product} onUpdate={fetchProduct} />
        )}

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* ── Left: Visual Presentation ── */}
          <motion.div {...fadeUp(0)} className="space-y-8">
            <div className="aspect-square rounded-[48px] bg-white border border-gray-100 shadow-2xl shadow-gray-200/50 p-12 flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-105" 
               />
               {product.featured && (
                 <div className="absolute top-8 left-8 px-4 py-2 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-orange-200">
                   Featured Select
                 </div>
               )}
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Truck size={18}/>, title: 'Pan India', sub: 'Standard Ship' },
                { icon: <Shield size={18}/>, title: 'Lab Tested', sub: 'Pure Quality' },
                { icon: <RefreshCw size={18}/>, title: 'Bilona', sub: 'Tradition' }
              ].map((spec, i) => (
                <div key={i} className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl p-5 text-center">
                   <div className="flex justify-center text-orange-600 mb-2">{spec.icon}</div>
                   <div className="text-[10px] font-black text-gray-900 uppercase tracking-tighter leading-none">{spec.title}</div>
                   <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-70">{spec.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Commerce Container ── */}
          <motion.div {...fadeUp(0.1)} className="pb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-6">
              <Tag size={12} className="text-orange-600" />
              <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">{catName} Ghee</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 font-head leading-[1.1] tracking-tight">
              {product.name}
            </h1>

            {/* Metrics Row */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} className={i <= Math.round(product.rating) ? 'text-orange-500 fill-orange-500' : 'text-gray-200'} />
                ))}
                <span className="ml-1 text-sm font-black text-gray-900">{product.rating.toFixed(1)}</span>
                <span className="text-xs font-bold text-gray-400">({product.numReviews} Reviews)</span>
              </div>
              <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {product.stock > 0 ? `Inventory Ready (${product.stock} units)` : 'Sold Out Permanently'}
                 </span>
              </div>
            </div>

            {/* Price Display */}
            <div className="mb-10 flex items-baseline gap-3">
               <span className="text-5xl font-black text-gray-900 tracking-tighter font-head">₹{product.price.toLocaleString('en-IN')}</span>
               <span className="text-sm font-bold text-gray-400">/ {product.weight || 'unit'}</span>
            </div>

            <div className="h-[1px] bg-gray-100 w-full mb-10" />

            <div className="prose prose-sm text-gray-500 font-medium leading-relaxed mb-12 max-w-none">
              {product.description}
            </div>

            {/* Selection Controls */}
            {product.stock > 0 && (!user || (user.role !== 'admin' && user.role !== 'superadmin')) && (
              <div className="space-y-8 bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Select Quantity</h4>
                    <p className="text-[10px] font-bold text-gray-400">Maximum {product.stock} units per cart</p>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-900 shadow-sm hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-lg font-black text-gray-900 font-head">{quantity}</span>
                    <button 
                       onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                       className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-900 shadow-sm hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="flex-[2] py-5 bg-gray-900 text-white font-black rounded-3xl shadow-2xl shadow-gray-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {adding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShoppingCart size={20} />}
                    {adding ? 'Securing Item...' : `Purchase Now — ₹${(product.price * quantity).toLocaleString()}`}
                  </button>
                </div>
                
                <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest">
                  Secure Checkout · Pan India Delivery · 100% Guaranteed Pure
                </p>
              </div>
            )}
            
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail