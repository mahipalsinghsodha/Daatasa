// pages/Support.jsx — Zomato-Style Inline Support Center
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, HelpCircle, Headphones, ChevronDown,
  Clock, CheckCircle, Search, Package, Send, X, Star, Sparkles, Image as ImageIcon, ArrowDown
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'
import api from '../api/axios'
import ChatBubble from '../components/chat/ChatBubble'
import { Link } from 'react-router-dom'

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  STATIC DATA                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

const TOPICS = [
  { id: 'ORDER', label: 'My Orders', icon: '📦', desc: 'Track, status, delivery' },
  { id: 'PAYMENT', label: 'Payment', icon: '💳', desc: 'Refunds, failed payment' },
  { id: 'RETURN', label: 'Return / Refund', icon: '↩️', desc: 'Start a return' },
  { id: 'PRODUCT', label: 'Product Query', icon: '🫙', desc: 'Ingredients, quality' },
  { id: 'OTHER', label: 'Other', icon: '💬', desc: 'General question' },
]

const ORDER_ISSUES = [
  { id: 'TRACK', label: '📍 Track Order', msg: 'I want to track my order' },
  { id: 'STATUS', label: '📋 Order Status', msg: 'What is my order status?' },
  { id: 'DELIVERY', label: '🚚 Delivery Issue', msg: 'I have a delivery issue' },
  { id: 'RETURN', label: '↩️ Return / Refund', msg: 'I want to return or get a refund' },
  { id: 'PRODUCT', label: '⚠️ Product Issue', msg: 'There is an issue with my product' },
  { id: 'OTHER', label: '💬 Other Issue', msg: 'I have another issue with my order' },
]

const FAQS = [
  { q: 'How long does standard delivery take?', a: 'Standard delivery takes 3–5 business days across most cities in India. Metro cities typically receive orders within 2–3 business days.' },
  { q: 'What is your return and refund policy?', a: 'We accept returns within 7 days of delivery for any quality-related issue. Refunds are processed within 5–7 business days to your original payment method.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll receive an SMS and email with a tracking link. You can also check your order status in the "My Orders" section of your account.' },
  { q: 'Is your ghee 100% pure and natural?', a: 'Yes! All our ghee products are made from Tharparkar cow milk in our Rajasthan village using the traditional bilona (hand-churned) method. No artificial additives, preservatives, or fillers.' },
  { q: 'Do you offer bulk or wholesale pricing?', a: 'Yes, we offer special pricing for bulk orders above 10 kg. Please contact us at wholesale@dhanifresh.com or chat with us for a custom quote.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD) for eligible pin codes. All payments are secured by Razorpay.' },
]

