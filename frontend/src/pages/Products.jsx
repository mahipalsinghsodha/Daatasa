import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { FiSearch, FiPackage, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const PAGE_SIZE = 12

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-100" />
    <div className="p-4 space-y-2.5">
      <div className="h-3.5 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-5 bg-gray-100 rounded w-1/3 mt-1" />
      <div className="h-9 bg-gray-100 rounded-lg mt-2" />
    </div>
  </div>
)

const SORT_OPTIONS = [
  { label: 'Default',         value: 'default' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Top Rated',       value: 'rating' },
  { label: 'Newest',          value: 'newest' },
]

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categories, setCategories] = useState([])
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    api.get('/api/categories').then(r => setCategories(r.data)).catch(console.error)
  }, [])

  useEffect(() => { fetchProducts() }, [selectedCategory, debouncedSearch])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (debouncedSearch.trim()) params.search = debouncedSearch
      const res = await api.get('/api/products', { params })
      setProducts(res.data)
      setPage(1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setPage(1)
    cat === 'all' ? setSearchParams({}) : setSearchParams({ category: cat })
  }

  // Client-side sort
  const sorted = useMemo(() => {
    const arr = [...products]
    if (sort === 'price_asc')  return arr.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') return arr.sort((a, b) => b.price - a.price)
    if (sort === 'rating')     return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    if (sort === 'newest')     return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return arr
  }, [products, sort])

  // Client-side pagination
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fa' }}>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-3">
            Pure Ghee Collection
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>
            Our Ghee Products
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-base text-gray-500 max-w-lg mx-auto">
            Handcrafted using traditional methods for absolute purity and rich aroma.
          </motion.p>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-[106px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[{ slug: 'all', name: 'All Products' }, ...categories].map(cat => {
                const active = selectedCategory === cat.slug
                return (
                  <button key={cat.slug} onClick={() => handleCategoryChange(cat.slug)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      active ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}>
                    {cat.name}
                  </button>
                )
              })}
            </div>

            {/* Search + Sort */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative group">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={15} />
                <input type="text" placeholder="Search..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none text-sm text-gray-800 transition-all placeholder:text-gray-400 w-44" />
              </div>
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
                className="py-2 pl-3 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 outline-none focus:border-orange-400 transition-all cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* Result count */}
        {!loading && sorted.length > 0 && (
          <p className="text-sm text-gray-500 mb-6">
            Showing <span className="font-semibold text-gray-800">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)}</span> of <span className="font-semibold text-gray-800">{sorted.length}</span> products
            {selectedCategory !== 'all' && <> in <span className="text-orange-600 font-semibold capitalize">{selectedCategory}</span></>}
          </p>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(PAGE_SIZE)].map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : paginated.length > 0 ? (
            <motion.div key="grid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {paginated.map(product => (
                <ProductCard key={product._id} product={product} categories={categories} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="py-24 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center text-center p-10">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 mb-4">
                <FiPackage size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No Products Found</h3>
              <p className="text-sm text-gray-400 max-w-xs mb-6">Try adjusting your search or filter to find what you're looking for.</p>
              <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSearchParams({}); setSort('default') }}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-all">
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900 disabled:opacity-40 transition-all">
              <FiChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1
              if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
                if (p === 2 || p === totalPages - 1) return <span key={p} className="text-gray-400 text-sm">…</span>
                return null
              }
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all border ${
                    page === p ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                  }`}>
                  {p}
                </button>
              )
            })}

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900 disabled:opacity-40 transition-all">
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
