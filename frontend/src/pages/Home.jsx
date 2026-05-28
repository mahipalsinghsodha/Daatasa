// pages/Home.jsx — Premium Edition
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import api from '../api/axios'
import { motion } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { FiArrowRight, FiShield, FiStar, FiTruck, FiDroplet, FiAward, FiCheck, FiPhone, FiZap } from 'react-icons/fi'

/* ── Skeleton ─────────────────────────────────────────────── */
const ProductSkeleton = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
    <div className="aspect-square skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-3 skeleton rounded-full w-4/5" />
      <div className="h-3 skeleton rounded-full w-2/3" />
      <div className="h-6 skeleton rounded-full w-1/3 mt-2" />
    </div>
  </div>
)

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.60, delay, ease: [0.22, 1, 0.36, 1] },
})

/* ── Data ─────────────────────────────────────────────────── */
const STATS = [
  { value: '5,000+', label: 'Happy Families', icon: '👨‍👩‍👧‍👦' },
  { value: '100%',   label: 'Pure & Natural',  icon: '🌿' },
  { value: '4.9 ★',  label: 'Average Rating',  icon: '⭐' },
  { value: '48hrs',  label: 'Delivery Time',   icon: '🚚' },
]

const FEATURES = [
  { icon: <FiAward   size={20} />, title: 'Farm Sourced',    sub: 'Direct from local farms',   color: 'rgba(245,166,35,0.12)', iconColor: '#F5A623' },
  { icon: <FiDroplet size={20} />, title: 'Bilona Process',  sub: 'Traditional hand-churned',  color: 'rgba(27,47,110,0.08)',  iconColor: '#2D4499' },
  { icon: <FiShield  size={20} />, title: 'FSSAI Certified', sub: 'Quality guaranteed',         color: 'rgba(56,161,105,0.10)', iconColor: '#38A169' },
  { icon: <FiTruck   size={20} />, title: 'Pan India',       sub: 'Fast & safe delivery',      color: 'rgba(49,130,206,0.10)', iconColor: '#3182CE' },
]

const WHY_US = [
  {
    icon: <FiAward size={20} />,
    title: 'Farm to Table',
    text: 'Sourced directly from trusted local farms with zero middlemen ensuring freshness and quality at every step.',
    color: 'rgba(245,166,35,0.15)', iconColor: 'var(--gold)',
  },
  {
    icon: <FiDroplet size={20} />,
    title: 'Traditional Bilona Method',
    text: 'Slow, hand-churned process that preserves all natural nutrients, vitamins and the rich golden aroma.',
    color: 'rgba(27,47,110,0.10)', iconColor: 'var(--navy)',
  },
  {
    icon: <FiShield size={20} />,
    title: 'Certified Purity',
    text: 'Rigorously tested and FSSAI certified for absolute safety and uncompromising quality you can trust.',
    color: 'rgba(56,161,105,0.12)', iconColor: 'var(--success)',
  },
]

const TESTIMONIALS = [
  { name: 'Anjali Sharma',    role: 'Home Maker & Mother',          rating: 5, initials: 'AS', color: '#1B2F6E', comment: 'This Bilona Cow Ghee smells exactly like the hand-churned ghee my grandmother used to make. The graininess and the rich aroma are absolutely perfect!' },
  { name: 'Dr. Ramesh Patel', role: 'Nutritionist & Wellness Coach', rating: 5, initials: 'RP', color: '#38A169', comment: 'Finding genuine, chemical-free A2 Bilona ghee is hard. I tested DhaniFresh myself and the purity is exceptional. Highly recommend to my clients.' },
  { name: 'Vikram Malhotra',  role: 'Fitness Enthusiast',           rating: 5, initials: 'VM', color: '#E09010', comment: 'I add DhaniFresh ghee to my bullet coffee every morning. It gives sustained energy and the taste is incredible. Quality unmatched!' },
]

/* ── Wave SVG dividers ──────────────────────────────────────── */
const WaveDown = ({ from = '#fff', to = '#EAF5FB' }) => (
  <div style={{ background: from, lineHeight: 0 }}>
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
      <path d="M0,0 C480,80 960,80 1440,0 L1440,80 L0,80 Z" fill={to} />
    </svg>
  </div>
)

const WaveUp = ({ from = '#EAF5FB', to = '#fff' }) => (
  <div style={{ background: from, lineHeight: 0 }}>
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
      <path d="M0,80 C480,0 960,0 1440,80 L1440,0 L0,0 Z" fill={to} />
    </svg>
  </div>
)

