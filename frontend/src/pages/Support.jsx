// pages/Support.jsx — Premium Redesign
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, HelpCircle, Headphones, ChevronDown, Plus,
         Clock, CheckCircle, AlertCircle, Search } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

const StatusBadge = ({ status }) => {
  const map = {
    Open:     { cls: 'badge-brand',   dot: 'var(--brand-primary)', label: 'Open' },
    Resolved: { cls: 'badge-success', dot: 'var(--success)',        label: 'Resolved' },
    Pending:  { cls: 'badge-warning', dot: 'var(--warning)',        label: 'Pending' },
  }
  const s = map[status] || map.Pending
  return (
    <span className={`badge ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

const TICKETS = [
  { id: 'TKT-001', subject: 'Order #84021 not delivered after 7 days', status: 'Open',     date: '26 May 2026', category: 'Delivery' },
  { id: 'TKT-002', subject: 'Refund not received for returned ghee jar', status: 'Pending', date: '24 May 2026', category: 'Refund' },
  { id: 'TKT-003', subject: 'Wrong product received in my last order',   status: 'Resolved', date: '20 May 2026', category: 'Product' },
  { id: 'TKT-004', subject: 'Payment deducted but order not placed',     status: 'Resolved', date: '15 May 2026', category: 'Payment' },
]

const FAQS = [
  { q: 'How long does standard delivery take?', a: 'Standard delivery takes 3–5 business days across most cities in India. Metro cities typically receive orders within 2–3 business days.' },
  { q: 'What is your return and refund policy?', a: 'We accept returns within 7 days of delivery for any quality-related issue. Refunds are processed within 5–7 business days to your original payment method.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll receive an SMS and email with a tracking link. You can also check your order status in the "My Orders" section of your account.' },
  { q: 'Is your ghee 100% pure and natural?', a: 'Yes! All our ghee products are made from A2 milk using the traditional bilona (hand-churned) method. No artificial additives, preservatives, or fillers.' },
  { q: 'Do you offer bulk or wholesale pricing?', a: 'Yes, we offer special pricing for bulk orders above 10 kg. Please contact us at wholesale@dhanifresh.com or chat with us for a custom quote.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD) for eligible pin codes. All payments are secured by Razorpay.' },
]

const FAQItem = ({ faq, idx }) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border-color)' }}>
      <button
        className="w-full flex items-center justify-between py-4 text-left transition-all"
        onClick={() => setOpen(v => !v)} id={`faq-${idx}`}>
        <span className="text-sm font-semibold pr-4" style={{ color: open ? 'var(--gold)' : 'var(--text-primary)' }}>{faq.q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}>
            <p className="pb-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const TicketCard = ({ ticket }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className="rounded-2xl cursor-pointer transition-all"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
      onClick={() => setExpanded(v => !v)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.35)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>{ticket.id}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                {ticket.category}
              </span>
            </div>
            <p className="text-[13.5px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{ticket.subject}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={ticket.status} />
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{ticket.date}</span>
          </div>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Our team is reviewing your request. You'll receive an email update within 24 hours.
                </p>
                <button className="btn btn-primary-sm mt-3">View Full Thread</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function Support() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [faqSearch, setFaqSearch] = useState('')

  const filteredFaqs = FAQS.filter(f =>
    faqSearch === '' || f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())
  )

  const tabs = [
    { id: 'tickets', label: 'My Tickets', icon: AlertCircle },
    { id: 'faqs',    label: 'FAQs',       icon: HelpCircle },
    { id: 'chat',    label: 'Live Chat',  icon: MessageSquare },
  ]

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-base)' }}>
      <Helmet>
        <title>Support Center — DhaniFresh</title>
        <meta name="description" content="Get help with your DhaniFresh orders, returns, and account. Browse FAQs or open a support ticket." />
      </Helmet>

      {/* ── Premium Hero ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-10 left-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.30) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.5 }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(245,166,35,0.18)', border: '1px solid rgba(245,166,35,0.30)' }}>
              <Headphones size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
              style={{ background: 'rgba(245,166,35,0.18)', borderColor: 'rgba(245,166,35,0.30)', color: 'var(--gold)' }}>
              Support Center
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl font-extrabold mb-3 text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            How can we <span className="shimmer-text">help?</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="text-sm sm:text-base max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Get help with your orders, returns, and account.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="var(--bg-base)" />
          </svg>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-8"
          style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={activeTab === tab.id
                ? { background: 'var(--bg-card)', color: 'var(--gold)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }
                : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid transparent' }}
              id={`tab-${tab.id}`}>
              <tab.icon size={14} />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'tickets' && (
            <motion.div key="tickets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-3">
              {TICKETS.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
            </motion.div>
          )}

          {activeTab === 'faqs' && (
            <motion.div key="faqs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              <div className="relative mb-5">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search FAQs…" value={faqSearch}
                  onChange={e => setFaqSearch(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 text-sm font-medium outline-none transition-all rounded-xl"
                  style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  id="faq-search" />
              </div>

              <div className="rounded-2xl p-5 sm:p-6"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                {filteredFaqs.length === 0
                  ? <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No FAQs match "{faqSearch}"</p>
                  : filteredFaqs.map((faq, i) => <FAQItem key={i} faq={faq} idx={i} />)
                }
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              <div className="rounded-3xl text-center py-14 px-8"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(245,166,35,0.12)' }}>
                  <MessageSquare size={28} style={{ color: 'var(--gold)' }} />
                </div>
                <h3 className="text-lg font-extrabold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Chat with Us</h3>
                <p className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Our AI assistant is available 24/7. Human agents are online Mon–Sat, 9am–6pm IST.
                </p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>Mon–Sat, 9am–6pm IST</span>
                </div>
                <button onClick={() => document.getElementById('chat-widget-button')?.click()} id="open-chat-btn"
                  className="btn btn-primary mx-auto">
                  <MessageSquare size={16} /> Start Live Chat
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { icon: Clock,        label: 'Avg. response', value: '< 2 min' },
                  { icon: CheckCircle,  label: 'Resolved today', value: '94%' },
                  { icon: Headphones,   label: 'Agents online',  value: '3' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl p-4 text-center transition-all"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none' }}>
                    <stat.icon size={18} className="mx-auto mb-2" style={{ color: 'var(--gold)' }} />
                    <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{stat.value}</p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      {activeTab === 'tickets' && (
        <button className="fixed bottom-8 right-6 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'var(--brand-gradient)', color: 'white', zIndex: 50, boxShadow: 'var(--shadow-brand)', border: 'none', cursor: 'pointer' }}
          id="create-ticket-fab">
          <Plus size={24} />
        </button>
      )}
    </div>
  )
}
