import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'

// Shared premium layout for all legal/policy pages
const PolicyPage = ({ icon, accentClass = 'from-orange-400 to-amber-400', tag, title, subtitle, lastUpdated, toc = [], children }) => (
  <div className="min-h-screen" style={{ background:'var(--bg-base)' }}>

    {/* Dark hero */}
    <div className="relative bg-[#0c1120] overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"/>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)', backgroundSize:'56px 56px' }}/>
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
          <div className="w-14 h-14 bg-white/8 border border-white/15 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
            {icon}
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-xs font-bold text-orange-300 tracking-wide uppercase mb-5">
            Legal Document
          </span>
        </motion.div>
        <motion.h1 initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-[1.1]"
          style={{ fontFamily:'Plus Jakarta Sans,sans-serif', letterSpacing:'-0.04em' }}>
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${accentClass}`}>{title}</span>
        </motion.h1>
        {subtitle && (
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.16 }}
            className="text-slate-400 text-sm max-w-sm mx-auto">{subtitle}</motion.p>
        )}
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.22 }}
          className="text-slate-500 text-xs mt-4">
          Last Updated: {lastUpdated}
        </motion.p>
      </div>
    </div>

    {/* Content */}
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className={`grid gap-8 ${toc.length ? 'lg:grid-cols-4' : 'max-w-4xl mx-auto'}`}>

        {/* Table of contents (optional sidebar) */}
        {toc.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgb(0_0_0_/_0.05)] p-5 lg:sticky lg:top-28">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Table of Contents</p>
              <nav className="space-y-1">
                {toc.map((item, i) => (
                  <a key={i} href={`#section-${i+1}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-all group font-medium">
                    <span className="w-5 h-5 rounded-md bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-orange-500 shrink-0 transition-all">{i+1}</span>
                    {item}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className={toc.length ? 'lg:col-span-3' : ''}>
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgb(0_0_0_/_0.06)] overflow-hidden">
            <div className="p-8 sm:p-12 space-y-10 text-[15px] leading-relaxed text-slate-600">
              {children}
            </div>
          </motion.div>

          {/* Footer nav */}
          <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-orange-500 transition-colors font-medium">← Back to Home</Link>
            <Link to="/contact" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-500 transition-colors font-medium">
              Questions? Contact us <FiArrowRight size={13}/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Section component used inside policies
export const PolicySection = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-28">
    <div className="flex items-start gap-4 mb-5">
      <div className="w-1.5 h-8 bg-gradient-to-b from-orange-500 to-amber-400 rounded-full shrink-0 mt-0.5"/>
      <h2 className="text-xl font-extrabold text-slate-900" style={{ fontFamily:'Plus Jakarta Sans,sans-serif', letterSpacing:'-0.02em' }}>{title}</h2>
    </div>
    <div className="pl-5.5 space-y-3">{children}</div>
  </section>
)

// Bullet list item
export const PolicyBullet = ({ children, color = 'text-orange-500' }) => (
  <li className="flex items-start gap-3 text-slate-600">
    <span className={`mt-1.5 shrink-0 text-xs ${color}`}>✦</span>
    <span>{children}</span>
  </li>
)

// Info callout box
export const PolicyCallout = ({ type = 'info', children }) => {
  const styles = {
    info:    'bg-blue-50 border-blue-100 text-blue-800',
    warning: 'bg-amber-50 border-amber-100 text-amber-800',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    tip:     'bg-orange-50 border-orange-100 text-orange-800',
  }
  const icons = { info:'ℹ️', warning:'⚠️', success:'✅', tip:'💡' }
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${styles[type]}`}>
      <span className="shrink-0 text-base">{icons[type]}</span>
      <span>{children}</span>
    </div>
  )
}

export default PolicyPage
