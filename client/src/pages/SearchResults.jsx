import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { FiSearch, FiPackage, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
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

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/api/categories').then(r => setCategories(r.data)).catch(console.error)
  }, [])

  useEffect(() => {
    if (query) {
      setPage(1)
      fetchSearchResults(1)
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [query])

  const fetchSearchResults = async (pageNum) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/search', {
        params: { q: query, page: pageNum, limit: PAGE_SIZE }
      })
      setProducts(res.data.products || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.pages || 0)
    } catch (err) {
      console.error(err)
      setError('Could not load search results. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    fetchSearchResults(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Helmet>
        <title>Search results for "{query}" — Daatasa</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* ── Search Header ── */}
      <div className="py-8 sm:py-12" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(245,166,35,0.1)', color: 'var(--gold)' }}>
            <FiSearch size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 text-white" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            Search Results
          </h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Showing results for <span className="font-bold text-white">"{query}"</span>
          </p>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {!loading && total > 0 && (
          <div className="mb-6">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Found <span className="font-bold text-white">{total}</span> matching products
            </p>
          </div>
        )}

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
              <h2 className="text-lg font-bold mb-2 text-white">Search Failed</h2>
              <p className="text-sm max-w-xs mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
              <button onClick={() => fetchSearchResults(page)} className="btn btn-primary text-sm">Try Again</button>
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
              <h3 className="text-xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-display)' }}>No Matches Found</h3>
              <p className="text-sm max-w-xs mb-7" style={{ color: 'var(--text-muted)' }}>
                We couldn't find any products matching "{query}". Try checking your spelling or using more general terms.
              </p>
              <button onClick={() => navigate('/products')} className="btn btn-primary text-sm">Browse All Products</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">
            <button onClick={() => handlePageChange(Math.max(1, page - 1))} disabled={page === 1}
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
                <button key={p} onClick={() => handlePageChange(p)}
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
            <button onClick={() => handlePageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
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

export default SearchResults
