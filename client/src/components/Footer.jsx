import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiInstagram, FiFacebook, FiTwitter, FiLinkedin, FiMail, FiPhone, FiMapPin, FiSend, FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const getNavCols = (t) => [
  {
    title: t('footer.exploreTitle'),
    links: [
      { label: t('footer.exploreAbout'),        to: '/about'    },
      { label: t('footer.exploreProducts'),    to: '/products' },
      { label: t('footer.exploreHowItWorks'),    to: '/support'  },
      { label: t('footer.exploreNews'), to: '/support'  },
      { label: t('footer.exploreContact'),      to: '/contact'  },
    ],
  },
  {
    title: t('footer.quickLinksTitle'),
    links: [
      { label: t('footer.quickPrivacy'),     to: '/privacy-policy' },
      { label: t('footer.quickTerms'), to: '/terms'          },
      { label: t('footer.quickDisclaimer'),         to: '/refund-policy'  },
      { label: t('footer.quickSupport'),            to: '/support'        },
      { label: t('footer.quickFAQ'),                to: '/faq'            },
    ],
  },
]

const SOCIALS = [
  { Icon: FiFacebook,  label: 'Facebook',  href: '#' },
  { Icon: FiTwitter,   label: 'Twitter',   href: '#' },
  { Icon: FiInstagram, label: 'Instagram', href: '#' },
  { Icon: FiLinkedin,  label: 'LinkedIn',  href: '#' },
]

const getContactItems = (t) => [
  { Icon: FiMapPin, text: t('footer.contactAddress') },
  { Icon: FiMail,   text: 'support@daatasa.com',  href: 'mailto:support@daatasa.com' },
  { Icon: FiPhone,  text: '+91 7665306403',      href: 'tel:+917665306403' },
]

export default function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [subState, setSubState] = useState('idle')
  const year = new Date().getFullYear()

  const navCols = useMemo(() => getNavCols(t), [t])
  const contactItems = useMemo(() => getContactItems(t), [t])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return
    setSubState('success')
  }

  return (
    <footer style={{ background: 'var(--bg-navy)', position: 'relative', overflow: 'hidden' }} role="contentinfo">

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.5) 0%, transparent 70%)', filter: 'blur(80px)', transform: 'translate(-30%, -30%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', filter: 'blur(70px)', transform: 'translate(30%, 30%)' }} />

      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,35,0.60), rgba(27,47,110,0.40), rgba(245,166,35,0.60), transparent)' }} />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Wave separator at top */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%', height: '60px', marginTop: '-1px' }}
          preserveAspectRatio="none">
          <path d="M0 60 C360 0 1080 0 1440 60 L1440 0 L0 0 Z" fill="var(--bg-alt)" />
        </svg>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">

          {/* Contact Column */}
          <div className="lg:col-span-3">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-7 group">
              <img 
                src="/logo_rectangle.png" 
                alt="Daatasa Logo" 
                className="h-20 sm:h-24 w-auto transition-transform duration-300 group-hover:scale-[1.02]" 
              />
            </Link>

            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] mb-5" style={{ color: 'var(--gold)' }}>
              {t('footer.contactHeading')}
            </h4>

            <ul className="space-y-4">
              {contactItems.map(({ Icon, text, href }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <Icon size={13} style={{ color: 'var(--gold)' }} />
                  </div>
                  {href
                    ? <a href={href} className="text-sm transition-colors leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.70)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}
                      >{text}</a>
                    : <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.70)' }}>{text}</span>
                  }
                </li>
              ))}
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 mt-7">
              {SOCIALS.map(({ Icon, label, href }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-250"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.10)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--gold)'
                    e.currentTarget.style.color = 'var(--navy)'
                    e.currentTarget.style.borderColor = 'var(--gold)'
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(245,166,35,0.35)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-8">
            {navCols.map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] mb-5" style={{ color: 'var(--gold)' }}>
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link to={link.to}
                        className="text-sm transition-colors duration-200 leading-relaxed flex items-center gap-2 group"
                        style={{ color: 'rgba(255,255,255,0.68)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.68)'}>
                        <FiArrowRight size={12} className="shrink-0 transition-transform group-hover:translate-x-1"
                          style={{ color: 'var(--gold)', opacity: 0.7 }} />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] mb-4" style={{ color: 'var(--gold)' }}>
              {t('footer.newsletterTitle')}
            </h4>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.68)' }}>
              {t('footer.newsletterDesc')}
            </p>

            {subState === 'success' ? (
              <div className="px-4 py-4 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(56,161,105,0.15)', border: '1px solid rgba(56,161,105,0.30)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--success)' }}>
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-sm font-semibold" style={{ color: '#68D391' }}>
                  {t('footer.newsletterSuccess')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe}>
                <div className="relative mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('footer.newsletterInput')}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.92)',
                      color: 'var(--navy)',
                      border: '2px solid transparent',
                      paddingRight: '16px',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
                  />
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--gold)',
                    color: 'var(--navy)',
                    boxShadow: '0 6px 20px rgba(245,166,35,0.40)',
                    border: 'none',
                    cursor: 'pointer',
                  }}>
                  <FiSend size={14} />
                  {t('footer.newsletterBtn')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {t('footer.copyright', { year })}
          </p>
        </div>
      </div>
    </footer>
  )
}
