import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { useState } from 'react'

// Cloudinary optimized images for cards
const clImg = (url, w = 400) => {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/c_fill,w_${w},f_auto,q_auto/`)
}

const ProductCard = ({ product, categories = [] }) => {
  const { user, toggleWishlist } = useAuth()
  const { fetchCartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [addingToCart, setAddingToCart] = useState(false)

  const catObj  = categories.find(c => c.slug === product.category)
  const catName = catObj ? catObj.name : product.category
  const showCart = !user || (user.role !== 'admin' && user.role !== 'superadmin')
  const isWishlisted = user?.wishlist?.some(id => String(id?._id || id) === String(product._id))
  const stars = Math.round(product.rating || 0)
  const inStock = product.stock > 0
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { navigate('/login', { state: { from: location.pathname } }); return }
    try {
      const added = await toggleWishlist(product._id)
      toast.success(added ? 'Added to wishlist ♥' : 'Removed from wishlist')
    } catch { toast.error('Failed to update wishlist') }
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { navigate('/login', { state: { from: '/cart' } }); return }
    if (!inStock) return
    setAddingToCart(true)
    try {
      await api.post('/api/cart/items', { productId: product._id, quantity: 1 })
      fetchCartCount()
      toast.success('Added to cart!')
    } catch { toast.error('Failed to add to cart') }
    finally { setAddingToCart(false) }
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block rounded-[16px] overflow-hidden hover:-translate-y-1.5 transition-all duration-300 will-change-transform"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      {/* ── Image ── */}
      <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <img
          src={clImg(product.image)}
          alt={`${product.name} — DhaniFresh`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top-left: discount / category badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount > 0 ? (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide"
              style={{ background: 'var(--brand-gradient)', color: 'var(--brand-text)' }}>
              -{discount}% OFF
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wide"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
              {catName}
            </span>
          )}
        </div>

        {/* Top-right: Top Pick + Wishlist */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
          {product.featured && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
              ✦ Top Pick
            </span>
          )}
          {showCart && (
            <button
              onClick={handleWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: isWishlisted ? '#ef4444' : 'var(--text-muted)',
              }}
            >
              <FiHeart size={13} className={isWishlisted ? 'fill-red-500' : ''} />
            </button>
          )}
        </div>

        {/* Desktop hover: Quick Add overlay */}
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            disabled={!inStock || addingToCart}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-full transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'var(--brand-gradient)',
              color: 'var(--brand-text)',
            }}
          >
            {addingToCart
              ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <FiShoppingCart size={13} />
            }
            {inStock ? (addingToCart ? 'Adding…' : 'Add to Cart') : 'Out of Stock'}
          </button>
        </div>

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}>
            <span className="px-4 py-2 text-white text-xs font-bold rounded-full uppercase tracking-widest"
              style={{ background: 'rgba(0,0,0,0.7)' }}>
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 sm:p-5">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <FiStar
                key={i}
                size={11}
                className={i <= stars ? 'text-amber-400 fill-amber-400' : ''}
                style={i > stars ? { color: 'var(--border-color)', fill: 'var(--border-color)' } : {}}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {product.rating ? product.rating.toFixed(1) : '—'}
            <span className="ml-0.5" style={{ color: 'var(--border-color)' }}>({product.numReviews || 0})</span>
          </span>
        </div>

        {/* Name */}
        <h3
          className="text-sm font-semibold mb-1 line-clamp-2 leading-snug transition-colors duration-200"
          style={{ color: 'var(--text-primary)' }}
        >
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs line-clamp-2 leading-relaxed mb-3 min-h-[2rem]"
          style={{ color: 'var(--text-muted)' }}>
          {product.description}
        </p>

        {/* Footer */}
        <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              {product.weight && (
                <div className="text-[10px] font-semibold mb-0.5 uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}>{product.weight}</div>
              )}
              {product.mrp && product.mrp > product.price ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    ₹{product.price?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                    ₹{product.mrp?.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-400'}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                {inStock ? 'In Stock' : 'Sold Out'}
              </span>
            </div>
          </div>

          {/* Mobile-only Add to Cart */}
          {showCart && inStock && (
            <button
              onClick={handleQuickAdd}
              disabled={addingToCart}
              className="sm:hidden mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-full transition-all duration-200 disabled:opacity-50"
              style={{ background: 'var(--brand-gradient)', color: 'var(--brand-text)' }}
            >
              {addingToCart
                ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <FiShoppingCart size={13} />
              }
              {addingToCart ? 'Adding…' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
