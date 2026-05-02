import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { FiSearch, FiFilter } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [searchTerm, setSearchTerm]         = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    api.get('/api/categories').then(res => setCategories(res.data)).catch(console.error)
  }, [])

  useEffect(() => { fetchProducts() }, [selectedCategory, debouncedSearch])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (debouncedSearch.trim())      params.search   = debouncedSearch
      const res = await api.get('/api/products', { params })
      setProducts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    cat === 'all' ? setSearchParams({}) : setSearchParams({ category: cat })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      
      {/* ── Page Title Section ── */}
      <div className="bg-white border-b border-[var(--color-border)] pt-12 pb-8 sm:pt-16 sm:pb-12 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-4"
            >
              <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">Pure Ghee Collection</span>
            </motion.div>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 font-head tracking-tight">Our Ghee Products</h1>
            <p className="text-gray-500 font-medium max-w-lg">Handcrafted using traditional methods to ensure absolute purity and rich aroma.</p>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)] py-4">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Category Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
              {[{ slug: 'all', name: 'All Collection' }, ...categories].map(cat => {
                const active = selectedCategory === cat.slug
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`whitespace-nowrap px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                      active 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80 group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
              <input
                type="text"
                placeholder="Find specific product..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-bold transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Result Summary */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-400">
            {products.length > 0 ? (
              <><span className="text-gray-900">{products.length}</span> results found in <span className="text-orange-600 font-black uppercase text-[10px] tracking-widest">{selectedCategory === 'all' ? 'Full Archive' : selectedCategory}</span></>
            ) : (
              'No products match your criteria'
            )}
          </p>
          <div className="hidden sm:flex items-center gap-2 text-xs font-black text-gray-300 uppercase tracking-widest">
            <FiFilter size={12} /> Filtered View
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-10 h-10 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Scanning inventory...</p>
            </motion.div>
          ) : products.length > 0 ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8"
            >
              {products.map((product, idx) => (
                <ProductCard key={product._id} product={product} categories={categories} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-32 bg-white rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center text-center p-12"
            >
              <div className="text-6xl mb-6 grayscale opacity-30">🍯</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 font-head">No Products Found</h3>
              <p className="text-gray-400 font-medium max-w-xs mx-auto">We couldn't find any products matching your search. Try different filters or terms.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSearchParams({}) }}
                className="mt-8 px-6 py-3 bg-gray-900 text-white text-sm font-black rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-gray-900/10"
              >
                Reset All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

export default Products
