import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { motion } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { FiArrowRight, FiShield, FiStar, FiTruck, FiDroplet, FiAward, FiCheck } from 'react-icons/fi'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/api/products?featured=true'),
          api.get('/api/categories')
        ])
        setFeaturedProducts(prodRes.data.slice(0, 4))
        setCategories(catRes.data)
      } catch (e) {
        console.error('Error fetching home data:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fa' }}>

      {/* ── Hero ── */}
      <section className="bg-[#111827] relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left */}
            <div>
              <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/25 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span className="text-xs font-semibold text-orange-300 tracking-wide">Traditional Bilona Method</span>
              </motion.div>

              <motion.h1 {...fadeUp(0.08)} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.03em' }}>
                Premium Quality<br />
                <span className="text-orange-400">Desi Ghee</span>
              </motion.h1>

              <motion.p {...fadeUp(0.16)} className="text-base text-slate-400 leading-relaxed mb-8 max-w-lg">
                Crafted from pure farm-fresh milk using the ancient Bilona method. No additives, no shortcuts — just pure, rich ghee delivered to your door.
              </motion.p>

              <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-3 mb-10">
                <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md shadow-orange-500/25 transition-all hover:-translate-y-0.5">
                  Shop Now <FiArrowRight size={16} />
                </Link>
                <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/15 transition-all">
                  Our Story
                </Link>
              </motion.div>

              <motion.div {...fadeUp(0.32)} className="flex items-center gap-6 pt-8 border-t border-white/8">
                {[
                  { icon: <FiStar size={14} className="text-orange-400" />, label: '4.9 / 5 Rating' },
                  { icon: <FiShield size={14} className="text-green-400" />, label: 'Lab Certified' },
                  { icon: <FiTruck size={14} className="text-blue-400" />, label: 'Pan India Delivery' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-xs font-medium text-slate-400">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="aspect-square bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="text-center relative z-10">
                      <div className="text-6xl font-black text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>100%</div>
                      <div className="text-lg font-semibold text-white/80 tracking-widest uppercase">Pure Ghee</div>
                    </div>
                  </div>
                </div>

                {/* Floating card 1 */}
                <div className="absolute -left-8 top-1/3 bg-white rounded-xl p-4 shadow-xl border border-gray-100 w-44">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiCheck size={12} className="text-green-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-900">Lab Tested</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">FSSAI certified, tested for purity at every batch.</p>
                </div>

                {/* Floating card 2 */}
                <div className="absolute -right-8 bottom-1/4 bg-white rounded-xl p-4 shadow-xl border border-gray-100">
                  <div className="text-2xl font-black text-gray-900 mb-0.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>5000+</div>
                  <div className="text-[11px] font-semibold text-orange-500 uppercase tracking-wide">Happy Families</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Strip ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {[
              { icon: <FiAward size={20} />, title: 'Farm Sourced', sub: 'Direct from local farms' },
              { icon: <FiDroplet size={20} />, title: 'Bilona Process', sub: 'Traditional hand-churned' },
              { icon: <FiShield size={20} />, title: 'FSSAI Certified', sub: 'Quality guaranteed' },
              { icon: <FiTruck size={20} />, title: 'Pan India', sub: 'Fast & safe delivery' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-6 sm:p-8">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-0.5">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-xs font-semibold text-orange-700 mb-4">
              Our Range
            </motion.div>
            <motion.h2 {...fadeUp(0.08)} className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>
              Explore Our Collection
            </motion.h2>
            <motion.p {...fadeUp(0.16)} className="text-base text-gray-500 max-w-lg mx-auto">
              Premium ghee varieties, each crafted with care and traditional expertise.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {categories.map((cat, idx) => (
              <motion.div key={cat.slug} {...fadeUp(idx * 0.1)}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-gray-50">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FiDroplet size={40} />
                      </div>
                    )}
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-orange-100 text-orange-700 text-[11px] font-semibold rounded-full uppercase tracking-wide mb-2">
                          {cat.slug} Ghee
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">{cat.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{cat.description}</p>
                      </div>
                      <div className="ml-4 shrink-0 w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-all">
                        <FiArrowRight size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 sm:py-28 bg-white border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-xs font-semibold text-orange-700 mb-3">
                <FiStar size={11} /> Best Sellers
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>
                Customer Favourites
              </h2>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-all">
              View All <FiArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product, idx) => (
                <motion.div key={product._id} {...fadeUp(idx * 0.08)}>
                  <ProductCard product={product} categories={categories} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm">
              View All Products <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>
              Why Choose DhaniFresh?
            </h2>
            <p className="text-base text-gray-500">Uncompromising quality at every step.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <FiAward size={22} />, title: 'Farm to Table', text: 'Sourced directly from trusted local farms with zero middlemen.' },
              { icon: <FiDroplet size={22} />, title: 'Traditional Bilona', text: 'Slow, hand-churned process that preserves all natural nutrients.' },
              { icon: <FiShield size={22} />, title: 'Certified Purity', text: 'Rigorously tested and FSSAI certified for safety and quality.' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeUp(idx * 0.1)}
                className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <motion.div
          {...fadeUp(0)}
          className="relative bg-orange-500 rounded-2xl overflow-hidden p-10 sm:p-16 flex flex-col sm:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/40 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>
              Ready for a healthier life?
            </h2>
            <p className="text-orange-100 text-base">Join 5,000+ happy families across India.</p>
          </div>
          <Link
            to="/products"
            className="relative z-10 px-8 py-3.5 bg-white text-orange-600 font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all text-sm shrink-0"
          >
            Order Now
          </Link>
        </motion.div>
      </section>

    </div>
  )
}

export default Home
