// frontend/src/components/chat/ChatWidget.jsx
// Floating chat support widget (bottom-right)
// Features:
//   ✅ 3-step Zomato-style pre-chat flow for logged-in users
//   ✅ Topic → Order selection (last 5) → Sub-issue
//   ✅ Guest fallback: name + email form
//   ✅ Real-time messages with typing indicators
//   ✅ Multi-image upload (up to 6 images with previews)
//   ✅ Scroll-to-bottom button
//   ✅ Smart auto-scroll (only when already at bottom)
//   ✅ Post-chat rating
//   ✅ Socket.io with reconnection

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../hooks/useSocket'
import api from '../../api/axios'
import ChatBubble from './ChatBubble'

// ── Constants ─────────────────────────────────────────────────────────────────
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

const MAX_IMAGES = 6

export default function ChatWidget() {
  const { user }                         = useAuth()
  const { connect, emit, on, off, isConnected } = useSocket()

  const [isOpen, setIsOpen]             = useState(false)
  const [phase, setPhase] = useState('pre')   // pre | chat | rating
  const [step, setStep] = useState(1)       // 1=topic, 2=order, 3=sub-issue (for logged-in ORDER)
  const [sessionId, setSessionId]       = useState(null)
  const [sessionStatus, setSessionStatus] = useState('BOT_HANDLING')
  const [messages, setMessages]         = useState([])
  const [inputText, setInputText]       = useState('')
  const [agentTyping, setAgentTyping]   = useState(false)
  const [unreadCount, setUnreadCount]   = useState(0)
  const [rating, setRating]             = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Pre-chat form state
  const [topic, setTopic] = useState('')
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState('')
  const [orderId, setOrderId]           = useState('')
  const [guestName, setGuestName]       = useState('')
  const [guestEmail, setGuestEmail]     = useState('')

  // Multi-image state
  const [imageFiles, setImageFiles] = useState([])   // { file, preview, uploading }[]
  const [uploadingImages, setUploadingImages] = useState(false)

  const messagesAreaRef = useRef(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimerRef = useRef(null)

  // ── Fetch user orders when widget opens (logged-in only) ───────────────────
  useEffect(() => {
    if (isOpen && user && orders.length === 0) {
      setLoadingOrders(true)
      api.get('/api/orders/myorders?limit=5')
        .then(res => setOrders(res.data.orders || []))
        .catch(() => { })
        .finally(() => setLoadingOrders(false))
    }
  }, [isOpen, user, orders.length])

  // ── Scroll tracking ────────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = messagesAreaRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    setIsAtBottom(atBottom)
    setShowScrollBtn(!atBottom)
  }, [])

  // ── Auto-scroll only when user is at bottom ─────────────────────────────────
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else {
      setUnreadCount(n => n + 1)
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBtn(false)
    setIsAtBottom(true)
  }

  // ── Socket event handlers ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

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
      if (!isAtBottom) setUnreadCount(n => n + 1)
    }

    const handleHistory = ({ messages: msgs, status }) => {
      setMessages(msgs || [])
      setSessionStatus(status)
      setPhase('chat')
    }

    const handleAgentJoined = () => setSessionStatus('ACTIVE')
    const handleAgentTyping = ({ isTyping }) => setAgentTyping(isTyping)
    const handleStatusChanged = ({ status }) => setSessionStatus(status)
    const handleSessionClosed = ({ rating_prompt }) => {
      setSessionStatus('CLOSED')
      sessionStorage.removeItem('chatSessionId')
      if (rating_prompt) setPhase('rating')
    }

    on('chat:session_created', handleSessionCreated)
    on('chat:message',         handleMessage)
    on('chat:history',         handleHistory)
    on('chat:agent_joined',    handleAgentJoined)
    on('chat:agent_typing',    handleAgentTyping)
    on('chat:status_changed',  handleStatusChanged)
    on('chat:session_closed',  handleSessionClosed)

    const existingSession = sessionStorage.getItem('chatSessionId')
    if (existingSession) {
      setSessionId(existingSession)
      emit('chat:rejoin', { sessionId: existingSession })
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
  }, [isOpen, connect, emit, on, off])

  // ── Open chat ──────────────────────────────────────────────────────────────
  const handleOpen = () => {
    setIsOpen(true)
    setUnreadCount(0)
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  // ── Step navigation ────────────────────────────────────────────────────────
  const handleTopicSelect = (t) => {
    setTopic(t)
    if (t === 'ORDER' && user) {
      setStep(2)   // go to order selection
    } else if (t !== 'ORDER' || !user) {
      setStep(1)   // stay / go to start chat for non-order
    }
  }

  const handleOrderSelect = (order) => {
    setSelectedOrder(order)
    setOrderId(order._id)
    setStep(3)   // go to sub-issue
  }

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue.id)
    // Auto-start chat with context
    emit('chat:start', {
      guestName: user?.name,
      guestEmail: user?.email,
      category: 'ORDER',
      orderId: selectedOrder?._id || null,
      subIssue: issue.id,
    })
    setPhase('chat')
    // Send the sub-issue as the first user message automatically
    setTimeout(() => {
      if (sessionId) {
        emit('chat:message', { sessionId, content: `${issue.msg} (Order #${selectedOrder?._id?.slice(-6).toUpperCase()})`, messageType: 'TEXT' })
      }
    }, 1200)
  }

  // ── Start chat (for non-ORDER topics or guest) ──────────────────────────────
  const handleStartChat = () => {
    if (!topic) return
    if (!user && (!guestName.trim() || !guestEmail.trim())) return

    emit('chat:start', {
      guestName:  guestName.trim() || user?.name,
      guestEmail: guestEmail.trim() || user?.email,
      category: topic,
      orderId:    orderId.trim() || null,
    })
    setPhase('chat')
  }

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if ((!text && imageFiles.length === 0) || !sessionId) return

    // Upload images first if any
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
    if (remaining <= 0) return
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

  // ── Typing indicator ───────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputText(e.target.value)
    if (!sessionId) return
    emit('chat:typing', { sessionId, isTyping: true })
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      emit('chat:typing', { sessionId, isTyping: false })
    }, 2000)
  }

  // ── Quick reply ────────────────────────────────────────────────────────────
  const handleQuickReply = (option) => {
    if (!sessionId) return
    emit('chat:message', { sessionId, content: option, messageType: 'TEXT' })
  }

  // ── End / close ────────────────────────────────────────────────────────────
  const handleEndChat = () => {
    if (sessionId) emit('chat:close', { sessionId })
  }

  const resetAll = () => {
    setPhase('pre'); setStep(1); setTopic(''); setSelectedOrder(null)
    setSelectedIssue(''); setOrderId(''); setMessages([])
    setSessionId(null); setSessionStatus('BOT_HANDLING')
    setRating(0); setRatingComment(''); setRatingSubmitted(false)
    setImageFiles([]); setUnreadCount(0)
    sessionStorage.removeItem('chatSessionId')
  }

  // ── Submit rating ──────────────────────────────────────────────────────────
  const handleSubmitRating = async () => {
    if (!rating || !sessionId) return
    try {
      await api.post(`/api/chat/sessions/${sessionId}/rate`, { score: rating, comment: ratingComment })
      setRatingSubmitted(true)
    } catch { }
  }

  // ── Status label ───────────────────────────────────────────────────────────
  const statusLabel = {
    BOT_HANDLING: { label: 'AI Assistant', dot: '#818cf8' },
    WAITING: { label: 'Waiting for agent...', dot: '#fbbf24' },
    ACTIVE: { label: 'Agent connected', dot: '#34d399' },
    CLOSED: { label: 'Chat ended', dot: '#94a3b8' },
  }[sessionStatus] || { label: 'Connecting...', dot: '#94a3b8' }

  const canStartChat = topic && (user || (guestName.trim() && guestEmail.trim()))

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Floating Button ────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          style={{
            position: 'fixed', bottom: '24px', right: '24px',
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'var(--brand-gradient)', color: '#fff',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-brand)', zIndex: 9999, fontSize: '26px',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          aria-label="Open support chat"
          id="chat-widget-button"
        >
          💬
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-4px',
              background: 'var(--danger)', color: '#fff', borderRadius: '50%',
              width: '20px', height: '20px', fontSize: '11px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      )}

      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', bottom: '24px', right: '24px',
            width: '390px', maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 48px)',
            background: 'var(--bg-surface)', borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            border: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column',
            zIndex: 9999, overflow: 'hidden',
            fontFamily: 'var(--font)',
          }}
          id="chat-panel"
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div style={{
            background: 'var(--brand-gradient)', color: '#fff',
            padding: '14px 18px', display: 'flex', alignItems: 'center',
            gap: '10px', flexShrink: 0,
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
            }}>🫙</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>DhaniFresh Support</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', opacity: 0.9 }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: phase === 'pre' ? '#34d399' : statusLabel.dot,
                  display: 'inline-block',
                }}/>
                {phase === 'pre' ? 'Online — Ready to help' : statusLabel.label}
              </div>
            </div>
            {phase === 'chat' && sessionStatus !== 'CLOSED' && (
              <button onClick={handleEndChat} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                borderRadius: '8px', padding: '5px 10px', fontSize: '11px',
                cursor: 'pointer', fontWeight: 600,
              }}>End</button>
            )}
            {(phase === 'chat' || phase === 'rating') && (
              <button onClick={resetAll} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                borderRadius: '8px', padding: '5px 8px', fontSize: '11px',
                cursor: 'pointer', fontWeight: 600, lineHeight: 1,
              }} title="New chat">✕</button>
            )}
            <button onClick={() => setIsOpen(false)} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
              fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '0 2px',
            }} aria-label="Close chat">×</button>
          </div>

          {/* ══════════════════════ PRE-CHAT FLOW ══════════════════════════ */}
          {phase === 'pre' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Greeting */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>👋</div>
                <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  Hi{user ? `, ${user.name.split(' ')[0]}` : ' there'}!
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>
                  What do you need help with?
                </p>
              </div>

              {/* ── STEP 1: Topic selection ── */}
              {step === 1 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {TOPICS.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleTopicSelect(t.id)}
                        style={{
                          padding: '12px 10px', borderRadius: '12px', cursor: 'pointer',
                          border: `2px solid ${topic === t.id ? 'var(--brand-secondary)' : 'var(--border-color)'}`,
                          background: topic === t.id ? 'rgba(245,166,35,0.08)' : 'var(--bg-alt)',
                          textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{t.icon}</span>
                        <span style={{
                          fontSize: '12px', fontWeight: 700,
                          color: topic === t.id ? 'var(--brand-secondary)' : 'var(--text-primary)',
                        }}>{t.label}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Guest fields for non-ORDER or when no user */}
                  {!user && topic && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={labelStyle}>Your Name *</label>
                        <input type="text" placeholder="Enter your name" value={guestName}
                          onChange={e => setGuestName(e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Email Address *</label>
                        <input type="email" placeholder="Enter your email" value={guestEmail}
                          onChange={e => setGuestEmail(e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  )}

                  {/* Show start button for non-ORDER topics */}
                  {topic && topic !== 'ORDER' && (
                    <button
                      onClick={handleStartChat}
                      disabled={!canStartChat}
                      style={{
                        ...primaryBtnStyle,
                        opacity: canStartChat ? 1 : 0.5,
                        cursor: canStartChat ? 'pointer' : 'not-allowed',
                      }}
                      id="widget-start-chat-btn"
                    >
                      Start Chat →
                    </button>
                  )}

                  {/* For ORDER + logged in: show "Select Order" prompt */}
                  {topic === 'ORDER' && user && (
                    <button
                      onClick={() => setStep(2)}
                      style={primaryBtnStyle}
                    >
                      Select Order →
                    </button>
                  )}

                  {/* For ORDER + guest */}
                  {topic === 'ORDER' && !user && (
                    <>
                      <div>
                        <label style={labelStyle}>Order ID (optional)</label>
                        <input type="text" placeholder="e.g. 684c123…" value={orderId}
                          onChange={e => setOrderId(e.target.value)} style={inputStyle} />
                      </div>
                      <button
                        onClick={handleStartChat}
                        disabled={!canStartChat}
                        style={{ ...primaryBtnStyle, opacity: canStartChat ? 1 : 0.5 }}
                      >
                        Start Chat →
                      </button>
                    </>
                  )}
                </>
              )}

              {/* ── STEP 2: Order selection ── */}
              {step === 2 && user && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '-4px' }}>
                    <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', padding: '0', lineHeight: 1 }}>←</button>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Select your order</span>
                  </div>
                  {loadingOrders ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                      <div style={{ width: '28px', height: '28px', border: '3px solid var(--border-color)', borderTopColor: 'var(--brand-secondary)', borderRadius: '50%', animation: 'widgetSpin 0.8s linear infinite' }} />
                    </div>
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No recent orders found.
                      <br />
                      <button onClick={() => { setStep(1); setTopic('OTHER') }} style={{ color: 'var(--brand-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginTop: '8px', textDecoration: 'underline' }}>
                        Chat about something else
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {orders.slice(0, 5).map(order => (
                        <button
                          key={order._id}
                          onClick={() => handleOrderSelect(order)}
                          style={{
                            padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
                            border: `2px solid ${selectedOrder?._id === order._id ? 'var(--brand-secondary)' : 'var(--border-color)'}`,
                            background: selectedOrder?._id === order._id ? 'rgba(245,166,35,0.08)' : 'var(--bg-alt)',
                            textAlign: 'left', transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 800, fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                              #{order._id.slice(-6).toUpperCase()}
                            </span>
                            <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px',
                              background: order.status === 'Delivered' ? 'rgba(16,185,129,0.12)' : order.status === 'Cancelled' ? 'rgba(239,68,68,0.12)' : 'rgba(245,166,35,0.12)',
                              color: order.status === 'Delivered' ? '#10b981' : order.status === 'Cancelled' ? '#ef4444' : '#f59e0b',
                            }}>{order.status}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>₹{order.total}</span>
                          </div>
                          {order.items?.[0] && (
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.items[0].name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                            </div>
                          )}
                        </button>
                      ))}
                        </div>
                  )}
                </>
              )}

              {/* ── STEP 3: Sub-issue selection ── */}
              {step === 3 && selectedOrder && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '-4px' }}>
                    <button onClick={() => { setStep(2); setSelectedOrder(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', padding: '0', lineHeight: 1 }}>←</button>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>What's the issue?</span>
                  </div>

                  {/* Selected order mini-card */}
                  <div style={{
                    padding: '10px 12px', borderRadius: '10px',
                    background: 'rgba(245,166,35,0.07)', border: '1.5px solid rgba(245,166,35,0.25)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                        #{selectedOrder._id.slice(-6).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--brand-secondary)' }}>₹{selectedOrder.total}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {ORDER_ISSUES.map(issue => (
                      <button
                        key={issue.id}
                        onClick={() => handleIssueSelect(issue)}
                        style={{
                          padding: '11px 14px', borderRadius: '11px', cursor: 'pointer',
                          border: `1.5px solid var(--border-color)`,
                          background: 'var(--bg-alt)', textAlign: 'left',
                          fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                          transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-secondary)'; e.currentTarget.style.background = 'rgba(245,166,35,0.06)' }}
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

          {/* ══════════════════════ ACTIVE CHAT ════════════════════════════ */}
          {phase === 'chat' && (
            <>
              {/* Messages area */}
              <div
                ref={messagesAreaRef}
                onScroll={handleScroll}
                style={{
                  flex: 1, overflowY: 'auto', padding: '14px',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  position: 'relative', minHeight: 0,
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
                      width: '30px', height: '30px', borderRadius: '50%',
                      background: 'var(--brand-gradient)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', color: '#fff', flexShrink: 0,
                    }}>🫙</div>
                    <div style={{
                      background: 'var(--bg-alt)', border: '1px solid var(--border-color)',
                      borderRadius: '14px 14px 14px 4px', padding: '9px 13px', display: 'flex', gap: '4px',
                    }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8',
                          animation: `widgetBounce 1s ${i * 0.15}s infinite`, display: 'inline-block',
                        }}/>
                      ))}
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll-to-bottom button */}
              {showScrollBtn && (
                <button
                  onClick={scrollToBottom}
                  style={{
                    position: 'absolute',
                    bottom: sessionStatus !== 'CLOSED' ? (imageFiles.length > 0 ? '148px' : '80px') : '60px',
                    right: '18px',
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'var(--brand-gradient)', color: '#fff',
                    border: 'none', cursor: 'pointer', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)', fontSize: '16px',
                    animation: 'fadeIn 0.2s ease',
                  }}
                  aria-label="Scroll to latest messages"
                >
                  ↓
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      background: 'var(--danger)', color: '#fff', borderRadius: '50%',
                      width: '16px', height: '16px', fontSize: '9px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
              )}

              {/* Image previews */}
              {imageFiles.length > 0 && sessionStatus !== 'CLOSED' && (
                <div style={{
                  padding: '8px 12px', borderTop: '1px solid var(--border-color)',
                  display: 'flex', gap: '8px', overflowX: 'auto', background: 'var(--bg-surface)', flexShrink: 0,
                }}>
                  {imageFiles.map(img => (
                    <div key={img.id} style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={img.preview} alt="preview" style={{
                        width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover',
                        border: '2px solid var(--border-color)',
                      }} />
                      <button
                        onClick={() => removeImage(img.id)}
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: 'var(--danger)', color: '#fff', border: 'none',
                          cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >✕</button>
                    </div>
                  ))}
                  {imageFiles.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: '56px', height: '56px', borderRadius: '8px', flexShrink: 0,
                        border: '2px dashed var(--border-color)', background: 'var(--bg-alt)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', color: 'var(--text-muted)',
                      }}
                    >+</button>
                  )}
                  <span style={{
                    fontSize: '10px', color: 'var(--text-muted)', alignSelf: 'flex-end', paddingBottom: '2px', whiteSpace: 'nowrap',
                  }}>{imageFiles.length}/{MAX_IMAGES}</span>
                </div>
              )}

              {/* Input bar */}
              {sessionStatus !== 'CLOSED' && (
                <div style={{
                  padding: '10px 12px', borderTop: '1px solid var(--border-color)',
                  display: 'flex', gap: '8px', background: 'var(--bg-surface)', flexShrink: 0,
                }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageFiles.length >= MAX_IMAGES || uploadingImages}
                    style={{
                      width: '40px', height: '40px', borderRadius: '10px', border: 'none',
                      background: imageFiles.length >= MAX_IMAGES ? 'var(--bg-alt)' : 'rgba(245,166,35,0.1)',
                      color: imageFiles.length >= MAX_IMAGES ? 'var(--text-muted)' : 'var(--brand-secondary)',
                      cursor: imageFiles.length >= MAX_IMAGES ? 'not-allowed' : 'pointer',
                      flexShrink: 0, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title={`Add image (${imageFiles.length}/${MAX_IMAGES})`}
                  >
                    {uploadingImages ? (
                      <span style={{ width: '16px', height: '16px', border: '2px solid var(--brand-secondary)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'widgetSpin 0.8s linear infinite' }} />
                    ) : '🖼️'}
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type your message…"
                      value={inputText}
                      maxLength={5000}
                      onChange={handleInputChange}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      style={{
                        width: '100%', border: '1.5px solid var(--border-color)',
                        borderRadius: '12px', padding: '9px 50px 9px 12px',
                        fontSize: '13px', outline: 'none',
                        color: 'var(--text-primary)', background: 'var(--bg-alt)',
                        fontFamily: 'var(--font)', boxSizing: 'border-box',
                      }}
                      id="chat-input"
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
                      width: '40px', color: '#fff', cursor: 'pointer', fontSize: '16px',
                      opacity: (inputText.trim() || imageFiles.length > 0) ? 1 : 0.5,
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: (inputText.trim() || imageFiles.length > 0) ? 'var(--shadow-brand)' : 'none',
                      transition: 'all 0.2s',
                    }}
                    id="chat-send-button"
                    aria-label="Send message"
                  >
                    ➤
                  </button>
                </div>
              )}

              {/* Closed banner */}
              {sessionStatus === 'CLOSED' && (
                <div style={{
                  padding: '14px', borderTop: '1px solid var(--border-color)',
                  textAlign: 'center', background: 'var(--bg-alt)', flexShrink: 0,
                }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px' }}>This chat has ended.</p>
                  <button onClick={resetAll} style={{ ...primaryBtnStyle, fontSize: '13px', padding: '10px 20px' }}>
                    Start New Chat
                  </button>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════ RATING PHASE ════════════════════════════ */}
          {phase === 'rating' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '14px', textAlign: 'center' }}>
              {ratingSubmitted ? (
                <>
                  <div style={{ fontSize: '44px' }}>🙏</div>
                  <p style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', margin: 0 }}>Thank you!</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Your feedback helps us improve.</p>
                  <button onClick={resetAll} style={{ ...primaryBtnStyle, marginTop: '8px' }}>Close</button>
                </>
              ) : (
                <>
                    <div style={{ fontSize: '36px' }}>⭐</div>
                    <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>How was your experience?</p>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '30px' }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setRating(n)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '30px', opacity: n <= rating ? 1 : 0.3, transition: 'opacity 0.1s' }}>⭐</button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Any comments? (optional)"
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    rows={3}
                      style={{ width: '100%', border: '1.5px solid var(--border-color)', borderRadius: '10px', padding: '10px', fontSize: '12px', resize: 'none', outline: 'none', color: 'var(--text-primary)', background: 'var(--bg-alt)', fontFamily: 'var(--font)', boxSizing: 'border-box' }}
                  />
                    <button onClick={handleSubmitRating} disabled={!rating}
                      style={{ ...primaryBtnStyle, opacity: rating ? 1 : 0.5, width: '100%' }}>
                    Submit Feedback
                  </button>
                    <button onClick={() => setPhase('pre')}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>
                    Skip
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes widgetBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes widgetSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        #chat-panel .hidden { display: none; }
      `}</style>
    </>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', border: '1.5px solid var(--border-color)', borderRadius: '10px',
  padding: '9px 12px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none',
  boxSizing: 'border-box', background: 'var(--bg-alt)', fontFamily: 'var(--font)',
}

const labelStyle = {
  fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
  display: 'block', marginBottom: '5px',
}

const primaryBtnStyle = {
  background: 'var(--brand-gradient)', color: '#fff', border: 'none',
  borderRadius: '12px', padding: '12px 20px', fontSize: '14px', fontWeight: 800,
  cursor: 'pointer', fontFamily: 'var(--font)', boxShadow: 'var(--shadow-brand)',
  width: '100%',
}
