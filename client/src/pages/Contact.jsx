// pages/Contact.jsx — Premium Redesign
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle } from 'lucide-react'
import { FiArrowRight } from 'react-icons/fi'
import api from '../api/axios'
import { toast } from 'react-toastify'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

const Field = ({ id, label, type = 'text', value, onChange, required, isTextarea }) => {
  const [focused, setFocused] = useState(false)
  const isLifted = focused || value.length > 0
  const commonProps = {
    id, value, onChange, required, placeholder: ' ',
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      paddingTop: isTextarea ? '24px' : '20px', paddingBottom: '8px',
      background: focused ? '#FEFEFE' : 'var(--bg-surface)',
      border: `2px solid ${focused ? 'var(--gold)' : 'var(--border-color)'}`,
      boxShadow: focused ? '0 0 0 4px rgba(245,166,35,0.12)' : 'none',
      color: 'var(--text-primary)', borderRadius: '14px',
    },
  }
  return (
    <div className="relative">
      {isTextarea
        ? <textarea {...commonProps} maxLength={2000} className="w-full px-3.5 text-sm font-medium outline-none transition-all" rows={5} style={{ ...commonProps.style, minHeight: '120px', resize: 'none' }} />
        : <input {...commonProps} type={type} className="w-full h-14 px-3.5 text-sm font-medium outline-none transition-all" />
      }
      <label htmlFor={id}
        className="absolute left-3.5 pointer-events-none transition-all duration-200"
        style={{
          top: isLifted ? (isTextarea ? '10px' : '8px') : '50%',
          transform: isLifted ? 'none' : 'translateY(-50%)',
          fontSize: isLifted ? '11px' : '14px',
          fontWeight: isLifted ? 700 : 500,
          color: focused ? 'var(--gold)' : 'var(--text-muted)',
          letterSpacing: isLifted ? '0.03em' : 'normal',
        }}>
        {label}{required ? ' *' : ''}
      </label>
      {isTextarea && (
        <div className="absolute right-3.5 -bottom-6 text-[10px] font-medium transition-colors"
             style={{ color: value.length >= 2000 ? 'var(--danger)' : 'var(--text-muted)' }}>
          {value.length}/2000
        </div>
      )}
    </div>
  )
}

const ContactRow = ({ icon: Icon, label, value, href }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl transition-all"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.40)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: 'rgba(245,166,35,0.12)' }}>
      <Icon size={18} style={{ color: 'var(--gold)' }} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {href
        ? <a href={href} className="text-[14px] font-medium transition-colors truncate block"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>{value}</a>
        : <p className="text-[14px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
      }
    </div>
  </div>
)

export default function Contact() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) { toast.error(t('contact.formError')); return }
    setSending(true)
    try {
      await api.post('/api/contact', form)
      setSent(true)
      toast.success(t('contact.formSuccess'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('contact.formFailed'))
    } finally { setSending(false) }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Helmet>
        <title>{t('contact.pageTitle')}</title>
        <meta name="description" content={t('contact.pageDesc')} />
      </Helmet>

      {/* ── Premium Hero ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-10 right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.30) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.5 }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(245,166,35,0.18)', border: '1px solid rgba(245,166,35,0.30)' }}>
              <MessageCircle size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
              style={{ background: 'rgba(245,166,35,0.18)', borderColor: 'rgba(245,166,35,0.30)', color: 'var(--gold)' }}>
              {t('contact.heroTag')}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl font-extrabold mb-3 text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            {t('contact.heroTitle').split(' ')[0]} <span className="shimmer-text">{t('contact.heroTitle').split(' ').slice(1).join(' ')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="text-sm sm:text-base max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {t('contact.heroDesc')}
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="var(--bg-base)" />
          </svg>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-14">
        <div className="grid md:grid-cols-5 gap-8">

          {/* Form */}
          <div className="md:col-span-3">
            <div className="rounded-3xl p-7 sm:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 8px 40px rgba(27,47,110,0.10)' }}>
              {sent ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
                  <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(56,161,105,0.12)', color: 'var(--success)' }}>
                    <CheckCircle size={32} />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{t('contact.msgSent')}</h3>
                  <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {t('contact.msgSentDesc')}
                  </p>
                  <button onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setSent(false) }}
                    className="btn btn-secondary text-sm">
                    {t('contact.sendAnother')}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{t('contact.formTitle')}</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('contact.formDesc')}</p>
                  </div>
                  <Field id="con-name"    label={t('contact.nameLabel')}     value={form.name}    onChange={set('name')}    required />
                  <Field id="con-email"   label={t('contact.emailLabel')} type="email" value={form.email} onChange={set('email')}   required />
                  <Field id="con-subject" label={t('contact.subjectLabel')}       value={form.subject} onChange={set('subject')} />
                  <Field id="con-message" label={t('contact.messageLabel')}  value={form.message} onChange={set('message')} required isTextarea />

                  <button type="submit" disabled={sending}
                    className="w-full h-13 font-extrabold text-[15px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] mt-2"
                    style={{ height: '52px', background: 'var(--brand-gradient)', color: '#FFFFFF', boxShadow: 'var(--shadow-brand)', borderRadius: '14px', border: 'none', cursor: sending ? 'not-allowed' : 'pointer' }}>
                    {sending
                      ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      : <><Send size={16} /> {t('contact.btnSend')}</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-2 space-y-3">
            <ContactRow icon={Mail}   label={t('contact.infoEmail')}   value="support@daatasa.com" href="mailto:support@daatasa.com" />
            <ContactRow icon={Phone}  label={t('contact.infoPhone')}   value="+91 7665306403"          href="tel:+917665306403" />
            <ContactRow icon={MapPin} label={t('contact.infoAddress')} value="Bakhtawar singh ki dhani, Khuri, Jaisalmer, Rajasthan" />

            {/* Business Hours */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(245,166,35,0.12)' }}>
                  <Clock size={14} style={{ color: 'var(--gold)' }} />
                </div>
                <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{t('contact.hoursTitle')}</p>
              </div>
              {[
                { days: t('contact.monFri'), hours: '9:00 AM – 6:00 PM' },
                { days: t('contact.sat'),        hours: '10:00 AM – 4:00 PM' },
                { days: t('contact.sun'),          hours: t('contact.closed') },
              ].map(row => (
                <div key={row.days} className="flex justify-between items-center py-2"
                  style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{row.days}</span>
                  <span className="text-[13px] font-semibold"
                    style={{ color: row.hours === t('contact.closed') ? 'var(--danger)' : 'var(--text-primary)' }}>{row.hours}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3 pt-1">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
                <span className="text-[12px] font-semibold" style={{ color: 'var(--success)' }}>{t('contact.openNow')}</span>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden mt-3" style={{ border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <iframe 
                src="https://maps.google.com/maps?q=26.3217375,70.6166729&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="220" 
                style={{ border: 0, display: 'block' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
