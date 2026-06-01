import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare, FiLifeBuoy, FiCheckCircle,
  FiUser, FiSend, FiSearch,
  FiArrowLeft, FiPackage, FiX, FiAlertCircle, FiClock
} from "react-icons/fi";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import RestrictedAccess from "../../components/RestrictedAccess";
import { toast } from "react-toastify";

const STATUS_CFG = {
  OPEN:        { label: "Open",        dot: "var(--danger)",  text: "var(--danger)",  bg: "rgba(229,62,62,0.08)", border: "rgba(229,62,62,0.25)" },
  IN_PROGRESS: { label: "In Progress", dot: "var(--warning)", text: "var(--warning)", bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.25)" },
  RESOLVED:    { label: "Resolved",    dot: "var(--success)", text: "var(--success)", bg: "rgba(56,161,105,0.08)", border: "rgba(56,161,105,0.25)" },
  CLOSED:      { label: "Closed",      dot: "var(--text-muted)", text: "var(--text-muted)", bg: "var(--bg-alt)", border: "var(--border-color)" },
};

const CAT_LABELS = {
  ORDER_ISSUE:    { label: "Order Issue",      icon: "📦" },
  PAYMENT_ISSUE:  { label: "Payment Problem",  icon: "💳" },
  RETURN_REQUEST: { label: "Return / Refund",  icon: "↩️" },
  PRODUCT_ISSUE:  { label: "Product Quality",  icon: "⚠️" },
  OTHER:          { label: "General",          icon: "💬" },
};

const StatusDot = ({ status }) => {
  const s = STATUS_CFG[status] || STATUS_CFG.OPEN;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px',
      borderRadius: 99, fontSize: 10, fontWeight: 800, background: s.bg, color: s.text, border: `1px solid ${s.border}`
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  );
};

