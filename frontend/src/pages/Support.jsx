import { useState, useEffect, useRef } from "react";
import api from '../api/axios'
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, LifeBuoy, Send, Plus, ChevronLeft,
  Search, X, CheckCircle, AlertCircle, Clock, HelpCircle
} from "lucide-react";
import { toast } from 'react-toastify'

const CATS = [
  { value: "ORDER_ISSUE",    label: "Order Issue" },
  { value: "PAYMENT_ISSUE",  label: "Payment Problem" },
  { value: "RETURN_REQUEST", label: "Return / Refund" },
  { value: "PRODUCT_ISSUE",  label: "Product Quality" },
  { value: "OTHER",          label: "General Question" },
];

const STATUS = {
  OPEN:        { label: "Open",        color: "text-red-600",    bg: "bg-red-50",    dot: "bg-red-500" },
  IN_PROGRESS: { label: "In Progress", color: "text-orange-600", bg: "bg-orange-50", dot: "bg-orange-500" },
  RESOLVED:    { label: "Resolved",    color: "text-green-600",  bg: "bg-green-50",  dot: "bg-green-500" },
  CLOSED:      { label: "Closed",      color: "text-gray-400",   bg: "bg-gray-50",   dot: "bg-gray-300" },
};

export default function Support() {
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState(null);   // null | 'new' | 'chat'
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("ALL");
  const [form,     setForm]     = useState({ subject: "", category: "", message: "" });
  const [reply,    setReply]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sending,    setSending]    = useState(false);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchTickets();
    const iv = setInterval(fetchTickets, 8000);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => { clearInterval(iv); window.removeEventListener("resize", onResize); };
  }, []);

  useEffect(() => {
    if (view === 'chat') bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [view, selected, tickets]);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/api/support/my");
      const data = res.data || [];
      setTickets(data);
      if (selected) {
        const updated = data.find(t => t._id === selected._id);
        if (updated) setSelected(updated);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/support", form);
      setForm({ subject: "", category: "", message: "" });
      setView(null);
      toast.success('Ticket submitted! We will get back to you soon.');
      fetchTickets();
    } catch { toast.error('Could not submit ticket. Try again.'); }
    finally { setSubmitting(false); }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    const text = reply;
    setReply("");
    try {
      await api.post(`/api/support/${selected._id}/reply`, { message: text });
      fetchTickets();
    } catch { setReply(text); toast.error('Could not send message'); }
    finally { setSending(false); }
  };

  const visible = tickets
    .filter(t => filter === "ALL" || t.status === filter)
    .filter(t => !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketId?.toLowerCase().includes(search.toLowerCase())
    );

  const showLeft  = !isMobile || !view;
  const showRight = !isMobile || !!view;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-start justify-center p-3 sm:p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row" style={{ minHeight: 600, height: 'calc(100vh - 100px)' }}>

        {/* ── Left: Ticket list ── */}
        {showLeft && (
          <div className="w-full md:w-80 border-r border-gray-100 flex flex-col shrink-0">

            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LifeBuoy size={18} className="text-orange-500" />
                  <span className="font-semibold text-gray-900 text-sm">Support</span>
                </div>
                <button
                  onClick={() => setView('new')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus size={13} /> New Ticket
                </button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:border-orange-400 transition-colors"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1 px-3 py-2 border-b border-gray-50 overflow-x-auto">
              {['ALL','OPEN','IN_PROGRESS','RESOLVED'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'IN_PROGRESS' ? 'In Progress' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading tickets...</div>
              ) : visible.length === 0 ? (
                <div className="p-8 text-center">
                  <HelpCircle size={32} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No tickets found</p>
                </div>
              ) : visible.map(t => {
                const s = STATUS[t.status] || STATUS.OPEN;
                return (
                  <button
                    key={t._id}
                    onClick={() => { setSelected(t); setView('chat'); }}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selected?._id === t._id ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.subject}</p>
                      <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${s.dot}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.color}`}>{s.label}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Right: Main panel ── */}
        {showRight && (
          <div className="flex-1 flex flex-col min-w-0">

            {/* Empty state */}
            {!view && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                  <LifeBuoy size={28} className="text-orange-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">How can we help?</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-xs">
                  Select a ticket from the list, or create a new one and we'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setView('new')}
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-orange-500 transition-colors"
                >
                  + New Support Ticket
                </button>
              </div>
            )}

            {/* New ticket form */}
            {view === 'new' && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  {isMobile && (
                    <button onClick={() => setView(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">New Support Ticket</h3>
                    <p className="text-xs text-gray-400">We usually reply within 24 hours</p>
                  </div>
                  <button onClick={() => setView(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <form onSubmit={handleCreate} className="max-w-lg mx-auto space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input
                        required
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder="e.g. Wrong product delivered"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        required
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-orange-400 transition-all cursor-pointer"
                      >
                        <option value="">Select a category</option>
                        {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        placeholder="Describe your issue in detail..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
                      {submitting ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Chat view */}
            {view === 'chat' && selected && (
              <div className="flex-1 flex flex-col min-h-0">

                {/* Chat header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
                  {isMobile && (
                    <button onClick={() => setView(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selected.subject}</p>
                    <p className="text-xs text-gray-400">#{selected.ticketId} · {selected.category?.replace('_',' ')}</p>
                  </div>
                  {(() => {
                    const s = STATUS[selected.status] || STATUS.OPEN;
                    return (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${s.bg} ${s.color}`}>
                        {s.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-center py-3">
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  {selected.messages?.map((msg, i) => {
                    const isMe = msg.sender === 'user';
                    return (
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-4 py-3 ${
                          isMe ? 'bg-gray-900 text-white rounded-br-md' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
                        }`}>
                          {!isMe && (
                            <p className="text-xs font-semibold text-orange-500 mb-1">DhaniFresh Support</p>
                          )}
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          <p className={`text-xs mt-2 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Reply input */}
                {['CLOSED','RESOLVED'].includes(selected.status) ? (
                  <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500">
                    This ticket is closed. <button onClick={() => setView('new')} className="text-orange-500 font-medium">Open a new ticket</button>
                  </div>
                ) : (
                  <div className="p-4 border-t border-gray-100 shrink-0">
                    <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-400 focus-within:bg-white transition-all p-2">
                      <textarea
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                        placeholder="Type your reply... (Enter to send)"
                        className="flex-1 bg-transparent outline-none text-sm px-2 py-1 resize-none min-h-[40px] max-h-[120px]"
                        rows={1}
                      />
                      <button
                        onClick={handleReply}
                        disabled={!reply.trim() || sending}
                        className={`p-2.5 rounded-lg transition-colors shrink-0 ${
                          reply.trim() ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