/* ── Component ─────────────────────────────────────────────── */
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/api/products?featured=true'),
          api.get('/api/categories'),
        ])
        const prods = Array.isArray(prodRes.data)
          ? prodRes.data
          : (prodRes.data.products ?? prodRes.data.data ?? [])
        setFeaturedProducts(prods.slice(0, 4))
        setCategories(catRes.data)
      } catch (e) { console.error('Error fetching home data:', e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>DhaniFresh — Pure Desi Bilona Ghee Online</title>
        <meta name="description" content="Shop 100% pure, natural Bilona Desi Ghee online at DhaniFresh. Traditional slow-churned A2 cow ghee, buffalo ghee and more. FSSAI certified." />
        <link rel="canonical" href="https://dhanifresh.in/" />
      </Helmet>

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)', minHeight: '94vh', display: 'flex', alignItems: 'center' }}>

        {/* Animated blob decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-[10%] w-80 h-80 rounded-full animate-blob opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.5) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full animate-blob-delay opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)', filter: 'blur(70px)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-blob-delay2 opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(45,68,153,0.8) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </div>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left text */}
            <div>
              <motion.div {...fadeUp(0)}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
                  style={{ background: 'rgba(245,166,35,0.18)', color: 'var(--gold)', border: '1px solid rgba(245,166,35,0.30)' }}>
                  <FiZap size={11} /> Premium Dairy Products
                </span>
              </motion.div>

              <motion.h1 {...fadeUp(0.08)}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] mb-6 text-white"
                style={{ letterSpacing: '-0.025em', fontFamily: 'var(--font-display)' }}>
                Pure & Natural<br />
                <span className="shimmer-text">Desi Bilona</span> Ghee
              </motion.h1>

              <motion.p {...fadeUp(0.16)} className="text-base leading-relaxed mb-8 max-w-lg"
                style={{ color: 'rgba(255,255,255,0.68)' }}>
                Crafted from pure farm-fresh milk using the ancient Bilona method. No additives, no shortcuts — just pure, rich, golden ghee delivered to your door across India.
              </motion.p>

              <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-3 mb-12">
                <Link to="/products"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[15px] transition-all hover:scale-105"
                  style={{ background: 'var(--gold)', color: 'var(--navy)', boxShadow: '0 6px 24px rgba(245,166,35,0.50)' }}>
                  Shop Now <FiArrowRight size={16} />
                </Link>
                <Link to="/about"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[15px] transition-all hover:bg-white/12"
                  style={{ border: '1.5px solid rgba(255,255,255,0.25)', color: 'white' }}>
                  Our Story
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div {...fadeUp(0.32)} className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {STATS.map((s, i) => (
                  <div key={i} className="text-center rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-xl font-extrabold mb-0.5" style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.50)' }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — visual card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.90, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <div className="rounded-3xl p-10 text-center relative overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.30)',
                  }}>
                  <div className="animate-float-slow inline-block">
                    <div className="text-9xl mb-4 drop-shadow-2xl">🫙</div>
                  </div>
                  <div className="text-5xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.04em', fontFamily: 'var(--font-display)' }}>100%</div>
                  <div className="text-lg font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--gold)' }}>Pure Desi Ghee</div>
                  <div className="mt-5 flex items-center justify-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(245,166,35,0.20)', color: 'var(--gold)', border: '1px solid rgba(245,166,35,0.35)' }}>FSSAI Certified</span>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.20)' }}>Lab Tested</span>
                  </div>
                  <div className="mt-4 flex justify-center gap-1">
                    {[1,2,3,4,5].map(i => <span key={i} className="text-xl" style={{ color: 'var(--gold)' }}>★</span>)}
                  </div>
                  {/* Inner glow */}
                  <div className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 50% 0%, rgba(245,166,35,0.12) 0%, transparent 60%)' }} />
                </div>

                {/* Floating card 1 */}
                <div className="absolute -left-12 top-1/3 rounded-2xl p-4 w-44 animate-float"
                  style={{ background: 'rgba(255,255,255,0.96)', boxShadow: '0 12px 40px rgba(27,47,110,0.25)', border: '1px solid rgba(255,255,255,0.80)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--success)' }}>
                      <FiCheck size={11} color="white" />
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--navy)' }}>Lab Tested</span>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>FSSAI certified, tested for purity at every batch.</p>
                  <div className="mt-2 flex gap-0.5">
                    {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
                  </div>
                </div>

                {/* Floating card 2 */}
                <div className="absolute -right-10 bottom-1/4 rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.96)', boxShadow: '0 12px 40px rgba(27,47,110,0.25)', border: '1px solid rgba(255,255,255,0.80)' }}>
                  <div className="text-2xl font-extrabold mb-0.5" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>5,000+</div>
                  <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>Happy Families</div>
                  <div className="mt-2.5 flex -space-x-2">
                    {['#1B2F6E','#F5A623','#38A169','#3182CE'].map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ background: c }} />
                    ))}
                  </div>
                </div>

                {/* Gold glow ring */}
                <div className="absolute -inset-4 rounded-[36px] pointer-events-none opacity-20"
                  style={{ background: 'radial-gradient(circle at 50% 50%, rgba(245,166,35,0.6) 0%, transparent 70%)', filter: 'blur(20px)' }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 72 }}>
            <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════ FEATURES STRIP ══════════ */}
      <section style={{ background: '#FFFFFF', paddingTop: 0 }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            {FEATURES.map((item, idx) => (
              <div key={idx}
                className="flex items-center gap-4 p-6 sm:p-8 cursor-default transition-all duration-250"
                style={{ borderRight: idx < FEATURES.length - 1 ? '1px solid var(--border-color)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-110"
                  style={{ background: item.color, color: item.iconColor }}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-bold mb-0.5" style={{ color: 'var(--navy)' }}>{item.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CATEGORIES ══════════ */}
      <WaveDown from="#fff" to="#EAF5FB" />
      <section style={{ background: '#EAF5FB', paddingBottom: '80px' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.p {...fadeUp(0)} className="section-tag">Our Range</motion.p>
            <motion.h2 {...fadeUp(0.08)} className="section-title mb-3">Explore Our Collection</motion.h2>
            <motion.p {...fadeUp(0.16)} className="section-sub max-w-md mx-auto">
              Premium ghee varieties, each crafted with care and traditional expertise.
            </motion.p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <motion.div key={cat.slug} {...fadeUp(idx * 0.07)}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group flex items-center gap-3 rounded-2xl transition-all duration-250 p-4 overflow-hidden"
                  style={{ background: '#fff', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = 'var(--shadow-gold)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ background: 'rgba(245,166,35,0.10)' }}>
                    {cat.image
                      ? <img src={cat.image} alt={cat.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      : <FiDroplet size={20} style={{ color: 'var(--gold)' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--navy)' }}>{cat.name}</p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{cat.description || 'Explore products'}</p>
                  </div>
                  <FiArrowRight size={14} className="shrink-0 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <WaveUp from="#EAF5FB" to="#fff" />

      {/* ══════════ FEATURED PRODUCTS ══════════ */}
      <section style={{ background: '#FFFFFF', padding: '60px 0 80px' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-tag flex items-center gap-1"><FiStar size={13} /> Featured Collection</p>
              <h2 className="section-title">Our Best Products</h2>
            </div>
            <Link to="/products"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ background: 'var(--brand-gradient)', color: 'white', boxShadow: 'var(--shadow-brand)' }}>
              View All <FiArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
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
            <Link to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ background: 'var(--brand-gradient)', color: 'white', boxShadow: 'var(--shadow-brand)' }}>
              View All Products <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ WHY US ══════════ */}
      <WaveDown from="#fff" to="#EAF5FB" />
      <section style={{ background: '#EAF5FB', padding: '60px 0 80px' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: illustration */}
            <motion.div {...fadeUp(0)} className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #2D4499 100%)' }}>
                {/* Inner decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
                  style={{ background: 'white', filter: 'blur(40px)' }} />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-20"
                  style={{ background: 'rgba(245,166,35,0.5)', filter: 'blur(30px)' }} />

                <div className="text-center text-white p-8 relative z-10">
                  <div className="text-7xl mb-4 animate-float-slow inline-block">🐄</div>
                  <div className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Farm Services</div>
                  <p className="text-sm opacity-70 mb-6">Eco-Friendly Practices on Our Ghee Farm</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ v: '65+', l: 'Years Experience' }, { v: '99%', l: 'Purity Guaranteed' }].map((s, i) => (
                      <div key={i} className="text-center p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <div className="text-2xl font-extrabold" style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{s.v}</div>
                        <div className="text-xs opacity-70 mt-1">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: content */}
            <div>
              <motion.p {...fadeUp(0)} className="section-tag">Farm Services</motion.p>
              <motion.h2 {...fadeUp(0.08)} className="section-title mb-4">
                Eco-Friendly Practices on Our Ghee Farm
              </motion.h2>
              <motion.p {...fadeUp(0.14)} className="section-sub mb-8">
                We follow traditional and sustainable methods to ensure our ghee is pure, natural, and ethically produced at every step.
              </motion.p>

              {WHY_US.map((item, idx) => (
                <motion.div key={idx} {...fadeUp(0.12 + idx * 0.08)} className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform hover:scale-110"
                    style={{ background: item.color, color: item.iconColor, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold mb-1.5" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.text}</p>
                  </div>
                </motion.div>
              ))}

              <motion.div {...fadeUp(0.38)}>
                <Link to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm mt-2 transition-all hover:scale-105"
                  style={{ background: 'var(--brand-gradient)', color: 'white', boxShadow: 'var(--shadow-brand)' }}>
                  <FiArrowRight size={14} /> Read More
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <WaveUp from="#EAF5FB" to="#fff" />

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section style={{ background: '#FFFFFF', padding: '60px 0 80px' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.p {...fadeUp(0)} className="section-tag">Testimonials</motion.p>
            <motion.h2 {...fadeUp(0.08)} className="section-title mb-3">Trusted by 5,000+ Families</motion.h2>
            <motion.p {...fadeUp(0.16)} className="section-sub max-w-md mx-auto">
              Here's what our happy families say about the pure aroma and quality of DhaniFresh ghee.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((item, idx) => (
              <motion.div key={idx} {...fadeUp(idx * 0.1)}
                className="rounded-3xl p-7 relative overflow-hidden transition-all duration-300"
                style={{ background: idx === 0 ? 'var(--brand-gradient)' : 'var(--bg-alt)', border: '1px solid var(--border-color)', boxShadow: idx === 0 ? 'var(--shadow-brand)' : 'var(--shadow-card)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = idx === 0 ? '0 20px 50px rgba(27,47,110,0.40)' : 'var(--shadow)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = idx === 0 ? 'var(--shadow-brand)' : 'var(--shadow-card)' }}
              >
                {/* Quote decoration */}
                <div className="absolute top-5 right-5 text-4xl font-black opacity-20" style={{ color: idx === 0 ? 'white' : 'var(--navy)' }}>"</div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <span key={i} style={{ color: idx === 0 ? 'var(--gold)' : 'var(--gold)' }}>★</span>
                  ))}
                </div>

                <p className="text-sm leading-relaxed mb-6 italic"
                  style={{ color: idx === 0 ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)' }}>
                  "{item.comment}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0"
                    style={{ background: idx === 0 ? 'rgba(255,255,255,0.20)' : item.color, color: idx === 0 ? 'white' : 'white' }}>
                    {item.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: idx === 0 ? 'white' : 'var(--navy)' }}>{item.name}</div>
                    <div className="text-[11px]" style={{ color: idx === 0 ? 'rgba(255,255,255,0.60)' : 'var(--text-muted)' }}>{item.role}</div>
                  </div>
                </div>

                {idx === 0 && (
                  <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-10"
                    style={{ background: 'rgba(245,166,35,0.8)', filter: 'blur(30px)' }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section style={{ background: '#EAF5FB', paddingBottom: '80px' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)}
            className="relative rounded-3xl overflow-hidden p-10 sm:p-16 flex flex-col sm:flex-row items-center justify-between gap-8"
            style={{ background: 'var(--gradient-hero)' }}>
            {/* Decorations */}
            <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none opacity-10"
              style={{ borderRadius: '50% 0 0 80%', background: 'rgba(255,255,255,0.30)' }} />
            <div className="absolute bottom-0 left-20 w-60 h-60 rounded-full pointer-events-none opacity-20"
              style={{ background: 'rgba(245,166,35,0.5)', filter: 'blur(40px)' }} />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 text-center sm:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                style={{ background: 'rgba(245,166,35,0.20)', color: 'var(--gold)', border: '1px solid rgba(245,166,35,0.35)' }}>
                ⚡ Limited Time Offer
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 text-white" style={{ letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
                Ready for a Healthier Life?
              </h2>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.68)' }}>
                Join 5,000+ happy families across India. Use code{' '}
                <span className="font-bold px-2 py-0.5 rounded-md" style={{ color: 'var(--navy)', background: 'var(--gold)' }}>FIRST10</span>
                {' '}for 10% off your first order.
              </p>
            </div>

            <Link to="/products"
              className="relative z-10 px-9 py-4 rounded-2xl font-extrabold text-sm shrink-0 transition-all hover:scale-105 flex items-center gap-2.5"
              style={{ background: 'var(--gold)', color: 'var(--navy)', boxShadow: '0 8px 30px rgba(245,166,35,0.55)' }}>
              <FiArrowRight size={16} /> Order Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
