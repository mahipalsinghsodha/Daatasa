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
    <div className="w-1 h-8 rounded-full shrink-0 mt-0.5"
      style={{ background: 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)' }} />
    <h2 className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</h2>
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
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Helmet>
        <title>{t('aboutUs.pageTitle')}</title>
        <meta name="description" content={t('aboutUs.pageDescription')} />
      </Helmet>

      {/* ── Premium Hero ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full pointer-events-none animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.35) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.5 }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}>
              🫙
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5 border"
              style={{ background: 'rgba(245,166,35,0.18)', borderColor: 'rgba(245,166,35,0.30)', color: 'var(--gold)' }}>
              {t('aboutUs.heroTag')}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl font-extrabold mb-4 leading-[1.1] text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            {t('aboutUs.heroTitle').split(' ')[0]} <span className="shimmer-text">{t('aboutUs.heroTitle').split(' ').slice(1).join(' ')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="text-sm sm:text-base max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {t('aboutUs.heroDesc')}
          </motion.p>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="var(--bg-base)" />
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-4 gap-8 items-start">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* TOC */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{t('aboutUs.tocTitle')}</p>
              <nav className="space-y-1">
                {TOC.map((item, i) => (
                  <a key={i} href={`#section-${i + 1}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all group"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.08)'; e.currentTarget.style.color = 'var(--gold)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 transition-all"
                      style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)' }}>{i + 1}</span>
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Stats */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{t('aboutUs.statsTitle')}</p>
              <div className="space-y-3">
                {STATS.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2"
                    style={{ borderBottom: i < STATS.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                    <span className="text-sm font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'var(--brand-gradient)', boxShadow: 'var(--shadow-brand)' }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(30%, -30%)' }} />
              <p className="text-white font-extrabold text-base mb-1 relative z-10" style={{ fontFamily: 'var(--font-display)' }}>{t('aboutUs.ctaTitle')}</p>
              <p className="text-xs mb-4 relative z-10" style={{ color: 'rgba(255,255,255,0.70)' }}>{t('aboutUs.ctaDesc')}</p>
              <Link to="/products" className="relative z-10 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: 'var(--gold)', color: 'var(--navy)', boxShadow: '0 4px 12px rgba(245,166,35,0.40)' }}>
                {t('aboutUs.ctaBtn')} <FiArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Main Card */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 24px rgba(27,47,110,0.08)' }}>
              <div className="p-8 sm:p-12 space-y-12">

                {/* Section 1 — Story */}
                <section id="section-1" className="scroll-mt-28">
                  <SectionHeader title={t('aboutUs.section1Title')} />
                  <p className="text-[15px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {t('aboutUs.section1P1')}
                  </p>
                  <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {t('aboutUs.section1P2')}
                  </p>
                </section>

                <hr style={{ borderColor: 'var(--border-color)' }} />

                {/* Section 2 — Bilona Process */}
                <section id="section-2" className="scroll-mt-28">
                  <SectionHeader title={t('aboutUs.section2Title')} />
                  <p className="text-[15px] leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {t('aboutUs.section2Desc')}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {STEPS.map((step, i) => (
                      <div key={i}
                        className="flex items-start gap-4 p-5 rounded-2xl transition-all"
                        style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.40)'; e.currentTarget.style.background = 'rgba(245,166,35,0.05)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-alt)' }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                          {step.emoji}
                        </div>
                        <div>
                          <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{step.title}</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <hr style={{ borderColor: 'var(--border-color)' }} />

                {/* Section 3 — Journey */}
                <section id="section-3" className="scroll-mt-28">
                  <SectionHeader title={t('aboutUs.section3Title')} />
                  <div className="space-y-0">
                    {TIMELINE.map((item, i) => (
                      <div key={i} className="flex gap-5">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black`}
                            style={i === TIMELINE.length - 1
                              ? { background: 'var(--brand-gradient)', color: 'white', boxShadow: 'var(--shadow-brand)' }
                              : { background: 'var(--bg-alt)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                            {item.year.slice(2)}
                          </div>
                          {i < TIMELINE.length - 1 && (
                            <div className="w-0.5 flex-1 my-1" style={{ background: 'var(--border-color)' }} />
                          )}
                        </div>
                        <div className={`pb-7 ${i === TIMELINE.length - 1 ? 'pb-0' : ''}`}>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.year}</p>
                          <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <hr style={{ borderColor: 'var(--border-color)' }} />

                {/* Section 4 — Promise */}
                <section id="section-4" className="scroll-mt-28">
                  <SectionHeader title={t('aboutUs.section4Title')} />
                  <p className="text-[15px] leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                    {t('aboutUs.section4Desc')}
                  </p>
                  <ul className="space-y-3">
                    {PROMISES.map((p, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: 'rgba(56,161,105,0.12)' }}>
                          <FiCheck size={11} style={{ color: 'var(--success)' }} />
                        </div>
                        <span className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Testimonial */}
                <div className="rounded-2xl p-6" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => <FiStar key={i} size={14} style={{ color: 'var(--gold)' }} />)}
                  </div>
                  <p className="text-[15px] leading-relaxed mb-4 italic" style={{ color: 'var(--text-secondary)' }}>
                    "{t('aboutUs.testimonialComment')}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                      style={{ background: 'var(--gold)', color: 'var(--navy)' }}>P</div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('aboutUs.testimonialName')}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('aboutUs.testimonialRole')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer nav */}
            <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
              <Link to="/" className="text-sm font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                {t('aboutUs.backToHome')}
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                {t('aboutUs.questionsContact')} <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
