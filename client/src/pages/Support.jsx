// pages/Support.jsx — Zomato-Style Inline Support Center
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, HelpCircle, Headphones, ChevronDown,
         Clock, CheckCircle, Search, Package, Send, X, Star, Sparkles, Image as ImageIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'
import api from '../api/axios'
import ChatBubble from '../components/chat/ChatBubble'
import { Link } from 'react-router-dom'

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  STATIC DATA                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  { id: 'ORDER',   label: 'Track Order',     icon: '📦', desc: 'Where is my order?' },
  { id: 'PAYMENT', label: 'Payment Issue',   icon: '💳', desc: 'Refund, failed payment' },
  { id: 'RETURN',  label: 'Return / Refund', icon: '↩️', desc: 'Start a return' },
  { id: 'PRODUCT', label: 'Product Query',   icon: '🫙', desc: 'Ingredients, storage' },
  { id: 'OTHER',   label: 'Other',           icon: '💬', desc: 'General question' },
]

const FAQS = [
  { q: 'How long does standard delivery take?', a: 'Standard delivery takes 3–5 business days across most cities in India. Metro cities typically receive orders within 2–3 business days.' },
  { q: 'What is your return and refund policy?', a: 'We accept returns within 7 days of delivery for any quality-related issue. Refunds are processed within 5–7 business days to your original payment method.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll receive an SMS and email with a tracking link. You can also check your order status in the "My Orders" section of your account.' },
  { q: 'Is your ghee 100% pure and natural?', a: 'Yes! All our ghee products are made from A2 milk using the traditional bilona (hand-churned) method. No artificial additives, preservatives, or fillers.' },
  { q: 'Do you offer bulk or wholesale pricing?', a: 'Yes, we offer special pricing for bulk orders above 10 kg. Please contact us at wholesale@dhanifresh.com or chat with us for a custom quote.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD) for eligible pin codes. All payments are secured by Razorpay.' },
]

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SUB-COMPONENTS                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function Support() {
  const { user } = useAuth()
  const { connect, emit, on, off, isConnected } = useSocket()

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('faqs')
  const [faqSearch, setFaqSearch] = useState('')

  // ── Orders (logged-in only) ───────────────────────────────────────────────
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // ── Chat state (inline — Zomato-style) ────────────────────────────────────
  const [chatPhase, setChatPhase] = useState('pre') // pre | chat | rating
  const [sessionId, setSessionId] = useState(null)
  const [sessionStatus, setSessionStatus] = useState('BOT_HANDLING')
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [agentTyping, setAgentTyping] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Pre-chat form
  const [category, setCategory] = useState('')
  const [orderId, setOrderId] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimerRef = useRef(null)

  // ── Default tab: show orders if logged in ─────────────────────────────────
  useEffect(() => {
    if (user) setActiveTab('orders')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch orders ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (user && (activeTab === 'orders' || activeTab === 'chat' || activeTab === 'faqs')) {
      if (orders.length > 0) return;
      const fetchOrders = async () => {
        setLoadingOrders(true)
        try {
          const res = await api.get('/api/orders/myorders?limit=5')
          setOrders(res.data.orders || [])
        } catch (error) {
          console.error('Failed to fetch orders for support', error)
        } finally {
          setLoadingOrders(false)
        }
      }
      fetchOrders()
    }
  }, [user, activeTab, orders.length])

  // ── Auto-scroll chat ─────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Socket events (only when chat tab active) ────────────────────────────
  useEffect(() => {
    if (activeTab !== 'chat') return

    const socket = connect()

    const handleSessionCreated = ({ sessionId: sid, status }) => {
      setSessionId(sid)
      setSessionStatus(status)
      sessionStorage.setItem('chatSessionId', sid)
    }
    const handleMessage = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    }
    const handleHistory = ({ messages: msgs, status }) => {
      setMessages(msgs || [])
      setSessionStatus(status)
      setChatPhase('chat')
    }
    const handleAgentJoined = () => setSessionStatus('ACTIVE')
    const handleAgentTyping = ({ isTyping }) => setAgentTyping(isTyping)
    const handleStatusChanged = ({ status }) => setSessionStatus(status)
    const handleSessionClosed = ({ rating_prompt }) => {
      setSessionStatus('CLOSED')
      sessionStorage.removeItem('chatSessionId')
      if (rating_prompt) setChatPhase('rating')
    }

    on('chat:session_created', handleSessionCreated)
    on('chat:message',         handleMessage)
    on('chat:history',         handleHistory)
    on('chat:agent_joined',    handleAgentJoined)
    on('chat:agent_typing',    handleAgentTyping)
    on('chat:status_changed',  handleStatusChanged)
    on('chat:session_closed',  handleSessionClosed)

    // Rejoin existing session
    const existing = sessionStorage.getItem('chatSessionId')
    if (existing) {
      setSessionId(existing)
      emit('chat:rejoin', { sessionId: existing })
    }

    return () => {
      off('chat:session_created', handleSessionCreated)
      off('chat:message',         handleMessage)
      off('chat:history',         handleHistory)
      off('chat:agent_joined',    handleAgentJoined)
      off('chat:agent_typing',    handleAgentTyping)
      off('chat:status_changed',  handleStatusChanged)
      off('chat:session_closed',  handleSessionClosed)
    }
  }, [activeTab, connect, emit, on, off])

  // ── Start chat session ────────────────────────────────────────────────────
  const handleStartChat = () => {
    if (!category) return
    if (!user && (!guestName.trim() || !guestEmail.trim())) return

    emit('chat:start', {
      guestName:  guestName.trim() || user?.name,
      guestEmail: guestEmail.trim() || user?.email,
      category,
      orderId:    orderId.trim() || null,
    })
    setChatPhase('chat')
  }

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputText.trim()
    if (!text || !sessionId) return
    emit('chat:message', { sessionId, content: text, messageType: 'TEXT' })
    setInputText('')
    emit('chat:typing', { sessionId, isTyping: false })
  }, [inputText, sessionId, emit])

  // ── Upload Image ──────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !sessionId) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      return alert('Only images are allowed')
    }
    if (file.size > 5 * 1024 * 1024) {
      return alert('Image size must be less than 5MB')
    }

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await api.post('/api/upload/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      emit('chat:message', { sessionId, content: res.data.url, messageType: 'IMAGE', metadata: { url: res.data.url } })
    } catch (err) {
      console.error('Upload failed', err)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Typing indicator ─────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputText(e.target.value)
    if (!sessionId) return
    emit('chat:typing', { sessionId, isTyping: true })
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      emit('chat:typing', { sessionId, isTyping: false })
    }, 2000)
  }

  // ── Quick reply ───────────────────────────────────────────────────────────
  const handleQuickReply = (option) => {
    if (!sessionId) return
    emit('chat:message', { sessionId, content: option, messageType: 'TEXT' })
  }

  // ── End chat ──────────────────────────────────────────────────────────────
  const handleEndChat = () => {
    if (sessionId) emit('chat:close', { sessionId })
  }

  // ── Submit rating ─────────────────────────────────────────────────────────
  const handleSubmitRating = async () => {
    if (!rating || !sessionId) return
    try {
      await api.post(`/api/chat/sessions/${sessionId}/rate`, { score: rating, comment: ratingComment })
      setRatingSubmitted(true)
    } catch { /* non-fatal */ }
  }

  // ── New chat (reset) ──────────────────────────────────────────────────────
  const resetChat = () => {
    setChatPhase('pre')
    setSessionId(null)
    setMessages([])
    setSessionStatus('BOT_HANDLING')
    setCategory('')
    setOrderId('')
    setRating(0)
    setRatingComment('')
    setRatingSubmitted(false)
    sessionStorage.removeItem('chatSessionId')
  }

  // ── Order "Get Help" ──────────────────────────────────────────────────────
  const handleOrderHelp = (order) => {
    resetChat()
    setCategory('ORDER')
    setOrderId(order._id)
    setActiveTab('chat')
    // Auto-start after switching tab (small delay for socket connection)
    setTimeout(() => {
      emit('chat:start', {
        guestName:  user?.name,
        guestEmail: user?.email,
        category:   'ORDER',
        orderId:    order._id,
      })
      setChatPhase('chat')
    }, 400)
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredFaqs = FAQS.filter(f =>
    faqSearch === '' || f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())
  )

  const statusLabel = {
    BOT_HANDLING: { label: 'AI Assistant',          dot: '#818cf8' },
    WAITING:      { label: 'Waiting for agent...',  dot: '#fbbf24' },
    ACTIVE:       { label: 'Agent connected',       dot: '#34d399' },
    CLOSED:       { label: 'Chat ended',            dot: '#94a3b8' },
  }[sessionStatus] || { label: 'Connecting...', dot: '#94a3b8' }

  const tabs = [
    ...(user ? [{ id: 'orders', label: 'My Orders', icon: Package }] : []),
    { id: 'faqs',    label: 'FAQs',       icon: HelpCircle },
    { id: 'chat',    label: 'Live Chat',  icon: MessageSquare },
  ]

  /* ═══════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                                */
  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-base)' }}>
      <Helmet>
        <title>Support Center — DhaniFresh</title>
        <meta name="description" content="Get help with your DhaniFresh orders, returns, and account. Browse FAQs or chat with our AI assistant." />
      </Helmet>

      {/* ── Hero ── */}
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

        {/* ── Tabs ── */}
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

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* ═══════════════ MY ORDERS TAB ═══════════════ */}
          {activeTab === 'orders' && user && (
            <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-4">
              {loadingOrders ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-bold text-[var(--text-primary)]">No recent orders</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1 mb-6">Looks like you haven't placed any orders yet.</p>
                  <Link to="/products" className="btn btn-primary">Start Shopping</Link>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order._id} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-[var(--text-primary)]">#{order._id.slice(-6).toUpperCase()}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--text-primary)]">₹{order.total}</p>
                        <p className="text-xs text-[var(--text-muted)]">{order.items?.length || 0} items</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">Need help with this order?</p>
                      <button
                        onClick={() => handleOrderHelp(order)}
                        className="btn py-2 px-4 text-xs" style={{ background: 'var(--brand-gradient)', color: '#fff', border: 'none' }}
                      >
                        Get Help
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* ═══════════════ FAQs TAB ═══════════════ */}
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

              {/* CTA: Can't find answer? */}
              <div className="mt-6 rounded-2xl p-6 text-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Can't find what you're looking for?
                </p>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  <MessageSquare size={14} /> Chat with us
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ LIVE CHAT TAB (INLINE — ZOMATO STYLE) ═══════════════ */}
          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

              {/* Chat container card */}
              <div className="rounded-3xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>

                {/* ── Chat Header ── */}
                <div style={{
                  background: 'var(--brand-gradient)',
                  color: '#fff',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                  }}>🫙</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>DhaniFresh Support</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', opacity: 0.9 }}>
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: chatPhase === 'pre' ? '#34d399' : statusLabel.dot,
                        display: 'inline-block',
                      }}/>
                      {chatPhase === 'pre' ? 'Online — Ready to help' : statusLabel.label}
                    </div>
                  </div>
                  {chatPhase === 'chat' && sessionStatus !== 'CLOSED' && (
                    <button onClick={handleEndChat}
                      style={{
                        background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                        borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
                        cursor: 'pointer', fontWeight: 600,
                      }}>End Chat</button>
                  )}
                  {(chatPhase === 'chat' || chatPhase === 'rating') && (
                    <button onClick={resetChat}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      aria-label="New chat" title="Start new chat">
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* ═══ Phase: Pre-chat form ═══ */}
                {chatPhase === 'pre' && (
                  <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Greeting */}
                    <div className="text-center">
                      <div className="text-3xl mb-2">👋</div>
                      <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        Hi{user ? `, ${user.name}` : ' there'}!
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        What do you need help with?
                      </p>
                    </div>

                    {/* Category selection */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className="transition-all"
                          style={{
                            padding: '14px 12px',
                            borderRadius: '14px',
                            border: `2px solid ${category === cat.id ? 'var(--gold)' : 'var(--border-color)'}`,
                            background: category === cat.id ? 'rgba(245,166,35,0.08)' : 'var(--bg-alt)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex', flexDirection: 'column', gap: '2px',
                          }}
                        >
                          <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                          <span style={{
                            fontSize: '13px', fontWeight: 700,
                            color: category === cat.id ? 'var(--gold)' : 'var(--text-primary)',
                          }}>{cat.label}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Order ID (when ORDER selected) */}
                    {category === 'ORDER' && (
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                          Order ID (optional)
                        </label>
                        {user && orders.length > 0 ? (
                          <select
                            value={orderId}
                            onChange={e => setOrderId(e.target.value)}
                            className="w-full h-11 px-3.5 text-sm outline-none rounded-xl"
                            style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)' }}
                          >
                            <option value="">Select an order...</option>
                            {orders.slice(0, 5).map(o => (
                              <option key={o._id} value={o._id}>
                                #{o._id.slice(-6).toUpperCase()} - {new Date(o.createdAt).toLocaleDateString()} - ₹{o.total}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text" placeholder="e.g. 684c123…" value={orderId}
                            onChange={e => setOrderId(e.target.value)}
                            className="w-full h-11 px-3.5 text-sm outline-none rounded-xl"
                            style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)' }}
                          />
                        )}
                      </div>
                    )}

                    {/* Guest info */}
                    {!user && (
                      <div className="space-y-3">
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Your Name *</label>
                          <input type="text" placeholder="Enter your name" value={guestName} onChange={e => setGuestName(e.target.value)}
                            className="w-full h-11 px-3.5 text-sm outline-none rounded-xl"
                            style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email Address *</label>
                          <input type="email" placeholder="Enter your email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                            className="w-full h-11 px-3.5 text-sm outline-none rounded-xl"
                            style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        </div>
                      </div>
                    )}

                    {/* Start Chat Button */}
                    <button
                      onClick={handleStartChat}
                      disabled={!category || (!user && (!guestName || !guestEmail))}
                      className="w-full py-3.5 rounded-xl text-[15px] font-extrabold transition-all flex items-center justify-center gap-2"
                      style={{
                        background: 'var(--brand-gradient)', color: '#fff', border: 'none',
                        opacity: (!category || (!user && (!guestName || !guestEmail))) ? 0.5 : 1,
                        cursor: (!category || (!user && (!guestName || !guestEmail))) ? 'not-allowed' : 'pointer',
                        boxShadow: 'var(--shadow-brand)',
                      }}
                      id="start-chat-btn"
                    >
                      <Sparkles size={16} /> Start Chat
                    </button>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: Clock,       label: 'Avg. response', value: '< 2 min' },
                        { icon: CheckCircle, label: 'Resolved today', value: '94%' },
                        { icon: Headphones,  label: 'Agents online',  value: '3' },
                      ].map(stat => (
                        <div key={stat.label} className="rounded-xl p-3 text-center"
                          style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
                          <stat.icon size={14} className="mx-auto mb-1" style={{ color: 'var(--gold)' }} />
                          <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ Phase: Active Chat ═══ */}
                {chatPhase === 'chat' && (
                  <>
                    {/* Messages area */}
                    <div style={{
                      height: '420px', overflowY: 'auto', padding: '16px',
                      display: 'flex', flexDirection: 'column', gap: '12px',
                      background: 'var(--bg-base)',
                    }}>
                      {messages.map((msg, idx) => (
                        <ChatBubble
                          key={msg._id || idx}
                          message={msg}
                          currentUserId={user?._id}
                          onQuickReply={handleQuickReply}
                        />
                      ))}

                      {agentTyping && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--brand-gradient)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', color: '#fff',
                          }}>🫙</div>
                          <div style={{
                            background: 'var(--bg-alt)', border: '1px solid var(--border-color)',
                            borderRadius: '16px 16px 16px 4px', padding: '10px 14px', display: 'flex', gap: '4px',
                          }}>
                            {[0,1,2].map(i => (
                              <span key={i} style={{
                                width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8',
                                animation: `supportBounce 1s ${i * 0.15}s infinite`, display: 'inline-block',
                              }}/>
                            ))}
                          </div>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>typing...</span>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input bar */}
                    {sessionStatus !== 'CLOSED' && (
                      <div style={{
                        padding: '12px 16px',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex', gap: '8px',
                        background: 'var(--bg-card)',
                      }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type your message..."
                            value={inputText}
                            maxLength={5000}
                            onChange={handleInputChange}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            className="w-full h-11 px-3.5 pl-12 pr-14 text-sm outline-none rounded-xl"
                            style={{
                              border: '1.5px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              background: 'var(--bg-alt)',
                            }}
                            id="support-chat-input"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
                            style={{ color: 'var(--text-muted)' }}
                            title="Upload Image"
                          >
                            {uploadingImage ? <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" /> : <ImageIcon size={16} />}
                          </button>
                          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                          <div style={{
                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                            fontSize: '9px', fontWeight: 600,
                            color: inputText.length >= 5000 ? 'var(--danger)' : 'var(--text-muted)',
                          }}>
                            {inputText.length}/5000
                          </div>
                        </div>
                        <button
                          onClick={handleSend}
                          disabled={!inputText.trim()}
                          style={{
                            background: 'var(--brand-gradient)',
                            border: 'none', borderRadius: '12px', width: '44px',
                            color: '#fff', cursor: 'pointer',
                            opacity: inputText.trim() ? 1 : 0.5,
                            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: inputText.trim() ? 'var(--shadow-brand)' : 'none',
                            transition: 'all 0.2s',
                          }}
                          id="support-chat-send"
                          aria-label="Send message"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    )}

                    {/* Closed state — option to start new chat */}
                    {sessionStatus === 'CLOSED' && (
                      <div style={{
                        padding: '16px', borderTop: '1px solid var(--border-color)',
                        textAlign: 'center', background: 'var(--bg-card)',
                      }}>
                        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                          This chat has ended.
                        </p>
                        <button onClick={resetChat}
                          className="btn btn-primary inline-flex items-center gap-2 text-sm">
                          <MessageSquare size={14} /> Start New Chat
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* ═══ Phase: Rating ═══ */}
                {chatPhase === 'rating' && (
                  <div style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    {ratingSubmitted ? (
                      <>
                        <div style={{ fontSize: '48px' }}>🙏</div>
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Thank you!</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your feedback helps us improve.</p>
                        <button onClick={resetChat}
                          className="btn btn-primary mt-2 inline-flex items-center gap-2">
                          <MessageSquare size={14} /> Start New Chat
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '40px' }}>⭐</div>
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>How was your experience?</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => setRating(n)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                transition: 'transform 0.15s',
                                transform: n <= rating ? 'scale(1.2)' : 'scale(1)',
                              }}>
                              <Star size={28} fill={n <= rating ? '#f59e0b' : 'none'}
                                stroke={n <= rating ? '#f59e0b' : 'var(--text-muted)'} strokeWidth={1.5} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="Any comments? (optional)"
                          value={ratingComment}
                          onChange={e => setRatingComment(e.target.value)}
                          rows={3}
                          className="w-full text-sm outline-none rounded-xl p-3"
                          style={{ border: '1.5px solid var(--border-color)', background: 'var(--bg-alt)', color: 'var(--text-primary)', resize: 'none' }}
                        />
                        <button
                          onClick={handleSubmitRating}
                          disabled={!rating}
                          className="w-full py-3 rounded-xl text-sm font-bold"
                          style={{
                            background: 'var(--brand-gradient)', color: '#fff', border: 'none',
                            opacity: rating ? 1 : 0.5, cursor: rating ? 'pointer' : 'not-allowed',
                            boxShadow: 'var(--shadow-brand)',
                          }}
                        >Submit Feedback</button>
                        <button onClick={resetChat}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyframe for typing bounce */}
      <style>{`
        @keyframes supportBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
