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
  OPEN:        { label: "Open",        dot: "bg-red-500",    text: "text-red-600",    bg: "bg-red-50 border-red-100" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-amber-400",  text: "text-amber-600",  bg: "bg-amber-50 border-amber-100" },
  RESOLVED:    { label: "Resolved",    dot: "bg-emerald-500",text: "text-emerald-600",bg: "bg-emerald-50 border-emerald-100" },
  CLOSED:      { label: "Closed",      dot: "bg-gray-300",   text: "text-gray-400",   bg: "bg-gray-50 border-gray-100" },
};

const CAT_LABELS = {
  ORDER_ISSUE:    { label: "Order Issue",      icon: "📦" },
  PAYMENT_ISSUE:  { label: "Payment Problem",  icon: "💳" },
  RETURN_REQUEST: { label: "Return / Refund",  icon: "↩️" },
  PRODUCT_ISSUE:  { label: "Product Quality",  icon: "⚠️" },
  OTHER:          { label: "General",          icon: "💬" },
};

const StatusDot = ({ status, size = "sm" }) => {
  const s = STATUS_CFG[status] || STATUS_CFG.OPEN;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 mt-3 text-sm">Loading tickets...</p>
      </div>
    </div>
  );

  const showSidebar = !isMobile || !selected;
  const showChat = !isMobile || !!selected;

  return (
    <div className="flex overflow-hidden bg-gray-50" style={{ height: 'calc(100vh - 106px)' }}>
      
      {/* ─── LEFT: Ticket List ─── */}
      {showSidebar && (
        <div className="w-full lg:w-[360px] bg-white border-r border-gray-100 flex flex-col shrink-0">

          {/* Header */}
          <div className="px-4 pt-5 pb-3 border-b border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FiLifeBuoy size={18} className="text-orange-500" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-gray-900 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Support</h1>
                  <p className="text-[11px] text-gray-400">
                    {counts.open > 0
                      ? <span className="text-red-500 font-semibold">{counts.open} open</span>
                      : 'All resolved'}
                    {counts.inProgress > 0 && <span className="text-gray-300 mx-1">·</span>}
                    {counts.inProgress > 0 && <span className="text-amber-500 font-semibold">{counts.inProgress} in progress</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, subject, #ID..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            {/* Filters — compact pills */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {[
                { v: 'ALL', label: 'All' },
                { v: 'OPEN', label: 'Open', count: counts.open },
                { v: 'IN_PROGRESS', label: 'In Progress', count: counts.inProgress },
                { v: 'RESOLVED', label: 'Resolved' },
              ].map(f => (
                <button key={f.v} onClick={() => setFilter(f.v)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    filter === f.v ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  {f.label}
                  {f.count > 0 && (
                    <span className={`text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold ${
                      filter === f.v ? 'bg-white text-gray-900' : 'bg-red-500 text-white'
                    }`}>{f.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Cards */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <FiMessageSquare size={28} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No tickets</p>
              </div>
            ) : filtered.map(t => {
              const active = selected?._id === t._id;
              const cat = CAT_LABELS[t.category] || { label: t.category, icon: '💬' };
              const lastMsg = t.messages[t.messages.length - 1];
              const s = STATUS_CFG[t.status] || STATUS_CFG.OPEN;
              const hasUnread = t.status === 'OPEN' && lastMsg?.sender === 'user';

              return (
                <button key={t._id} onClick={() => setSelected(t)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 transition-colors flex items-start gap-3 ${
                    active ? 'bg-orange-50' : 'hover:bg-gray-50'
                  } ${active ? 'border-l-2 border-l-orange-400' : 'border-l-2 border-l-transparent'}`}>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0 mt-0.5">
                    {t.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-bold text-gray-900 truncate">{t.user?.name || 'Customer'}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(t.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] text-gray-500 truncate font-medium">{t.subject}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400">{cat.icon} {cat.label}</span>
                        {t.ticketId && <span className="text-[10px] text-gray-300">· #{t.ticketId}</span>}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${s.bg} ${s.text}`}>
                        <span className={`w-1 h-1 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                    {lastMsg && (
                      <p className="text-[11px] text-gray-400 mt-1.5 truncate">
                        <span className={lastMsg.sender === 'admin' ? 'text-gray-500' : hasUnread ? 'text-gray-700 font-semibold' : 'text-gray-400'}>
                          {lastMsg.sender === 'admin' ? 'You: ' : ''}
                        </span>
                        {lastMsg.message}
                      </p>
                    )}
                  </div>

                  {hasUnread && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── RIGHT: Chat Panel ─── */}
      {showChat && (
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <FiMessageSquare size={28} className="text-gray-300" />
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Select a ticket</h2>
                <p className="text-sm text-gray-400">Pick a conversation from the list to view and reply</p>
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-0 h-full">

                {/* Chat Header */}
                <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    {isMobile && (
                      <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiArrowLeft size={18} />
                      </button>
                    )}
                    {/* User avatar */}
                    <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                      {selected.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900 truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          {selected.user?.name || 'Customer'}
                        </span>
                        <StatusDot status={selected.status} />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                        <span>{selected.user?.email}</span>
                        {selected.ticketId && <><span className="text-gray-200">·</span><span>#{selected.ticketId}</span></>}
                        {selected.category && <><span className="text-gray-200">·</span><span>{CAT_LABELS[selected.category]?.label || selected.category}</span></>}
                      </div>
                    </div>
                  </div>

                  {/* Status switcher */}
                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(st => {
                      const cfg = STATUS_CFG[st];
                      const active = selected.status === st;
                      return (
                        <button key={st} onClick={() => updateStatus(st)} title={cfg.label}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            active ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'
                          }`}>
                          {st === 'IN_PROGRESS' ? 'Progress' : cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subject + Order bar */}
                <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-3 text-xs text-gray-600">
                  <FiMessageSquare size={13} className="text-gray-400 shrink-0" />
                  <span className="font-semibold truncate">{selected.subject}</span>
                  {selected.order && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="flex items-center gap-1 text-orange-600 font-semibold">
                        <FiPackage size={11} />
                        Order #{(selected.order._id || selected.order).toString().slice(-8).toUpperCase()}
                      </span>
                    </>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3" style={{ background: '#f9fafb' }}>
                  <div className="text-center mb-4">
                    <span className="text-[11px] text-gray-400 bg-gray-100/80 px-3 py-1 rounded-full">
                      {new Date(selected.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {(selected.messages || []).map((m, idx) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                      <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold shrink-0">
                            {selected.user?.name?.charAt(0) || 'C'}
                          </div>
                        )}
                        <div className={`max-w-[72%] sm:max-w-[60%]`}>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isAdmin
                              ? 'bg-gray-900 text-white rounded-br-sm'
                              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                          }`}>
                            {m.message}
                          </div>
                          <p className={`text-[10px] text-gray-400 mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                            {isAdmin ? user?.name || 'Admin' : selected.user?.name || 'Customer'}
                            {' · '}
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
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
                  <div className="px-5 py-4 text-center bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                    This ticket is closed.
                  </div>
                ) : (
                  <div className="px-4 sm:px-5 py-4 border-t border-gray-100 bg-white shrink-0">
                    <form onSubmit={sendReply} className="flex gap-3 items-end">
                      <div className="flex-1 relative">
                        <textarea
                          placeholder="Write a reply... (Enter to send)"
                          value={replyText} onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-400 outline-none text-sm resize-none transition-all"
                          rows={1}
                          style={{ minHeight: 44, maxHeight: 120 }}
                        />
                      </div>
                      <button type="submit" disabled={sending || !replyText.trim()}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                          replyText.trim()
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                        {sending
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <FiSend size={16} />}
                      </button>
                    </form>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[11px] text-gray-400">
                        Replying as <span className="font-medium text-gray-600">{user?.name}</span>
                      </span>
                      {selected.status !== 'RESOLVED' && (
                        <button onClick={() => updateStatus('RESOLVED')}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
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
