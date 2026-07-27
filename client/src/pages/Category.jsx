import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

const Category = () => {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchCategoryData()
  }, [slug])

  useEffect(() => {
    if (category) {
      document.title = `${category.name} | DhaniFresh`
      const meta = document.querySelector('meta[name="description"]')
      if (meta) {
        meta.setAttribute('content', category.description || `Browse our premium selection of ${category.name}.`)
      }
    }
  }, [category])

  const fetchCategoryData = async () => {
    setLoading(true)
    setError(false)
    try {
      // Fetch category details
      const catRes = await api.get(`/api/categories/${slug}`)
      setCategory(catRes.data)

      // Fetch products for this category
      const prodRes = await api.get(`/api/products?category=${slug}`)
      setProducts(prodRes.data.products || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen py-20 text-center bg-[var(--bg-base)]">
        <h1 className="text-3xl font-bold text-brand-primary mb-4">Category not found</h1>
        <Link to="/products" className="text-brand-secondary hover:underline font-bold">
          Browse all products
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-20">
      {/* Hero Section */}
      <div className="relative bg-brand-primary text-white overflow-hidden rounded-b-[3rem] shadow-sm">
        {category.image && (
          <div className="absolute inset-0 opacity-20">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-transparent opacity-90"></div>
        <div className="relative max-w-[1280px] mx-auto px-6 py-20 lg:py-24 text-center md:text-left flex flex-col md:flex-row items-center justify-center md:justify-start gap-10">
          {category.image && (
             <img src={category.image} alt={category.name} className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full shadow-2xl border-4 border-white/10" />
          )}
          <div>
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-[var(--gold)] drop-shadow-sm mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg md:text-xl text-white/80 max-w-2xl font-medium leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1280px] mx-auto px-6 mt-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-primary/10">
          <h2 className="text-2xl font-bold font-display text-brand-primary">
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-brand-primary/10 shadow-sm">
            <p className="text-brand-text/50 font-medium text-lg">No products found in this category yet.</p>
            <Link to="/products" className="inline-flex mt-6 btn btn-primary px-8 h-12 rounded-full items-center justify-center font-bold transition-transform hover:scale-105 active:scale-95">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Category
