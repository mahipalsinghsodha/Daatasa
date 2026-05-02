import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare, FiLifeBuoy, FiClock, FiCheckCircle,
  FiUser, FiSend, FiRefreshCw, FiChevronDown, FiSearch, FiFilter, 
  FiArrowLeft, FiPaperclip, FiMoreVertical, FiTag, FiShieldOff, FiSlash, 
  FiChevronRight, FiX, FiActivity
} from "react-icons/fi";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import RestrictedAccess from "../../components/RestrictedAccess";
import { toast } from "react-toastify";

// ── Design Tokens ──────────────────────────────────────────────────────────────
const T = {
  bg: '#f8fafc', 
  surface: '#ffffff', 
  surfaceHigh: '#f1f5f9', 
  border: '#e2e8f0',
  accent: '#e8621a', 
  accentDim: '#fff4ee', 
  success: '#10b981', 
  successDim: '#f0fdf4',
  danger: '#ef4444', 
  dangerDim: '#fef2f2', 
  info: '#3b82f6', 
  infoDim: '#eff6ff',
  warning: '#f59e0b', 
  warningDim: '#fff7ed',
  text: '#0f172a', 
  textMid: '#475569', 
  textDim: '#94a3b8',
  white: '#ffffff',
  font: '"Inter", "Plus Jakarta Sans", sans-serif',
}

const STATUS_CFG = {
  OPEN:        { label: "OPEN",        color: T.danger,  bg: T.dangerDim },
  IN_PROGRESS: { label: "IN PROGRESS", color: T.warning, bg: T.warningDim },
  RESOLVED:    { label: "RESOLVED",    color: T.success, bg: T.successDim },
  CLOSED:      { label: "CLOSED",      color: T.textDim, bg: T.surfaceHigh },
};

