import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { FiSearch, FiPackage, FiChevronLeft, FiChevronRight, FiSliders, FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const PAGE_SIZE = 12

const SkeletonCard = () => (
  <div className="rounded-[20px] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
    <div className="aspect-square skeleton" />
    <div className="p-4 space-y-2.5">
      <div className="h-3 skeleton rounded-full w-3/4" />
      <div className="h-3 skeleton rounded-full w-1/2" />
      <div className="h-5 skeleton rounded-full w-1/3 mt-1" />
    </div>
  </div>
)

const SORT_OPTIONS = [
  { label: 'Default',           value: 'default'   },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Top Rated',         value: 'rating'    },
  { label: 'Newest',            value: 'newest'    },
]

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products,         setProducts]         = useState([])
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [searchTerm,       setSearchTerm]       = useState('')
  const [debouncedSearch,  setDebouncedSearch]  = useState('')
  const [categories,       setCategories]       = useState([])
  const [sort,             setSort]             = useState('default')
  const [page,             setPage]             = useState(1)
  const [total,            setTotal]            = useState(0)
  const [totalPages,       setTotalPages]       = useState(0)

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    api.get('/api/categories').then(r => setCategories(r.data)).catch(console.error)
  }, [])

  useEffect(() => { fetchProducts() }, [selectedCategory, debouncedSearch, page, sort])

  const fetchProducts = async () => {
    setLoading(true); setError(null)
    try {
      const params = { page, limit: PAGE_SIZE, sort }
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
      const res = await api.get('/api/products', { params })
      setProducts(res.data.products || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.pages || 0)
    } catch (err) {
      console.error(err)
      setError('Could not load products. Please check your connection and try again.')
    } finally { setLoading(false) }
  }

  const handleCategoryChange = cat => {
    setSelectedCategory(cat); setPage(1)
    cat === 'all' ? setSearchParams({}) : setSearchParams({ category: cat })
  }

  const clearFilters = () => {
    setSearchTerm(''); setSelectedCategory('all')
    setSearchParams({}); setSort('default'); setPage(1)
  }

  const hasFilters = selectedCategory !== 'all' || debouncedSearch

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Helmet>
        <title>{selectedCategory && selectedCategory !== 'all'
          ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Ghee — DhaniFresh`
          : 'Buy Pure Desi Ghee Online — DhaniFresh'}</title>
        <meta name="description" content="Shop premium Bilona Desi Ghee online. Traditional Tharparkar cow ghee crafted in our Rajasthan village. FSSAI certified. Free shipping above ₹500. Pan India delivery." />
        <link rel="canonical" href="https://dhanifresh.in/products" />
      </Helmet>

      {/* ── Premium Hero Header ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.30) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.5, transform: 'translate(20%, -30%)' }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center">
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs font-bold uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(245,166,35,0.18)', color: 'var(--gold)', border: '1px solid rgba(245,166,35,0.30)' }}>
            Pure Ghee Collection
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
            className="text-4xl sm:text-5xl font-extrabold mb-3 text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            Our <span className="shimmer-text">Ghee</span> Products
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="text-sm sm:text-base max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Handcrafted using traditional methods for absolute purity and rich aroma.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="var(--bg-base)" />
          </svg>
        </div>
      </div>

      {/* ── Sticky Filter Bar ── */}
      <div
        className="sticky top-[60px] z-30 backdrop-blur-xl"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {[{ slug: 'all', name: 'All Products' }, ...categories].map(cat => {
                const active = selectedCategory === cat.slug
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                    style={active
                      ? { background: 'var(--brand-gradient)', color: 'var(--brand-text)', boxShadow: '0 4px 14px rgba(19,60,42,0.25)' }
                      : { color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }
                    }
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>

            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              {/* Search */}
              <div className="relative group">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px' }}
                  className="pl-9 pr-4 py-2 text-sm outline-none focus:ring-0 transition-all placeholder:text-[var(--text-muted)] w-full sm:w-44"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <FiX size={13} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <FiSliders className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} size={13} />
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1) }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '12px' }}
                  className="pl-9 pr-8 py-2 text-sm outline-none transition-all cursor-pointer appearance-none w-full sm:w-auto"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* Result count + clear */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Showing <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</span> of{' '}
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{total}</span> products
              {selectedCategory !== 'all' && (
                <> in <span className="font-bold capitalize" style={{ color: 'var(--brand-secondary)' }}>{selectedCategory}</span></>
              )}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold transition-colors" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <FiX size={12} /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(PAGE_SIZE)].map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-24 rounded-3xl flex flex-col items-center text-center p-10"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--danger)' }}>
                <FiPackage size={28} />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Could Not Load Products</h2>
              <p className="text-sm max-w-xs mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
              <button onClick={fetchProducts} className="btn btn-primary text-sm">Try Again</button>
            </motion.div>
          ) : products.length > 0 ? (
            <motion.div key="grid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} categories={categories} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="py-28 rounded-3xl border-dashed flex flex-col items-center text-center p-10"
              style={{ background: 'var(--bg-card)', border: '2px dashed var(--border-color)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
                <FiPackage size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>No Products Found</h3>
              <p className="text-sm max-w-xs mb-7" style={{ color: 'var(--text-muted)' }}>
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <button onClick={clearFilters} className="btn btn-primary text-sm">Reset Filters</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-40"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <FiChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1
              if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
                if (p === 2 || p === totalPages - 1) return <span key={p} style={{ color: 'var(--text-muted)' }} className="text-sm px-1">…</span>
                return null
              }
              return (
                <button key={p} onClick={() => setPage(p)}
                  className="w-10 h-10 rounded-xl text-sm font-bold transition-all"
                  style={page === p
                    ? { background: 'var(--brand-gradient)', color: 'var(--brand-text)', boxShadow: 'var(--shadow-brand)' }
                    : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                  }
                >
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-40"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
