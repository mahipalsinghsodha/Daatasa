import { useState, useEffect, useRef } from "react";
import api from '../api/axios'
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronLeft, Package, Search, X, CheckCircle, HelpCircle, ChevronRight, LifeBuoy, MessageSquare } from "lucide-react";
import { toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'

const CATS = [
  { value: "ORDER_ISSUE", label: "Order Issue", icon: "📦" },
  { value: "PAYMENT_ISSUE", label: "Payment Problem", icon: "💳" },
  { value: "RETURN_REQUEST", label: "Return / Refund", icon: "↩️" },
  { value: "PRODUCT_ISSUE", label: "Product Quality", icon: "⚠️" },
  { value: "OTHER", label: "General Question", icon: "💬" },
];

const STATUS = {
  OPEN: { label: "Open", dot: "bg-red-500", bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  RESOLVED: { label: "Resolved", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  CLOSED: { label: "Closed", dot: "bg-gray-300", bg: "bg-gray-50", text: "text-gray-400", border: "border-gray-100" },
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function Support() {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("help");  // 'help' | 'tickets'
  const [step, setStep] = useState(1);       // 1=select order, 2=form
  const [selOrder, setSelOrder] = useState(null);
  const [selected, setSelected] = useState(null);    // ticket in chat
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [form, setForm] = useState({ subject: "", category: "", message: "" });
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchTickets, 10000);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => { clearInterval(iv); window.removeEventListener("resize", onResize); };
  }, []);

  useEffect(() => {
    const oid = searchParams.get('orderId');
    if (oid && orders.length > 0) {
      const found = orders.find(o => o._id === oid);
      if (found) { setSelOrder(found); setStep(2); setTab('help'); }
    }
  }, [searchParams, orders]);

  useEffect(() => {
    if (selected) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages?.length]);

  const fetchAll = async () => {
    try {
      const [tRes, oRes] = await Promise.all([
        api.get("/api/support/my"),
        api.get("/api/orders/myorders"),
      ]);
      setTickets(tRes.data || []);
      setOrders(oRes.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  const fetchTickets = async () => {
    try {
      const res = await api.get("/api/support/my");
      const data = res.data || [];
      setTickets(data);
      if (selected) {
        const up = data.find(t => t._id === selected._id);
        if (up) setSelected(up);
      }
    } catch { }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.category) { toast.error('Please select an issue type'); return; }
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (selOrder) payload.order = selOrder._id;
      await api.post("/api/support", payload);
      setForm({ subject: "", category: "", message: "" });
      setSelOrder(null); setStep(1); setTab("tickets");
      toast.success("Ticket submitted! We'll get back to you soon.");
      fetchTickets();
    } catch { toast.error('Could not submit. Try again.'); }
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
    .filter(t => !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticketId?.toLowerCase().includes(search.toLowerCase()));

  const orderStatus = (o) => {
    if (o.isDelivered) return { label: 'Delivered', cls: 'text-emerald-600 bg-emerald-50' };
    if (o.paymentStatus === 'CANCELLED') return { label: 'Cancelled', cls: 'text-gray-500 bg-gray-50' };
    if (o.isPaid || o.paymentStatus === 'COD_CONFIRMED') return { label: 'Processing', cls: 'text-blue-600 bg-blue-50' };
    return { label: 'Pending', cls: 'text-amber-600 bg-amber-50' };
  };

  // On mobile, when a ticket is selected, show only chat
  const showLeft = !isMobile || (!selected || tab === 'help');
  const showRight = !isMobile || !!selected || tab === 'help';

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center" style={{ background: '#f8f9fa' }}>
      <div className="w-7 h-7 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-20 pt-0" style={{ background: '#f8f9fa' }}>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <LifeBuoy size={19} className="text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Help Center</h1>
              <p className="text-xs text-gray-400">How can we help you today?</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-2">
            <button onClick={() => { setTab('help'); setStep(1); setSelected(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'help' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              Need Help?
            </button>
            <button onClick={() => { setTab('tickets'); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${tab === 'tickets' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              My Tickets
              {tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length > 0 && (
                <span className={`w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center ${tab === 'tickets' ? 'bg-white text-gray-900' : 'bg-orange-500 text-white'}`}>
                  {tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6">

        {/* ── NEED HELP TAB ── */}
        {tab === 'help' && (
          <AnimatePresence mode="wait">

            {/* Step 1: Select order */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <p className="text-sm font-semibold text-gray-700 mb-1">What do you need help with?</p>
                <p className="text-xs text-gray-400 mb-4">Select an order or raise a general query</p>

                {orders.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Recent Orders</p>
                    <div className="space-y-2">
                      {orders.slice(0, 5).map(o => {
                        const st = orderStatus(o);
                        return (
                          <button key={o._id} onClick={() => { setSelOrder(o); setStep(2); }}
                            className="w-full bg-white rounded-xl border border-gray-100 p-3.5 flex items-center gap-3 hover:border-orange-200 hover:bg-orange-50/20 transition-all text-left group">
                            <div className="w-11 h-11 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                              {o.orderItems?.[0]?.image
                                ? <img src={o.orderItems[0].image} alt="" className="w-full h-full object-cover" />
                                : <Package size={18} className="text-gray-300" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold text-gray-900">#{o._id.slice(-8).toUpperCase()}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">{o.orderItems?.map(i => i.name).join(', ')}</p>
                              <p className="text-[11px] text-gray-400">₹{Number(o.totalPrice).toLocaleString('en-IN')} · {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                            </div>
                            <ChevronRight size={15} className="text-gray-300 group-hover:text-orange-400 transition-colors shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button onClick={() => { setSelOrder(null); setStep(2); }}
                  className="w-full bg-white rounded-xl border border-gray-100 p-3.5 flex items-center gap-3 hover:border-orange-200 hover:bg-orange-50/20 transition-all text-left group">
                  <div className="w-11 h-11 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <HelpCircle size={20} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">General Query</p>
                    <p className="text-[11px] text-gray-400">About products, shipping, account, or anything else</p>
                  </div>
                  <ChevronRight size={15} className="text-gray-300 group-hover:text-orange-400 transition-colors shrink-0" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Form */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
                  <ChevronLeft size={15} /> Back
                </button>

                {selOrder && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 flex items-center gap-2.5">
                    <Package size={15} className="text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900">Order #{selOrder._id.slice(-8).toUpperCase()}</p>
                      <p className="text-[11px] text-gray-400 truncate">{selOrder.orderItems?.map(i => i.name).join(', ')}</p>
                    </div>
                    <button onClick={() => { setSelOrder(null); setStep(1); }} className="p-1 hover:bg-orange-100 rounded-lg transition-colors">
                      <X size={13} className="text-gray-400" />
                    </button>
                  </div>
                )}

                <h2 className="text-base font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {selOrder ? 'Describe your issue' : 'Raise a query'}
                </h2>

                <form onSubmit={handleCreate} className="space-y-4 bg-white rounded-2xl border border-gray-100 p-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Issue Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CATS.map(c => (
                        <button type="button" key={c.value} onClick={() => setForm({ ...form, category: c.value })}
                          className={`p-2.5 rounded-xl border text-left transition-all ${form.category === c.value ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                            }`}>
                          <span className="text-base">{c.icon}</span>
                          <p className="text-[11px] font-semibold text-gray-700 mt-1 leading-tight">{c.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
                    <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Wrong product delivered"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
                    <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your issue in detail..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none" />
                  </div>
                  <button type="submit" disabled={submitting || !form.category}
                    className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── MY TICKETS TAB ── */}
        {tab === 'tickets' && (
          <div className="flex gap-4" style={{ minHeight: 520 }}>

            {/* Left: ticket list */}
            {(!isMobile || !selected) && (
              <div className={`bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden ${isMobile ? 'w-full' : 'w-[320px] shrink-0'}`} style={{ height: 560 }}>
                <div className="p-3 border-b border-gray-50">
                  <div className="relative mb-2">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..."
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:border-orange-400 transition-colors" />
                  </div>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
                      <button key={f} onClick={() => setFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        {f === 'ALL' ? 'All' : f === 'IN_PROGRESS' ? 'In Progress' : f.charAt(0) + f.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {visible.length === 0 ? (
                    <div className="p-8 text-center">
                      <HelpCircle size={28} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-xs text-gray-400">No tickets yet</p>
                    </div>
                  ) : visible.map(t => {
                    const s = STATUS[t.status] || STATUS.OPEN;
                    const cat = CATS.find(c => c.value === t.category);
                    const lastMsg = t.messages?.[t.messages.length - 1];
                    const active = selected?._id === t._id;
                    return (
                      <button key={t._id} onClick={() => setSelected(t)}
                        className={`w-full text-left px-3.5 py-3 border-b border-gray-50 flex items-start gap-2.5 transition-colors ${active ? 'bg-orange-50 border-l-2 border-l-orange-400' : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                          }`}>

                        {/* Status color line */}
                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot} mt-1.5 shrink-0`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-xs font-bold text-gray-900 truncate">{t.subject}</span>
                            <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(t.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            {cat && <span className="text-[10px] text-gray-400">{cat.icon} {cat.label}</span>}
                            {t.ticketId && <span className="text-[10px] text-gray-300">· #{t.ticketId}</span>}
                            <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-semibold border ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>
                          </div>
                          {lastMsg && (
                            <p className="text-[11px] text-gray-400 truncate">
                              {lastMsg.sender === 'admin' ? 'Support: ' : ''}{lastMsg.message}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Right: chat */}
            {(!isMobile || selected) && (
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden" style={{ height: 560 }}>
                {!selected ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <MessageSquare size={28} className="text-gray-200 mb-3" />
                    <p className="text-sm font-semibold text-gray-700 mb-1">Select a ticket</p>
                    <p className="text-xs text-gray-400">Click a ticket to view the conversation</p>
                  </div>
                ) : (
                  <>
                    {/* Chat header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5 shrink-0">
                      {isMobile && (
                        <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <ChevronLeft size={16} />
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{selected.subject}</p>
                        <p className="text-[11px] text-gray-400">#{selected.ticketId} · {CATS.find(c => c.value === selected.category)?.label || selected.category}</p>
                      </div>
                      {(() => {
                        const s = STATUS[selected.status] || STATUS.OPEN;
                        return (
                          <span className={`text-[10px] px-2 py-1 rounded-full font-semibold border ${s.bg} ${s.text} ${s.border} shrink-0`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot} mr-1`} />{s.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#f9fafb' }}>
                      <div className="text-center">
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      {selected.messages?.map((msg, i) => {
                        const isMe = msg.sender === 'user';
                        return (
                          <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isMe ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                              }`}>
                              {!isMe && <p className="text-[10px] font-bold text-orange-500 mb-1">DhaniFresh Support</p>}
                              <p>{msg.message}</p>
                              <p className="text-[10px] mt-1.5 opacity-60">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </div>

                    {/* Reply bar */}
                    {['CLOSED', 'RESOLVED'].includes(selected.status) ? (
                      <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
                        Ticket closed · <button onClick={() => { setTab('help'); setStep(1); setSelected(null); }} className="text-orange-500 font-medium">Raise new query</button>
                      </div>
                    ) : (
                      <div className="p-3 border-t border-gray-100 shrink-0">
                        <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-400 focus-within:bg-white transition-all p-2">
                          <textarea value={reply} onChange={e => setReply(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                            placeholder="Type a message... (Enter to send)"
                            className="flex-1 bg-transparent outline-none text-sm px-2 py-1 resize-none min-h-[36px] max-h-[100px]" rows={1} />
                          <button onClick={handleReply} disabled={!reply.trim() || sending}
                            className={`p-2 rounded-lg transition-colors shrink-0 ${reply.trim() ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400'}`}>
                            {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