// ── Primitives ─────────────────────────────────────────────────────────────────
const StatusMarker = ({ status }) => {
  const s = STATUS_CFG[status] || STATUS_CFG.OPEN;
  return (
    <span style={{
      background: s.bg, color: s.color, padding: "4px 10px",
      borderRadius: 10, fontSize: 10, fontWeight: 900, whiteSpace: "nowrap",
      border: `1.5px solid ${s.color}20`, letterSpacing: '0.05em'
    }}>{s.label}</span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminSupport() {
  const { user, hasPermission } = useAuth();
  const [tickets, setTickets]       = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText]   = useState("");
  const [loading, setLoading]       = useState(false);
  const [filter, setFilter]         = useState("ALL");
  const [search, setSearch]         = useState("");
  const [sending, setSending]       = useState(false);
  const [isMobile, setIsMobile]     = useState(typeof window !== 'undefined' && window.innerWidth < 1024);

  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    if (hasPermission('support')) fetchTickets(true);
    
    const interval = setInterval(() => {
      if (hasPermission('support')) fetchTickets(false);
    }, 10000);
    
    return () => {
       clearInterval(interval);
       window.removeEventListener("resize", handleResize);
    };
  }, [hasPermission]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages?.length]);

  const fetchTickets = async (showLoad = false) => {
    if (!hasPermission('support')) return;
    if (showLoad) setLoading(true);
    try {
      const res = await api.get("/api/support/admin", { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data || [];
      setTickets(data);
      if (selectedTicket) {
        const updated = data.find(t => t._id === selectedTicket._id);
        if (updated && (updated.messages.length !== selectedTicket.messages.length || updated.status !== selectedTicket.status)) {
          setSelectedTicket(updated);
        }
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const sendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      await api.post(`/api/support/reply/${selectedTicket._id}`, { message: replyText }, { headers: { Authorization: `Bearer ${token}` } });
      setReplyText("");
      fetchTickets(false);
    } catch (e) {
      toast.error("Transmission failed");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status) => {
    if (!selectedTicket) return;
    try {
      await api.patch(`/api/support/status/${selectedTicket._id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Protocol state: ${status}`);
      fetchTickets(false);
    } catch (e) { toast.error("State transition failed"); }
  };

  const filtered = tickets.filter(t => {
    const matchF = filter === "ALL" ? true : t.status === filter;
    const q = search.toLowerCase();
    const matchS = !q || t.subject.toLowerCase().includes(q) || t.user?.name?.toLowerCase().includes(q) || t._id.includes(q);
    return matchF && matchS;
  });

  if (!hasPermission('support')) return <RestrictedAccess title="Support Restricted" message="Your account lacks the clearance to monitor or respond to client distress signals. Contact system overseer." />;

  if (loading && tickets.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: T.font }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ color: T.textMid, marginTop: 16, fontWeight: 700 }}>Orchestrating Support Nodes...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, color: T.text, fontFamily: T.font, overflow: 'hidden' }}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 10px; }
        .ticket-item:hover { background: #fcfcfd !important; }
        .btn-hover:hover { background: ${T.surfaceHigh}; transform: translateY(-1px); }
        @media (max-width: 1023px) { 
           .sidebar { width: 100% !important; border-right: none !important; }
           .chat-main { position: fixed !important; inset: 0; z-index: 200; background: ${T.bg} !important; }
        }
      `}</style>

      {/* ── Side Matrix (Ticket List) ── */}
      <div className="sidebar" style={{ 
        width: 400, borderRight: `1.5px solid ${T.border}`, background: T.surface, 
        display: (isMobile && selectedTicket) ? 'none' : 'flex', flexDirection: 'column', flexShrink: 0 
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '24px', borderBottom: `1.5px solid ${T.border}`, background: T.white }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, background: T.accentDim, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
              <FiLifeBuoy size={24}/>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>Distress Feed</h1>
              <p style={{ margin: 0, fontSize: 12, color: T.textDim, fontWeight: 600 }}>Active Support Requests</p>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <FiSearch size={16} color={T.textDim} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search signals…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 42px', background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 12, outline: 'none', fontSize: 14, fontWeight: 500 }} />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 24px', background: T.bg, borderBottom: `1.5px solid ${T.border}`, overflowX: 'auto' }}>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(stat => (
            <button key={stat} onClick={() => setFilter(stat)}
              style={{ 
                padding: '6px 12px', borderRadius: 8, fontSize: 10, fontWeight: 800, border: 'none', cursor: 'pointer', transition: '0.2s',
                background: filter === stat ? T.accent : T.surfaceHigh,
                color: filter === stat ? '#fff' : T.textMid,
              }}>
              {stat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Scrollable Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: T.textDim }}>
              <FiMessageSquare size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
              <div style={{ fontSize: 14, fontWeight: 700 }}>Silence in the feed.</div>
            </div>
          ) : filtered.map(t => {
            const active = selectedTicket?._id === t._id;
            const lastMsg = t.messages[t.messages.length - 1];
            return (
              <div key={t._id} onClick={() => setSelectedTicket(t)} className="ticket-item"
                style={{
                  padding: '16px', borderRadius: 16, cursor: 'pointer', transition: '0.2s', marginBottom: 8,
                  background: active ? T.accentDim : 'transparent',
                  border: `1.5px solid ${active ? T.accent : 'transparent'}`
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <StatusMarker status={t.status} />
                  <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: active ? T.accent : T.text, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</div>
                <div style={{ fontSize: 13, color: T.textMid, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                   <FiUser size={12}/> {t.user?.name || 'Anonymous Node'}
                </div>
                {lastMsg && (
                  <div style={{ fontSize: 12, color: T.textDim, background: T.surfaceHigh, padding: '8px 12px', borderRadius: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lastMsg.message}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Main Panel (Chat / Response) ── */}
      <div className="chat-main" style={{ flex: 1, display: (selectedTicket || !isMobile) ? 'flex' : 'none', flexDirection: 'column', background: T.surface }}>
        <AnimatePresence mode="wait">
          {!selectedTicket ? (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.textDim }}>
               <FiMessageSquare size={60} style={{ opacity: 0.1, marginBottom: 24 }}/>
               <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Signal Monitor Standby</h2>
               <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Select a distress signal to begin communication.</p>
            </motion.div>
          ) : (
            <motion.div key="selected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
               {/* Detail Header */}
               <div style={{ padding: '24px 32px', borderBottom: `2px solid ${T.border}`, background: T.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {isMobile && <button onClick={() => setSelectedTicket(null)} style={{ background: T.surfaceHigh, border: 'none', borderRadius: 10, padding: 10 }}><FiArrowLeft/></button>}
                    <div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: '-0.01em' }}>{selectedTicket.subject}</h2>
                          <StatusMarker status={selectedTicket.status} />
                       </div>
                       <div style={{ fontSize: 12, color: T.textMid, fontWeight: 600 }}>Protocol ID: {selectedTicket._id.toUpperCase()} • Sector: {selectedTicket.category || 'General'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: T.bg, padding: 4, borderRadius: 12, border: `1.5px solid ${T.border}` }}>
                      {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(st => (
                        <button key={st} onClick={() => updateStatus(st)}
                          style={{ 
                            padding: '6px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, border: 'none', cursor: 'pointer', transition: '0.2s',
                            background: selectedTicket.status === st ? T.white : 'transparent',
                            color: selectedTicket.status === st ? T.accent : T.textDim,
                            boxShadow: selectedTicket.status === st ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                          }} title={`Transition to ${st.replace(/_/g, ' ')}`}>
                          {st.charAt(0)}
                        </button>
                      ))}
                    </div>
                    <button className="btn-hover" style={{ padding: 10, borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.white, cursor: 'pointer', color: T.textMid }}><FiMoreVertical/></button>
                  </div>
               </div>

               {/* Messages Feed */}
               <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, background: '#fcfcfd' }}>
                  {/* Internal Log: Ticket Creation */}
                  <div style={{ textAlign: 'center' }}>
                     <span style={{ fontSize: 11, fontWeight: 800, color: T.textDim, background: T.surfaceHigh, padding: '4px 16px', borderRadius: 20 }}>DISTRESS SIGNAL INITIATED • {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>

                  {(selectedTicket.messages || []).map((m, idx) => {
                    const isBot = m.sender === 'system';
                    const isAdmin = m.senderRole === 'admin' || m.senderRole === 'superadmin';
                    const isUser = !isAdmin && !isBot;
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: isUser ? 'flex-start' : 'flex-end', alignItems: 'flex-start', gap: 12 }}>
                         {isUser && <div style={{ width: 32, height: 32, borderRadius: 10, background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, fontWeight: 900, fontSize: 12, mt: 4 }}>{selectedTicket.user?.name?.charAt(0) || 'U'}</div>}
                         <div style={{ maxWidth: '70%' }}>
                            <div style={{ 
                               padding: '16px 20px', borderRadius: 20, fontSize: 14, fontWeight: 500, lineHeight: 1.6,
                               background: isUser ? T.white : isAdmin ? T.accent : T.surfaceHigh,
                               color: isUser ? T.text : isAdmin ? '#fff' : T.textMid,
                               border: isUser ? `1.5px solid ${T.border}` : 'none',
                               borderBottomLeftRadius: isUser ? 4 : 20,
                               borderBottomRightRadius: !isUser ? 4 : 20,
                               boxShadow: isUser ? '0 4px 12px rgba(0,0,0,0.02)' : 'none'
                            }}>
                              {m.message}
                            </div>
                            <div style={{ marginTop: 6, fontSize: 11, color: T.textDim, fontWeight: 600, textAlign: isUser ? 'left' : 'right' }}>
                              {isAdmin ? 'MISSION CONTROL' : isUser ? 'CLIENT NODE' : 'SYSTEM'} • {formatTime(m.timestamp)}
                            </div>
                         </div>
                         {!isUser && <div style={{ width: 32, height: 32, borderRadius: 10, background: isAdmin ? T.accent : T.surfaceHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isAdmin ? '#fff' : T.textDim, fontWeight: 900, fontSize: 12, mt: 4 }}>{isAdmin ? 'A' : 'S'}</div>}
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
               </div>

               {/* Response Interface */}
               {selectedTicket.status !== 'CLOSED' ? (
                 <div style={{ padding: '24px 32px', borderTop: `2px solid ${T.border}`, background: T.white }}>
                    <form onSubmit={sendReply} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                       <div style={{ flex: 1, position: 'relative' }}>
                          <textarea placeholder="Transmit response protocol…" value={replyText} onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendReply(); } }}
                            style={{ 
                               width: '100%', minHeight: 60, maxHeight: 200, padding: '16px 20px', borderRadius: 16, 
                               border: `2px solid ${T.border}`, background: T.bg, outline: 'none', 
                               fontSize: 14, fontWeight: 500, fontFamily: T.font, resize: 'none'
                             }} className="input-focus" />
                       </div>
                       <button type="submit" disabled={sending || !replyText.trim()}
                         style={{ 
                            width: 56, height: 56, borderRadius: 16, background: T.accent, color: '#fff', border: 'none', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s',
                            opacity: (sending || !replyText.trim()) ? 0.6 : 1, boxShadow: `0 8px 20px ${T.accent}30`
                         }}>
                         {sending ? <FiRefreshCw className="spin"/> : <FiSend size={22}/>}
                       </button>
                    </form>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                       <span style={{ fontSize: 11, color: T.textDim, fontWeight: 700 }}>OPERATOR: {user?.name.toUpperCase()} (MISSION CONTROL)</span>
                       <div style={{ display: 'flex', gap: 12 }}>
                         <button style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}><FiPaperclip/> Attach Signal</button>
                         <button onClick={() => updateStatus('RESOLVED')} style={{ background: 'none', border: 'none', color: T.success, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800 }}><FiCheckCircle/> Resolve Ticket</button>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div style={{ padding: '32px', textAlign: 'center', background: T.surfaceHigh, color: T.textDim, fontWeight: 800, textTransform: 'uppercase', fontSize: 13, borderTop: `2px solid ${T.border}` }}>
                   PROTOCOL TERMINATED: Distress Signal Resolved and Secured.
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
