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
      paddingTop: isTextarea ? '24px' : '20px', paddingBottom: '8px'
    }
  }
  return (
    <div className="relative">
      {isTextarea
        ? <textarea {...commonProps} maxLength={2000} className={`w-full px-4 text-sm font-medium outline-none transition-all rounded-[1rem] bg-white border ${focused ? 'border-brand-secondary ring-1 ring-brand-secondary/30' : 'border-brand-primary/20'} text-brand-primary`} rows={5} style={{ ...commonProps.style, minHeight: '120px', resize: 'none' }} />
        : <input {...commonProps} type={type} className={`w-full h-14 px-4 text-sm font-medium outline-none transition-all rounded-[1rem] bg-white border ${focused ? 'border-brand-secondary ring-1 ring-brand-secondary/30' : 'border-brand-primary/20'} text-brand-primary`} />
      }
      <label htmlFor={id}
        className={`absolute left-4 pointer-events-none transition-all duration-200 ${focused ? 'text-brand-secondary' : 'text-brand-text/40'}`}
        style={{
          top: isLifted ? (isTextarea ? '10px' : '8px') : '50%',
          transform: isLifted ? 'none' : 'translateY(-50%)',
          fontSize: isLifted ? '10px' : '14px',
          fontWeight: isLifted ? 700 : 500,
          letterSpacing: isLifted ? '0.1em' : 'normal',
          textTransform: isLifted ? 'uppercase' : 'none'
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
  <div className="flex items-center gap-4 p-5 rounded-[1.5rem] transition-all bg-white border border-brand-primary/10 shadow-sm hover:border-brand-secondary/40 hover:-translate-y-0.5 hover:shadow-md group">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-brand-secondary/10 group-hover:bg-brand-secondary/20 transition-colors">
      <Icon size={20} className="text-brand-secondary" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-brand-text/50">{label}</p>
      {href
        ? <a href={href} className="text-sm font-bold transition-colors truncate block text-brand-primary group-hover:text-brand-secondary">{value}</a>
        : <p className="text-sm font-bold truncate text-brand-primary">{value}</p>
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
    <div className="min-h-screen bg-[var(--ivory)] font-sans text-brand-text">
      <Helmet>
        <title>{t('contact.pageTitle')}</title>
        <meta name="description" content={t('contact.pageDesc')} />
      </Helmet>

      {/* ── Premium Hero ── */}
      <div className="relative overflow-hidden bg-white text-brand-primary border-b border-brand-primary/5">
        <div className="absolute top-10 right-20 w-72 h-72 rounded-full pointer-events-none bg-brand-secondary/10 blur-[60px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, var(--brand-primary) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-brand-primary/10 bg-brand-primary/5 text-brand-primary">
              <MessageCircle size={14} className="text-brand-primary" />
              {t('contact.heroTag')}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl font-extrabold mb-3 text-brand-primary font-display -tracking-[0.03em]">
            {t('contact.heroTitle').split(' ')[0]} <span className="text-brand-secondary italic">{t('contact.heroTitle').split(' ').slice(1).join(' ')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="text-sm max-w-sm mx-auto text-brand-text/60 font-medium">
            {t('contact.heroDesc')}
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="block w-full h-[60px]">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="var(--ivory)" />
          </svg>
        </div>
      </div>

      <div className="max-w-[800px] lg:max-w-[1000px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-[2rem] p-8 sm:p-10 bg-white border border-brand-primary/10 shadow-sm">
              {sent ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
                  <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-[1.5rem] mx-auto mb-6 flex items-center justify-center bg-green-50 text-green-500">
                    <CheckCircle size={40} />
                  </motion.div>
                  <h3 className="text-xl font-bold font-display text-brand-primary mb-2">{t('contact.msgSent')}</h3>
                  <p className="text-sm mb-8 leading-relaxed text-brand-text/60 font-medium">
                    {t('contact.msgSentDesc')}
                  </p>
                  <button onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setSent(false) }}
                    className="btn btn-secondary text-sm px-8 h-12 rounded-full">
                    {t('contact.sendAnother')}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="mb-8">
                    <h2 className="text-2xl font-extrabold font-display text-brand-primary mb-2">{t('contact.formTitle')}</h2>
                    <p className="text-sm text-brand-text/60 font-medium">{t('contact.formDesc')}</p>
                  </div>
                  <Field id="con-name"    label={t('contact.nameLabel')}     value={form.name}    onChange={set('name')}    required />
                  <Field id="con-email"   label={t('contact.emailLabel')} type="email" value={form.email} onChange={set('email')}   required />
                  <Field id="con-subject" label={t('contact.subjectLabel')}       value={form.subject} onChange={set('subject')} />
                  <Field id="con-message" label={t('contact.messageLabel')}  value={form.message} onChange={set('message')} required isTextarea />

                  <button type="submit" disabled={sending}
                    className="w-full h-14 btn btn-primary rounded-full flex items-center justify-center gap-2 mt-4 text-sm font-bold shadow-gold disabled:opacity-50">
                    {sending
                      ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      : <><Send size={16} /> {t('contact.btnSend')}</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-3">
            <ContactRow icon={Mail}   label={t('contact.infoEmail')}   value="support@daatasa.com" href="mailto:support@daatasa.com" />
            <ContactRow icon={Phone}  label={t('contact.infoPhone')}   value="+91 7665306403"          href="tel:+917665306403" />
            <ContactRow icon={MapPin} label={t('contact.infoAddress')} value="Bakhtawar singh ki dhani, Khuri, Jaisalmer, Rajasthan" />

            {/* Business Hours */}
            <div className="rounded-[1.5rem] p-6 bg-white border border-brand-primary/10 shadow-sm mt-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-secondary/10">
                  <Clock size={18} className="text-brand-secondary" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text/50">{t('contact.hoursTitle')}</p>
              </div>
              {[
                { days: t('contact.monFri'), hours: '9:00 AM – 6:00 PM' },
                { days: t('contact.sat'),        hours: '10:00 AM – 4:00 PM' },
                { days: t('contact.sun'),          hours: t('contact.closed') },
              ].map((row, i) => (
                <div key={row.days} className={`flex justify-between items-center py-3 ${i < 2 ? 'border-b border-brand-primary/5' : ''}`}>
                  <span className="text-sm text-brand-text/70 font-medium">{row.days}</span>
                  <span className={`text-sm font-bold ${row.hours === t('contact.closed') ? 'text-red-500' : 'text-brand-primary'}`}>{row.hours}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-4 pt-2">
                <span className="w-2 h-2 rounded-full animate-pulse bg-green-500" />
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">{t('contact.openNow')}</span>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-[1.5rem] overflow-hidden mt-6 border border-brand-primary/10 shadow-sm">
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
