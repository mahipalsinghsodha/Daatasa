import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle,
  FiUser, FiMessageSquare, FiClock, FiInstagram,
  FiFacebook, FiTwitter,
} from 'react-icons/fi'

// ── Brand Tokens ──────────────────────────────────────────────────────────────
const C = {
  orange:      '#e8621a',
  orangeHov:   '#cf5618',
  orangeLight: '#fff4ee',
  orangeMid:   '#fddcca',
  bg:          '#f2f4f6',
  white:       '#ffffff',
  text:        '#1a1a2e',
  textMid:     '#444455',
  textLight:   '#8899aa',
  border:      '#e4e9f0',
  shadow:      '0 2px 12px rgba(0,0,0,0.07)',
  shadowMd:    '0 8px 32px rgba(0,0,0,0.11)',
  green:       '#16a34a', greenBg: '#dcfce7',
  red:         '#dc2626', redBg:   '#fee2e2',
  grayBg:      '#f1f5f9',
  font:        "'Plus Jakarta Sans', system-ui, sans-serif",
}

const useW = () => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
})

// ── Styled Field ──────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, error, as = 'input', ...props }) => {
  const [focused, setFocused] = useState(false)
  const Tag = as
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={14} style={{ position: 'absolute', left: 13, top: as === 'textarea' ? 14 : '50%', transform: as === 'textarea' ? 'none' : 'translateY(-50%)', color: focused ? C.orange : C.textLight, transition: 'color 0.2s', pointerEvents: 'none' }} />
        )}
        <Tag
          {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e) }}
          onBlur={e => { setFocused(false); props.onBlur?.(e) }}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: `1.5px solid ${error ? C.red : focused ? C.orange : C.border}`,
            borderRadius: 11, padding: `11px 14px 11px ${Icon ? '36px' : '14px'}`,
            fontSize: 14, color: C.text, outline: 'none',
            fontFamily: C.font, background: C.white, transition: 'border-color 0.2s',
            resize: as === 'textarea' ? 'vertical' : undefined,
            minHeight: as === 'textarea' ? 130 : undefined,
          }}
        />
      </div>
      {error && <p style={{ margin: '5px 0 0', fontSize: 12, color: C.red }}>{error}</p>}
    </div>
  )
}

// ── Info Card ─────────────────────────────────────────────────────────────────
const InfoCard = ({ icon: Icon, title, lines, color = C.orange }) => (
  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '18px 20px', background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadow }}>
    <div style={{ width: 42, height: 42, borderRadius: 12, background: C.orangeLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>{l}</div>
      ))}
    </div>
  </div>
)

