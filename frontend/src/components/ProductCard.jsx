import { Link } from 'react-router-dom'
import { FiStar, FiShoppingCart } from 'react-icons/fi'
import { Tag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import api from '../api/axios'

const ProductCard = ({ product, categories = [] }) => {
  const { user } = useAuth()
  const { fetchCartCount } = useCart()
  const catObj = categories.find(c => c.slug === product.category)
  const catName = catObj ? catObj.name : product.category.toUpperCase()

  const showCart = !user || (user.role !== 'admin' && user.role !== 'superadmin')

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.info('Please login to add to cart')
      return
    }
    try {
      await api.post('/api/cart/items', {
        productId: product._id,
        quantity: 1,
      })
      fetchCartCount()
      toast.success(`${product.name} added to cart!`)
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-orange-50/50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1.5">
            <Tag size={10} className="text-orange-600" />
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider">{catName}</span>
          </div>
          
          {product.featured && (
            <div className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20">
              Featured
            </div>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6">
        {/* Rating & Reviews */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <FiStar 
                key={i} 
                size={10} 
                className={`${i <= Math.round(product.rating) ? 'text-orange-500 fill-orange-500' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400">({product.numReviews})</span>
        </div>

        {/* Name & Desc */}
        <h3 className="text-base font-black text-gray-900 mb-1.5 line-clamp-1 group-hover:text-orange-600 transition-colors font-head">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
          {product.description}
        </p>

        {/* Divider */}
        <div className="h-[1px] bg-gray-50 w-full mb-4" />

        {/* Footer: Price & Action */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">{product.weight}</div>
            <div className="text-xl font-black text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
          </div>

          {showCart && (
            <button
              onClick={handleQuickAdd}
              className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm active:scale-95"
              title="Add to Cart"
            >
              <FiShoppingCart size={18} />
            </button>
          )}
        </div>

        {/* Stock Status Tooltip-like badge */}
        <div className="mt-4">
          {product.stock > 0 ? (
            <div className="inline-flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-black text-green-600 uppercase tracking-tight">In Stock</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-black text-red-600 uppercase tracking-tight">Sold Out</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
