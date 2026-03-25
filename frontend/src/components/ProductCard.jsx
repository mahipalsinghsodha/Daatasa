import { Link } from 'react-router-dom'
import { FiStar, FiShoppingCart } from 'react-icons/fi'

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
  shadowHov:   '0 8px 28px rgba(232,98,26,0.18)',
  green:       '#16a34a', greenBg:  '#dcfce7',
  red:         '#dc2626', redBg:    '#fee2e2',
  grayBg:      '#f1f5f9',
  font:        "'Inter', system-ui, sans-serif",
}

const CATEGORY_ICON = {
  a1: '🫙',
  a2: '🐄',
}

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/products/${product._id}`}
      style={{ textDecoration: 'none', display: 'block', fontFamily: C.font }}
    >
      <div
        style={{
          background: C.white,
          border: `1.5px solid ${C.border}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: C.shadow,
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = C.shadowHov
          e.currentTarget.style.borderColor = C.orangeMid
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = C.shadow
          e.currentTarget.style.borderColor = C.border
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '4/3', background: C.orangeLight, overflow: 'hidden' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          {/* Gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.08), transparent)' }} />

          {/* Badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.92)', color: C.text,
              border: `1px solid ${C.border}`, backdropFilter: 'blur(6px)',
              letterSpacing: '0.04em',
            }}>
              {CATEGORY_ICON[product.category] || '🫙'} {product.category.toUpperCase()}
            </span>
            {product.featured && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
                background: C.orange, color: '#fff',
              }}>
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px 18px' }}>
          {/* Name */}
          <h3 style={{
            margin: '0 0 6px', fontSize: 16, fontWeight: 800,
            color: C.text, lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.name}
          </h3>

          {/* Description */}
          <p style={{
            margin: '0 0 12px', fontSize: 13, color: C.textLight,
            lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.description}
          </p>

          {/* Rating + Weight */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiStar size={13} style={{ color: C.orange, fill: C.orange }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{product.rating.toFixed(1)}</span>
              <span style={{ fontSize: 12, color: C.textLight }}>({product.numReviews})</span>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
              background: C.grayBg, color: C.textMid,
            }}>
              {product.weight}
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: C.border, marginBottom: 12 }} />

          {/* Price + Stock */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.orange, fontFamily: C.font }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {product.stock > 0 ? (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: C.greenBg, color: C.green }}>
                  In Stock
                </span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: C.redBg, color: C.red }}>
                  Out of Stock
                </span>
              )}
              <div style={{
                width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: C.orangeLight, border: `1.5px solid ${C.orangeMid}`, color: C.orange,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = C.orange; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = C.orangeLight; e.currentTarget.style.color = C.orange }}
              >
                <FiShoppingCart size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
