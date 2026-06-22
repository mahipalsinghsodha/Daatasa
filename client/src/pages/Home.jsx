// pages/Home.jsx — Premium Edition
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import api from '../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ProductCard from '../components/ProductCard'
import { FiArrowRight, FiShield, FiStar, FiTruck, FiDroplet, FiAward, FiCheck, FiPhone, FiZap, FiPlay, FiPause, FiX, FiChevronLeft, FiChevronRight, FiClock, FiMaximize2, FiImage } from 'react-icons/fi'

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
  { name: 'Anjali Sharma',    role: 'Home Maker & Mother',          rating: 5, initials: 'AS', color: '#1B2F6E', comment: 'This Tharparkar Bilona Ghee smells exactly like the hand-churned ghee my grandmother used to make in Rajasthan. The graininess and the rich aroma are absolutely perfect!' },
  { name: 'Dr. Ramesh Patel', role: 'Nutritionist & Wellness Coach', rating: 5, initials: 'RP', color: '#38A169', comment: 'Finding genuine, chemical-free ghee from Tharparkar cows is hard. I tested DhaniFresh myself and the purity from their village process is exceptional.' },
  { name: 'Vikram Malhotra',  role: 'Fitness Enthusiast',           rating: 5, initials: 'VM', color: '#E09010', comment: 'I add DhaniFresh ghee to my bullet coffee every morning. The traditional village preparation gives sustained energy and the taste is incredible.' },
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

/* ── Data for Ghee Making & Gallery ───────────────────────── */
const GHEE_STEPS = [
  {
    title: 'Milk Boiling & Cooling',
    timeLabel: '0:00 - 0:10',
    startTime: 0,
    endTime: 10,
    desc: 'Boiling & Cooling Process',
    longDesc: 'Fresh milk from our Tharparkar cows is boiled in mitti ki handi (traditional earthen pots) over slow-burning kanda (cow dung cakes) and babool firewood, capturing the true rustic aroma of Rajasthan.',
    image: '/ghee-step-1.png',
  },
  {
    title: 'Curd Culturing & Churning',
    timeLabel: '0:10 - 0:20',
    startTime: 10,
    endTime: 20,
    desc: 'Traditional Bilona Churning',
    longDesc: 'The curd is hand-churned before dawn using a wooden Bilona, rotated clockwise and anti-clockwise to separate the nutrient-rich makkhan (butter) from the buttermilk.',
    image: '/ghee-step-2.png',
  },
  {
    title: 'Butter Clarifying',
    timeLabel: '0:20 - 0:30',
    startTime: 20,
    endTime: 30,
    desc: 'Boiling Makhan in Kadhai',
    longDesc: 'The fresh hand-churned Makhan is placed in a heavy brass/copper Kadhai and slowly heated over a wood fire. The water evaporates, leaving aromatic golden ghee.',
    image: '/ghee-step-3.png',
  },
  {
    title: 'Pure Ghee Packaging',
    timeLabel: '0:30 - 0:40',
    startTime: 30,
    endTime: 40,
    desc: 'Aromatic Jar Seal & Delivery',
    longDesc: 'Our premium Bilona ghee is filtered and poured into sterile glass jars while warm. We seal in the granular texture and ship it directly to you.',
    image: '/ghee-step-4.png',
  },
]

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Happy Tharparkar Cows',
    category: 'Farm',
    desc: 'Our pure Tharparkar cows lovingly feeding their calves.',
    image: '/gallery-cows.png'
  },
  {
    id: 2,
    title: 'Traditional Wooden Bilona',
    category: 'Process',
    desc: 'Wood churner used to extract fresh butter.',
    image: '/gallery-churn.png'
  },
  {
    id: 3,
    title: 'Simmering Butter',
    category: 'Process',
    desc: 'Boiling Makhan slowly to clarify into liquid gold.',
    image: '/ghee-step-3.png'
  },
  {
    id: 4,
    title: 'Fresh Milk Storage',
    category: 'Farm',
    desc: 'Boiling fresh organic milk in traditional pots.',
    image: '/ghee-step-1.png'
  },
  {
    id: 5,
    title: 'Laboratory Purity Testing',
    category: 'Purity',
    desc: 'Tested for quality and FSSAI standards.',
    image: '/gallery-testing.png'
  },
  {
    id: 6,
    title: 'DhaniFresh Ghee Jars',
    category: 'Products',
    desc: 'Finished premium granular ghee ready for kitchens.',
    image: '/gallery-jar.png'
  }
]

