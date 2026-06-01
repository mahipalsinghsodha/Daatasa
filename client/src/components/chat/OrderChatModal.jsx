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
import { motion, AnimatePresence } from 'framer-motion'
import ChatBubble from './ChatBubble'

const CATEGORIES = [
  { id: 'ORDER',   label: '📦 Track Order',    icon: '📦' },
  { id: 'PAYMENT', label: '💳 Payment Issue',   icon: '💳' },
  { id: 'RETURN',  label: '↩️ Return/Refund',   icon: '↩️' },
  { id: 'PRODUCT', label: '🫙 Product Query',   icon: '🫙' },
  { id: 'OTHER',   label: '💬 Other',           icon: '💬' },
]

export default function OrderChatModal({ isOpen, onClose, orderId }) {
  const { user }                         = useAuth()
  const { connect, emit, on, off, isConnected } = useSocket()

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

  // Pre-chat form state (removed as it's passed via props and auth)

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  // ── Auto-scroll to latest message ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Auto-start chat ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && orderId && phase === 'pre') {
      emit('chat:start', {
        guestName:  user?.name,
        guestEmail: user?.email,
        category:   'ORDER',
        orderId:    orderId,
      })
      setPhase('chat')
    }
  }, [isOpen, orderId, phase, emit, user])

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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
              zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
            }}
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width:        '100%',
                maxWidth:     '420px',
                height:       '100%',
                maxHeight:    '85vh',
                background:   'var(--bg-surface)',
                borderRadius: '24px',
                boxShadow:    '0 25px 50px -12px rgba(27,47,110,0.25)',
                border:       '1px solid var(--border-color)',
                display:      'flex',
                flexDirection:'column',
                overflow:     'hidden',
                fontFamily:   'var(--font)',
              }}
              onClick={e => e.stopPropagation()}
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
              onClick={onClose}
              style={{
                background:'none', border:'none', color:'rgba(255,255,255,0.8)',
                fontSize:'24px', cursor:'pointer', lineHeight:1, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              aria-label="Close chat"
            >×</button>
          </div>

          {/* ── Phase: Pre-chat form ─────────────────────────────────────────── */}
          {phase === 'pre' && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Connecting to secure session...</p>
              </div>
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
                  <button onClick={() => { onClose(); setPhase('pre'); setMessages([]); setSessionId(null) }} style={{ ...primaryBtnStyle, marginTop: '8px' }}>
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
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

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
