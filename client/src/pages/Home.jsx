import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { FiArrowRight, FiShield, FiStar, FiTruck, FiDroplet, FiAward, FiCheck, FiPlay, FiEye, FiHeart } from 'react-icons/fi'

import ProductCarousel from '../components/ProductCarousel'
import HeroCarousel from '../components/HeroCarousel'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

const slideIn = (delay = 0, direction = "left") => ({
  initial: { opacity: 0, x: direction === "left" ? -40 : 40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Home() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Product States for Carousels
  const [bestSellers, setBestSellers] = useState([])
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [comingSoonProducts, setComingSoonProducts] = useState([])

  const [galleryFilter, setGalleryFilter] = useState('All')

  // Newsletter
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [
          catRes,
          bestRes,
          recRes,
          comingRes
        ] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/products?sort=rating&limit=10'),
          api.get('/api/products?limit=8&page=2'), // Simulate recommended
          api.get('/api/products?comingSoon=true&limit=8') // Fetch actual coming soon
        ])

        setCategories(catRes.data)

        const extractProds = (res) => Array.isArray(res.data) ? res.data : (res.data.products ?? res.data.data ?? [])

        setBestSellers(extractProds(bestRes))
        setRecommendedProducts(extractProds(recRes))
        setComingSoonProducts(extractProds(comingRes))
      } catch (e) {
        console.error('Error fetching home data:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Dummy data arrays for sections
  const TRUST_ITEMS = [
    { icon: <FiAward size={24} />, title: t('home.trust1Title', "Farm Fresh"), sub: t('home.trust1Sub', "Direct from farms") },
    { icon: <FiDroplet size={24} />, title: t('home.trust2Title', "Bilona Crafted"), sub: t('home.trust2Sub', "Traditional method") },
    { icon: <FiShield size={24} />, title: t('home.trust3Title', "FSSAI Certified"), sub: t('home.trust3Sub', "Quality guaranteed") },
    { icon: <FiTruck size={24} />, title: t('home.trust4Title', "Pan India"), sub: t('home.trust4Sub', "Fast & safe delivery") }
  ]

  const WHY_CHOOSE = [
    { icon: <FiAward size={28} />, title: t('home.wc1Title', "100% Pure"), text: t('home.wc1Text', "Unadulterated, uncompromised purity in every drop.") },
    { icon: <FiCheck size={28} />, title: t('home.wc2Title', "Lab Tested"), text: t('home.wc2Text', "Rigorously tested to meet the highest safety standards.") },
    { icon: <FiHeart size={28} />, title: t('home.wc3Title', "Farm Fresh"), text: t('home.wc3Text', "Sourced directly from trusted local farmers.") },
    { icon: <FiShield size={28} />, title: t('home.wc4Title', "Chemical Free"), text: t('home.wc4Text', "Zero preservatives, zero artificial additives.") },
    { icon: <FiDroplet size={28} />, title: t('home.wc5Title', "Traditional Process"), text: t('home.wc5Text', "Hand-churned using the authentic Vedic Bilona method.") },
    { icon: <FiTruck size={28} />, title: t('home.wc6Title', "Fast Delivery"), text: t('home.wc6Text', "Delivered fresh to your doorstep across India.") }
  ]

  const TESTIMONIALS = [
    { name: t('home.t1Name', "Aarav Sharma"), role: t('home.t1Role', "Chef"), rating: 5, text: t('home.t1Comment', "The rich aroma and granular texture are unmatched. It instantly elevates every dish I prepare. Highly recommended for culinary enthusiasts."), image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop" },
    { name: t('home.t2Name', "Priya Desai"), role: t('home.t2Role', "Nutritionist"), rating: 5, text: t('home.t2Comment', "Finding pure A2 ghee is difficult, but Daatasa delivers on its promise. It's truly authentic, easily digestible, and packed with nutrients."), image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" },
    { name: t('home.t3Name', "Vikram Singh"), role: t('home.t3Role', "Fitness Coach"), rating: 5, text: t('home.t3Comment', "I start my day with Daatasa ghee in my coffee. It provides clean, sustained energy for my workouts and supports recovery."), image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop" }
  ]

  const GALLERY_TABS = [
    t('home.galleryAll', 'All'), 
    t('home.galleryFarm', 'Farm'), 
    t('home.galleryProducts', 'Products'), 
    t('home.galleryBilona', 'Bilona'), 
    t('home.galleryLifestyle', 'Lifestyle')
  ]
  const GALLERY_IMAGES = [
    { id: 1, cat: 'Farm', url: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=600&h=800&fit=crop' },
    { id: 2, cat: 'Products', url: 'https://images.unsplash.com/photo-1526362456488-87e35b7501a3?w=600&h=400&fit=crop' },
    { id: 3, cat: 'Bilona', url: 'https://images.unsplash.com/photo-1513682121497-80211f36a790?w=600&h=600&fit=crop' },
    { id: 4, cat: 'Lifestyle', url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=600&fit=crop' },
    { id: 5, cat: 'Farm', url: 'https://images.unsplash.com/photo-1511690078903-71dc5a49f5e3?w=600&h=400&fit=crop' },
    { id: 6, cat: 'Products', url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&h=800&fit=crop' }
  ]

  const PROCESS_STEPS = [
    { title: t('home.processStep1Title', "Milk Collection"), desc: t('home.processStep1Desc', "Fresh A2 milk sourced from happy, free-grazing cows.") },
    { title: t('home.processStep2Title', "Curd Culturing"), desc: t('home.processStep2Desc', "Milk is boiled and traditionally set into curd overnight.") },
    { title: t('home.processStep3Title', "Bilona Churning"), desc: t('home.processStep3Desc', "Curd is hand-churned in wooden bilona to separate Makhan.") },
    { title: t('home.processStep4Title', "Slow Heating"), desc: t('home.processStep4Desc', "Makhan is slowly heated on cow-dung fire to craft liquid gold.") }
  ]

  return (
    <div className="min-h-screen bg-[var(--ivory)] font-sans text-brand-text selection:bg-brand-secondary selection:text-white">
      <Helmet>
        <title>Daatasa — Premium Vedic Bilona Ghee</title>
      </Helmet>

      {/* ══════════ HERO SECTION (Image Slider) ══════════ */}
      <HeroCarousel />

      {/* ══════════ TRUST BAR ══════════ */}
      <div className="max-w-[1280px] mx-auto px-6 -mt-8 relative z-20 mb-20">
        <motion.div {...fadeUp(0)} className="bg-white rounded-3xl shadow-xl border border-brand-primary/5 p-6 md:p-8 overflow-hidden relative">
          <div className="flex md:justify-between items-center gap-12 w-max md:w-full animate-marquee-mobile md:animate-none">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, idx) => (
              <div key={idx} className={`flex items-center gap-4 group shrink-0 ${idx >= TRUST_ITEMS.length ? 'md:hidden' : ''}`}>
                <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center text-brand-secondary transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-secondary group-hover:text-white">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-primary tracking-wide">{item.title}</h4>
                  <p className="text-xs text-brand-text/60 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ══════════ BEST SELLERS ══════════ */}
      <section className="py-12 bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <ProductCarousel
            title={t('home.bestSellers', 'Best Sellers')}
            subtitle={t('home.crowdFavorites', 'Crowd Favorites')}
            products={bestSellers}
            loading={loading}
            viewAllLink="/products?sort=rating"
            showRank={true}
          />
        </div>
      </section>

      {/* ══════════ RECOMMENDED PRODUCTS ══════════ */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-[1440px] mx-auto px-6">
          <ProductCarousel
            title={t('home.recommendedProducts', 'Recommended For You')}
            subtitle={t('home.curated', 'Curated Picks')}
            products={recommendedProducts}
            loading={loading}
            viewAllLink="/products"
          />
        </div>
      </section>

      {/* ══════════ COMING SOON ══════════ */}
      <section className="py-20 bg-white border-y border-brand-primary/5">
        <div className="max-w-[1440px] mx-auto px-6">
          <ProductCarousel
            title={t('home.comingSoon', 'Coming Soon')}
            subtitle={t('home.sneakPeek', 'Sneak Peek')}
            products={comingSoonProducts}
            loading={loading}
          />
        </div>
      </section>

      {/* ══════════ ABOUT SECTION (Farm to Family) ══════════ */}
      <section className="py-24 overflow-hidden relative bg-[var(--ivory)] border-y border-brand-primary/5">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-secondary/5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
        
        <div className="max-w-[1280px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...slideIn(0.1, "left")} className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative max-w-md mx-auto">
              <img src="https://images.unsplash.com/photo-1511690078903-71dc5a49f5e3?w=800&q=80" alt="Farm" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <button className="w-20 h-20 bg-white/30 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center text-white hover:bg-brand-secondary hover:border-brand-secondary transition-all hover:scale-110">
                  <FiPlay size={32} className="ml-2" />
                </button>
              </div>
            </div>
            {/* Decorative line art / shape */}
            <div className="absolute -bottom-8 -left-8 w-32 h-32 border border-brand-secondary rounded-full opacity-40 animate-spin-slow" />
          </motion.div>
          
          <div className="max-w-lg">
            <motion.h4 {...fadeUp(0.1)} className="text-sm font-bold uppercase tracking-[0.2em] text-brand-secondary mb-4">{t('home.ourHeritageLabel', 'Our Heritage')}</motion.h4>
            <motion.h2 {...fadeUp(0.2)} className="text-4xl md:text-5xl font-display font-bold text-brand-primary leading-tight mb-6">
              {t('home.farmToFamilyTitle', 'From Our Farms')} <br/> <span className="italic font-light">{t('home.farmToFamilySub', 'To Your Family')}</span>
            </motion.h2>
            <motion.p {...fadeUp(0.3)} className="text-brand-text/70 mb-10 leading-relaxed font-light">
              {t('home.farmToFamilyDesc', 'Nurtured with love in the pure environment of Khuri, Jaisalmer. Our free-grazing cows feed on natural organic grass, ensuring the milk produced is rich in vital nutrients. Every step of our process honors ancient traditions to bring you unparalleled purity.')}
            </motion.p>
            
            <motion.div {...fadeUp(0.4)} className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <h3 className="text-4xl font-display font-bold text-brand-secondary mb-1">600+</h3>
                <p className="text-sm text-brand-text/60 font-medium">{t('home.happyCowsLabel', 'Happy Cows')}</p>
              </div>
              <div>
                <h3 className="text-4xl font-display font-bold text-brand-secondary mb-1">50+</h3>
                <p className="text-sm text-brand-text/60 font-medium">{t('home.acresFarmLabel', 'Acres of Farm')}</p>
              </div>
            </motion.div>
            
            <motion.div {...fadeUp(0.5)}>
              <Link to="/about" className="btn btn-secondary h-12 px-8 rounded-full flex items-center justify-center w-max">{t('home.storyBtn', 'Explore Our Story')}</Link>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ══════════ BILONA PROCESS SECTION (Ivory Luxury) ══════════ */}
      <section className="py-24 bg-white text-brand-text overflow-hidden relative border-b border-brand-primary/5">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-[1280px] mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.h4 {...fadeUp(0)} className="text-sm font-bold uppercase tracking-[0.2em] text-brand-secondary mb-4 flex items-center gap-2">
                <FiDroplet /> {t('home.ancientWisdomLabel', 'Ancient Wisdom')}
              </motion.h4>
              <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6 text-brand-primary">
                {t('home.authenticLabel', 'The Authentic')} <br /> <span className="text-brand-secondary italic">{t('home.bilonaProcessLabel', 'Bilona Process')}</span>
              </motion.h2>
              <motion.p {...fadeUp(0.2)} className="text-brand-text/70 mb-10 leading-relaxed font-light text-lg">
                {t('home.processDescNew', "We don't make ghee from malai (cream). We follow the rigorous 4-step Vedic process mentioned in ancient texts. Every drop is crafted with patience, tradition, and devotion.")}
              </motion.p>
              <motion.div {...fadeUp(0.3)}>
                <Link to="/about" className="btn btn-secondary h-14 px-8 rounded-full flex items-center justify-center w-max">
                  {t('home.discoverMethodBtn', 'Discover The Method')}
                </Link>
              </motion.div>
            </div>
            
            {/* Right Video / Process Steps */}
            <motion.div {...slideIn(0.2, "right")} className="relative">
              {/* Cinematic Video Player */}
              <div className="aspect-[16/10] rounded-[2rem] overflow-hidden shadow-lg relative bg-black group border border-brand-primary/10">
                <img src="https://images.unsplash.com/photo-1513682121497-80211f36a790?w=800&q=80" alt="Bilona Video" className="w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/50 via-transparent to-transparent opacity-80" />
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-brand-primary hover:scale-110 transition-transform shadow-lg group-hover:text-brand-secondary">
                  <FiPlay size={32} className="ml-2" />
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Process Timeline below */}
          <motion.div {...fadeUp(0.3)} className="overflow-hidden relative mt-12 md:mt-16 pb-6 -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 w-max md:w-full animate-marquee-mobile md:animate-none">
              {[...PROCESS_STEPS, ...PROCESS_STEPS].map((step, idx) => (
                <div key={idx} className={`shrink-0 w-[260px] md:w-auto p-5 md:p-6 rounded-3xl bg-[var(--ivory)] border border-brand-primary/10 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-brand-secondary/30 transition-all ${idx >= PROCESS_STEPS.length ? 'md:hidden' : ''}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/10 rounded-bl-[4rem] -z-10 group-hover:scale-150 transition-transform duration-500" />
                  <div className="text-3xl md:text-4xl font-display font-bold text-brand-secondary mb-3 md:mb-4">{`0${(idx % PROCESS_STEPS.length) + 1}`}</div>
                  <h4 className="text-base md:text-lg font-bold text-brand-primary mb-1 md:mb-2">{step.title}</h4>
                  <p className="text-xs md:text-sm text-brand-text/60 font-light leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ WHY CHOOSE DAATASA ══════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <motion.h4 {...fadeUp(0)} className="text-sm font-bold uppercase tracking-[0.2em] text-brand-secondary mb-2">{t('home.ourPromiseLabel', 'Our Promise')}</motion.h4>
            <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-5xl font-display font-bold text-brand-primary mb-6">{t('home.whyChooseLabel', 'Why Choose Daatasa')}</motion.h2>
            <motion.p {...fadeUp(0.2)} className="text-brand-text/70 text-lg font-light leading-relaxed">
              {t('home.promiseDesc', 'We bring the ancient Vedic tradition right to your doorstep, ensuring unmatched purity and health benefits.')}
            </motion.p>
          </div>
          
          <motion.div {...fadeUp(0.3)} className="overflow-hidden relative pb-6 -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 w-max md:w-full animate-marquee-mobile md:animate-none">
              {[...WHY_CHOOSE, ...WHY_CHOOSE].map((item, idx) => (
                <div key={idx} className={`shrink-0 w-[260px] md:w-auto p-6 md:p-8 rounded-3xl bg-brand-bg border border-brand-primary/5 hover:border-brand-secondary/30 transition-all hover:shadow-xl group ${idx >= WHY_CHOOSE.length ? 'md:hidden' : ''}`}>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center text-brand-secondary mb-4 md:mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="text-base md:text-xl font-bold text-brand-primary mb-2 md:mb-3">{item.title}</h4>
                  <p className="text-xs md:text-base text-brand-text/60 font-light leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-24 bg-brand-bg relative overflow-hidden">
        <div className="absolute top-10 left-10 text-9xl text-brand-primary/5 font-display italic">"</div>
        <div className="absolute bottom-10 right-10 text-9xl text-brand-primary/5 font-display italic rotate-180">"</div>

        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h4 {...fadeUp(0)} className="text-sm font-bold uppercase tracking-[0.2em] text-brand-secondary mb-2">{t('home.testimonialTag', 'Testimonials')}</motion.h4>
            <motion.h2 {...fadeUp(0.1)} className="text-4xl font-display font-bold text-brand-primary">{t('home.testimonialTitle', 'Loved by Families')}</motion.h2>
          </div>

          <motion.div {...fadeUp(0.2)} className="overflow-hidden relative pb-6 -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex md:grid md:grid-cols-3 gap-5 md:gap-8 w-max md:w-full animate-marquee-mobile md:animate-none">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((review, idx) => (
                <div key={idx} className={`shrink-0 w-[280px] md:w-auto bg-white p-6 md:p-10 rounded-[2rem] shadow-card relative border border-brand-primary/5 flex flex-col ${idx >= TESTIMONIALS.length ? 'md:hidden' : ''}`}>
                  <div className="flex gap-1 mb-4 md:mb-6 text-brand-secondary">
                    {[...Array(review.rating)].map((_, i) => <FiStar key={i} size={16} fill="currentColor" className="w-[14px] md:w-[18px]" />)}
                  </div>
                  <p className="text-xs md:text-base text-brand-text/70 italic leading-relaxed mb-6 md:mb-8 font-serif">"{review.text}"</p>
                  <div className="flex items-center gap-3 md:gap-4 mt-auto">
                    <img src={review.image} alt={review.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-md" />
                    <div>
                      <h5 className="font-bold text-brand-primary text-xs md:text-sm">{review.name}</h5>
                      <p className="text-[10px] md:text-xs text-brand-text/50">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ GALLERY (Masonry Layout) ══════════ */}
      <section className="py-24 bg-white border-y border-brand-primary/5">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div>
              <motion.h2 {...fadeUp(0)} className="text-4xl font-display font-bold text-brand-primary mb-2">Our World</motion.h2>
              <motion.p {...fadeUp(0.1)} className="text-brand-text/60">Glimpses of our heritage and process.</motion.p>
            </div>
            <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-2 justify-center">
              {GALLERY_TABS.map((tab, idx) => {
              const tabKeys = ['All', 'Farm', 'Products', 'Bilona', 'Lifestyle'];
              const rawTab = tabKeys[idx];
              return (
                <button 
                  key={idx}
                  onClick={() => setGalleryFilter(rawTab)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    galleryFilter === rawTab 
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'bg-brand-bg text-brand-text/60 hover:bg-brand-primary/5 hover:text-brand-primary'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
            </motion.div>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {GALLERY_IMAGES.filter(img => galleryFilter === 'All' || img.cat === galleryFilter).map((img, idx) => (
              <motion.div key={img.id} {...fadeUp(idx * 0.1)} className="break-inside-avoid relative rounded-3xl overflow-hidden group shadow-md cursor-pointer">
                <img src={img.url} alt={`Gallery ${img.cat}`} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-brand-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                    <FiEye size={20} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CERTIFICATIONS ══════════ */}
      <section className="py-16 bg-brand-bg border-b border-brand-primary/5">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['FSSAI', 'A2 Milk', '100% Natural', 'Lab Tested', 'Organic'].map((cert, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 border-2 border-brand-primary rounded-full flex items-center justify-center text-brand-primary font-bold">
                  {cert.charAt(0)}
                </div>
                <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TRACK ORDER BANNER ══════════ */}
      <section className="py-12 bg-white relative">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div {...fadeUp(0)} className="bg-brand-primary p-8 md:p-12 rounded-[2rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 max-w-xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary">
                  <FiTruck size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white">{t('home.trackOrderTitle', 'Track Your Order')}</h3>
              </div>
              <p className="text-white/80 text-base md:text-lg font-light leading-relaxed">
                {t('home.trackOrderDesc', 'Waiting for your pure Bilona Ghee? Use our tracking portal to get real-time updates on your delivery status.')}
              </p>
            </div>
            
            <div className="relative z-10 w-full md:w-auto shrink-0">
               <Link to="/track-order" className="btn btn-primary h-14 px-10 text-[15px] rounded-full flex items-center justify-center gap-2 shadow-gold whitespace-nowrap w-full">
                 Track Now <FiArrowRight />
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ NEWSLETTER & LIMITED OFFER ══════════ */}
      <section className="py-12 bg-white relative pb-20">
        <div className="max-w-[1280px] mx-auto px-6 grid lg:grid-cols-2 gap-8 md:gap-10">
          <motion.div {...fadeUp(0)} className="bg-brand-bg p-8 md:p-10 rounded-[2rem] relative overflow-hidden border border-brand-primary/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            
            <h3 className="text-2xl md:text-3xl font-display font-bold text-brand-primary mb-3">{t('home.joinFamilyTitle', 'Join The Daatasa Family')}</h3>
            <p className="text-brand-text/70 mb-6 font-light">{t('home.joinFamilyDesc', 'Subscribe to get exclusive health tips, early access to new products, and special family-only discounts.')}</p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('home.emailPlaceholder', 'Enter your email address')} 
                className="flex-1 px-5 py-3.5 rounded-xl bg-white border border-brand-primary/10 focus:border-brand-secondary outline-none shadow-sm text-sm"
              />
              <button type="submit" disabled={subscribing} className="btn btn-primary h-[50px] px-6 rounded-full whitespace-nowrap">
                {subscribing ? t('home.subscribingBtn', 'Joining...') : t('home.subscribeBtn', 'Subscribe Now')}
              </button>
            </form>
          </motion.div>

          <motion.div {...slideIn(0.2, "right")} className="bg-brand-primary rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden flex flex-col justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-20">
              <FiAward size={200} />
            </div>
            
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded bg-brand-secondary text-brand-primary text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3">{t('home.limitedOffer', 'Limited Time Offer')}</span>
              <h3 className="text-3xl md:text-4xl font-display font-bold mb-3 text-white">{t('home.get10Off', 'Get 10% OFF')}</h3>
              <p className="text-white/70 mb-6 text-sm md:text-base font-light">{t('home.offerDesc', 'On your first order of our premium Desi Cow Bilona Ghee.')}</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:w-auto px-5 py-3 border border-white/20 rounded-xl bg-white/10 font-mono text-brand-secondary text-lg md:text-xl font-bold tracking-widest shadow-inner text-center">
                  FIRST10
                </div>
                <Link to="/products" className="btn btn-accent w-full sm:w-auto h-[50px] px-6 rounded-full flex items-center justify-center shadow-gold bg-brand-secondary text-brand-primary hover:bg-white transition-colors">
                  {t('home.orderNowBtn', 'Order Now')} <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
