import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import {
  FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle,
  FiUser, FiMessageSquare, FiClock, FiInstagram,
  FiFacebook, FiTwitter, FiAlertCircle, FiChevronRight, FiHelpCircle
} from 'react-icons/fi'
import { toast } from 'react-toastify'

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const onChange = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Identity required'
    if (!form.email.trim()) e.email = 'Coordinates required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid coordinate structure'
    if (!form.subject.trim()) e.subject = 'classification required'
    if (!form.message.trim()) e.message = 'Transmission content required'
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
      toast.success('Transmission established successfully.')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      toast.error('Transmission failed. Network rejection.')
    } finally {
      setLoading(false)
    }
  }

  const SUBJECTS = ['Order Inquiry', 'Product Matrix', 'Bulk Acquisition', 'Redemption / Refund', 'Collaboration', 'Other']

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-32">
      
      {/* ── Hero Matrix ── */}
      <section className="bg-gray-900 pt-32 pb-24 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-[800px] mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 border border-orange-600/30 mb-8"
          >
            <FiHelpCircle size={14} className="text-orange-500" />
            <span className="text-[10px] uppercase tracking-widest font-black text-orange-500">Communication Terminal</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black text-white font-head tracking-tight mb-6"
          >
            Get in <span className="text-orange-600">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 font-medium max-w-lg mx-auto"
          >
            Have a question about our artifacts, a bulk inquiry, or just want to establish a connection? We're listening.
          </motion.p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          
          {/* ── Left: Technical Contact Details ── */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl p-10 space-y-8">
               {[
                 { icon: <FiMail />, title: 'Digital Points', lines: ['support@dhanifresh.com', 'admin@dhanifresh.com'] },
                 { icon: <FiPhone />, title: 'Direct Link', lines: ['+91 98765 43210', 'Mon - Sat, 9AM - 6PM'] },
                 { icon: <FiMapPin />, title: 'Geo Location', lines: ['123 Dairy Lane, Mumbai,', 'Maharashtra - 400058'] }
               ].map((item, idx) => (
                 <div key={idx} className="flex gap-5">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                       {item.icon}
                    </div>
                    <div>
                       <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">{item.title}</h4>
                       {item.lines.map((l, i) => <p key={i} className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{l}</p>)}
                    </div>
                 </div>
               ))}

               <div className="pt-8 border-t border-gray-50">
                  <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-6 text-center">Social Nodes</h4>
                  <div className="flex justify-center gap-4">
                     {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
                       <a key={i} href="#" className="w-12 h-12 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all">
                         <Icon size={18} />
                       </a>
                     ))}
                  </div>
               </div>
            </div>

            {/* Support Notice */}
            <div className="bg-orange-600 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-xl shadow-orange-100">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                  <FiClock size={100} />
               </div>
               <h3 className="text-xl font-black font-head mb-2">Internal SLA</h3>
               <p className="text-xs font-bold text-orange-100 leading-relaxed uppercase tracking-tighter">
                  Nuestra team responds to all verified transmissions within 24 standard business hours.
               </p>
            </div>
          </div>

          {/* ── Right: Transmission Form ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl p-10 sm:p-14 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-32 h-32 bg-gray-50 rounded-full -translate-x-16 -translate-y-16" />
               
               <div className="relative z-10 mb-12">
                  <h2 className="text-3xl font-black text-gray-900 font-head tracking-tight mb-2">Send Transmission</h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Initialize Secure Messaging Flow</p>
               </div>

               <AnimatePresence>
                 {success && (
                   <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 p-6 bg-green-50 border border-green-100 rounded-3xl flex items-center gap-4"
                   >
                     <FiCheckCircle className="text-green-600 shrink-0" size={24} />
                     <div>
                        <p className="text-sm font-black text-gray-900">Transmission Logged</p>
                        <p className="text-xs font-bold text-green-600 uppercase">We will re-establish contact shortly.</p>
                     </div>
                     <button onClick={() => setSuccess(false)} className="ml-auto text-gray-400"><FiX /></button>
                   </motion.div>
                 )}
               </AnimatePresence>

               <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid sm:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity</label>
                        <div className="relative group">
                           <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600">
                             <FiUser size={18}/>
                           </div>
                           <input name="name" required value={form.name} onChange={onChange} placeholder="Full name" className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all" />
                        </div>
                        {errors.name && <p className="text-[10px] text-red-500 font-black ml-1 uppercase">{errors.name}</p>}
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Coordinates</label>
                        <div className="relative group">
                           <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600">
                             <FiMail size={18}/>
                           </div>
                           <input name="email" required type="email" value={form.email} onChange={onChange} placeholder="Email address" className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all" />
                        </div>
                        {errors.email && <p className="text-[10px] text-red-500 font-black ml-1 uppercase">{errors.email}</p>}
                     </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Direct Link</label>
                        <div className="relative group">
                           <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600">
                             <FiPhone size={18}/>
                           </div>
                           <input name="phone" value={form.phone} onChange={onChange} placeholder="+91 00000 00000" className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Classification</label>
                        <select name="subject" required value={form.subject} onChange={onChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all cursor-pointer appearance-none">
                           <option value="">Select Topic</option>
                           {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.subject && <p className="text-[10px] text-red-500 font-black ml-1 uppercase">{errors.subject}</p>}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transmission Content</label>
                     <textarea name="message" required rows={5} value={form.message} onChange={onChange} placeholder="Describe your inquiry..." className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all resize-none" />
                     {errors.message && <p className="text-[10px] text-red-500 font-black ml-1 uppercase">{errors.message}</p>}
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-gray-900 text-white font-black rounded-[20px] shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend />}
                    {loading ? 'Transmitting...' : 'Establish Secure Communication'}
                  </button>
               </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ Nodes ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-32">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 font-head tracking-tight mb-4">Protocol Knowledge Base</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Common Artifact Inquiries</p>
         </div>
         <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'Artifact Differentiation?', a: 'Dhani Ghee uses traditional Bilona methods for superior artifact quality compared to industrial peers.' },
              { q: 'Bulk Acquisition?', a: 'Logistics nodes support large scale acquisitions. Select "Bulk Acquisition" in classification for specific pricing.' },
              { q: 'Redemption Flow?', a: 'Redemptions are handled within 7 days of verified arrival. Initiate via terminal above.' },
              { q: 'Node Availability?', a: 'Nationwide delivery available via nuestra logistical matrix.' }
            ].map((faq, i) => (
              <div key={i} className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:border-orange-200 transition-all">
                 <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 text-[10px] font-black">Q</div>
                    <div>
                       <h4 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-tighter">{faq.q}</h4>
                       <p className="text-[11px] font-bold text-gray-400 leading-relaxed uppercase tracking-tighter">{faq.a}</p>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </section>

    </div>
  )
}

export default Contact
