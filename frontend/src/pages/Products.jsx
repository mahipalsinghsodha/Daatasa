import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { FiSearch } from 'react-icons/fi'

// ── Brand tokens (same as Support component) ──────────────────────────────────
const C = {
  orange:      '#e8621a',
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
  grayBg:      '#f1f5f9',
  font:        "'Inter', system-ui, sans-serif",
}

const CATEGORIES = [
  { value: 'all', label: 'All Products' },
  { value: 'a1',  label: 'A1 Ghee' },
  { value: 'a2',  label: 'A2 Ghee' },
]

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [searchTerm, setSearchTerm]         = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => { fetchProducts() }, [selectedCategory, debouncedSearch])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (debouncedSearch.trim())      params.search   = debouncedSearch
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
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font }}>

      {/* ── Page Header ── */}
      <div style={{
        background: C.white, borderBottom: `1.5px solid ${C.border}`,
        padding: '28px 32px 0', boxShadow: C.shadow,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ paddingBottom: 20 }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Pure · Natural · Traditional
            </p>
            <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: C.text }}>
              Our Ghee Products
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: C.textLight }}>
              Handcrafted using traditional bilona methods
            </p>
          </div>

          {/* Category tabs (underline style — same as Support) */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat.value
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 16px', fontFamily: C.font,
                    borderBottom: active ? `3px solid ${C.orange}` : '3px solid transparent',
                    color: active ? C.orange : C.textLight,
                    fontWeight: active ? 700 : 500,
                    fontSize: 14, whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        {/* Search + count row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          {!loading && (
            <p style={{ margin: 0, fontSize: 13, color: C.textLight }}>
              <span style={{ fontWeight: 700, color: C.text }}>{products.length}</span> product{products.length !== 1 ? 's' : ''} found
            </p>
          )}
          <div style={{ position: 'relative' }}>
            <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.orange }} />
            <input
              type="text"
              placeholder="Search products…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                border: `1.5px solid ${C.border}`, borderRadius: 10,
                background: C.white, fontFamily: C.font, fontSize: 14,
                color: C.text, outline: 'none', width: 240,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = C.orange}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <div style={{
              width: 36, height: 36, border: `3px solid ${C.border}`,
              borderTop: `3px solid ${C.orange}`, borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ margin: 0, fontSize: 14, color: C.textLight }}>Loading products…</p>
          </div>
        ) : products.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{
            background: C.white, border: `1.5px solid ${C.border}`,
            borderRadius: 16, padding: '60px 24px', textAlign: 'center',
            boxShadow: C.shadow,
          }}>
            <div style={{
              width: 64, height: 64, background: C.orangeLight, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28,
            }}>🫙</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: C.text }}>No products found</h3>
            <p style={{ margin: 0, color: C.textLight, fontSize: 14 }}>Try a different category or search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
