import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { FiStar, FiShoppingCart, FiEdit2, FiMinus, FiPlus, FiChevronLeft } from 'react-icons/fi'
import { useCart } from '../context/CartContext'

// ── Brand tokens (same as Support component) ──────────────────────────────────
const C = {
  orange:      '#e8621a',
  orangeHov:   '#cf561a',
  orangeLight: '#fff4ee',
  orangeMid:   '#fddcca',
  bg:          '#f2f4f6',
  white:       '#ffffff',
  text:        '#1a1a2e',
  textMid:     '#555566',
  textLight:   '#8899aa',
  border:      '#e4e9f0',
  shadow:      '0 2px 12px rgba(0,0,0,0.07)',
  shadowMd:    '0 6px 24px rgba(0,0,0,0.11)',
  green:       '#16a34a', greenBg: '#dcfce7',
  red:         '#dc2626', redBg:   '#fee2e2',
  yellow:      '#b45309', yellowBg: '#fef3c7',
  grayBg:      '#f1f5f9',
  font:        "'Inter', system-ui, sans-serif",
}

const ProductDetail = () => {
  const { id }              = useParams()
  const navigate            = useNavigate()
  const { user }            = useAuth()
  const { fetchCartCount }  = useCart()

  const [product,     setProduct]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [quantity,    setQuantity]    = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => { fetchProduct() }, [id])

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`)
      setProduct(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    try {
      await axios.post('/api/cart/items', { productId: product._id, quantity })
      setAddedToCart(true)
      fetchCartCount()
      setTimeout(() => setAddedToCart(false), 3000)
    } catch {
      alert('Failed to add to cart')
    }
  }

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.font }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 36, height: 36, border: `3px solid ${C.border}`,
          borderTop: `3px solid ${C.orange}`, borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: C.textLight, fontSize: 14, margin: 0 }}>Loading product…</p>
      </div>
    </div>
  )

  /* ── Not found ── */
  if (!product) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.font }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🫙</div>
        <p style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>Product not found</p>
        <button onClick={() => navigate('/products')}
          style={{ padding: '10px 20px', background: C.orange, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: C.font }}>
          Back to Products
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font }}>

      {/* ── Sub-header ── */}
      <div style={{ background: C.white, borderBottom: `1.5px solid ${C.border}`, padding: '16px 32px', boxShadow: C.shadow }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/products')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.orange, fontWeight: 600, fontSize: 14, fontFamily: C.font, padding: 0 }}>
            <FiChevronLeft size={16} /> Products
          </button>
          <span style={{ color: C.border }}>/</span>
          <span style={{ fontSize: 14, color: C.textLight }}>{product.name}</span>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

          {/* Image */}
          <div>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: C.shadowMd, border: `1.5px solid ${C.border}` }}>
              <img src={product.image} alt={product.name}
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>

          {/* Info */}
          <div>
            {/* Category + Edit */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 8,
                background: C.orangeLight, color: C.orange, border: `1px solid ${C.orangeMid}`,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {product.category}
              </span>
              {user?.role === 'admin' && (
                <button onClick={() => navigate(`/products/edit/${product._id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', background: C.yellowBg, color: C.yellow,
                    border: `1.5px solid ${C.yellow}40`, borderRadius: 10,
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: C.font,
                  }}>
                  <FiEdit2 size={13} /> Edit Product
                </button>
              )}
            </div>

            {/* Name */}
            <h1 style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(i => (
                  <FiStar key={i} size={15} style={{ color: C.orange, fill: i <= Math.round(product.rating) ? C.orange : 'transparent' }} />
                ))}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{product.rating.toFixed(1)}</span>
              <span style={{ fontSize: 13, color: C.textLight }}>({product.numReviews} reviews)</span>
            </div>

            {/* Description */}
            <p style={{ margin: '0 0 24px', fontSize: 15, color: C.textMid, lineHeight: 1.65 }}>
              {product.description}
            </p>

            {/* Details card */}
            <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '4px 0', marginBottom: 24, boxShadow: C.shadow }}>
              {[
                { label: 'Weight', value: product.weight },
                {
                  label: 'Stock',
                  value: product.stock > 0
                    ? <span style={{ color: C.green, fontWeight: 700 }}>In Stock ({product.stock} units)</span>
                    : <span style={{ color: C.red, fontWeight: 700 }}>Out of Stock</span>
                },
                {
                  label: 'Price',
                  value: <span style={{ fontSize: 26, fontWeight: 800, color: C.orange }}>₹{product.price.toLocaleString('en-IN')}</span>
                },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <span style={{ fontSize: 14, color: C.textLight }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Quantity + Cart */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Qty stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.textMid }}>Quantity</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', background: C.white }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: 38, height: 38, border: 'none', background: 'none', cursor: 'pointer', color: C.textMid, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.grayBg}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <FiMinus size={14} />
                    </button>
                    <span style={{ width: 40, textAlign: 'center', fontSize: 15, fontWeight: 700, color: C.text }}>{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      style={{ width: 38, height: 38, border: 'none', background: 'none', cursor: 'pointer', color: C.textMid, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.grayBg}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>

                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    background: addedToCart ? C.green : C.orange,
                    color: '#fff', fontWeight: 700, fontSize: 15,
                    cursor: addedToCart ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: C.font, transition: 'background 0.2s, box-shadow 0.2s',
                    boxShadow: addedToCart
                      ? '0 4px 16px rgba(22,163,74,0.30)'
                      : '0 4px 16px rgba(232,98,26,0.30)',
                  }}
                  onMouseEnter={e => { if (!addedToCart) e.currentTarget.style.background = C.orangeHov }}
                  onMouseLeave={e => { if (!addedToCart) e.currentTarget.style.background = C.orange }}
                >
                  <FiShoppingCart size={18} />
                  {addedToCart
                    ? 'Added to Cart!'
                    : `Add to Cart — ₹${(product.price * quantity).toLocaleString('en-IN')}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
