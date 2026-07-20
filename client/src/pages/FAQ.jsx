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
    <div className="w-1 h-8 rounded-full shrink-0 mt-0.5" style={{ background: 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)' }} />
    <h2 className="text-xl font-extrabold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
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
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Helmet>
        <title>{t('faq.pageTitle')} — Daatasa</title>
        <meta name="description" content={t('faq.heroDesc')} />
      </Helmet>

      {/* ── Premium Hero ──────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" style={{ background: 'rgba(245,166,35,0.08)' }} />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>❓</div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border" style={{ background: 'rgba(245,166,35,0.15)', borderColor: 'rgba(245,166,35,0.25)', color: 'var(--gold)' }}>
              {t('faq.pageTitle')}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl font-extrabold mb-4 leading-[1.1] text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}>
            {t('faq.heroTitle').split(' ').slice(0, -1).join(' ')} <span className="shimmer-text">{t('faq.heroTitle').split(' ').slice(-1)[0]}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="text-sm sm:text-base max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {t('faq.heroDesc')}
          </motion.p>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-4 gap-8 items-start">

          {/* ── SIDEBAR ── */}
          <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-28">
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{t('faq.categories')}</p>
              <nav className="space-y-1">
                {SECTIONS.map((s, i) => (
                  <a key={i} href={`#${s.id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all group font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.08)'; e.currentTarget.style.color = 'var(--gold)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 transition-all"
                      style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)' }}>{i + 1}</span>
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{t('faq.stillNeedHelp')}</p>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('faq.cantFindAnswer')}</p>
              <Link to="/contact" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all"
                style={{ background: 'var(--brand-gradient)', color: '#FFFFFF', boxShadow: 'var(--shadow-brand)' }}>
                {t('faq.contactSupport')} <FiArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* ── MAIN CARD ── */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 24px rgba(27,47,110,0.08)' }}>
              <div className="p-8 sm:p-12 space-y-12">
                {SECTIONS.map((section, si) => (
                  <section key={si} id={section.id} className="scroll-mt-28">
                    <SectionHeader emoji={section.emoji} title={section.label} />
                    <div className="space-y-2">
                      {section.faqs.map((faq, qi) => {
                        const key = `${section.id}-${qi}`
                        const isOpen = !!open[key]
                        return (
                          <div key={qi}
                            className="border rounded-2xl overflow-hidden transition-all duration-200"
                            style={{ borderColor: isOpen ? 'rgba(245,166,35,0.40)' : 'var(--border-color)', boxShadow: isOpen ? '0 4px 20px rgba(245,166,35,0.08)' : 'none', background: 'var(--bg-surface)' }}>
                            <button onClick={() => toggle(section.id, qi)}
                              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors gap-4 focus:outline-none"
                              style={{ background: isOpen ? 'rgba(245,166,35,0.02)' : 'transparent' }}
                              onMouseEnter={e => !isOpen && (e.currentTarget.style.background = 'var(--bg-alt)')}
                              onMouseLeave={e => !isOpen && (e.currentTarget.style.background = 'transparent')}>
                              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                                style={{ background: isOpen ? 'var(--gold)' : 'var(--bg-alt)', color: isOpen ? 'var(--navy)' : 'var(--text-muted)' }}>
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <FiChevronDown size={14} />
                                </motion.div>
                              </div>
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                                  <p className="px-5 pb-5 text-sm leading-relaxed border-t pt-3" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>{faq.a}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                    {si < SECTIONS.length - 1 && <hr className="mt-12" style={{ borderColor: 'var(--border-color)' }} />}
                  </section>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
              <Link to="/" className="text-sm font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                {t('faq.backToHome')}
              </Link>
              <a href="mailto:support@daatasa.com" className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <FiMail size={13} /> {t('faq.emailUs')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
