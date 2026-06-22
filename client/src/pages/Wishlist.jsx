import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
  FiHeart, FiShoppingCart, FiTrash2, FiArrowRight,
  FiPackage, FiStar
} from 'react-icons/fi'

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
    <div className="aspect-square skeleton" />
    <div className="p-4 space-y-2.5">
      <div className="h-3 skeleton rounded w-3/4" />
      <div className="h-3 skeleton rounded w-1/2" />
      <div className="h-8 skeleton rounded mt-3" />
    </div>
  </div>
)

const WishlistCard = ({ product, onRemove, onAddToCart }) => {
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async () => {
    setAdding(true)
    try {
      await onAddToCart(product._id)
    } finally {
      setAdding(false)
    }
  }

  const isOutOfStock = product.stock === 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      className="rounded-2xl overflow-hidden group transition-all duration-300"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <Link to={`/products/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg-overlay)' }}>
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
              Out of Stock
            </span>
          </div>
        )}

        {/* Remove from wishlist */}
        <button
          onClick={() => onRemove(product._id)}
          title="Remove from wishlist"
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)', color: 'var(--danger)' }}
        >
          <FiHeart size={14} fill="currentColor" />
        </button>

        {/* Rating badge */}
        {product.rating > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)', backdropFilter: 'blur(8px)' }}>
            <FiStar size={11} style={{ color: 'var(--brand-primary)', fill: 'var(--brand-primary)' }} />
            {product.rating.toFixed(1)}
            {product.numReviews > 0 && (
              <span style={{ color: 'var(--text-muted)' }} className="font-normal">({product.numReviews})</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-sm font-semibold line-clamp-2 transition-colors mb-1"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
            {product.name}
          </h3>
        </Link>
        {product.weight && (
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{product.weight}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(234, 168, 39, 0.08)', color: 'var(--brand-secondary)', border: '1px solid rgba(234, 168, 39, 0.18)' }}>
              Only {product.stock} left
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
          style={isOutOfStock
            ? { background: 'var(--bg-base)', color: 'var(--text-muted)', cursor: 'not-allowed' }
            : { background: 'var(--brand-gradient)', color: 'var(--brand-text)', boxShadow: 'var(--shadow-brand)' }
          }
        >
          {adding ? (
            <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
          ) : (
            <>
              <FiShoppingCart size={14} />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

const Wishlist = () => {
  const { user, toggleWishlist } = useAuth()
  const { fetchCartCount } = useCart()
  const navigate = useNavigate()

  const [wishlistProducts, setWishlistProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/wishlist' } }); return }
    fetchWishlist()
  }, [user])

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      // Fetch all wishlisted products by their IDs
      if (!user.wishlist || user.wishlist.length === 0) {
        setWishlistProducts([])
        setLoading(false)
        return
      }
      // Fetch each product — use the products list endpoint with IDs
      const res = await api.get('/api/products')
      const all = res.data
      const wishlisted = all.filter(p => user.wishlist.some(id => String(id?._id || id) === String(p._id)))
      setWishlistProducts(wishlisted)
    } catch (err) {
      console.error('Wishlist fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId)
      setWishlistProducts(prev => prev.filter(p => p._id !== productId))
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  const handleAddToCart = async (productId) => {
    try {
      await api.post('/api/cart/items', { productId, quantity: 1 })
      await fetchCartCount()
      toast.success('Added to cart!')
    } catch (err) {
      // toast is shown by global axios interceptor
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Helmet>
        <title>My Wishlist — DhaniFresh</title>
        <meta name="description" content="Your saved DhaniFresh products. Add to cart and enjoy premium Bilona Desi Ghee delivered to your door." />
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* ── Page Header ── */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.10)' }}>
                  <FiHeart size={18} style={{ color: 'var(--danger)', fill: 'var(--danger)' }} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  My Wishlist
                </h1>
              </div>
              {!loading && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {wishlistProducts.length === 0
                    ? 'Your wishlist is empty'
                    : `${wishlistProducts.length} saved product${wishlistProducts.length !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
            {wishlistProducts.length > 0 && (
              <Link
                to="/products"
                className="hidden sm:flex items-center gap-2 btn-secondary text-[13.5px]"
              >
                Continue Shopping <FiArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : wishlistProducts.length === 0 ? (
          /* Premium Empty State */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="py-20 rounded-3xl flex flex-col items-center text-center p-10"
            style={{ background: 'var(--bg-card)', border: '2px dashed var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
          >
            {/* Animated heart illustration */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mb-8"
            >
              <div className="w-28 h-28 rounded-3xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', boxShadow: '0 8px 32px -8px rgba(239,68,68,0.20)' }}>
                <FiHeart size={48} style={{ color: 'var(--danger)', fill: 'var(--danger)', opacity: 0.7 }} />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--brand-gradient)', color: 'var(--brand-text)', boxShadow: 'var(--shadow-sm)' }}>
                0
              </div>
            </motion.div>

            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Your wishlist is empty
            </h2>
            <p className="text-sm max-w-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Save your favourite ghee products here to buy them later. Start exploring our collection!
            </p>
            <p className="text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
              Tap the <FiHeart size={11} className="inline" style={{ color: 'var(--danger)', fill: 'var(--danger)', opacity: 0.5 }} /> on any product to add it here.
            </p>

            {/* Category suggestion chips */}
            <div className="flex flex-wrap gap-2.5 justify-center mb-8">
              {['Tharparkar Bilona Ghee', 'Cow Ghee', 'Buffalo Ghee', 'Best Sellers'].map(cat => (
                <Link
                  key={cat}
                  to={`/products?category=${cat.toLowerCase().replace(/ /g, '-')}`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--brand-primary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'var(--bg-surface)';
                  }}
                >
                  {cat}
                </Link>
              ))}
            </div>

            <Link
              to="/products"
              className="btn-primary"
            >
              Explore Products <FiArrowRight size={15} />
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {wishlistProducts.map(product => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemove}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default Wishlist
