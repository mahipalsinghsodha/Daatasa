import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiPackage, FiCheckCircle, FiRefreshCw,
  FiX, FiSearch, FiShield, FiAlertTriangle, FiEdit2, FiSave
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import RestrictedAccess from '../../components/RestrictedAccess'

const AdminInventory = () => {
  const { hasPermission } = useAuth()
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editStock, setEditStock] = useState('')

  useEffect(() => { 
    if (hasPermission('products')) fetchInventory(true, lowStockOnly) 
  }, [hasPermission, lowStockOnly])

  const fetchInventory = async (showLoad = false, lowStock = false) => {
    if (showLoad) setLoading(true); else setSyncing(true)
    try {
      const res = await api.get(`/api/products/admin/inventory?lowStock=${lowStock}`)
      setProducts(res.data)
    } catch { toast.error('Failed to load inventory') }
    finally { setLoading(false); setSyncing(false) }
  }

  const handleUpdateStock = async (id) => {
    if (editStock === '' || isNaN(editStock) || Number(editStock) < 0) {
      return toast.error('Invalid stock value')
    }
    setSyncing(true)
    try {
      const res = await api.put(`/api/products/${id}/stock`, { stock: Number(editStock) })
      toast.success('Stock updated successfully')
      setProducts(products.map(p => p._id === id ? { ...p, stock: res.data.stock } : p))
      setEditingId(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock')
    } finally {
      setSyncing(false)
    }
  }

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  })

  if (!hasPermission('products')) return <RestrictedAccess title="Access Restricted" message="You don't have permission to manage inventory." />

  if (loading) return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-base)' }}>
      <div style={{ background: 'var(--gradient-hero)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-48 shimmer rounded mb-2" />
          <div className="h-5 w-64 shimmer rounded" />
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: 20 }} className="h-16 shimmer" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-base)' }}>
      {/* ── Premium Admin Header ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.7 }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border mb-3"
                style={{ background: 'rgba(245,197,24,0.18)', color: 'var(--gold)', borderColor: 'rgba(245,197,24,0.35)' }}>
                <FiShield size={10} /> Admin Panel
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>Inventory Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <FiSearch size={14} style={{ color: 'rgba(255,255,255,0.55)' }} className="shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory…"
                  className="bg-transparent outline-none text-sm w-48" style={{ color: '#FFF', caretColor: 'var(--gold)', fontFamily: 'var(--font)' }} />
              </div>
              <button onClick={() => fetchInventory(true, lowStockOnly)} disabled={syncing}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.80)' }}>
                <FiRefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
             <button onClick={() => setLowStockOnly(false)}
                className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={!lowStockOnly
                  ? { background: 'var(--gold)', color: 'var(--navy)', border: 'none' }
                  : { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.75)' }
                }>All Products</button>
             <button onClick={() => setLowStockOnly(true)}
                className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                style={lowStockOnly
                  ? { background: 'var(--danger)', color: 'white', border: 'none' }
                  : { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.75)' }
                }><FiAlertTriangle size={14}/> Low Stock ( {'< 10'} )</button>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '80px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)' }}>
              <FiPackage size={28} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>No products found</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {search ? `No results for "${search}"` : `Inventory looks clean.`}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-[var(--bg-alt)] border-b border-[var(--border-color)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          <th className="p-4 pl-6">Product</th>
                          <th className="p-4">Category</th>
                          <th className="p-4 text-center">Stock</th>
                          <th className="p-4 text-right pr-6">Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredProducts.map((p, i) => {
                          const isEditing = editingId === p._id;
                          const isLowStock = p.stock < 10;
                          return (
                              <tr key={p._id} className="border-b last:border-b-0 border-[var(--border-color)] hover:bg-[var(--bg-surface)] transition-colors">
                                  <td className="p-4 pl-6 flex items-center gap-4">
                                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-[var(--border-color)]" />
                                      <div>
                                          <p className="text-sm font-bold text-[var(--text-primary)]">{p.name}</p>
                                          <p className="text-xs text-[var(--text-muted)]">₹{p.price}</p>
                                      </div>
                                  </td>
                                  <td className="p-4">
                                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--bg-alt)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                                          {p.category}
                                      </span>
                                  </td>
                                  <td className="p-4 text-center align-middle">
                                      {isEditing ? (
                                          <input 
                                              autoFocus
                                              type="number" 
                                              value={editStock} 
                                              onChange={(e) => setEditStock(e.target.value)}
                                              onKeyDown={(e) => {
                                                  if(e.key === 'Enter') handleUpdateStock(p._id);
                                                  if(e.key === 'Escape') setEditingId(null);
                                              }}
                                              className="w-20 text-center p-1.5 text-sm border-2 border-[var(--brand-secondary)] rounded outline-none bg-white text-black" 
                                          />
                                      ) : (
                                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-extrabold ${isLowStock ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                              {isLowStock && <FiAlertTriangle size={14} />} {p.stock}
                                          </span>
                                      )}
                                  </td>
                                  <td className="p-4 pr-6 text-right align-middle">
                                      {isEditing ? (
                                          <div className="flex justify-end gap-2">
                                              <button disabled={syncing} onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg"><FiX size={16}/></button>
                                              <button disabled={syncing} onClick={() => handleUpdateStock(p._id)} className="p-2 text-white bg-[var(--success)] hover:opacity-90 rounded-lg shadow-sm"><FiSave size={16}/></button>
                                          </div>
                                      ) : (
                                          <button onClick={() => { setEditingId(p._id); setEditStock(p.stock) }} className="p-2 text-[var(--brand-secondary)] bg-[rgba(27,47,110,0.06)] hover:bg-[rgba(27,47,110,0.12)] rounded-lg transition-colors">
                                              <FiEdit2 size={16}/>
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          )
                      })}
                  </tbody>
              </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default AdminInventory