// ── Main ──────────────────────────────────────────────────────────────────────
const Contact = () => {
  const w         = useW()
  const isMobile  = w < 640
  const isDesktop = w >= 1024

  const [form, setForm]       = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')

  const onChange = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Name is required'
    if (!form.email.trim())   e.email   = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError('')
    try {
      await axios.post('/api/contact', form)
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const SUBJECTS = ['Order Inquiry', 'Product Question', 'Bulk Order', 'Return / Refund', 'Partnership', 'Other']

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1810 60%, #3d2010 100%)', padding: isMobile ? '48px 20px' : '72px 24px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(232,98,26,0.15) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(232,98,26,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <motion.div {...fadeUp(0)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,98,26,0.15)', border: '1px solid rgba(232,98,26,0.3)', padding: '5px 14px', borderRadius: 20, marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
            <span style={{ color: C.orange, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>WE'RE HERE TO HELP</span>
          </motion.div>
          <motion.h1 {...fadeUp(0.08)} style={{ margin: '0 0 14px', fontSize: isMobile ? 'clamp(26px,8vw,34px)' : 'clamp(32px,4vw,48px)', fontWeight: 900, color: '#fff', lineHeight: 1.12, letterSpacing: '-0.02em' }}>
            Get in Touch with<br /><span style={{ color: C.orange }}>Ghee Store</span>
          </motion.h1>
          <motion.p {...fadeUp(0.14)} style={{ margin: 0, fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 480, marginInline: 'auto' }}>
            Have a question about our products, a bulk order inquiry, or just want to say hello? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '28px 14px' : '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 400px' : '1fr', gap: isMobile ? 22 : 32, alignItems: 'start' }}>

          {/* ── Left: Form ─────────────────────────────────────────────── */}
          <motion.div {...fadeUp(0)}>
            <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: C.shadowMd }}>
              {/* Form header */}
              <div style={{ padding: isMobile ? '18px 18px' : '22px 28px', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: C.orange, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiMessageSquare size={18} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text }}>Send us a Message</h2>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textLight }}>We reply within 24 hours</p>
                </div>
              </div>

              {/* Success state */}
              <AnimatePresence>
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ margin: '20px 28px 0', padding: '16px 18px', background: C.greenBg, border: `1.5px solid ${C.greenMid || '#86efac'}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: C.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheckCircle size={18} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: C.green }}>Message Sent! 🎉</div>
                      <div style={{ fontSize: 13, color: C.green, opacity: 0.8 }}>Thank you for reaching out. We'll get back to you shortly.</div>
                    </div>
                    <button onClick={() => setSuccess(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: C.green, fontSize: 18, lineHeight: 1 }}>×</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* API Error */}
              <AnimatePresence>
                {apiError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ margin: '20px 28px 0', padding: '12px 16px', background: C.redBg, border: `1.5px solid ${C.red}30`, borderRadius: 10, fontSize: 13, color: C.red, fontWeight: 600 }}>
                    {apiError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: isMobile ? '20px 18px' : '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Name + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <Field label="Full Name" icon={FiUser} name="name" placeholder="Your full name" value={form.name} onChange={onChange} error={errors.name} />
                  <Field label="Email Address" icon={FiMail} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} error={errors.email} />
                </div>

                {/* Phone + Subject */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <Field label="Phone (Optional)" icon={FiPhone} type="tel" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={onChange} />
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subject</label>
                    <select name="subject" value={form.subject} onChange={onChange}
                      style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${errors.subject ? C.red : C.border}`, borderRadius: 11, padding: '11px 14px', fontSize: 14, color: form.subject ? C.text : C.textLight, outline: 'none', fontFamily: C.font, background: C.white, transition: 'border-color 0.2s', cursor: 'pointer' }}
                      onFocus={e => e.target.style.borderColor = C.orange}
                      onBlur={e => e.target.style.borderColor = errors.subject ? C.red : C.border}>
                      <option value="">Select a subject</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.subject && <p style={{ margin: '5px 0 0', fontSize: 12, color: C.red }}>{errors.subject}</p>}
                  </div>
                </div>

                {/* Message */}
                <Field label="Your Message" icon={FiMessageSquare} as="textarea" name="message" placeholder="Tell us how we can help you…" value={form.message} onChange={onChange} error={errors.message} />

                {/* Submit */}
                <motion.button
                  type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  style={{ padding: '14px', background: loading ? '#f0a070' : C.orange, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: C.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: loading ? 'none' : '0 6px 20px rgba(232,98,26,0.35)', transition: 'background 0.2s' }}>
                  {loading ? (
                    <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Sending…</>
                  ) : (
                    <><FiSend size={16} /> Send Message</>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* ── Right: Info Column ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Contact info cards */}
            <motion.div {...fadeUp(0.08)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InfoCard icon={FiMail} title="Email Us" lines={['support@gheestore.in', 'orders@gheestore.in']} />
                <InfoCard icon={FiPhone} title="Call / WhatsApp" lines={['+91 98765 43210', 'Mon – Sat, 9 AM – 6 PM IST']} />
                <InfoCard icon={FiMapPin} title="Our Address" lines={['123, Dairy Lane, Andheri West,', 'Mumbai, Maharashtra – 400058, India']} />
                <InfoCard icon={FiClock} title="Business Hours" lines={['Monday – Saturday: 9:00 AM – 6:00 PM', 'Sunday: Closed']} />
              </div>
            </motion.div>

            {/* Social links */}
            <motion.div {...fadeUp(0.14)}>
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: C.shadow }}>
                <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: C.textMid }}>Follow Us</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { icon: FiInstagram, label: 'Instagram', color: '#e1306c', bg: '#fce4ec' },
                    { icon: FiFacebook,  label: 'Facebook',  color: '#1877f2', bg: '#dbeafe' },
                    { icon: FiTwitter,   label: 'Twitter',   color: '#1da1f2', bg: '#e0f2fe' },
                  ].map(s => (
                    <motion.a key={s.label} href="#" whileHover={{ y: -2 }}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', background: s.bg, borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s' }}>
                      <s.icon size={20} style={{ color: s.color }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Map embed placeholder */}
            <motion.div {...fadeUp(0.2)}>
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1810)', height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <FiMapPin size={32} style={{ color: C.orange }} />
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>Mumbai, Maharashtra</span>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                    style={{ marginTop: 4, padding: '7px 16px', background: C.orange, borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                    Open in Maps ↗
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── FAQ Strip ────────────────────────────────────────────────────── */}
      <section style={{ background: C.white, borderTop: `1.5px solid ${C.border}`, padding: isMobile ? '40px 16px' : '60px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 40 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: isMobile ? 22 : 28, fontWeight: 900, letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
            <p style={{ color: C.textLight, fontSize: 14 }}>Quick answers before you reach out</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            {[
              { q: 'What is the difference between A1 and A2 ghee?', a: 'A1 ghee is made from HF/Jersey cow milk, while A2 ghee comes from desi Indian breeds like Gir cow. A2 is easier to digest and preferred by health enthusiasts.' },
              { q: 'Do you offer bulk / wholesale pricing?', a: 'Yes! We offer special pricing for bulk orders above 10 kg. Please use the contact form above with subject "Bulk Order" and our team will reach out.' },
              { q: 'How is the ghee packaged and shipped?', a: 'All our ghee is packed in food-grade, tamper-proof glass jars and shipped in insulated packaging to preserve freshness across India.' },
              { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for damaged or incorrect items. Contact us with your order ID and photos of the product.' },
            ].map((faq, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}>
                <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, background: C.orange, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>Q</span>
                    </div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: C.text, lineHeight: 1.4 }}>{faq.q}</p>
                  </div>
                  <p style={{ margin: '0 0 0 32px', fontSize: 13, color: C.textLight, lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
