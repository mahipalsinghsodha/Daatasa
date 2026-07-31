import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiArrowRight, FiMail } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'

const getSections = (t) => [
  {
    id: 'section-1',
    label: t('faq.sec1Label'),
    emoji: '🔬',
    faqs: [
      { q: t('faq.sec1q1'), a: t('faq.sec1a1') },
      { q: t('faq.sec1q2'), a: t('faq.sec1a2') },
      { q: t('faq.sec1q3'), a: t('faq.sec1a3') },
    ]
  },
  {
    id: 'section-2',
    label: t('faq.sec2Label'),
    emoji: '🚚',
    faqs: [
      { q: t('faq.sec2q1'), a: t('faq.sec2a1') },
      { q: t('faq.sec2q2'), a: t('faq.sec2a2') },
      { q: t('faq.sec2q3'), a: t('faq.sec2a3') },
    ]
  },
  {
    id: 'section-3',
    label: t('faq.sec3Label'),
    emoji: '↩️',
    faqs: [
      { q: t('faq.sec3q1'), a: t('faq.sec3a1') },
      { q: t('faq.sec3q2'), a: t('faq.sec3a2') },
    ]
  },
  {
    id: 'section-4',
    label: t('faq.sec4Label'),
    emoji: '📦',
    faqs: [
      { q: t('faq.sec4q1'), a: t('faq.sec4a1') },
      { q: t('faq.sec4q2'), a: t('faq.sec4a2') },
    ]
  },
]

const SectionHeader = ({ emoji, title }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="w-1 h-8 rounded-full shrink-0 mt-0.5 bg-gradient-to-b from-brand-secondary to-brand-secondary/80" />
    <h2 className="text-xl font-extrabold flex items-center gap-2.5 text-brand-primary font-display -tracking-[0.02em]">
      <span>{emoji}</span> {title}
    </h2>
  </div>
)

export default function FAQ() {
  const { t } = useTranslation()
  const SECTIONS = useMemo(() => getSections(t), [t])
  const [open, setOpen] = useState({})
  const toggle = (sid, qi) => setOpen(p => ({ ...p, [`${sid}-${qi}`]: !p[`${sid}-${qi}`] }))

  return (
    <div className="min-h-screen bg-[var(--ivory)] font-sans text-brand-text">
      <Helmet>
        <title>{t('faq.pageTitle')} — Daatasa</title>
        <meta name="description" content={t('faq.heroDesc')} />
      </Helmet>

      {/* ── Premium Hero ──────────────────────────── */}
      <div className="relative overflow-hidden bg-white text-brand-primary border-b border-brand-primary/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none bg-brand-secondary/10" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, var(--brand-primary) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-brand-primary/10 bg-brand-primary/5 text-brand-primary">
              <span className="text-[12px]">❓</span>
              {t('faq.pageTitle')}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl font-extrabold mb-4 leading-[1.1] text-brand-primary font-display -tracking-[0.04em]">
            {t('faq.heroTitle').split(' ').slice(0, -1).join(' ')} <span className="text-brand-secondary italic">{t('faq.heroTitle').split(' ').slice(-1)[0]}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="text-sm max-w-sm mx-auto text-brand-text/60 font-medium">
            {t('faq.heroDesc')}
          </motion.p>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-4 gap-8 items-start">

          {/* ── SIDEBAR ── */}
          <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-28">
            <div className="rounded-[1.5rem] p-6 bg-white border border-brand-primary/10 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-brand-text/50">{t('faq.categories')}</p>
              <nav className="space-y-1">
                {SECTIONS.map((s, i) => (
                  <a key={i} href={`#${s.id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all font-bold text-brand-text/70 hover:bg-brand-secondary/10 hover:text-brand-primary">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 transition-all bg-[var(--ivory)] text-brand-text/40">{i + 1}</span>
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="rounded-[1.5rem] p-6 bg-white border border-brand-primary/10 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-brand-text/50">{t('faq.stillNeedHelp')}</p>
              <p className="text-sm mb-5 leading-relaxed text-brand-text/70 font-medium">{t('faq.cantFindAnswer')}</p>
              <Link to="/contact" className="btn btn-primary w-full h-12 rounded-full inline-flex items-center justify-center gap-2 shadow-gold text-sm">
                {t('faq.contactSupport')} <FiArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* ── MAIN CARD ── */}
          <div className="lg:col-span-3">
            <div className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-white border border-brand-primary/10 shadow-sm">
              <div className="p-6 xs:p-8 sm:p-12 space-y-12">
                {SECTIONS.map((section, si) => (
                  <section key={si} id={section.id} className="scroll-mt-28">
                    <SectionHeader emoji={section.emoji} title={section.label} />
                    <div className="space-y-3">
                      {section.faqs.map((faq, qi) => {
                        const key = `${section.id}-${qi}`
                        const isOpen = !!open[key]
                        return (
                          <div key={qi}
                            className={`border rounded-2xl overflow-hidden transition-all duration-200 bg-[var(--ivory)] ${isOpen ? 'border-brand-secondary/40 shadow-sm' : 'border-brand-primary/5 hover:border-brand-primary/20'}`}>
                            <button onClick={() => toggle(section.id, qi)}
                              className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors gap-4 focus:outline-none ${isOpen ? 'bg-brand-secondary/5' : 'bg-transparent'}`}>
                              <span className="text-sm font-bold text-brand-primary">{faq.q}</span>
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${isOpen ? 'bg-brand-secondary text-brand-primary' : 'bg-white border border-brand-primary/10 text-brand-text/50'}`}>
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <FiChevronDown size={16} />
                                </motion.div>
                              </div>
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                                  <p className="px-6 pb-6 text-sm leading-relaxed border-t border-brand-primary/5 pt-4 text-brand-text/70 font-medium">{faq.a}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                       })}
                    </div>
                    {si < SECTIONS.length - 1 && <hr className="mt-12 border-brand-primary/10" />}
                  </section>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-between items-center px-4">
              <Link to="/" className="text-sm font-bold transition-colors text-brand-text/50 hover:text-brand-secondary">
                {t('faq.backToHome')}
              </Link>
              <a href="mailto:support@daatasa.com" className="inline-flex items-center gap-2 text-sm font-bold transition-colors text-brand-text/50 hover:text-brand-secondary">
                <FiMail size={13} /> {t('faq.emailUs')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
