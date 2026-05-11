import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight,
  Star, Truck, Shield, RefreshCw, MapPin, Package,
  CheckCircle, AlertCircle, Tag, User, Send, BadgeCheck, Heart
} from 'lucide-react'

// ── Star selector component ────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="transition-transform hover:scale-110"
      >
        <Star
          size={24}
          className={n <= value ? 'text-orange-400 fill-orange-400' : 'text-gray-200'}
        />
      </button>
    ))}
  </div>
)

// ── Read-only stars ────────────────────────────────────────────────────────
const Stars = ({ rating, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(n => (
      <Star
        key={n}
        size={size}
        className={n <= Math.round(rating) ? 'text-orange-400 fill-orange-400' : 'text-gray-200'}
      />
    ))}
  </div>
)

// ── Main Page ──────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, toggleWishlist } = useAuth()
  const { fetchCartCount } = useCart()

  const [product,    setProduct]    = useState(null)
  const [related,    setRelated]    = useState([])
  const [addresses,  setAddresses]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [quantity,   setQuantity]   = useState(1)
  const [adding,     setAdding]     = useState(false)
  const [activeTab,  setActiveTab]  = useState('description') // description | reviews
  const [reviewRating,  setReviewRating]  = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setQuantity(1)
    setActiveTab('description')
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [prodRes] = await Promise.all([
        api.get(`/api/products/${id}`),
      ])
      const prod = prodRes.data
      setProduct(prod)
      document.title = `${prod.name} – DhaniFresh`

      // Check if current user already reviewed
      if (user && prod.reviews?.length) {
        setHasReviewed(prod.reviews.some(r => r.user === user._id || r.user?._id === user._id))
      }

      // Fetch related products (same category)
      try {
        const relRes = await api.get(`/api/products?category=${prod.category}`)
        setRelated((relRes.data || []).filter(p => p._id !== prod._id).slice(0, 4))
      } catch {}

      // Fetch saved addresses for delivery info
      if (user) {
        try {
          const meRes = await api.get('/api/auth/me')
          setAddresses(meRes.data.addresses || [])
        } catch {}
      }
    } catch {
      toast.error('Could not load product')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async ({ redirectTo } = {}) => {
    if (!user) {
      sessionStorage.setItem('pendingCartItem', JSON.stringify({ productId: product._id, quantity }))
      navigate('/login', { state: { from: redirectTo || location.pathname } })
      return
    }
    setAdding(true)
    try {
      await api.post('/api/cart/items', { productId: product._id, quantity })
      fetchCartCount()
      if (redirectTo) {
        navigate(redirectTo)
      } else {
        toast.success('Added to cart!')
      }
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login', { state: { from: location.pathname } }); return }
    if (reviewRating === 0) { toast.error('Please select a rating'); return }
    if (!reviewComment.trim()) { toast.error('Please write a review'); return }
    setSubmittingReview(true)
    try {
      await api.post(`/api/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment })
      toast.success('Thank you for your review!')
      setReviewComment('')
      setReviewRating(0)
      setHasReviewed(true)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleWishlist = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    try {
      const added = await toggleWishlist(product._id)
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-400">Loading product...</p>
    </div>
  )

  // ── Not found ──
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center">
        <Package size={48} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-400 mb-6 text-sm">This product may have been removed from our store.</p>
        <Link to="/products" className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-orange-500 transition-colors">
          Back to Products
        </Link>
      </div>
    </div>
  )

  const defaultAddr = addresses.find(a => a.isDefault) || addresses[0]
  const isCustomer  = !user || (user.role !== 'admin' && user.role !== 'superadmin')
  const reviews     = product.reviews || []
  const avgRating   = product.rating || 0
  const numReviews  = product.numReviews || 0

  // Rating distribution
  const dist = [5,4,3,2,1].map(n => ({
    star: n,
    count: reviews.filter(r => Math.round(r.rating) === n).length
  }))

  return (
    <div className="min-h-screen bg-gray-50 pb-20">


      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Main product grid ── */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* ── Left: Product image ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden aspect-square flex items-center justify-center p-10 group">
              {product.featured && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                  Featured
                </span>
              )}
              {product.stock === 0 && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full border border-red-200">
                  Out of Stock
                </span>
              )}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: Truck,     title: 'Pan India', sub: 'Shipping' },
                { icon: Shield,    title: 'Lab Tested', sub: 'Pure Quality' },
                { icon: RefreshCw, title: 'Bilona',    sub: 'Traditional' },
              ].map((b, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                  <b.icon size={18} className="text-orange-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-gray-900">{b.title}</p>
                  <p className="text-[10px] text-gray-400">{b.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Product info + purchase ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-5"
          >
            {/* Category badge */}
            <div className="flex items-center gap-2">
              <Tag size={13} className="text-orange-500" />
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                {product.category} Ghee
              </span>
            </div>

            {/* Name and Wishlist */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {product.name}
              </h1>
              {isCustomer && (
                <button
                  onClick={handleWishlist}
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <Heart size={18} className={user?.wishlist?.includes(product._id) ? 'fill-current' : ''} />
                </button>
              )}
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Stars rating={avgRating} size={15} />
                <span className="text-sm font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-sm text-orange-500 hover:underline"
                >
                  ({numReviews} reviews)
                </button>
              </div>
              <span className="text-gray-200">|</span>
              {/* Show availability status — hide exact stock count from customers */}
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Currently Not Available'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-gray-400">/ {product.weight || 'unit'}</span>
            </div>

            <hr className="border-gray-100" />

            {/* Deliver to */}
            {user && (
              <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-700 mb-0.5">Deliver to</p>
                  {defaultAddr ? (
                    <p className="text-sm text-gray-700 truncate">
                      <span className="font-medium">{defaultAddr.name}</span>
                      {' — '}{defaultAddr.city}, {defaultAddr.state} – {defaultAddr.zipCode}
                    </p>
                  ) : (
                    <Link to="/profile" className="text-sm text-orange-500 hover:underline font-medium">
                      + Add a delivery address
                    </Link>
                  )}
                </div>
                {defaultAddr && (
                  <Link to="/profile" className="text-xs text-orange-500 hover:text-orange-600 font-semibold shrink-0">
                    Change
                  </Link>
                )}
              </div>
            )}

            {/* Purchase controls — only for logged-in regular customers */}
            {product.stock > 0 && isCustomer && (() => {
              // Dynamic max: capped at 10, but never exceeds actual stock
              const maxQty = Math.min(product.stock, 10)
              return (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Quantity</p>
                      <p className="text-xs text-gray-400">Max {maxQty} per order</p>
                    </div>
                    <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-900 hover:text-white transition-colors text-gray-700"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-10 text-center text-base font-bold text-gray-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-900 hover:text-white transition-colors text-gray-700"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Total for {quantity} {quantity === 1 ? 'item' : 'items'}</span>
                    <span className="font-bold text-gray-900">₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                  </div>

                  {/* Add to cart button */}
                  <button
                    onClick={() => handleAddToCart()}
                    disabled={adding}
                    className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-orange-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 text-sm shadow-lg shadow-gray-900/10 active:scale-[0.99]"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {adding
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <ShoppingCart size={17} />
                    }
                    {adding ? 'Adding to Cart...' : `Add to Cart — ₹${(product.price * quantity).toLocaleString('en-IN')}`}
                  </button>

                  {/* Buy Now */}
                  <button
                    onClick={() => handleAddToCart({ redirectTo: '/checkout' })}
                    disabled={adding}
                    className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    Buy Now
                  </button>

                  <p className="text-center text-xs text-gray-400 pt-1">
                    <CheckCircle size={11} className="inline mr-1 text-green-500" />
                    Secure checkout · Free shipping above ₹500 · 100% pure ghee
                  </p>
                </div>
              )
            })()}

            {/* Out of stock — Currently Not Available */}
            {product.stock === 0 && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
                <AlertCircle size={28} className="text-red-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-red-600 mb-1">Currently Not Available</p>
                <p className="text-xs text-red-400">This product is temporarily out of stock. Please check back later.</p>
              </div>
            )}

          </motion.div>
        </div>

        {/* ── Tabs: Description + Reviews ── */}
        <div className="mt-12">
          <div className="flex border-b border-gray-100 mb-6 gap-1">
            {[
              { key: 'description', label: 'Description' },
              { key: 'reviews',     label: `Reviews (${numReviews})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Description tab ── */}
            {activeTab === 'description' && (
              <motion.div
                key="desc"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 gap-6"
              >
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">About this product</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Product Details</h3>
                  {[
                    { label: 'Weight / Size', value: product.weight },
                    { label: 'Category',      value: product.category },
                    { label: 'Availability',  value: product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock' },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500">{d.label}</span>
                      <span className="text-sm font-medium text-gray-900">{d.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Reviews tab ── */}
            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Rating summary */}
                {numReviews > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row gap-6 items-center">
                    <div className="text-center shrink-0">
                      <p className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                      <Stars rating={avgRating} size={18} />
                      <p className="text-xs text-gray-400 mt-1">{numReviews} reviews</p>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      {dist.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-4 shrink-0">{star}</span>
                          <Star size={11} className="text-orange-400 fill-orange-400 shrink-0" />
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-orange-400 rounded-full transition-all"
                              style={{ width: numReviews ? `${(count / numReviews) * 100}%` : '0%' }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-4 shrink-0">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Write a review */}
                {user && !hasReviewed && isCustomer && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-sm flex items-center gap-2">
                      <Star size={15} className="text-orange-500" /> Write a Review
                    </h3>
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-700">
                      Only customers who have <strong>received this product</strong> can submit a review.
                      You can also rate from your{' '}
                      <Link to="/orders" className="font-semibold underline">Orders page</Link>.
                    </div>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <StarPicker value={reviewRating} onChange={setReviewRating} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                        <textarea
                          required
                          rows={4}
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this product..."
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-orange-500 transition-all disabled:opacity-50"
                      >
                        {submittingReview
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Send size={14} />
                        }
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                )}

                {hasReviewed && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
                    <CheckCircle size={15} /> You have already reviewed this product. Thank you!
                  </div>
                )}

                {!user && (
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-700">
                    <Link to="/login" className="font-semibold hover:underline">Sign in</Link> to leave a review.
                  </div>
                )}

                {/* Review list */}
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <Star size={36} className="text-gray-100 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...reviews].reverse().map((r, i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                              {r.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                                {r.verified && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-600">
                                    <BadgeCheck size={12} /> Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <Stars rating={r.rating} size={13} />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg font-bold text-gray-900 mb-5">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => (
                <Link
                  key={p._id}
                  to={`/products/${p._id}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-orange-100 transition-all group"
                >
                  <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-orange-600">₹{p.price.toLocaleString('en-IN')}</p>
                      <Stars rating={p.rating || 0} size={11} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProductDetail