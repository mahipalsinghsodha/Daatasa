import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import api from '../api/axios'

const ProductCard = ({ product, categories = [] }) => {
  const { user } = useAuth()
  const { fetchCartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const catObj = categories.find(c => c.slug === product.category)
  const catName = catObj ? catObj.name : product.category

  const showCart = !user || (user.role !== 'admin' && user.role !== 'superadmin')
  const isWishlisted = user?.wishlist?.includes(product._id)

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    try {
      const added = await user.toggleWishlist(product._id)
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      // After login, send them to cart — that's where they want to go
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    try {
      await api.post('/api/cart/items', { productId: product._id, quantity: 1 })
      fetchCartCount()
      toast.success(`${product.name} added to cart!`)
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  const stars = Math.round(product.rating || 0)

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        <img
          src={product.image}
          alt={`${product.name} — DhaniFresh`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-gray-700 rounded-full border border-white/50 shadow-sm uppercase tracking-wide">
            {catName}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {product.featured && (
            <span className="px-2.5 py-1 bg-orange-500 text-white text-[10px] font-semibold rounded-full uppercase tracking-wide shadow-sm">
              Featured
            </span>
          )}
          {showCart && (
            <button
              onClick={handleWishlist}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-white flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all shadow-sm"
            >
              <FiHeart size={14} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <FiStar
                key={i}
                size={11}
                className={i <= stars ? 'text-orange-400 fill-orange-400' : 'text-gray-200'}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 ml-0.5">({product.numReviews || 0})</span>
        </div>

        {/* Name */}
        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-500 transition-colors" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3 min-h-[2.25rem]">
          {product.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <div className="text-[10px] font-medium text-gray-400 mb-0.5 uppercase tracking-wide">{product.weight}</div>
            <div className="text-base font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              ₹{product.price?.toLocaleString('en-IN')}
            </div>
          </div>

          {showCart && (
            <button
              onClick={handleQuickAdd}
              title="Add to Cart"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-50 text-orange-500 border border-orange-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all active:scale-95"
            >
              <FiShoppingCart size={16} />
            </button>
          )}
        </div>

        {/* Stock */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
