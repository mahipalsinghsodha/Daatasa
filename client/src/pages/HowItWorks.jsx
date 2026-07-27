import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { FiDroplet, FiCheck, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function HowItWorks() {
  const { t } = useTranslation()

  const PROCESS_STEPS = [
    { title: t('howItWorks.s1Title', 'Milk Collection'), desc: t('howItWorks.s1Desc', 'Fresh A2 milk sourced from happy, free-grazing cows foraging in the Thar desert.') },
    { title: t('howItWorks.s2Title', 'Curd Culturing'), desc: t('howItWorks.s2Desc', 'Milk is boiled and traditionally set into curd overnight in earthen pots (Mitti ki Handi).') },
    { title: t('howItWorks.s3Title', 'Bilona Churning'), desc: t('howItWorks.s3Desc', 'Curd is hand-churned in wooden bilona clockwise and anti-clockwise to separate Makhan.') },
    { title: t('howItWorks.s4Title', 'Slow Heating'), desc: t('howItWorks.s4Desc', 'Makhan is slowly heated on a cow-dung fire to craft liquid gold, locking in the aroma.') }
  ]

  return (
    <div className="min-h-screen bg-[var(--ivory)] font-sans text-brand-text">
      <Helmet>
        <title>{t('footer.exploreHowItWorks') || 'How It Works'} — Daatasa</title>
        <meta name="description" content="Learn about the authentic Vedic Bilona process used to craft Daatasa pure A2 cow ghee." />
      </Helmet>

      {/* ── Premium Hero Header ── */}
      <div className="relative overflow-hidden bg-white text-brand-primary border-b border-brand-primary/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none bg-brand-secondary/10" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, var(--brand-primary) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-10 text-center">
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-brand-primary/5 text-brand-primary border border-brand-primary/10 mb-4">
            <span className="text-[12px] mr-2">⚙️</span>
            {t('howItWorks.heroTag', 'The Process')}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
            className="text-3xl sm:text-5xl font-display font-bold mb-3 text-brand-primary">
            {t('howItWorks.heroTitle1', 'How It')} <span className="text-brand-secondary italic font-light">{t('howItWorks.heroTitle2', 'Works')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="text-base font-medium text-brand-text/60 max-w-xl mx-auto">
            {t('howItWorks.heroDesc', 'Discover the traditional Vedic Bilona method that brings pure liquid gold to your table.')}
          </motion.p>
        </div>
      </div>

      {/* ── Content Section ── */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.h4 {...fadeUp(0)} className="text-sm font-bold uppercase tracking-[0.2em] text-brand-secondary mb-4 flex items-center gap-2">
                <FiDroplet /> {t('howItWorks.ancientWisdom', 'Ancient Wisdom')}
              </motion.h4>
              <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6 text-brand-primary">
                {t('howItWorks.authenticBilona1', 'The Authentic')} <br /> <span className="text-brand-secondary italic">{t('howItWorks.authenticBilona2', 'Bilona Process')}</span>
              </motion.h2>
              <motion.p {...fadeUp(0.2)} className="text-brand-text/70 mb-10 leading-relaxed font-light text-lg">
                {t('howItWorks.authenticDesc', "We don't make ghee from malai (cream). We follow the rigorous 4-step Vedic process mentioned in ancient texts. Every drop is crafted with patience, tradition, and devotion in our Khuri, Jaisalmer farm.")}
              </motion.p>
              
              <div className="space-y-6">
                {PROCESS_STEPS.map((step, idx) => (
                  <motion.div key={idx} {...fadeUp(0.3 + idx * 0.1)} className="flex gap-4 p-5 bg-white border border-brand-primary/5 rounded-[1.5rem] shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary font-bold text-xl shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-brand-primary mb-1">{step.title}</h4>
                      <p className="text-sm text-brand-text/70">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Right Video/Image */}
            <motion.div {...fadeUp(0.4)} className="relative">
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative bg-black border border-brand-primary/10 lg:sticky lg:top-28">
                <img src="https://images.unsplash.com/photo-1513682121497-80211f36a790?w=800&q=80" alt="Bilona Process" className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/60 via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
                  <h4 className="font-bold text-brand-primary mb-2 flex items-center gap-2">
                    <FiCheck className="text-brand-secondary" /> {t('howItWorks.pureTag', 'Pure & Unadulterated')}
                  </h4>
                  <p className="text-sm text-brand-text/70">{t('howItWorks.pureDesc', 'From our happy cows to your kitchen, quality is monitored at every single step.')}</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div {...fadeUp(0.8)} className="mt-20 text-center">
             <Link to="/products" className="btn btn-primary h-14 px-10 rounded-full text-[15px]">
              {t('howItWorks.tasteBtn', 'Taste the Purity')} <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
