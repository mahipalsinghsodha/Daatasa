import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiTag, FiGift, FiCopy, FiCheckCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

const Deals = () => {
  const [coupons, setCoupons] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)

  useEffect(() => {
    fetchDealsData()
  }, [])

  const fetchDealsData = async () => {
    setLoading(true)
    try {
      const [couponRes, prodRes] = await Promise.all([
        api.get('/api/coupons/active'),
        api.get('/api/products?deals=true')
      ])
      setCoupons(couponRes.data || [])
      setProducts(prodRes.data.products || [])
    } catch (err) {
      toast.error('Failed to load deals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Special Deals & Offers | DhaniFresh'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', 'Explore exclusive deals, discounts, and active coupons on our premium products.')
    }
  }, [])

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Coupon code copied!')
    setTimeout(() => setCopiedCode(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-20">
      
      {/* Hero Section */}
      <div className="relative bg-brand-primary text-white overflow-hidden rounded-b-[3rem] shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/95 to-transparent"></div>
        <div className="relative max-w-[1280px] mx-auto px-6 py-20 lg:py-24 text-center md:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-bold uppercase tracking-widest text-[var(--gold)] mb-6">
              <FiGift size={16} /> Exclusive Offers
            </span>
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight drop-shadow-sm mb-6">
              Special Deals &<br/> Discount Coupons
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed">
              Save big on our premium products with active coupons and discounted prices. Grab them before they're gone!
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 mt-12 space-y-16">
        
        {/* Coupons Section */}
        {coupons.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-primary/10">
              <div className="w-10 h-10 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] flex items-center justify-center">
                <FiTag size={20} />
              </div>
              <h2 className="text-2xl font-bold font-display text-brand-primary">Active Coupons</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map(coupon => (
                <div key={coupon._id} className="relative overflow-hidden bg-white rounded-[2rem] border-2 border-brand-primary/10 shadow-sm hover:border-[var(--gold)] transition-colors p-8 group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--gold)]/10 rounded-full blur-2xl group-hover:bg-[var(--gold)]/20 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-black font-display text-brand-primary">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </h3>
                      <p className="text-sm font-medium text-brand-text/60 mt-1">
                        On orders above ₹{coupon.minOrderValue}
                      </p>
                    </div>
                    {coupon.maxDiscount && (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-[var(--ivory)] text-brand-secondary px-3 py-1.5 rounded-full border border-brand-primary/5">
                        Up to ₹{coupon.maxDiscount}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-brand-text/70 mb-6 min-h-[40px]">{coupon.description || 'Use this code at checkout to avail the discount.'}</p>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between p-4 bg-[var(--ivory)] border border-brand-primary/10 rounded-2xl border-dashed">
                      <span className="font-mono font-bold text-lg text-brand-primary tracking-widest">{coupon.code}</span>
                      <button 
                        onClick={() => handleCopyCode(coupon.code)}
                        className="text-brand-secondary hover:text-brand-primary transition-colors p-2"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? <FiCheckCircle size={20} className="text-green-500" /> : <FiCopy size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Discounted Products Section */}
        <section>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-primary/10">
            <h2 className="text-2xl font-bold font-display text-brand-primary">Discounted Products</h2>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Sale</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-brand-primary/10 shadow-sm">
              <p className="text-brand-text/50 font-medium text-lg">No discounted products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

export default Deals