const MAX_IMAGES = 6

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
  const { connect, emit, on, off } = useSocket()

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('faqs')
  const [faqSearch, setFaqSearch] = useState('')

  // ── Orders (logged-in only) ───────────────────────────────────────────────
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // ── Chat pre-chat flow ────────────────────────────────────────────────────
  const [chatPhase, setChatPhase] = useState('pre')   // pre | chat | rating
  const [chatStep, setChatStep] = useState(1)       // 1=topic, 2=order, 3=sub-issue
  const [topic, setTopic] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState('')
  const [orderId, setOrderId] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  // ── Chat session state ────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState(null)
  const [sessionStatus, setSessionStatus] = useState('BOT_HANDLING')
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [agentTyping, setAgentTyping] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  // ── Image upload ─────────────────────────────────────────────────────────
  const [imageFiles, setImageFiles] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // ── Scroll state ──────────────────────────────────────────────────────────
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const messagesAreaRef = useRef(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimerRef = useRef(null)

  // ── Default tab: show orders if logged in ─────────────────────────────────
  useEffect(() => {
    if (user) setActiveTab('orders')
  }, []) // eslint-disable-line

  // ── Fetch orders ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (user && orders.length === 0) {
      setLoadingOrders(true)
      api.get('/api/orders/myorders?limit=5')
        .then(res => setOrders(res.data.orders || []))
        .catch(() => { })
        .finally(() => setLoadingOrders(false))
    }
  }, [user, orders.length])

  // ── Scroll tracking ────────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = messagesAreaRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    setIsAtBottom(atBottom)
    setShowScrollBtn(!atBottom)
  }, [])

  const scrollToBottom = () => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
    setShowScrollBtn(false)
    setIsAtBottom(true)
  }

  // ── Auto-scroll only when at bottom ───────────────────────────────────────
  useEffect(() => {
    if (isAtBottom && messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  }, [messages])

  // ── Socket events (only when chat tab active) ────────────────────────────
  useEffect(() => {
    if (activeTab !== 'chat') return

    connect()

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

  // ── Topic selection ────────────────────────────────────────────────────────
  const handleTopicSelect = (t) => {
    setTopic(t)
    if (t === 'ORDER' && user) {
      setChatStep(2)
    }
  }

  // ── Order selection ────────────────────────────────────────────────────────
  const handleOrderSelect = (order) => {
    setSelectedOrder(order)
    setOrderId(order._id)
    setChatStep(3)
  }

  // ── Sub-issue selection — auto-starts chat ─────────────────────────────────
  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue.id)
    emit('chat:start', {
      guestName: user?.name,
      guestEmail: user?.email,
      category: 'ORDER',
      orderId: selectedOrder?._id || null,
      subIssue: issue.id,
    })
    setChatPhase('chat')
    setTimeout(() => {
      if (sessionId) {
        emit('chat:message', {
          sessionId,
          content: `${issue.msg} (Order #${selectedOrder?._id?.slice(-6).toUpperCase()})`,
          messageType: 'TEXT',
        })
      }
    }, 1200)
  }

  // ── Start chat (non-ORDER or guest) ──────────────────────────────────────
  const handleStartChat = () => {
    if (!topic) return
    if (!user && (!guestName.trim() || !guestEmail.trim())) return
    emit('chat:start', {
      guestName:  guestName.trim() || user?.name,
      guestEmail: guestEmail.trim() || user?.email,
      category: topic,
      orderId:    orderId.trim() || null,
    })
    setChatPhase('chat')
  }

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if ((!text && imageFiles.length === 0) || !sessionId) return

    if (imageFiles.length > 0) {
      setUploadingImages(true)
      for (const imgObj of imageFiles) {
        const formData = new FormData()
        formData.append('image', imgObj.file)
        try {
          const res = await api.post('/api/upload/chat', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          emit('chat:message', { sessionId, content: res.data.url, messageType: 'IMAGE', metadata: { url: res.data.url } })
        } catch { }
      }
      setImageFiles([])
      setUploadingImages(false)
    }

    if (text) {
      emit('chat:message', { sessionId, content: text, messageType: 'TEXT' })
      setInputText('')
      emit('chat:typing', { sessionId, isTyping: false })
    }
  }, [inputText, imageFiles, sessionId, emit])

  // ── Image selection ────────────────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_IMAGES - imageFiles.length
    const allowed = files.slice(0, remaining)
    const newImgs = allowed
      .filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
      .map(f => ({ file: f, preview: URL.createObjectURL(f), id: Math.random().toString(36).slice(2) }))
    setImageFiles(prev => [...prev, ...newImgs])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (id) => {
    setImageFiles(prev => {
      const img = prev.find(i => i.id === id)
      if (img) URL.revokeObjectURL(img.preview)
      return prev.filter(i => i.id !== id)
    })
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
    } catch { }
  }

  // ── Reset chat ────────────────────────────────────────────────────────────
  const resetChat = () => {
    setChatPhase('pre'); setChatStep(1); setTopic(''); setSelectedOrder(null)
    setSelectedIssue(''); setOrderId(''); setMessages([])
    setSessionId(null); setSessionStatus('BOT_HANDLING')
    setRating(0); setRatingComment(''); setRatingSubmitted(false)
    setImageFiles([])
    sessionStorage.removeItem('chatSessionId')
  }

  // ── "Get Help" from orders tab ─────────────────────────────────────────────
  const handleOrderHelp = (order) => {
    resetChat()
    setTopic('ORDER')
    setSelectedOrder(order)
    setOrderId(order._id)
    setChatStep(3)
    setActiveTab('chat')
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

  const canStartChat = topic && (user || (guestName.trim() && guestEmail.trim()))

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
      <div className="relative overflow-hidden" style={{ background: 'var(--navy)' }}>
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-extrabold mb-2 text-white"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              DhaniFresh Help Center | 24x7 Support
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
              We are here to help you with your orders, refunds, and queries.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="hidden sm:flex items-center gap-3 bg-white/10 px-5 py-3 rounded-xl border border-white/20 mt-4 sm:mt-0">
            <Headphones size={28} style={{ color: 'var(--gold)' }} />
            <div className="text-left">
              <div className="text-white font-bold text-sm">Always Online</div>
              <div className="text-white/60 text-xs">Fastest resolution</div>
            </div>
          </motion.div>
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
                    {/* Items preview */}
                    {order.items?.slice(0, 2).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        {item.image && <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-color)' }} />}
                        <span className="text-xs font-medium text-[var(--text-secondary)] truncate">{item.name}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-4 mt-3">
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

          {/* ═══════════════ LIVE CHAT TAB ═══════════════ */}
          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

              <div className="rounded-3xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>

                {/* ── Chat Header ── */}
                <div style={{
                  background: 'var(--brand-gradient)', color: '#fff',
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px',
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
                      style={{
                        background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                        borderRadius: '8px', padding: '6px 8px', fontSize: '12px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                      }}
                      aria-label="New chat" title="Start new chat">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* ══════ PRE-CHAT FLOW ══════ */}
                {chatPhase === 'pre' && (
                  <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Greeting */}
                    <div className="text-center">
                      <div className="text-3xl mb-2">👋</div>
                      <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        Hi{user ? `, ${user.name.split(' ')[0]}` : ' there'}!
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>What do you need help with?</p>
                    </div>

                    {/* ─ Step 1: Topic ─ */}
                    {chatStep === 1 && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {TOPICS.map(t => (
                            <button
                              key={t.id}
                              onClick={() => handleTopicSelect(t.id)}
                              className="transition-all"
                              style={{
                                padding: '16px 20px', borderRadius: '8px', cursor: 'pointer',
                                border: `1px solid ${topic === t.id ? 'var(--navy)' : 'var(--border-color)'}`,
                                background: topic === t.id ? 'rgba(27,47,110,0.04)' : 'var(--bg-card)',
                                textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px',
                                boxShadow: topic === t.id ? '0 0 0 1px var(--navy)' : 'none',
                              }}
                            >
                              <span style={{ fontSize: '24px' }}>{t.icon}</span>
                              <div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.label}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Guest fields */}
                        {!user && topic && (
                          <div className="space-y-3">
                            <div>
                              <label style={labelSt}>Your Name *</label>
                              <input type="text" placeholder="Enter your name" value={guestName}
                                onChange={e => setGuestName(e.target.value)} style={inputSt} />
                            </div>
                            <div>
                              <label style={labelSt}>Email Address *</label>
                              <input type="email" placeholder="Enter your email" value={guestEmail}
                                onChange={e => setGuestEmail(e.target.value)} style={inputSt} />
                            </div>
                          </div>
                        )}

                        {/* Non-ORDER: show start button */}
                        {topic && topic !== 'ORDER' && (
                          <button
                            onClick={handleStartChat}
                            disabled={!canStartChat}
                            className="w-full py-3.5 rounded-xl text-[15px] font-extrabold transition-all flex items-center justify-center gap-2"
                            style={{
                              background: 'var(--brand-gradient)', color: '#fff', border: 'none',
                              opacity: canStartChat ? 1 : 0.5,
                              cursor: canStartChat ? 'pointer' : 'not-allowed',
                              boxShadow: 'var(--shadow-brand)',
                            }}
                            id="start-chat-btn"
                          >
                            <Sparkles size={16} /> Start Chat
                          </button>
                        )}

                        {/* ORDER + logged in: advance to order selection */}
                        {topic === 'ORDER' && user && (
                          <button
                            onClick={() => setChatStep(2)}
                            className="w-full py-3.5 rounded-xl text-[15px] font-extrabold transition-all flex items-center justify-center gap-2"
                            style={{ background: 'var(--brand-gradient)', color: '#fff', border: 'none', boxShadow: 'var(--shadow-brand)', cursor: 'pointer' }}
                          >
                            <Package size={16} /> Select Order →
                          </button>
                        )}

                        {/* ORDER + guest */}
                        {topic === 'ORDER' && !user && (
                          <>
                            <div>
                              <label style={labelSt}>Order ID (optional)</label>
                              <input type="text" placeholder="e.g. 684c123…" value={orderId}
                                onChange={e => setOrderId(e.target.value)} style={inputSt} />
                            </div>
                            <button onClick={handleStartChat} disabled={!canStartChat}
                              className="w-full py-3.5 rounded-xl text-[15px] font-extrabold flex items-center justify-center gap-2"
                              style={{ background: 'var(--brand-gradient)', color: '#fff', border: 'none', opacity: canStartChat ? 1 : 0.5, cursor: canStartChat ? 'pointer' : 'not-allowed', boxShadow: 'var(--shadow-brand)' }}>
                              <Sparkles size={16} /> Start Chat
                            </button>
                          </>
                        )}

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { icon: Clock, label: 'Avg. response', value: '< 2 min' },
                            { icon: CheckCircle, label: 'Resolved today', value: '94%' },
                            { icon: Headphones, label: 'Agents online', value: '3' },
                          ].map(stat => (
                            <div key={stat.label} className="rounded-xl p-3 text-center"
                              style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
                              <stat.icon size={14} className="mx-auto mb-1" style={{ color: 'var(--gold)' }} />
                              <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* ─ Step 2: Order selection ─ */}
                    {chatStep === 2 && user && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button onClick={() => setChatStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', lineHeight: 1, padding: 0 }}>←</button>
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Which order needs help?</span>
                        </div>
                        {loadingOrders ? (
                          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                            <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'supportSpin 0.8s linear infinite' }} />
                          </div>
                        ) : orders.length === 0 ? (
                          <div className="text-center py-6" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            No recent orders found.
                            <br />
                            <button onClick={() => { setChatStep(1); setTopic('OTHER') }}
                              style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginTop: '8px', textDecoration: 'underline' }}>
                              Chat about something else
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {orders.slice(0, 5).map(order => (
                              <button
                                key={order._id}
                                onClick={() => handleOrderSelect(order)}
                                className="w-full text-left transition-all"
                                style={{
                                  padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
                                  border: `2px solid ${selectedOrder?._id === order._id ? 'var(--gold)' : 'var(--border-color)'}`,
                                  background: selectedOrder?._id === order._id ? 'rgba(245,166,35,0.07)' : 'var(--bg-alt)',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <span style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                                    #{order._id.slice(-6).toUpperCase()}
                                  </span>
                                  <span style={{
                                    fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '99px',
                                    background: order.status === 'Delivered' ? 'rgba(16,185,129,0.12)' : order.status === 'Cancelled' ? 'rgba(239,68,68,0.12)' : 'rgba(245,166,35,0.12)',
                                    color: order.status === 'Delivered' ? '#10b981' : order.status === 'Cancelled' ? '#ef4444' : '#f59e0b',
                                  }}>{order.status}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>₹{order.total}</span>
                                </div>
                                {order.items?.[0] && (
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {order.items[0].name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* ─ Step 3: Sub-issue ─ */}
                    {chatStep === 3 && selectedOrder && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button onClick={() => { setChatStep(2); setSelectedOrder(null) }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', lineHeight: 1, padding: 0 }}>←</button>
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>What's the issue?</span>
                        </div>

                        {/* Selected order mini-card */}
                        <div style={{
                          padding: '12px 16px', borderRadius: '12px',
                          background: 'rgba(245,166,35,0.07)', border: '1.5px solid rgba(245,166,35,0.25)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <div>
                            <span style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                              #{selectedOrder._id.slice(-6).toUpperCase()}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                              {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--gold)' }}>₹{selectedOrder.total}</span>
                        </div>

                        <div className="space-y-2">
                          {ORDER_ISSUES.map(issue => (
                            <button
                              key={issue.id}
                              onClick={() => handleIssueSelect(issue)}
                              className="w-full text-left transition-all"
                              style={{
                                padding: '13px 16px', borderRadius: '12px', cursor: 'pointer',
                                border: '1.5px solid var(--border-color)',
                                background: 'var(--bg-alt)',
                                fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
                                display: 'flex', alignItems: 'center', gap: '10px',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'rgba(245,166,35,0.06)' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-alt)' }}
                            >
                              {issue.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ══════ ACTIVE CHAT ══════ */}
                {chatPhase === 'chat' && (
                  <>
                    {/* Messages area */}
                    <div style={{ position: 'relative' }}>
                      <div
                        ref={messagesAreaRef}
                        onScroll={handleScroll}
                        style={{
                          height: '420px', overflowY: 'auto', padding: '16px',
                          display: 'flex', flexDirection: 'column', gap: '12px',
                          background: 'var(--bg-base)',
                        }}
                      >
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
                              {[0, 1, 2].map(i => (
                                <span key={i} style={{
                                  width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8',
                                  animation: `supportBounce 1s ${i * 0.15}s infinite`, display: 'inline-block',
                                }} />
                              ))}
                            </div>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>typing...</span>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Scroll to bottom button */}
                      {showScrollBtn && (
                        <button
                          onClick={scrollToBottom}
                          style={{
                            position: 'absolute', bottom: '16px', right: '16px',
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'var(--brand-gradient)', color: '#fff',
                            border: 'none', cursor: 'pointer', zIndex: 5,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                            animation: 'fadeIn 0.2s ease',
                          }}
                          aria-label="Scroll to latest messages"
                        >
                          <ArrowDown size={16} />
                        </button>
                      )}
                    </div>

                    {/* Image previews */}
                    {imageFiles.length > 0 && sessionStatus !== 'CLOSED' && (
                      <div style={{
                        padding: '10px 16px', borderTop: '1px solid var(--border-color)',
                        display: 'flex', gap: '10px', overflowX: 'auto', background: 'var(--bg-card)',
                        alignItems: 'center',
                      }}>
                        {imageFiles.map(img => (
                          <div key={img.id} style={{ position: 'relative', flexShrink: 0 }}>
                            <img src={img.preview} alt="preview" style={{
                              width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover',
                              border: '2px solid var(--border-color)',
                            }} />
                            <button
                              onClick={() => removeImage(img.id)}
                              style={{
                                position: 'absolute', top: '-6px', right: '-6px',
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: 'var(--danger)', color: '#fff', border: 'none',
                                cursor: 'pointer', fontSize: '10px', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >✕</button>
                          </div>
                        ))}
                        {imageFiles.length < MAX_IMAGES && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              width: '60px', height: '60px', borderRadius: '10px', flexShrink: 0,
                              border: '2px dashed var(--border-color)', background: 'var(--bg-alt)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '22px', color: 'var(--text-muted)',
                            }}
                          >+</button>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {imageFiles.length}/{MAX_IMAGES} images
                        </span>
                      </div>
                    )}

                    {/* Input bar */}
                    {sessionStatus !== 'CLOSED' && (
                      <div style={{
                        padding: '12px 16px', borderTop: '1px solid var(--border-color)',
                        display: 'flex', gap: '8px', background: 'var(--bg-card)',
                      }}>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={imageFiles.length >= MAX_IMAGES || uploadingImages}
                          style={{
                            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, border: 'none',
                            background: imageFiles.length >= MAX_IMAGES ? 'var(--bg-alt)' : 'rgba(245,166,35,0.1)',
                            color: imageFiles.length >= MAX_IMAGES ? 'var(--text-muted)' : 'var(--gold)',
                            cursor: imageFiles.length >= MAX_IMAGES ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          title={`Attach image (${imageFiles.length}/${MAX_IMAGES})`}
                        >
                          {uploadingImages
                            ? <div style={{ width: '18px', height: '18px', border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'supportSpin 0.8s linear infinite' }} />
                            : <ImageIcon size={18} />}
                        </button>
                        <input type="file" accept="image/*" multiple ref={fileInputRef}
                          onChange={handleImageSelect} style={{ display: 'none' }} />

                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type your message…"
                            value={inputText}
                            maxLength={5000}
                            onChange={handleInputChange}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            className="w-full h-11 px-3.5 pr-14 text-sm outline-none rounded-xl"
                            style={{
                              border: '1.5px solid var(--border-color)',
                              color: 'var(--text-primary)', background: 'var(--bg-alt)',
                            }}
                            id="support-chat-input"
                          />
                          {inputText.length > 100 && (
                            <div style={{
                              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                              fontSize: '9px', fontWeight: 600,
                              color: inputText.length >= 5000 ? 'var(--danger)' : 'var(--text-muted)',
                            }}>{inputText.length}/5000</div>
                          )}
                        </div>
                        <button
                          onClick={handleSend}
                          disabled={!inputText.trim() && imageFiles.length === 0}
                          style={{
                            background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px',
                            width: '44px', color: '#fff', cursor: 'pointer',
                            opacity: (inputText.trim() || imageFiles.length > 0) ? 1 : 0.5,
                            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: (inputText.trim() || imageFiles.length > 0) ? 'var(--shadow-brand)' : 'none',
                            transition: 'all 0.2s',
                          }}
                          id="support-chat-send"
                          aria-label="Send message"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    )}

                    {/* Closed state */}
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

                {/* ══════ RATING PHASE ══════ */}
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
                            {[1, 2, 3, 4, 5].map(n => (
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

      {/* Keyframes */}
      <style>{`
        @keyframes supportBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes supportSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// Shared styles
const inputSt = {
  width: '100%', border: '1.5px solid var(--border-color)', borderRadius: '10px',
  padding: '10px 14px', fontSize: '14px', color: 'var(--text-primary)', outline: 'none',
  boxSizing: 'border-box', background: 'var(--bg-alt)', fontFamily: 'var(--font)',
}

const labelSt = {
  fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
  display: 'block', marginBottom: '6px',
}
