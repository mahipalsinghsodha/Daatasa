import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

// Shared premium layout for all legal/policy pages
const PolicyPage = ({ icon, tag = 'Legal Document', title, subtitle, lastUpdated, toc = [], children }) => {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Premium Hero */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" style={{ background: 'rgba(245,166,35,0.08)' }} />
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {icon}
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border" style={{ background: 'rgba(245,166,35,0.15)', borderColor: 'rgba(245,166,35,0.25)', color: 'var(--gold)' }}>
              {tag}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}>
            <span className="shimmer-text">{title}</span>
          </motion.h1>
          {subtitle && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
              className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>{subtitle}</motion.p>
          )}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
            className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Last Updated: {lastUpdated}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`grid gap-8 ${toc.length ? 'lg:grid-cols-4' : 'max-w-4xl mx-auto'}`}>

          {/* Table of contents */}
          {toc.length > 0 && (
            <div className="lg:col-span-1">
              <div className="rounded-2xl p-5 lg:sticky lg:top-28" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>{t('policy.toc')}</p>
                <nav className="space-y-1">
                  {toc.map((item, i) => (
                    <a key={i} href={`#section-${i + 1}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all group font-medium"
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
            </div>
          )}

          {/* Main content */}
          <div className={toc.length ? 'lg:col-span-3' : ''}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-3xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 24px rgba(27,47,110,0.06)' }}>
              <div className="p-8 sm:p-12 space-y-10 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {children}
              </div>
            </motion.div>

            {/* Footer nav */}
            <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
              <Link to="/" className="text-sm font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{t('policy.backToHome')}</Link>
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                {t('policy.questionsContact')} <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// Section component used inside policies
export const PolicySection = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-28">
    <div className="flex items-start gap-4 mb-5">
      <div className="w-1 h-8 rounded-full shrink-0 mt-0.5" style={{ background: 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)' }} />
      <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{title}</h2>
    </div>
    <div className="pl-5 space-y-3">{children}</div>
  </section>
)

// Bullet list item
export const PolicyBullet = ({ children, color = 'var(--gold)' }) => (
  <li className="flex items-start gap-3">
    <span className="mt-1.5 shrink-0 text-xs" style={{ color }}>✦</span>
    <span>{children}</span>
  </li>
)

// Info callout box
export const PolicyCallout = ({ type = 'info', children }) => {
  const styles = {
    info:    { bg: 'rgba(49,130,206,0.08)', border: 'rgba(49,130,206,0.15)', color: 'var(--info)' },
    warning: { bg: 'rgba(214,158,46,0.08)', border: 'rgba(214,158,46,0.15)', color: 'var(--warning)' },
    success: { bg: 'rgba(56,161,105,0.08)', border: 'rgba(56,161,105,0.15)', color: 'var(--success)' },
    tip:     { bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.15)', color: 'var(--gold)' },
  }
  const icons = { info: 'ℹ️', warning: '⚠️', success: '✅', tip: '💡' }
  const s = styles[type]
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border text-sm font-medium"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}>
      <span className="shrink-0 text-base">{icons[type]}</span>
      <span style={{ color: 'var(--text-secondary)' }}>{children}</span>
    </div>
  )
}

export default PolicyPage

