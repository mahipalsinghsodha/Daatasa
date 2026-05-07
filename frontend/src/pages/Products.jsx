import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { FiSearch, FiPackage } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [searchTerm, setSearchTerm] = useState('')
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
      if (debouncedSearch.trim()) params.search = debouncedSearch
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
    <div className="min-h-screen" style={{ background: '#f8f9fa' }}>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-3"
          >
            Pure Ghee Collection
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}
          >
            Our Ghee Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base text-gray-500 max-w-lg mx-auto"
          >
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
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>

            {/* Search */}
            <div className="relative shrink-0 sm:w-72 group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={15} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none text-sm text-gray-800 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* Result count */}
        {!loading && products.length > 0 && (
          <p className="text-sm text-gray-500 mb-6">
            Showing <span className="font-semibold text-gray-800">{products.length}</span> products
            {selectedCategory !== 'all' && <> in <span className="text-orange-600 font-semibold capitalize">{selectedCategory}</span></>}
          </p>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-28 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading products...</p>
            </motion.div>
          ) : products.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {products.map(product => (
                <ProductCard key={product._id} product={product} categories={categories} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-24 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center text-center p-10"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 mb-4">
                <FiPackage size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No Products Found</h3>
              <p className="text-sm text-gray-400 max-w-xs mb-6">Try adjusting your search or filter to find what you're looking for.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSearchParams({}) }}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-all"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Products
