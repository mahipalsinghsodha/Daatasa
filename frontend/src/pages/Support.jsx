import { useState, useEffect, useRef } from "react";
import api from '../api/axios'
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, LifeBuoy, Send, Plus, ChevronLeft, Clock, Search, X, Shield, AlertCircle, CheckCircle, HelpCircle
} from "lucide-react";
import { toast } from 'react-toastify'

const CATS = [
  { value: "ORDER_ISSUE", label: "Order Artifact Matrix" },
  { value: "PAYMENT_ISSUE", label: "Settlement Conflict" },
  { value: "RETURN_REQUEST", label: "Redemption Protocol" },
  { value: "PRODUCT_ISSUE", label: "Artifact Integrity" },
  { value: "OTHER", label: "General Inquiry" },
];

const STATUS_CONFIG = {
  OPEN: { label: "Pending Activation", color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
  IN_PROGRESS: { label: "Processing Transmission", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
  RESOLVED: { label: "Successfully Terminated", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
  CLOSED: { label: "Archived", color: "text-gray-400", bg: "bg-gray-50", border: "border-gray-100" },
};

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rightView, setRightView] = useState(null); 
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [form, setForm] = useState({ subject: "", category: "", message: "" });
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);

  const messagesEndRef = useRef(null);

  useEffect(() => { 
    fetchTickets();
    const interval = setInterval(fetchTickets, 8000);
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener("resize", handleResize);
    return () => {
       clearInterval(interval);
       window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (rightView === 'chat' && messagesEndRef.current) {
       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [rightView, selectedTicket, tickets]);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/api/support/my");
      const data = res.data || [];
      setTickets(data);
      if (selectedTicket) {
        const updated = data.find(t => t._id === selectedTicket._id);
        if (updated && (updated.messages.length !== selectedTicket.messages.length || updated.status !== selectedTicket.status)) {
           setSelectedTicket(updated);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/support", form);
      setForm({ subject: "", category: "", message: "" });
      setRightView(null);
      toast.success('Ticket activation sequence successful.');
      fetchTickets();
    } catch (e) { toast.error('Failed to initialize ticket.'); }
    finally { setSubmitting(false); }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    const text = replyText;
    setReplyText("");
    try {
      await api.post(`/api/support/${selectedTicket._id}/reply`, { message: text });
      fetchTickets();
    } catch (e) { setReplyText(text); }
    finally { setSending(false); }
  };

  const visibleTickets = tickets
      .filter(t => filter === "ALL" || t.status === filter)
      .filter(t => !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticketId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--color-bg)] flex items-center justify-center p-0 sm:p-6 lg:p-12">
      
      <div className="w-full max-w-[1280px] h-full min-h-[600px] sm:h-[80vh] bg-white sm:rounded-[48px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* ── Left Matrix: Ticket Logs ── */}
        {(!isMobile || !rightView) && (
          <div className="w-full md:w-[400px] border-r border-gray-50 flex flex-col bg-white">
             <div className="p-8 border-b border-gray-50">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                         <Shield size={20} />
                      </div>
                      <div>
                         <h2 className="text-xl font-black text-gray-900 font-head tracking-tight">Support Vault</h2>
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mt-1">Incident Reports</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setRightView('new')}
                    className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center"
                   >
                     <Plus size={20} />
                   </button>
                </div>

                <div className="relative group">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-600 transition-colors" />
                   <input 
                    placeholder="Locate Incident ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-orange-500 outline-none text-xs font-black transition-all"
                   />
                </div>
             </div>

             <div className="flex gap-2 p-4 border-b border-gray-50 overflow-x-auto no-scrollbar">
                {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      filter === f ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {f === 'ALL' ? 'Total Archive' : f.replace('_', ' ')}
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                {loading ? (
                   <div className="p-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">Scanning Archive...</div>
                ) : visibleTickets.length === 0 ? (
                   <div className="p-12 text-center">
                      <HelpCircle size={40} className="mx-auto text-gray-100 mb-4" />
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No active incidents found</p>
                   </div>
                ) : (
                  visibleTickets.map(t => (
                    <motion.div 
                      key={t._id}
                      onClick={() => { setSelectedTicket(t); setRightView('chat'); }}
                      className={`p-6 rounded-[32px] cursor-pointer transition-all border-2 relative overflow-hidden group ${
                        selectedTicket?._id === t._id ? 'bg-white border-gray-900 shadow-xl' : 'bg-white border-transparent hover:border-gray-100'
                      }`}
                    >
                       <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm font-black text-gray-900 truncate pr-4 font-head">{t.subject}</h4>
                          <span className="text-[10px] font-black text-gray-400 tabular-nums">
                            {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[150px]">
                            {t.messages?.[t.messages.length - 1]?.message || t.category}
                          </p>
                          <div className={`w-2 h-2 rounded-full ${
                             t.status === 'RESOLVED' ? 'bg-green-500' : t.status === 'OPEN' ? 'bg-red-500' : 'bg-orange-500'
                          }`} />
                       </div>
                    </motion.div>
                  ))
                )}
             </div>
          </div>
        )}

        {/* ── Right Matrix: Active Terminal ── */}
        {(!isMobile || rightView) && (
          <div className="flex-1 flex flex-col bg-[var(--color-bg)]/50">
             
             {/* Dynamic View Injection */}
             {!rightView ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                   <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center shadow-2xl mb-8 relative">
                      <LifeBuoy size={48} className="text-orange-600 animate-spin-slow" />
                      <div className="absolute inset-0 border-4 border-dashed border-gray-100 rounded-[48px]" />
                   </div>
                   <h2 className="text-3xl font-black text-gray-900 font-head mb-4">Awaiting Signal</h2>
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest max-w-sm leading-relaxed">
                      Initialize a new transmission or select an existing incident from the archive to re-establish contact.
                   </p>
                   <button 
                    onClick={() => setRightView('new')}
                    className="mt-10 px-10 py-5 bg-gray-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-full shadow-2xl shadow-gray-200 hover:bg-orange-600 transition-all"
                   >
                     Deploy New Ticket
                   </button>
                </div>
             ) : rightView === 'new' ? (
                <div className="flex-1 flex flex-col">
                   <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-4">
                         <button onClick={() => setRightView(null)} className="md:hidden"><ChevronLeft /></button>
                         <div>
                            <h3 className="text-xl font-black text-gray-900 font-head">Incident Allocation</h3>
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Digital Form 72-B</p>
                         </div>
                      </div>
                      <button onClick={() => setRightView(null)} className="text-gray-300 hover:text-gray-900 transition-colors"><X size={20}/></button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-8 sm:p-12">
                      <form onSubmit={handleCreateTicket} className="max-w-[600px] mx-auto space-y-8 bg-white p-10 sm:p-14 rounded-[48px] border border-gray-100 shadow-xl">
                         <div className="space-y-6">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Incident Subject</label>
                               <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all" placeholder="Brief classification..." />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Classification Matrix</label>
                               <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all appearance-none cursor-pointer">
                                  <option value="">Select Protocol</option>
                                  {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                               </select>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Technical Details</label>
                               <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all resize-none" placeholder="Provide raw incident data..." />
                            </div>
                         </div>
                         <button type="submit" disabled={submitting} className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50">
                            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                            {submitting ? 'Initializing...' : 'Transmit Report'}
                         </button>
                      </form>
                   </div>
                </div>
             ) : (
                <div className="flex-1 flex flex-col min-h-0">
                   <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white shrink-0">
                      <div className="flex items-center gap-4">
                         <button onClick={() => setRightView(null)} className="md:hidden"><ChevronLeft /></button>
                         <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shrink-0 group hover:bg-orange-600 transition-colors">
                            <MessageSquare size={20} />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-gray-900 font-head tracking-tight truncate max-w-[200px]">{selectedTicket.subject}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                               <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">ID: {selectedTicket.ticketId}</p>
                               <span className="w-1 h-1 bg-gray-200 rounded-full" />
                               <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">{selectedTicket.category?.replace('_',' ')}</p>
                            </div>
                         </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${STATUS_CONFIG[selectedTicket.status].bg} ${STATUS_CONFIG[selectedTicket.status].color} ${STATUS_CONFIG[selectedTicket.status].border}`}>
                         {STATUS_CONFIG[selectedTicket.status].label}
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 space-y-6">
                      <div className="text-center py-8">
                         <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">Transmission Established {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                      </div>

                      {selectedTicket.messages?.map((msg, i) => {
                        const isMe = msg.sender === 'user';
                        return (
                          <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] rounded-[32px] p-6 shadow-sm border relative ${
                               isMe ? 'bg-gray-900 text-white border-gray-900 rounded-tr-none' : 'bg-white text-gray-900 border-gray-100 rounded-tl-none'
                             }`}>
                                {!isMe && <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-2">Vault Support Team</p>}
                                <p className="text-sm font-bold leading-relaxed">{msg.message}</p>
                                <p className={`text-[9px] font-black mt-4 uppercase tracking-tighter ${isMe ? 'text-gray-500' : 'text-gray-300'}`}>
                                   {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                             </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                   </div>

                   {["CLOSED", "RESOLVED"].includes(selectedTicket.status) ? (
                      <div className="p-8 bg-gray-100 border-t border-gray-200 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                         This transmission channel has been terminated.
                      </div>
                   ) : (
                      <div className="p-6 sm:p-8 bg-white border-t border-gray-50 shrink-0">
                         <div className="max-w-[700px] mx-auto flex items-end gap-3 bg-gray-50 rounded-[32px] p-2 border border-gray-100 focus-within:border-orange-500 focus-within:bg-white transition-all">
                            <textarea 
                             value={replyText}
                             onChange={e => setReplyText(e.target.value)}
                             placeholder="Deploy response..."
                             className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-sm font-bold min-h-[56px] max-h-[150px] resize-none"
                             onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                            />
                            <button 
                             onClick={handleSendReply}
                             disabled={!replyText.trim() || sending}
                             className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                               replyText.trim() ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-200 text-gray-400'
                             }`}
                            >
                               {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
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
  )
}

export default Support
