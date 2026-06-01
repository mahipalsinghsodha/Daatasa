// frontend/src/components/chat/ChatWidget.jsx
// Floating chat support widget (bottom-right)
// Features:
//   ✅ Pre-chat form (category, order ID for guests, name+email)
//   ✅ Real-time messages with typing indicators
//   ✅ Quick reply buttons
//   ✅ Post-chat rating
//   ✅ Socket.io with reconnection

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../hooks/useSocket'
import api from '../../api/axios'
import ChatBubble from './ChatBubble'

const CATEGORIES = [
  { id: 'ORDER',   label: '📦 Track Order',    icon: '📦' },
  { id: 'PAYMENT', label: '💳 Payment Issue',   icon: '💳' },
  { id: 'RETURN',  label: '↩️ Return/Refund',   icon: '↩️' },
  { id: 'PRODUCT', label: '🫙 Product Query',   icon: '🫙' },
  { id: 'OTHER',   label: '💬 Other',           icon: '💬' },
]

export default function ChatWidget() {
  const { user }                         = useAuth()
  const { connect, emit, on, off, isConnected } = useSocket()

  const [isOpen, setIsOpen]             = useState(false)
  const [phase, setPhase]               = useState('pre')  // pre | chat | rating
  const [sessionId, setSessionId]       = useState(null)
  const [sessionStatus, setSessionStatus] = useState('BOT_HANDLING')
  const [messages, setMessages]         = useState([])
  const [inputText, setInputText]       = useState('')
  const [agentTyping, setAgentTyping]   = useState(false)
  const [unreadCount, setUnreadCount]   = useState(0)
  const [rating, setRating]             = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  // Pre-chat form state
  const [category, setCategory]         = useState('')
  const [orderId, setOrderId]           = useState('')
  const [guestName, setGuestName]       = useState('')
  const [guestEmail, setGuestEmail]     = useState('')

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  // ── Auto-scroll to latest message ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        // Deduplicate by _id
        if (prev.some(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
      if (!isOpen) setUnreadCount(n => n + 1)
    }

    const handleHistory = ({ messages: msgs, status }) => {
      setMessages(msgs || [])
      setSessionStatus(status)
      setPhase('chat')
    }

    const handleAgentJoined = ({ agentName }) => {
      setSessionStatus('ACTIVE')
    }

    const handleAgentTyping = ({ isTyping }) => {
      setAgentTyping(isTyping)
    }

    const handleStatusChanged = ({ status }) => {
      setSessionStatus(status)
    }

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

    // Try to rejoin existing session
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
    inputRef.current?.focus()
  }

  // ── Start chat session ─────────────────────────────────────────────────────
  const handleStartChat = () => {
    if (!category) return
    if (!user && (!guestName.trim() || !guestEmail.trim())) return

    emit('chat:start', {
      guestName:  guestName.trim() || user?.name,
      guestEmail: guestEmail.trim() || user?.email,
      category,
      orderId:    orderId.trim() || null,
    })
    setPhase('chat')
  }

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputText.trim()
    if (!text || !sessionId) return

    emit('chat:message', { sessionId, content: text, messageType: 'TEXT' })
    setInputText('')

    // Stop typing indicator
    emit('chat:typing', { sessionId, isTyping: false })
  }, [inputText, sessionId, emit])

  // ── Typing indicator ───────────────────────────────────────────────────────
  const typingTimerRef = useRef(null)
  const handleInputChange = (e) => {
    setInputText(e.target.value)
    if (!sessionId) return

    emit('chat:typing', { sessionId, isTyping: true })
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      emit('chat:typing', { sessionId, isTyping: false })
    }, 2000)
  }

  // ── Quick reply click ──────────────────────────────────────────────────────
  const handleQuickReply = (option) => {
    if (!sessionId) return
    emit('chat:message', { sessionId, content: option, messageType: 'TEXT' })
  }

  // ── End chat ───────────────────────────────────────────────────────────────
  const handleEndChat = () => {
    if (sessionId) emit('chat:close', { sessionId })
  }

  // ── Submit rating ──────────────────────────────────────────────────────────
  const handleSubmitRating = async () => {
    if (!rating || !sessionId) return
    try {
      await api.post(`/api/chat/sessions/${sessionId}/rate`, { score: rating, comment: ratingComment })
      setRatingSubmitted(true)
    } catch { /* non-fatal */ }
  }

  // ── Status label ───────────────────────────────────────────────────────────
  const statusLabel = {
    BOT_HANDLING: { label: 'AI Assistant', color: '#6366f1', dot: '#818cf8' },
    WAITING:      { label: 'Waiting for agent...', color: '#f59e0b', dot: '#fbbf24' },
    ACTIVE:       { label: 'Agent connected', color: '#10b981', dot: '#34d399' },
    CLOSED:       { label: 'Chat ended', color: '#64748b', dot: '#94a3b8' },
  }[sessionStatus] || { label: 'Connecting...', color: '#64748b', dot: '#94a3b8' }

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        style={{
          position:        'fixed',
          bottom:          '24px',
          right:           '24px',
          width:           '60px',
          height:          '60px',
          borderRadius:    '50%',
          background:      'var(--brand-gradient)',
          color:           '#fff',
          border:          'none',
          cursor:          'pointer',
          display:         isOpen ? 'none' : 'flex',
          alignItems:      'center',
          justifyContent:  'center',
          boxShadow:       'var(--shadow-brand)',
          zIndex:          9999,
          fontSize:        '26px',
          transition:      'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,47,110,0.45)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-brand)' }}
        aria-label="Open support chat"
        id="chat-widget-button"
      >
        💬
        {unreadCount > 0 && (
          <span style={{
            position:    'absolute',
            top:         '-4px',
            right:       '-4px',
            background:  'var(--danger)',
            color:       '#fff',
            borderRadius:'50%',
            width:       '20px',
            height:      '20px',
            fontSize:    '11px',
            fontWeight:  700,
            display:     'flex',
            alignItems:  'center',
            justifyContent: 'center',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* ── Chat Panel ──────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position:     'fixed',
            bottom:       '24px',
            right:        '24px',
            width:        '380px',
            height:       '560px',
            background:   'var(--bg-surface)',
            borderRadius: '20px',
            boxShadow:    'var(--shadow-lg)',
            border:       '1px solid var(--border-color)',
            display:      'flex',
            flexDirection:'column',
            zIndex:        9999,
            overflow:     'hidden',
            fontFamily:   'var(--font)',
          }}
          id="chat-panel"
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div style={{
            background:   'var(--brand-gradient)',
            color:        '#fff',
            padding:      '16px 20px',
            display:      'flex',
            alignItems:   'center',
            gap:          '12px',
          }}>
            <div style={{
              width:        '42px',
              height:       '42px',
              borderRadius: '50%',
              background:   'rgba(255,255,255,0.2)',
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              fontSize:     '20px',
            }}>🫙</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>DhaniFresh Support</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', opacity: 0.9 }}>
                <span style={{
                  width:        '7px', height: '7px',
                  borderRadius: '50%',
                  background:   statusLabel.dot,
                  display:      'inline-block',
                }}/>
                {statusLabel.label}
              </div>
            </div>
            {phase === 'chat' && sessionStatus !== 'CLOSED' && (
              <button
                onClick={handleEndChat}
                style={{
                  background:'rgba(255,255,255,0.15)', border:'none', color:'#fff',
                  borderRadius:'8px', padding:'6px 10px', fontSize:'12px',
                  cursor:'pointer', fontWeight: 600,
                }}
              >End</button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background:'none', border:'none', color:'rgba(255,255,255,0.8)',
                fontSize:'20px', cursor:'pointer', lineHeight:1,
              }}
              aria-label="Close chat"
            >×</button>
          </div>

          {/* ── Phase: Pre-chat form ─────────────────────────────────────────── */}
          {phase === 'pre' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', margin: '0 0 4px' }}>
                  👋 Hi{user ? `, ${user.name}` : ''}!
                </p>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  How can we help you today?
                </p>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  What do you need help with?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      style={{
                        padding:      '10px 12px',
                        borderRadius: '10px',
                        border:       `2px solid ${category === cat.id ? 'var(--brand-secondary)' : 'var(--border-color)'}`,
                        background:   category === cat.id ? 'rgba(245,166,35,0.08)' : 'var(--bg-alt)',
                        cursor:       'pointer',
                        textAlign:    'left',
                        fontSize:     '13px',
                        color:        category === cat.id ? 'var(--brand-secondary)' : 'var(--text-secondary)',
                        fontWeight:   category === cat.id ? 700 : 500,
                        transition:   'all 0.15s',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {category === 'ORDER' && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                    Order ID (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 684c123..."
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              )}

              {!user && (
                <>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Your Name *</label>
                    <input type="text" placeholder="Enter your name" value={guestName} onChange={e => setGuestName(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Email Address *</label>
                    <input type="email" placeholder="Enter your email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} style={inputStyle} />
                  </div>
                </>
              )}

              <button
                onClick={handleStartChat}
                disabled={!category || (!user && (!guestName || !guestEmail))}
                style={{
                  background:    'var(--brand-gradient)',
                  color:         '#fff',
                  border:        'none',
                  borderRadius:  '12px',
                  padding:       '14px',
                  fontSize:      '15px',
                  fontWeight:    800,
                  cursor:        'pointer',
                  opacity:       (!category || (!user && (!guestName || !guestEmail))) ? 0.5 : 1,
                  transition:    'opacity 0.2s',
                  fontFamily:    'var(--font)',
                  boxShadow:     'var(--shadow-brand)',
                }}
              >
                Start Chat →
              </button>
            </div>
          )}

          {/* ── Phase: Active chat ───────────────────────────────────────────── */}
          {phase === 'chat' && (
            <>
              {/* Messages area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                      width:        '32px', height: '32px',
                      borderRadius: '50%',
                      background:   'var(--brand-gradient)',
                      display:      'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize:     '14px', color: '#fff',
                    }}>🫙</div>
                    <div style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', display: 'flex', gap: '4px' }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{
                          width:'6px', height:'6px', borderRadius:'50%', background:'#94a3b8',
                          animation:`bounce 1s ${i*0.15}s infinite`,
                          display:'inline-block',
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
                  padding:        '12px 16px',
                  borderTop:      '1px solid var(--border-color)',
                  display:        'flex',
                  gap:            '8px',
                  background:     'var(--bg-surface)',
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
                      style={{
                        width:        '100%',
                        border:       '1.5px solid var(--border-color)',
                        borderRadius: '12px',
                        padding:      '10px 14px',
                        fontSize:     '14px',
                        outline:      'none',
                        color:        'var(--text-primary)',
                        background:   'var(--bg-alt)',
                        fontFamily:   'var(--font)',
                        paddingRight: '50px',
                      }}
                      id="chat-input"
                    />
                    <div style={{ 
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '9px', fontWeight: 600, color: inputText.length >= 5000 ? 'var(--danger)' : 'var(--text-muted)'
                    }}>
                      {inputText.length}/5000
                    </div>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    style={{
                      background:   'var(--brand-gradient)',
                      border:       'none',
                      borderRadius: '12px',
                      width:        '44px',
                      color:        '#fff',
                      cursor:       'pointer',
                      fontSize:     '18px',
                      opacity:      inputText.trim() ? 1 : 0.5,
                      flexShrink:   0,
                      boxShadow:    inputText.trim() ? 'var(--shadow-brand)' : 'none',
                      transition:   'all 0.2s',
                    }}
                    id="chat-send-button"
                    aria-label="Send message"
                  >
                    ➤
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Phase: Rating ────────────────────────────────────────────────── */}
          {phase === 'rating' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '16px', textAlign: 'center' }}>
              {ratingSubmitted ? (
                <>
                  <div style={{ fontSize: '48px' }}>🙏</div>
                  <p style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a', margin: 0 }}>Thank you!</p>
                  <p style={{ color: '#64748b', margin: 0 }}>Your feedback helps us improve.</p>
                  <button onClick={() => { setIsOpen(false); setPhase('pre'); setMessages([]); setSessionId(null) }} style={{ ...primaryBtnStyle, marginTop: '8px' }}>
                    Close
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '40px' }}>⭐</div>
                  <p style={{ fontWeight: 700, fontSize: '17px', color: '#0f172a', margin: 0 }}>How was your experience?</p>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '32px' }}>
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:'32px', opacity: n <= rating ? 1 : 0.3, transition: 'opacity 0.1s' }}
                      >⭐</button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Any comments? (optional)"
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    rows={3}
                    style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'10px', padding:'10px', fontSize:'13px', resize:'none', outline:'none' }}
                  />
                  <button
                    onClick={handleSubmitRating}
                    disabled={!rating}
                    style={{ ...primaryBtnStyle, opacity: rating ? 1 : 0.5, width:'100%' }}
                  >
                    Submit Feedback
                  </button>
                  <button onClick={() => setPhase('pre')} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'13px' }}>
                    Skip
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  )
}

const inputStyle = {
  width:        '100%',
  border:       '1.5px solid var(--border-color)',
  borderRadius: '10px',
  padding:      '10px 14px',
  fontSize:     '14px',
  color:        'var(--text-primary)',
  outline:      'none',
  boxSizing:    'border-box',
  background:   'var(--bg-alt)',
  fontFamily:   'var(--font)',
}

const primaryBtnStyle = {
  background:   'var(--brand-gradient)',
  color:        '#fff',
  border:       'none',
  borderRadius: '12px',
  padding:      '13px 24px',
  fontSize:     '15px',
  fontWeight:   800,
  cursor:       'pointer',
  fontFamily:   'var(--font)',
  boxShadow:    'var(--shadow-brand)',
}
