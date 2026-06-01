// frontend/src/components/chat/ChatBubble.jsx
// Renders a single chat message bubble
// Supports: USER, AGENT, BOT, SYSTEM message types
// Supports: TEXT, ORDER_CARD, QUICK_REPLY message types

import { formatDistanceToNow } from 'date-fns'

const STATUS_COLORS = {
  PAID:          { bg: 'rgba(56,161,105,0.10)', text: 'var(--success)', label: 'Paid' },
  PENDING:       { bg: 'rgba(214,158,46,0.10)', text: 'var(--warning)', label: 'Pending' },
  CONFIRMED:     { bg: 'rgba(49,130,206,0.10)', text: 'var(--info)',    label: 'Confirmed' },
  PROCESSING:    { bg: 'rgba(49,130,206,0.10)', text: 'var(--info)',    label: 'Processing' },
  SHIPPED:       { bg: 'rgba(49,130,206,0.10)', text: 'var(--info)',    label: 'Shipped' },
  DELIVERED:     { bg: 'rgba(56,161,105,0.10)', text: 'var(--success)', label: 'Delivered' },
  CANCELLED:     { bg: 'rgba(229,62,62,0.10)',  text: 'var(--danger)',  label: 'Cancelled' },
  FAILED:        { bg: 'rgba(229,62,62,0.10)',  text: 'var(--danger)',  label: 'Failed' },
}

export default function ChatBubble({ message, currentUserId, onQuickReply }) {
  const { senderType, senderName, content, messageType, metadata, createdAt } = message

  const isUser   = senderType === 'USER'
  const isSystem = senderType === 'SYSTEM'
  const isBot    = senderType === 'BOT'

  const timeAgo = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : ''

  // ── System message (centered, muted) ──────────────────────────────────────
  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <span style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          background: 'var(--bg-alt)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '4px 12px',
          display: 'inline-block',
          fontFamily: 'var(--font)',
          fontWeight: 500,
        }}>
          {content}
        </span>
      </div>
    )
  }

  // ── Avatar for bot/agent ───────────────────────────────────────────────────
  const avatar = isBot ? '🫙' : '👤'

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: '8px',
    }}>
      {/* Avatar (only for bot/agent) */}
      {!isUser && (
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '50%',
          background: isBot ? 'var(--brand-gradient)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', color: '#fff',
          flexShrink: 0,
          boxShadow: 'var(--shadow-sm)',
        }}>
          {avatar}
        </div>
      )}

      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: '4px' }}>
        {/* Sender name */}
        {!isUser && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '4px', fontWeight: 600, fontFamily: 'var(--font)' }}>
            {senderName}
          </span>
        )}

        {/* ── Order Card ──────────────────────────────────────────────────── */}
        {messageType === 'ORDER_CARD' && metadata?.orderId ? (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px',
            minWidth: '240px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order</div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 600 }}>
              #{String(metadata.orderId).slice(-8).toUpperCase()}
            </div>

            {(() => {
              const s = STATUS_COLORS[metadata.status] || { bg: 'var(--bg-alt)', text: 'var(--text-muted)', label: metadata.status }
              return (
                <span style={{ background: s.bg, color: s.text, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>
                  {s.label}
                </span>
              )
            })()}

            {metadata.trackingNumber && (
              <div style={{ marginTop: '10px', padding: '8px 10px', background: 'var(--bg-alt)', borderRadius: '8px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tracking: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{metadata.trackingNumber}</strong>
              </div>
            )}

            {content && (
              <div style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, fontFamily: 'var(--font)' }}>
                {content}
              </div>
            )}
          </div>
        ) : (
          /* ── Regular text bubble ────────────────────────────────────────── */
          <div style={{
            background: isUser
              ? 'var(--brand-gradient)'
              : isBot
                ? 'var(--bg-alt)'
                : 'var(--bg-surface)',
            color: isUser ? '#fff' : 'var(--text-primary)',
            borderRadius: isUser
              ? '18px 18px 4px 18px'
              : '18px 18px 18px 4px',
            padding: '10px 14px',
            fontSize: '14px',
            lineHeight: 1.5,
            boxShadow: isUser ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
            border: !isUser && !isBot ? '1.5px solid var(--border-color)' : 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'var(--font)',
          }}>
            {content}
          </div>
        )}

        {/* ── Quick Reply Buttons ──────────────────────────────────────────── */}
        {messageType === 'QUICK_REPLY' && metadata?.options?.length > 0 && onQuickReply && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {metadata.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onQuickReply(opt)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--brand-secondary)',
                  color: 'var(--brand-secondary)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.10)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)' }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', paddingLeft: '4px', paddingRight: '4px', fontFamily: 'var(--font)' }}>
          {timeAgo}
        </span>
      </div>
    </div>
  )
}
