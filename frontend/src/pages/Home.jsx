import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { motion } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { FiArrowRight, FiShield, FiStar, FiTruck } from 'react-icons/fi'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
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
    <div className="min-h-screen bg-[var(--color-bg)]">
      
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48 bg-[#0f172a]">
        {/* Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-orange-900/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(var(--color-primary) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Hero Left Content */}
            <div className="text-left">
              <motion.div 
                {...fadeUp(0)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-black text-orange-400">Pure Traditional Ghee</span>
              </motion.div>

              <motion.h1 
                {...fadeUp(0.1)}
                className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6 font-head"
              >
                Premium Quality<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Desi Ghee</span>
              </motion.h1>

              <motion.p 
                {...fadeUp(0.2)}
                className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg"
              >
                Experience the rich heritage of traditional Bilona method. Crafted from pure farm-fresh milk, delivering unmatched purity to your doorstep.
              </motion.p>

              <motion.div 
                {...fadeUp(0.3)}
                className="flex flex-wrap gap-4"
              >
                <Link 
                  to="/products"
                  className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-900/20 transition-all hover:-translate-y-1 flex items-center gap-2"
                >
                  Shop Collection <FiArrowRight size={18} />
                </Link>
                <Link 
                  to="/products?category=a2"
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700"
                >
                  Explore A2 Ghee
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                {...fadeUp(0.4)}
                className="flex flex-wrap gap-8 mt-12 pt-12 border-t border-slate-800"
              >
                 {[
                  { icon: <FiStar className="text-orange-500" />, label: '4.9/5 Rating' },
                  { icon: <FiShield className="text-green-500" />, label: 'Lab Tested' },
                  { icon: <FiTruck className="text-blue-500" />, label: 'Fast Shipping' }
                ].map((item, id) => (
                  <div key={id} className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="text-sm font-bold text-slate-500">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Right Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 p-4 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl">
                <div className="bg-gradient-to-tr from-orange-600 to-orange-400 rounded-[32px] overflow-hidden aspect-square flex items-center justify-center p-12">
                   <div className="text-9xl filter drop-shadow-2xl animate-float">🧈</div>
                </div>
                
                {/* Floating Stats */}
                <div className="absolute -left-10 top-1/4 p-5 bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><FiStar size={14}/></div>
                    <span className="text-xs font-black text-gray-900">Highly Rated</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold">Recommended by 5000+ happy customers across India.</p>
                </div>

                <div className="absolute -right-10 bottom-1/4 p-5 bg-white rounded-3xl shadow-2xl border border-gray-100">
                  <div className="text-2xl font-black text-gray-900 mb-1">100%</div>
                  <div className="text-[10px] uppercase tracking-wider font-black text-orange-500">Pure Natural</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Bar ─────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-10 relative z-20 -mt-10 mx-4 sm:mx-8 px-6 sm:px-12 rounded-[32px] shadow-xl shadow-gray-200/50 max-w-[1280px] lg:mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
            { tag: '🐄', title: 'Farm Sourced', sub: 'Pure fresh milk' },
            { tag: '🍶', title: 'Bilona Process', sub: 'Traditional method' },
            { tag: '🌿', title: 'A1 & A2 Milk', sub: 'Quality varieties' },
            { tag: '🚚', title: 'Pan India', sub: 'Safe delivery' }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-2">
              <span className="text-3xl mb-1">{item.tag}</span>
              <h4 className="text-sm font-black text-gray-900 leading-none">{item.title}</h4>
              <p className="text-[11px] font-bold text-gray-400">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories Section ───────────────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-4">
              <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">Curated Selection</span>
            </motion.div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 font-head">Discover Perfection</h2>
            <p className="text-gray-500 font-medium max-w-lg mx-auto">Explore our premium range of ghee varieties, each prepared with the utmost care and traditional expertise.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {categories.map((cat, idx) => (
              <motion.div 
                key={cat.slug}
                {...fadeUp(idx * 0.1)}
              >
                <Link 
                  to={`/products?category=${cat.slug}`}
                  className="group block relative overflow-hidden rounded-[32px] bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
                >
                  <div className="aspect-[16/10] sm:aspect-[16/11] overflow-hidden bg-gray-50">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🍯</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="p-8 sm:p-10 relative">
                    <div className="absolute top-0 left-10 -translate-y-1/2 px-4 py-2 bg-orange-600 text-white text-[10px] font-black rounded-xl tracking-widest uppercase shadow-lg">
                      {cat.slug} Ghee
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">{cat.name}</h3>
                    <p className="text-sm leading-relaxed text-gray-500 mb-6 line-clamp-2">{cat.description}</p>
                    <div className="flex items-center gap-2 text-sm font-black text-orange-600">
                      Explore Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-16 sm:mb-20">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 mb-4">
                <FiStar className="text-orange-600" size={14}/>
                <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">Best Sellers</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 font-head">Customer Favourites</h2>
            </div>
            <Link to="/products" className="px-6 py-3 bg-white border border-gray-200 text-sm font-black text-gray-900 rounded-2xl hover:bg-gray-50 transition shadow-sm">
              See All Products
            </Link>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
              {featuredProducts.map((product, idx) => (
                <motion.div key={product._id} {...fadeUp(idx * 0.1)}>
                  <ProductCard product={product} categories={categories} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials / Why Section ───────────────────────────────────── */}
      <section className="py-24 sm:py-32 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-50 rounded-full blur-[100px] -z-10" />
           
           <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 font-head">Why DhaniFresh?</h2>
            <p className="text-gray-500 font-medium">Uncompromising standards at every step of the journey.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              { icon: '🐄', title: 'Fresh Sourced', text: 'We source only from trusted local farms with high standards.' },
              { icon: '🍶', title: 'Traditional Bilona', text: 'Slow processed hand-churned method to preserve nutrients.' },
              { icon: '🔬', title: 'Modern Quality', text: 'Rigorous testing for purity and food safety standards.' }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                {...fadeUp(idx * 0.1)}
                className="p-10 rounded-[32px] bg-white border border-orange-50 shadow-xl shadow-orange-900/5 text-center"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400 font-medium">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ─────────────────────────────────────────── */}
      <section className="pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <motion.div 
          {...fadeUp(0)}
          className="relative rounded-[40px] bg-orange-600 p-12 sm:p-20 overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-12"
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-700/50 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full -translate-x-1/3 translate-y-1/3" />
          
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-none font-head">Ready for a<br/> healthier lifestyle?</h2>
            <p className="text-orange-100 font-bold text-lg opacity-80">Join 5000+ happy families today.</p>
          </div>

          <Link 
            to="/products"
            className="relative z-10 px-10 py-5 bg-white text-orange-600 font-black rounded-2xl shadow-2xl hover:scale-105 transition-transform"
          >
            Order Now
          </Link>
        </motion.div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>

    </div>
  )
}

export default Home
