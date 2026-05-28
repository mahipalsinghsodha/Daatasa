// frontend/src/components/chat/ChatBubble.jsx
// Renders a single chat message bubble
// Supports: USER, AGENT, BOT, SYSTEM message types
// Supports: TEXT, ORDER_CARD, QUICK_REPLY message types

import { formatDistanceToNow } from 'date-fns'

const STATUS_COLORS = {
  PAID:          { bg: '#dcfce7', text: '#166534', label: 'Paid' },
  PENDING:       { bg: '#fef9c3', text: '#854d0e', label: 'Pending' },
  CONFIRMED:     { bg: '#dbeafe', text: '#1e40af', label: 'Confirmed' },
  PROCESSING:    { bg: '#e0e7ff', text: '#3730a3', label: 'Processing' },
  SHIPPED:       { bg: '#cffafe', text: '#0e7490', label: 'Shipped' },
  DELIVERED:     { bg: '#dcfce7', text: '#166534', label: 'Delivered' },
  CANCELLED:     { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
  FAILED:        { bg: '#fee2e2', text: '#991b1b', label: 'Failed' },
}

export default function ChatBubble({ message, currentUserId, onQuickReply }) {
  const { senderType, senderName, content, messageType, metadata, createdAt } = message

  const isUser   = senderType === 'USER'
  const isSystem = senderType === 'SYSTEM'
  const isBot    = senderType === 'BOT'
  const isAgent  = senderType === 'AGENT'

  const timeAgo = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : ''

  // ── System message (centered, gray) ──────────────────────────────────────
  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <span style={{
          fontSize:     '12px',
          color:        '#94a3b8',
          background:   '#f1f5f9',
          borderRadius: '20px',
          padding:      '4px 12px',
          display:      'inline-block',
        }}>
          {content}
        </span>
      </div>
    )
  }

  // ── Avatar for bot/agent ───────────────────────────────────────────────────
  const avatar = isBot ? '🫙' : isAgent ? '👤' : null

  return (
    <div style={{
      display:       'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems:    'flex-end',
      gap:           '8px',
    }}>
      {/* Avatar (only for bot/agent) */}
      {!isUser && (
        <div style={{
          width:        '32px', height: '32px',
          borderRadius: '50%',
          background:   isBot
            ? 'linear-gradient(135deg, #f97316, #ea580c)'
            : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          display:      'flex', alignItems: 'center', justifyContent: 'center',
          fontSize:     '14px', color: '#fff',
          flexShrink:   0,
        }}>
          {avatar}
        </div>
      )}

      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: '4px' }}>
        {/* Sender name */}
        {!isUser && (
          <span style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: '4px', fontWeight: 600 }}>
            {senderName}
          </span>
        )}

        {/* ── Order Card ────────────────────────────────────────────────────── */}
        {messageType === 'ORDER_CARD' && metadata?.orderId ? (
          <div style={{
            background:   '#fff',
            border:       '1.5px solid #e2e8f0',
            borderRadius: '14px',
            padding:      '14px',
            minWidth:     '240px',
          }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Order</div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#0f172a', marginBottom: '10px', fontWeight: 600 }}>
              #{String(metadata.orderId).slice(-8).toUpperCase()}
            </div>

            {(() => {
              const s = STATUS_COLORS[metadata.status] || { bg: '#f1f5f9', text: '#475569', label: metadata.status }
              return (
                <span style={{ background: s.bg, color: s.text, borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 700 }}>
                  {s.label}
                </span>
              )
            })()}

            {metadata.trackingNumber && (
              <div style={{ marginTop: '10px', padding: '8px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Tracking: </span>
                <strong style={{ color: '#0f172a' }}>{metadata.trackingNumber}</strong>
              </div>
            )}

            {content && (
              <div style={{ marginTop: '10px', color: '#374151', fontSize: '13px', lineHeight: 1.5 }}>
                {content}
              </div>
            )}
          </div>
        ) : (
          /* ── Regular text bubble ──────────────────────────────────────────── */
          <div style={{
            background:   isUser
              ? 'linear-gradient(135deg, #f97316, #ea580c)'
              : isBot
                ? '#f1f5f9'
                : '#fff',
            color:        isUser ? '#fff' : '#0f172a',
            borderRadius: isUser
              ? '18px 18px 4px 18px'
              : '18px 18px 18px 4px',
            padding:      '10px 14px',
            fontSize:     '14px',
            lineHeight:   1.5,
            boxShadow:    isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
            border:       !isUser && !isBot ? '1.5px solid #e2e8f0' : 'none',
            whiteSpace:   'pre-wrap',
            wordBreak:    'break-word',
          }}>
            {content}
          </div>
        )}

        {/* ── Quick Reply Buttons ────────────────────────────────────────────── */}
        {messageType === 'QUICK_REPLY' && metadata?.options?.length > 0 && onQuickReply && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {metadata.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onQuickReply(opt)}
                style={{
                  background:   '#fff',
                  border:       '1.5px solid #f97316',
                  color:        '#ea580c',
                  borderRadius: '20px',
                  padding:      '6px 14px',
                  fontSize:     '12px',
                  fontWeight:   600,
                  cursor:       'pointer',
                  transition:   'all 0.15s',
                  whiteSpace:   'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span style={{ fontSize: '10px', color: '#cbd5e1', paddingLeft: '4px', paddingRight: '4px' }}>
          {timeAgo}
        </span>
      </div>
    </div>
  )
}
