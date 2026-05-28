// pages/AboutUs.jsx — Premium Redesign
import { motion } from 'framer-motion'
import { FiCheck, FiArrowRight, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const STEPS = [
  { emoji: '🥛', title: 'Fresh A2 Milk',  desc: 'Sourced from free-grazing desi cows on our partner farms every morning.' },
  { emoji: '🫙', title: 'Curd & Churn',   desc: 'Milk is cultured into curd, then hand-churned in wooden bilona vats.' },
  { emoji: '🔥', title: 'Slow-Cooked',    desc: 'Extracted butter is slow-heated over a low flame until golden ghee forms.' },
  { emoji: '✅', title: 'Lab Tested',      desc: 'Every batch passes FSSAI-certified lab tests before dispatch.' },
]

const PROMISES = [
  'No preservatives, no artificial colours, no hidden chemicals.',
  'Our cows graze freely and are never injected with hormones.',
  'Every batch is rigorously lab-tested for purity and safety.',
  'Delivered fresh in food-safe, tamper-evident packaging.',
  'Carbon-neutral packaging initiative since 2024.',
]

const TIMELINE = [
  { year: '2019', title: 'The Idea',        desc: 'A family tired of adulterated supermarket ghee decides to go back to roots.' },
  { year: '2020', title: 'First Batch',     desc: 'Our first Bilona ghee is made on the farm — sold out in 3 days.' },
  { year: '2021', title: 'Online Launch',   desc: 'DhaniFresh.com goes live. 500 families order in the first month.' },
  { year: '2022', title: 'FSSAI Certified', desc: 'After rigorous lab testing, we earn full FSSAI certification.' },
  { year: '2023', title: 'Pan India',       desc: 'Now serving 5,000+ families across all major Indian cities.' },
  { year: '2024', title: 'Eco Packaging',   desc: 'Launched biodegradable, carbon-neutral packaging across all products.' },
]

const STATS = [
  { value: '5,000+', label: 'Happy Families' },
  { value: '100%',   label: 'Pure & Natural' },
  { value: '4.9★',   label: 'Average Rating' },
  { value: 'FSSAI',  label: 'Certified Quality' },
]

const TOC = ['Our Story', 'The Bilona Process', 'Our Journey', 'Our Promise']

const SectionHeader = ({ title }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-1 h-8 rounded-full shrink-0 mt-0.5"
      style={{ background: 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)' }} />
    <h2 className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</h2>
  </div>
)

export default function AboutUs() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Helmet>
        <title>About Us — DhaniFresh Pure Bilona Ghee</title>
        <meta name="description" content="Learn about DhaniFresh — our story, the traditional Bilona process, and our promise of 100% pure, natural desi ghee." />
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
              Our Story
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl font-extrabold mb-4 leading-[1.1] text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            About <span className="shimmer-text">DhaniFresh</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="text-sm sm:text-base max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Bringing pure traditional Bilona ghee from our farms to your family's table.
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
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>On This Page</p>
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
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>By the Numbers</p>
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
              <p className="text-white font-extrabold text-base mb-1 relative z-10" style={{ fontFamily: 'var(--font-display)' }}>Try it today</p>
              <p className="text-xs mb-4 relative z-10" style={{ color: 'rgba(255,255,255,0.70)' }}>Join 5,000+ happy families.</p>
              <Link to="/products" className="relative z-10 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: 'var(--gold)', color: 'var(--navy)', boxShadow: '0 4px 12px rgba(245,166,35,0.40)' }}>
                Shop Now <FiArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Main Card */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 24px rgba(27,47,110,0.08)' }}>
              <div className="p-8 sm:p-12 space-y-12">

                {/* Section 1 — Story */}
                <section id="section-1" className="scroll-mt-28">
                  <SectionHeader title="Our Story" />
                  <p className="text-[15px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    DhaniFresh was born from a simple frustration — the market was flooded with processed ghee alternatives lacking the rich aroma, texture, and health benefits of traditionally churned ghee. What started as a kitchen experiment became a family mission.
                  </p>
                  <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    We set out to bridge the gap between ancient Vedic wisdom and modern convenience — delivering FSSAI-certified, lab-tested, pure Bilona ghee right to your doorstep. No shortcuts. No additives. Just tradition in every jar.
                  </p>
                </section>

                <hr style={{ borderColor: 'var(--border-color)' }} />

                {/* Section 2 — Bilona Process */}
                <section id="section-2" className="scroll-mt-28">
                  <SectionHeader title="The Bilona Process" />
                  <p className="text-[15px] leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                    We strictly follow the ancient Vedic Bilona method — the only method that preserves the true nutritional value of ghee:
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
                  <SectionHeader title="Our Journey" />
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
                  <SectionHeader title="Our Promise" />
                  <p className="text-[15px] leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                    Every jar of DhaniFresh ghee is a commitment — to you, to the cows, and to the planet:
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
                    "The aroma when I open the jar is absolutely divine. You can taste the difference — this is how ghee is supposed to be made."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                      style={{ background: 'var(--gold)', color: 'var(--navy)' }}>P</div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Priya Sharma</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mumbai · Verified Customer</p>
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
                ← Back to Home
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                Questions? Contact us <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