/* ── Component ─────────────────────────────────────────────── */
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  // Stepper & Video & Gallery States
  const [activeStep, setActiveStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [galleryFilter, setGalleryFilter] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const videoRef = useRef(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [videoModalSource, setVideoModalSource] = useState('local')

  // Newsletter State
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email')
    
    try {
      setSubscribing(true)
      const res = await api.post('/api/subscribers/subscribe', { email })
      toast.success(res.data.message || 'Successfully subscribed!')
      setEmail('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe')
    } finally {
      setSubscribing(false)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      const matchingStepIndex = GHEE_STEPS.findIndex(
        step => time >= step.startTime && time < step.endTime
      )
      if (matchingStepIndex !== -1 && matchingStepIndex !== activeStep) {
        setActiveStep(matchingStepIndex)
      }
      if (time >= 40) {
        videoRef.current.currentTime = 0
        setCurrentTime(0)
        setActiveStep(0)
      }
    }
  }

  const handleStepClick = (index) => {
    setActiveStep(index)
    if (videoRef.current) {
      videoRef.current.currentTime = GHEE_STEPS[index].startTime
      setCurrentTime(GHEE_STEPS[index].startTime)
      if (!isPlaying) {
        videoRef.current.play().catch(err => console.log('Video play error:', err))
        setIsPlaying(true)
      }
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play().catch(err => console.log('Video play error:', err))
        setIsPlaying(true)
      }
    }
  }

  const filteredGallery = GALLERY_ITEMS.filter(
    item => galleryFilter === 'All' || item.category === galleryFilter
  )

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
        <meta name="description" content="Shop 100% pure, natural Bilona Desi Ghee online at DhaniFresh. Traditional slow-churned Tharparkar cow ghee straight from our Rajasthan village. FSSAI certified." />
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
                className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] mb-6 text-white"
                style={{ letterSpacing: '-0.025em', fontFamily: 'var(--font-display)' }}>
                Pure & Natural<br />
                <span className="shimmer-text">Desi Bilona</span> Ghee
              </motion.h1>

              <motion.p {...fadeUp(0.16)} className="text-base leading-relaxed mb-8 max-w-lg"
                style={{ color: 'rgba(255,255,255,0.68)' }}>
                Crafted in Khuri, Jaisalmer from pure Tharparkar cow milk using the ancient Vedic Bilona method. Sun-baked earthen pots, wooden churners, and firewood slow-cooking give our ghee its signature golden granularity and unmatched aroma.
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
                    <div className="text-7xl sm:text-9xl mb-4 drop-shadow-2xl">🫙</div>
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.04em', fontFamily: 'var(--font-display)' }}>100%</div>
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

      {/* ══════════ FULL-WIDTH COW VIDEO ══════════ */}
      <section className="relative w-full overflow-hidden bg-[#1B2F6E] mt-16 sm:mt-24" style={{ height: '60vh' }}>
        {/* Background YouTube Video - desktop only for performance */}
        <div className="absolute inset-0 overflow-hidden hidden sm:block">
          <iframe
            style={{ position: 'absolute', top: '50%', left: '50%', width: '120%', height: '120%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', border: 'none' }}
            src="https://www.youtube.com/embed/nRbkTi7ge_Q?autoplay=1&mute=1&controls=0&loop=1&playlist=nRbkTi7ge_Q&modestbranding=1&rel=0&playsinline=1"
            title="Pure Tharparkar Cows"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {/* Mobile fallback image */}
        <div className="absolute inset-0 sm:hidden">
          <img src="/gallery-cows.png" alt="Tharparkar Cows" className="w-full h-full object-cover opacity-60" />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B2F6E]/90 via-[#1B2F6E]/30 to-black/20" />
        {/* Content */}
        <div className="absolute inset-0 flex items-end justify-center pb-12 sm:pb-20">
          <div className="text-center px-4 max-w-4xl">
            <h2 className="text-3xl sm:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl" style={{ fontFamily: 'var(--font-display)' }}>
              100% Pure Tharparkar Cows
            </h2>
            <p className="text-base sm:text-xl text-white/90 drop-shadow-xl mx-auto max-w-2xl font-medium leading-relaxed">
              Experience the beautiful, organic lifestyle of our cows. They roam freely in the pure arid environment of Khuri, Jaisalmer, drinking pristine water and grazing naturally.
            </p>
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


      {/* ══════════ GHEE MAKING PROCESS (BILONA PROCESS & VIDEO SYNC) ══════════ */}
      <section style={{ background: '#EAF5FB', padding: '0 0 80px', overflowX: 'hidden' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.p {...fadeUp(0)} className="section-tag flex items-center gap-1.5 justify-center">
              <FiDroplet size={13} /> Traditional Method
            </motion.p>
            <motion.h2 {...fadeUp(0.08)} className="section-title mb-3">
              How Our Ghee Is Made: The Vedic Bilona Process
            </motion.h2>
            <motion.p {...fadeUp(0.16)} className="section-sub max-w-2xl mx-auto">
              Follow our step-by-step handcrafting journey, perfectly synced with our process video. Click any step to jump to that part!
            </motion.p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left: Video Player Pane (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl p-4 sm:p-6"
                 style={{ 
                   background: '#ffffff', 
                   border: '1px solid var(--border-color)', 
                   boxShadow: 'var(--shadow-card)',
                 }}>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black group"
                   style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)' }}>
                {/* HTML5 Video Tag */}
                <video
                  ref={videoRef}
                  src="https://assets.mixkit.co/videos/preview/mixkit-organic-milk-poured-into-a-glass-jar-42301-large.mp4"
                  className="w-full h-full object-cover"
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  playsInline
                  muted
                  loop
                />

                {/* Overlays */}
                {/* Active Step Banner on Video */}
                <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
                     style={{ background: 'rgba(27, 47, 110, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Currently Showing: {GHEE_STEPS[activeStep]?.desc}
                </div>

                {/* Expand Video Button */}
                <button
                  onClick={() => {
                    setIsVideoModalOpen(true);
                    if (videoRef.current) {
                      videoRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  className="absolute top-4 right-4 z-10 p-2.5 rounded-xl text-white hover:text-amber-400 hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(27, 47, 110, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  title="Expand Video Dialog"
                >
                  <FiMaximize2 size={13} />
                </button>

                {/* Custom Playback Overlay */}
                <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                  <button 
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{ 
                      background: 'var(--gold)', 
                      color: 'var(--navy)', 
                      boxShadow: '0 8px 30px rgba(245, 166, 35, 0.6)' 
                    }}>
                    {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} className="ml-1" />}
                  </button>
                </div>

                {/* Progress bar overlay at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4 z-10">
                  <button onClick={togglePlay} className="text-white hover:text-amber-400 transition-colors">
                    {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                  </button>
                  
                  {/* Progress Line */}
                  <div className="flex-1 h-1.5 rounded-full bg-white/20 relative cursor-pointer overflow-hidden"
                       onClick={(e) => {
                         const rect = e.currentTarget.getBoundingClientRect();
                         const clickX = e.clientX - rect.left;
                         const width = rect.width;
                         const clickPercent = clickX / width;
                         if (videoRef.current) {
                           videoRef.current.currentTime = clickPercent * 40;
                         }
                       }}>
                    <div className="h-full bg-amber-400 transition-all duration-100"
                         style={{ width: `${(currentTime / 40) * 100}%` }} />
                  </div>

                  {/* Timer display */}
                  <div className="text-[11px] font-mono text-white/80 flex items-center gap-1.5 shrink-0">
                    <FiClock size={12} />
                    <span>0:{Math.floor(currentTime).toString().padStart(2, '0')}</span>
                    <span className="text-white/40">/</span>
                    <span>0:40</span>
                  </div>
                </div>
              </div>

              {/* Step visual image preview underneath the video */}
              <div className="mt-4 p-4 rounded-xl flex items-center gap-4"
                   style={{ background: 'rgba(27, 47, 110, 0.04)', border: '1px solid rgba(27, 47, 110, 0.08)' }}>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0"
                     style={{ border: '1px solid var(--border-color)' }}>
                  <img 
                    src={GHEE_STEPS[activeStep]?.image} 
                    alt={GHEE_STEPS[activeStep]?.title}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
                    Step {activeStep + 1} Illustration
                  </h4>
                  <p className="text-xs font-bold" style={{ color: 'var(--navy)' }}>
                    {GHEE_STEPS[activeStep]?.title}
                  </p>
                  <p className="text-[11px] leading-relaxed mt-1" style={{ color: 'var(--text-muted)' }}>
                    {GHEE_STEPS[activeStep]?.desc} process: watch flow at time marker {GHEE_STEPS[activeStep]?.timeLabel}.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Stepper Steps list (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3 w-full min-w-0">
              {GHEE_STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div 
                    key={idx}
                    onClick={() => handleStepClick(idx)}
                    className="group cursor-pointer rounded-2xl p-5 transition-all duration-300 relative overflow-hidden"
                    style={{ 
                      background: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.4)', 
                      border: isActive ? '1px solid var(--gold)' : '1px solid var(--border-color)',
                      boxShadow: isActive ? 'var(--shadow-gold)' : 'none',
                    }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                           style={{ background: 'radial-gradient(circle at 100% 0%, var(--gold) 0%, transparent 60%)' }} />
                    )}

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300"
                             style={{ 
                               background: isActive ? 'var(--brand-gradient)' : 'rgba(27, 47, 110, 0.08)',
                               color: isActive ? '#ffffff' : 'var(--navy)',
                               boxShadow: isActive ? 'var(--shadow-brand)' : 'none'
                             }}>
                          {idx + 1}
                        </div>
                        {idx < GHEE_STEPS.length - 1 && (
                          <div className="w-0.5 h-4 my-1 transition-colors duration-300"
                               style={{ background: isActive ? 'var(--gold)' : 'rgba(27, 47, 110, 0.12)' }} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-1 mb-1">
                          <h3 className="text-sm font-bold transition-colors duration-300 min-w-0 flex-1"
                              style={{ color: isActive ? 'var(--navy)' : 'rgba(27,47,110,0.8)' }}>
                            {step.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0"
                                style={{ 
                                  background: isActive ? 'rgba(245, 166, 35, 0.15)' : 'rgba(27, 47, 110, 0.05)',
                                  color: isActive ? 'var(--gold)' : 'var(--text-muted)'
                                }}>
                            {step.timeLabel}
                          </span>
                        </div>
                        <p className="text-xs font-semibold mb-2" 
                           style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }}>
                          {step.desc}
                        </p>
                        
                        {isActive ? (
                          <motion.p 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-xs leading-relaxed" 
                            style={{ color: 'var(--text-secondary)' }}>
                            {step.longDesc}
                          </motion.p>
                        ) : (
                          <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                            {step.longDesc}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* ══════════ PHOTO GALLERY ══════════ */}
      <section style={{ background: '#FFFFFF', padding: '60px 0 80px' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.p {...fadeUp(0)} className="section-tag flex items-center gap-1.5 justify-center">
              <FiImage size={13} /> Visual Tour
            </motion.p>
            <motion.h2 {...fadeUp(0.08)} className="section-title mb-3">
              Our Gallery & Farm Life
            </motion.h2>
            <motion.p {...fadeUp(0.16)} className="section-sub max-w-md mx-auto">
              Browse through photos of our grass-fed cows, traditional Bilona churning, purity labs, and premium finished ghee.
            </motion.p>

            {/* Filter buttons */}
            <motion.div {...fadeUp(0.22)} className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {['All', 'Farm', 'Process', 'Purity', 'Products'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setGalleryFilter(tab)}
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300"
                  style={{
                    background: galleryFilter === tab ? 'var(--brand-gradient)' : 'rgba(27, 47, 110, 0.05)',
                    color: galleryFilter === tab ? '#ffffff' : 'var(--navy)',
                    boxShadow: galleryFilter === tab ? 'var(--shadow-brand)' : 'none',
                    border: '1px solid',
                    borderColor: galleryFilter === tab ? 'transparent' : 'var(--border-color)',
                  }}
                >
                  {tab === 'All' ? 'View All' : tab}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Photo Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredGallery.map((item, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={item.id}
                  onClick={() => setLightboxIndex(index)}
                  className="group cursor-pointer rounded-2xl overflow-hidden relative aspect-[4/3] flex flex-col justify-end"
                  style={{ 
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  {/* Image */}
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                  {/* Text content & Hover indicator */}
                  <div className="relative z-10 p-5 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
                          style={{ background: 'var(--gold)', boxShadow: '0 2px 8px rgba(245,166,35,0.4)' }}>
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2 mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-white/70 max-h-0 overflow-hidden group-hover:max-h-[40px] transition-all duration-300 ease-out">
                      {item.desc}
                    </p>
                  </div>

                  {/* Floating Zoom Icon */}
                  <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FiMaximize2 size={14} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ══════════ LIGHTBOX MODAL ══════════ */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close Button */}
            <button 
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200"
            >
              <FiX size={20} />
            </button>

            {/* Prev Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredGallery.length - 1));
              }}
              className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200"
            >
              <FiChevronLeft size={24} />
            </button>

            {/* Next Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev < filteredGallery.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200"
            >
              <FiChevronRight size={24} />
            </button>

            {/* Active Image and Caption */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-4xl max-h-[80vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={filteredGallery[lightboxIndex]?.image} 
                alt={filteredGallery[lightboxIndex]?.title} 
                className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl"
              />
              <div className="text-center mt-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ background: 'var(--gold)' }}>
                  {filteredGallery[lightboxIndex]?.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">
                  {filteredGallery[lightboxIndex]?.title}
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  {filteredGallery[lightboxIndex]?.desc}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ VIDEO DIALOG MODAL ══════════ */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setIsVideoModalOpen(false)}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 z-10"
            >
              <FiX size={20} />
            </button>

            {/* Video Content Panel */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col items-center bg-[#1B2F6E]/95 border border-white/10 shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tabs for Source Select */}
              <div className="flex items-center gap-2 mb-6 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setVideoModalSource('local')}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${videoModalSource === 'local' ? 'bg-amber-400 text-[#1B2F6E]' : 'text-white/80 hover:text-white'}`}
                >
                  Traditional Farm Process
                </button>
                <button
                  onClick={() => setVideoModalSource('youtube')}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${videoModalSource === 'youtube' ? 'bg-amber-400 text-[#1B2F6E]' : 'text-white/80 hover:text-white'}`}
                >
                  YouTube Vedic Bilona Tour
                </button>
              </div>

              {/* Video Player Area */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 relative">
                {videoModalSource === 'local' ? (
                  <video
                    src="https://assets.mixkit.co/videos/preview/mixkit-organic-milk-poured-into-a-glass-jar-42301-large.mp4"
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <iframe 
                    className="w-full h-full" 
                    src="https://www.youtube.com/embed/3S_W4Xo0d40?autoplay=1" 
                    title="Traditional Vedic Bilona Ghee Making Process" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  />
                )}
              </div>

              {/* Title & Description */}
              <div className="text-center mt-6 max-w-xl">
                <h3 className="text-lg font-bold text-white mb-2">
                  {videoModalSource === 'local' ? 'Traditional Khuri Village Process' : 'Tharparkar Cow Bilona Ghee Making Tour'}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {videoModalSource === 'local' 
                    ? 'Watch the artisans of Khuri village process whole Tharparkar milk, set the curd overnight in mitti ki handi, hand-churn it with a wooden bilona in the early morning, and gently heat the makkhan over a chulha.' 
                    : 'Experience a detailed tour of an authentic organic Vedic cow farm, highlighting milk culturing, wooden Bilona hand churning, and traditional clarifying.'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ NEWSLETTER ══════════ */}
      <section style={{ background: '#FFFFFF', padding: '40px 0 60px' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} 
            className="rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto"
            style={{ 
              background: 'var(--bg-alt)', 
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-card)'
            }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                 style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--gold)' }}>
              <FiZap size={28} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
              Join the DhaniFresh Family
            </h2>
            <p className="text-sm sm:text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Subscribe to our newsletter to receive exclusive offers, health tips, and early access to our premium organic products.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-5 py-3.5 rounded-xl text-sm outline-none transition-all"
                style={{ 
                  background: 'var(--bg-base)', 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              <button 
                type="submit" 
                disabled={subscribing}
                className="px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105 flex items-center justify-center min-w-[140px]"
                style={{ 
                  background: 'var(--brand-gradient)', 
                  color: 'white', 
                  boxShadow: 'var(--shadow-brand)',
                  opacity: subscribing ? 0.7 : 1,
                  cursor: subscribing ? 'not-allowed' : 'pointer'
                }}>
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </motion.div>
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
