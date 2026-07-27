// pages/AboutUs.jsx — Premium Redesign
import { motion } from 'framer-motion'
import { FiCheck, FiArrowRight, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

const getSteps = (t) => [
  { emoji: '🥛', title: t('aboutUs.step1Title'),  desc: t('aboutUs.step1Desc') },
  { emoji: '🫙', title: t('aboutUs.step2Title'),   desc: t('aboutUs.step2Desc') },
  { emoji: '🔥', title: t('aboutUs.step3Title'),    desc: t('aboutUs.step3Desc') },
  { emoji: '✅', title: t('aboutUs.step4Title'),      desc: t('aboutUs.step4Desc') },
]

const getPromises = (t) => [
  t('aboutUs.promise1'),
  t('aboutUs.promise2'),
  t('aboutUs.promise3'),
  t('aboutUs.promise4'),
  t('aboutUs.promise5'),
]

const getTimeline = (t) => [
  { year: t('aboutUs.time1Year'), title: t('aboutUs.time1Title'),        desc: t('aboutUs.time1Desc') },
  { year: t('aboutUs.time2Year'), title: t('aboutUs.time2Title'),     desc: t('aboutUs.time2Desc') },
  { year: t('aboutUs.time3Year'), title: t('aboutUs.time3Title'),   desc: t('aboutUs.time3Desc') },
  { year: t('aboutUs.time4Year'), title: t('aboutUs.time4Title'), desc: t('aboutUs.time4Desc') },
  { year: t('aboutUs.time5Year'), title: t('aboutUs.time5Title'),       desc: t('aboutUs.time5Desc') },
  { year: t('aboutUs.time6Year'), title: t('aboutUs.time6Title'),   desc: t('aboutUs.time6Desc') },
]

const getStats = (t) => [
  { value: '5,000+', label: t('aboutUs.stat1Label') },
  { value: '100%',   label: t('aboutUs.stat2Label') },
  { value: '4.9★',   label: t('aboutUs.stat3Label') },
  { value: 'FSSAI',  label: t('aboutUs.stat4Label') },
]

const getToc = (t) => [t('aboutUs.toc1'), t('aboutUs.toc2'), t('aboutUs.toc3'), t('aboutUs.toc4')]

const SectionHeader = ({ title }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-1 h-8 rounded-full shrink-0 mt-0.5 bg-gradient-to-b from-brand-secondary to-brand-secondary/80" />
    <h2 className="text-xl font-extrabold font-display text-brand-primary -tracking-[0.02em]">{title}</h2>
  </div>
)

export default function AboutUs() {
  const { t } = useTranslation()
  const STEPS = useMemo(() => getSteps(t), [t])
  const PROMISES = useMemo(() => getPromises(t), [t])
  const TIMELINE = useMemo(() => getTimeline(t), [t])
  const STATS = useMemo(() => getStats(t), [t])
  const TOC = useMemo(() => getToc(t), [t])

  return (
    <div className="min-h-screen bg-[var(--ivory)] font-sans text-brand-text">
      <Helmet>
        <title>{t('aboutUs.pageTitle')}</title>
        <meta name="description" content={t('aboutUs.pageDescription')} />
      </Helmet>

      {/* ── Premium Hero ── */}
      <div className="relative overflow-hidden bg-white text-brand-primary border-b border-brand-primary/5">
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full pointer-events-none animate-blob bg-brand-secondary/10 blur-[60px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, var(--brand-primary) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-brand-primary/10 bg-brand-primary/5 text-brand-primary">
              <span className="text-[12px]">🫙</span>
              {t('aboutUs.heroTag')}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl font-extrabold mb-4 leading-[1.1] font-display text-brand-primary -tracking-[0.03em]">
            {t('aboutUs.heroTitle').split(' ')[0]} <span className="text-brand-secondary italic">{t('aboutUs.heroTitle').split(' ').slice(1).join(' ')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="text-sm max-w-md mx-auto text-brand-text/60 font-medium">
            {t('aboutUs.heroDesc')}
          </motion.p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-4 gap-8 items-start">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* TOC */}
            <div className="rounded-[1.5rem] p-6 bg-white border border-brand-primary/10 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-brand-text/50">{t('aboutUs.tocTitle')}</p>
              <nav className="space-y-1">
                {TOC.map((item, i) => (
                  <a key={i} href={`#section-${i + 1}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-all text-brand-text/70 hover:bg-brand-secondary/10 hover:text-brand-primary">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 transition-all bg-[var(--ivory)] text-brand-text/40">{i + 1}</span>
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Stats */}
            <div className="rounded-[1.5rem] p-6 bg-white border border-brand-primary/10 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-brand-text/50">{t('aboutUs.statsTitle')}</p>
              <div className="space-y-3">
                {STATS.map((s, i) => (
                  <div key={i} className={`flex items-center justify-between py-2 ${i < STATS.length - 1 ? 'border-b border-brand-primary/5' : ''}`}>
                    <span className="text-xs font-medium text-brand-text/60">{s.label}</span>
                    <span className="text-sm font-extrabold font-display text-brand-primary">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-[1.5rem] p-6 relative overflow-hidden bg-brand-primary border border-brand-primary/10 shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none bg-white/5 translate-x-[30%] -translate-y-[30%]" />
              <p className="text-white font-extrabold text-base mb-1 relative z-10 font-display">{t('aboutUs.ctaTitle')}</p>
              <p className="text-xs mb-5 relative z-10 text-white/70 font-medium">{t('aboutUs.ctaDesc')}</p>
              <Link to="/products" className="btn btn-accent w-full h-12 rounded-full relative z-10 shadow-gold inline-flex items-center justify-center">
                {t('aboutUs.ctaBtn')} <FiArrowRight size={13} className="ml-2" />
              </Link>
            </div>
          </div>

          {/* Main Card */}
          <div className="lg:col-span-3">
            <div className="rounded-[2rem] overflow-hidden bg-white border border-brand-primary/10 shadow-sm">
              <div className="p-8 sm:p-12 space-y-12">

                {/* Section 1 — Story */}
                <section id="section-1" className="scroll-mt-28">
                  <SectionHeader title={t('aboutUs.section1Title')} />
                  <p className="text-[15px] leading-relaxed mb-4 text-brand-text/70 font-medium">
                    {t('aboutUs.section1P1')}
                  </p>
                  <p className="text-[15px] leading-relaxed text-brand-text/70 font-medium">
                    {t('aboutUs.section1P2')}
                  </p>
                </section>

                <hr className="border-brand-primary/10" />

                {/* Section 2 — Bilona Process */}
                <section id="section-2" className="scroll-mt-28">
                  <SectionHeader title={t('aboutUs.section2Title')} />
                  <p className="text-[15px] leading-relaxed mb-6 text-brand-text/70 font-medium">
                    {t('aboutUs.section2Desc')}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {STEPS.map((step, i) => (
                      <div key={i}
                        className="flex items-start gap-4 p-5 rounded-2xl transition-all bg-[var(--ivory)] border border-brand-primary/5 hover:border-brand-secondary/30 hover:bg-brand-secondary/5">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 bg-white border border-brand-primary/10 shadow-sm">
                          {step.emoji}
                        </div>
                        <div>
                          <p className="text-sm font-bold mb-1 text-brand-primary">{step.title}</p>
                          <p className="text-xs leading-relaxed text-brand-text/60">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <hr className="border-brand-primary/10" />

                {/* Section 3 — Journey */}
                <section id="section-3" className="scroll-mt-28">
                  <SectionHeader title={t('aboutUs.section3Title')} />
                  <div className="space-y-0">
                    {TIMELINE.map((item, i) => (
                      <div key={i} className="flex gap-5">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${i === TIMELINE.length - 1 ? 'bg-brand-primary text-white shadow-sm' : 'bg-[var(--ivory)] text-brand-text/50 border border-brand-primary/10'}`}>
                            {item.year.slice(2)}
                          </div>
                          {i < TIMELINE.length - 1 && (
                            <div className="w-0.5 flex-1 my-1 bg-brand-primary/10" />
                          )}
                        </div>
                        <div className={`pb-7 ${i === TIMELINE.length - 1 ? 'pb-0' : ''}`}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-brand-text/50">{item.year}</p>
                          <p className="text-sm font-bold mb-0.5 text-brand-primary">{item.title}</p>
                          <p className="text-sm leading-relaxed text-brand-text/60">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <hr className="border-brand-primary/10" />

                {/* Section 4 — Promise */}
                <section id="section-4" className="scroll-mt-28">
                  <SectionHeader title={t('aboutUs.section4Title')} />
                  <p className="text-[15px] leading-relaxed mb-5 text-brand-text/70 font-medium">
                    {t('aboutUs.section4Desc')}
                  </p>
                  <ul className="space-y-4">
                    {PROMISES.map((p, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-brand-secondary/20 text-brand-secondary">
                          <FiCheck size={12} />
                        </div>
                        <span className="text-[15px] leading-relaxed text-brand-text/70 font-medium">{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Testimonial */}
                <div className="rounded-2xl p-6 bg-[var(--ivory)] border border-brand-primary/10">
                  <div className="flex gap-1 mb-3 text-brand-secondary">
                    {[...Array(5)].map((_, i) => <FiStar key={i} size={14} className="fill-brand-secondary" />)}
                  </div>
                  <p className="text-[15px] leading-relaxed mb-4 italic text-brand-text/70 font-serif">
                    "{t('aboutUs.testimonialComment')}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-brand-secondary text-brand-primary shadow-sm">
                      P
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-primary">{t('aboutUs.testimonialName')}</p>
                      <p className="text-xs text-brand-text/50">{t('aboutUs.testimonialRole')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer nav */}
            <div className="mt-8 flex flex-wrap gap-4 justify-between items-center px-4">
              <Link to="/" className="text-sm font-bold transition-colors text-brand-text/50 hover:text-brand-secondary">
                {t('aboutUs.backToHome')}
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-bold transition-colors text-brand-text/50 hover:text-brand-secondary">
                {t('aboutUs.questionsContact')} <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