const timeAgo = (date) => {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function AdminSupport() {
  const { user, hasPermission } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    if (hasPermission('support')) fetchTickets(true);
    const iv = setInterval(() => { if (hasPermission('support')) fetchTickets(false); }, 10000);
    return () => { clearInterval(iv); window.removeEventListener("resize", onResize); };
  }, [hasPermission]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages?.length]);

  const fetchTickets = async (showLoad = false) => {
    if (!hasPermission('support')) return;
    if (showLoad) setLoading(true);
    try {
      const res = await api.get("/api/support/admin");
      const data = res.data || [];
      setTickets(data);
      if (selected) {
        const updated = data.find(t => t._id === selected._id);
        if (updated) setSelected(updated);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const sendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selected) return;
    setSending(true);
    const text = replyText;
    setReplyText("");
    try {
      await api.post(`/api/support/${selected._id}/reply`, { message: text });
      fetchTickets(false);
    } catch { setReplyText(text); toast.error("Failed to send reply"); }
    finally { setSending(false); }
  };

  const updateStatus = async (status) => {
    if (!selected) return;
    try {
      await api.put(`/api/support/${selected._id}/status`, { status });
      toast.success(`Ticket marked as ${STATUS_CFG[status]?.label}`);
      fetchTickets(false);
    } catch { toast.error("Failed to update status"); }
  };

  const filtered = tickets.filter(t => {
    const matchF = filter === "ALL" || t.status === filter;
    const q = search.toLowerCase();
    const matchS = !q || t.subject.toLowerCase().includes(q) ||
      t.user?.name?.toLowerCase().includes(q) ||
      t.ticketId?.toLowerCase().includes(q);
    return matchF && matchS;
  });

  const counts = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
  };

  if (!hasPermission('support')) return (
    <RestrictedAccess title="Access Restricted" message="You don't have permission to access the support panel." />
  );

  if (loading && tickets.length === 0) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto"
          style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--brand-secondary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12, textAlign: 'center', fontWeight: 600 }}>Loading support tickets…</p>
      </div>
    </div>
  );

  const showSidebar = !isMobile || !selected;
  const showChat = !isMobile || !!selected;

  return (
    <div style={{ display: 'flex', overflow: 'hidden', background: 'var(--bg-base)', height: 'calc(100vh - 106px)' }}>
      
      {/* ─── LEFT: Ticket List ─── */}
      {showSidebar && (
        <div style={{ width: isMobile ? '100%' : 360, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          {/* Header */}
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(245,166,35,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiLifeBuoy size={18} style={{ color: 'var(--brand-secondary)' }} />
                </div>
                <div>
                  <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0, lineHeight: 1.2 }}>Support</h1>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {counts.open > 0
                      ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{counts.open} open</span>
                      : 'All resolved'}
                    {counts.inProgress > 0 && <span style={{ margin: '0 4px', color: 'var(--border-color)' }}>·</span>}
                    {counts.inProgress > 0 && <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{counts.inProgress} in progress</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <FiSearch size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, subject, #ID..."
                style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'var(--bg-alt)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-input)', fontSize: 12, outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--brand-secondary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="no-scrollbar">
              {[
                { v: 'ALL', label: 'All' },
                { v: 'OPEN', label: 'Open', count: counts.open },
                { v: 'IN_PROGRESS', label: 'In Progress', count: counts.inProgress },
                { v: 'RESOLVED', label: 'Resolved' },
              ].map(f => (
                <button key={f.v} onClick={() => setFilter(f.v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s', border: '1px solid', cursor: 'pointer',
                    ...(filter === f.v
                      ? { background: 'var(--navy)', color: '#fff', borderColor: 'var(--navy)' }
                      : { background: 'var(--bg-alt)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' })
                  }}>
                  {f.label}
                  {f.count > 0 && (
                    <span style={{ fontSize: 9, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 800, background: filter === f.v ? '#fff' : 'var(--danger)', color: filter === f.v ? 'var(--navy)' : '#fff' }}>
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Cards */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <FiMessageSquare size={28} style={{ color: 'var(--border-color)', margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>No tickets</p>
              </div>
            ) : filtered.map(t => {
              const active = selected?._id === t._id;
              const cat = CAT_LABELS[t.category] || { label: t.category, icon: '💬' };
              const lastMsg = t.messages[t.messages.length - 1];
              const s = STATUS_CFG[t.status] || STATUS_CFG.OPEN;
              const hasUnread = t.status === 'OPEN' && lastMsg?.sender === 'user';

              return (
                <button key={t._id} onClick={() => setSelected(t)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 16px', borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12, borderLeft: `3px solid ${active ? 'var(--brand-secondary)' : 'transparent'}`,
                    ...(active ? { background: 'rgba(245,166,35,0.06)' } : { background: 'transparent' })
                  }}
                  onMouseEnter={e => { if(!active) e.currentTarget.style.background = 'var(--bg-alt)' }}
                  onMouseLeave={e => { if(!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(245,166,35,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-secondary)', fontWeight: 800, fontSize: 14, flexShrink: 0, border: '1.5px solid rgba(245,166,35,0.3)' }}>
                    {t.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.user?.name || 'Customer'}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(t.createdAt)}</span>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{t.subject}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cat.icon} {cat.label}</span>
                        {t.ticketId && <span style={{ fontSize: 10, color: 'var(--border-color)' }}>· #{t.ticketId}</span>}
                      </div>
                      <StatusDot status={t.status} />
                    </div>
                    {lastMsg && (
                      <p style={{ fontSize: 11, color: hasUnread ? 'var(--text-primary)' : 'var(--text-muted)', marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: hasUnread ? 600 : 400 }}>
                        <span style={{ color: lastMsg.sender === 'admin' ? 'var(--text-muted)' : 'inherit' }}>
                          {lastMsg.sender === 'admin' ? 'You: ' : ''}
                        </span>
                        {lastMsg.message}
                      </p>
                    )}
                  </div>
                  {hasUnread && <div style={{ width: 8, height: 8, background: 'var(--brand-secondary)', borderRadius: '50%', flexShrink: 0, marginTop: 8 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── RIGHT: Chat Panel ─── */}
      {showChat && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-base)' }}>
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32 }}>
                <div style={{ width: 64, height: 64, background: 'var(--bg-alt)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <FiMessageSquare size={28} style={{ color: 'var(--border-color)' }} />
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Select a ticket</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Pick a conversation from the list to view and reply</p>
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>

                {/* Chat Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    {isMobile && (
                      <button onClick={() => setSelected(null)} style={{ padding: 6, background: 'transparent', border: 'none', color: 'var(--text-primary)', borderRadius: 8, cursor: 'pointer' }}>
                        <FiArrowLeft size={18} />
                      </button>
                    )}
                    <div style={{ width: 36, height: 36, background: 'rgba(245,166,35,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-secondary)', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                      {selected.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selected.user?.name || 'Customer'}
                        </span>
                        <StatusDot status={selected.status} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        <span>{selected.user?.email}</span>
                        {selected.ticketId && <><span style={{ color: 'var(--border-color)' }}>·</span><span>#{selected.ticketId}</span></>}
                        {selected.category && <><span style={{ color: 'var(--border-color)' }}>·</span><span>{CAT_LABELS[selected.category]?.label || selected.category}</span></>}
                      </div>
                    </div>
                  </div>

                  {/* Status switcher */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(st => {
                      const cfg = STATUS_CFG[st];
                      const active = selected.status === st;
                      return (
                        <button key={st} onClick={() => updateStatus(st)} title={cfg.label}
                          style={{
                            padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                            ...(active ? { background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)', color: 'var(--text-primary)' } : { background: 'transparent', color: 'var(--text-muted)' })
                          }}>
                          {st === 'IN_PROGRESS' ? 'Progress' : cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subject + Order bar */}
                <div style={{ padding: '10px 20px', background: 'var(--bg-alt)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <FiMessageSquare size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.subject}</span>
                  {selected.order && (
                    <>
                      <span style={{ color: 'var(--border-color)' }}>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-secondary)', fontWeight: 700 }}>
                        <FiPackage size={11} />
                        Order #{(selected.order._id || selected.order).toString().slice(-8).toUpperCase()}
                      </span>
                    </>
                  )}
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-alt)', padding: '4px 12px', borderRadius: 99, fontWeight: 600 }}>
                      {new Date(selected.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {(selected.messages || []).map((m, idx) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                        {!isAdmin && (
                          <div style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(245,166,35,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-secondary)', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                            {selected.user?.name?.charAt(0) || 'C'}
                          </div>
                        )}
                        <div style={{ maxWidth: '72%' }}>
                          <div style={{
                            padding: '10px 14px', fontSize: 14, lineHeight: 1.5,
                            ...(isAdmin
                              ? { background: 'var(--navy)', color: '#fff', borderRadius: '16px 16px 4px 16px' }
                              : { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '16px 16px 16px 4px', boxShadow: 'var(--shadow-sm)' }
                            )
                          }}>
                            {m.message}
                          </div>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: isAdmin ? 'right' : 'left' }}>
                            {isAdmin ? user?.name || 'Admin' : selected.user?.name || 'Customer'}
                            {' · '}
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {isAdmin && (
                          <div style={{ width: 28, height: 28, borderRadius: 10, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                            {user?.name?.charAt(0) || 'A'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply bar */}
                {selected.status === 'CLOSED' ? (
                  <div style={{ padding: '16px 20px', textAlign: 'center', background: 'var(--bg-alt)', borderTop: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                    This ticket is closed.
                  </div>
                ) : (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)', flexShrink: 0 }}>
                    <form onSubmit={sendReply} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <textarea
                          placeholder="Write a reply... (Enter to send)"
                          value={replyText} onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-input)', border: '1.5px solid var(--border-color)', background: 'var(--bg-alt)', outline: 'none', fontSize: 14, color: 'var(--text-primary)', resize: 'none', transition: 'all 0.2s', minHeight: 44, maxHeight: 120, fontFamily: 'var(--font)' }}
                          onFocus={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--brand-secondary)' }}
                          onBlur={e => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
                          rows={1}
                        />
                      </div>
                      <button type="submit" disabled={sending || !replyText.trim()}
                        style={{
                          width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0, border: 'none', cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                          ...(replyText.trim()
                            ? { background: 'var(--brand-secondary)', color: '#fff' }
                            : { background: 'var(--bg-alt)', color: 'var(--text-muted)' })
                        }}>
                        {sending
                          ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                          : <FiSend size={18} />}
                      </button>
                    </form>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Replying as <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{user?.name}</span>
                      </span>
                      {selected.status !== 'RESOLVED' && (
                        <button onClick={() => updateStatus('RESOLVED')}
                          style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                          <FiCheckCircle size={11} /> Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
