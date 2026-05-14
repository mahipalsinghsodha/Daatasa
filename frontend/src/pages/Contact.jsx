import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import {
  FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle,
  FiUser, FiClock, FiInstagram, FiFacebook, FiTwitter,
  FiChevronDown, FiChevronUp
} from 'react-icons/fi'
import { toast } from 'react-toastify'

const TOPICS = [
  'Order Inquiry', 'Product Question', 'Bulk Order',
  'Return / Refund', 'Collaboration', 'Other'
]

const FAQS = [
  {
    q: 'What makes DhaniFresh ghee different?',
    a: 'We use the traditional Bilona method — slow-churned from cultured curd of pure A1 desi cow milk. No additives, no preservatives.'
  },
  {
    q: 'Can I place a bulk or wholesale order?',
    a: 'Yes! Select "Bulk Order" in the form and we will share a custom quote within 24 hours.'
  },
  {
    q: 'How do I return a product or get a refund?',
    a: 'Returns are accepted within 7 days of delivery if the product is defective or incorrect. Use the form with "Return / Refund" topic.'
  },
  {
    q: 'Do you deliver across India?',
    a: 'Yes! We deliver pan-India via trusted courier partners. Free shipping on orders above Rs. 500.'
  },
]

const inp = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-gray-400'

export default function Contact() {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

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
    if (!form.subject)        e.subject = 'Please select a topic'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await api.post('/api/contact', form)
      setSuccess(true)
      toast.success('Message sent! We will get back to you soon.')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      toast.error('Could not send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">

      {/* Hero */}
      <div className="bg-[#0f172a] pt-20 pb-32 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="relative z-10 max-w-xl mx-auto px-4">
          <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-[11px] font-bold tracking-wider uppercase rounded-full border border-orange-500/20 mb-5">
            Contact Support
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Get in <span className="text-orange-500">Touch</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
            Have a question or need help with an order? We're here for you.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* Left info */}
          <div className="space-y-4 lg:space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              {[
                { icon: FiMail,   title: 'Email',   info: 'support@dhanifresh.com' },
                { icon: FiPhone,  title: 'Phone',   info: '+91 98765 43210' },
                { icon: FiMapPin, title: 'Address', info: 'Mumbai, Maharashtra' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.title}</p>
                    <p className="text-sm font-medium text-gray-900">{item.info}</p>
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-gray-100 flex gap-3">
                {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 hover:bg-orange-500 hover:text-white transition-all duration-300">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white flex items-start gap-4 shadow-lg shadow-orange-500/20">
              <div className="bg-white/20 p-2.5 rounded-xl shrink-0">
                <FiClock size={20} />
              </div>
              <div>
                <p className="font-bold text-sm mb-1">We reply within 24 hours</p>
                <p className="text-orange-100 text-[13px] font-medium">Mon - Sat, 9AM to 6PM IST</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Send us a message</h2>
            <p className="text-sm text-gray-500 mb-8 font-medium">We read every message and reply as quickly as possible.</p>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3"
                >
                  <FiCheckCircle size={18} className="text-green-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Message received!</p>
                    <p className="text-xs text-green-700">We will get back to you within 24 hours.</p>
                  </div>
                  <button onClick={() => setSuccess(false)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">x</button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="name" value={form.name} onChange={onChange} placeholder="Your name" className={`${inp} pl-9`} />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="email" type="email" value={form.email} onChange={onChange} placeholder="you@email.com" className={`${inp} pl-9`} />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <FiPhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                      placeholder="10-digit mobile"
                      className={`${inp} pl-9`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <select name="subject" value={form.subject} onChange={onChange} className={inp}>
                    <option value="">Select a topic</option>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={onChange}
                  placeholder="Describe your question or issue in detail..."
                  className={`${inp} resize-none`}
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gray-900 text-white text-[15px] font-bold rounded-xl hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <FiSend size={16} />
                }
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Frequently Asked Questions</h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 transition-colors gap-4"
                >
                  <p className="text-[15px] font-bold text-gray-800">{faq.q}</p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${openFaq === i ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-400'}`}>
                    {openFaq === i
                      ? <FiChevronUp size={16} />
                      : <FiChevronDown size={16} />
                    }
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
