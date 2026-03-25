import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, LifeBuoy, Clock, CheckCircle,
  User, Send, RefreshCw, ChevronDown, Search, Filter,
} from "lucide-react";

// ── Brand Tokens ──────────────────────────────────────────────────────────────
const C = {
  orange:     "#e8621a",
  orangeHov:  "#d4561a",
  orangeLight:"#fff4ee",
  orangeMid:  "#fddcca",
  bg:         "#f0f4f8",
  white:      "#ffffff",
  text:       "#1a1a2e",
  textMid:    "#444455",
  textLight:  "#8899aa",
  border:     "#e4e9f0",
  shadow:     "0 2px 12px rgba(0,0,0,0.07)",
  shadowMd:   "0 6px 24px rgba(0,0,0,0.10)",
  green:      "#16a34a", greenBg:  "#dcfce7",
  yellow:     "#b45309", yellowBg: "#fef3c7",
  red:        "#dc2626", redBg:    "#fee2e2",
  blue:       "#1d4ed8", blueBg:   "#dbeafe",
  gray:       "#64748b", grayBg:   "#f1f5f9",
  font:       "'Inter', system-ui, sans-serif",
};

const BADGE_CFG = {
  OPEN:        { label: "Open",        color: C.red,    bg: C.redBg },
  IN_PROGRESS: { label: "In Progress", color: C.yellow, bg: C.yellowBg },
  RESOLVED:    { label: "Resolved",    color: C.green,  bg: C.greenBg },
  CLOSED:      { label: "Closed",      color: C.gray,   bg: C.grayBg },
};

// ── Primitives ─────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = BADGE_CFG[status] || BADGE_CFG.OPEN;
  return (
    <span style={{
      background: s.bg, color: s.color, padding: "4px 11px",
      borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{
    background: C.white, border: `1.5px solid ${C.border}`,
    borderRadius: 14, padding: "18px 20px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: C.shadow,
  }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 12, color: C.textLight, fontWeight: 500 }}>{label}</p>
      <p style={{ margin: "3px 0 0", fontSize: 26, fontWeight: 800, color: C.text, fontFamily: C.font, lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

const ActionBtn = ({ children, onClick, color, bg, disabled, icon: Icon }) => (
  <motion.button
    whileHover={disabled ? {} : { scale: 1.03 }}
    whileTap={disabled ? {} : { scale: 0.97 }}
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "8px 14px", background: disabled ? C.grayBg : bg,
      border: `1.5px solid ${disabled ? C.border : color + "40"}`,
      borderRadius: 9, color: disabled ? C.textLight : color,
      fontSize: 12, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: C.font, transition: "all 0.15s",
    }}
  >
    {Icon && <Icon size={13} />}
    {children}
  </motion.button>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminSupport() {
  const [tickets, setTickets]     = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading]     = useState(false);
  const [expanded, setExpanded]   = useState(null);
  const [filter, setFilter]       = useState("ALL");
  const [search, setSearch]       = useState("");
  const [busy, setBusy]           = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/support/admin", { headers: { Authorization: `Bearer ${token}` } });
      setTickets(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const sendReply = async (id) => {
    if (!replyText[id]?.trim()) return;
    setBusy(b => ({ ...b, [`r${id}`]: true }));
    try {
      await axios.post(`/api/support/${id}/reply`, { message: replyText[id] }, { headers: { Authorization: `Bearer ${token}` } });
      setReplyText(p => ({ ...p, [id]: "" }));
      fetchTickets();
    } catch (e) { console.error(e); }
    finally { setBusy(b => ({ ...b, [`r${id}`]: false })); }
  };

  const updateStatus = async (id, status) => {
    setBusy(b => ({ ...b, [`s${id}${status}`]: true }));
    try {
      await axios.put(`/api/support/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchTickets();
    } catch (e) { console.error(e); }
    finally { setBusy(b => ({ ...b, [`s${id}${status}`]: false })); }
  };

  const stats = {
    total:    tickets.length,
    open:     tickets.filter(t => t.status === "OPEN").length,
    progress: tickets.filter(t => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter(t => t.status === "RESOLVED").length,
  };

  const FILTERS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

  const filtered = tickets
    .filter(t => filter === "ALL" || t.status === filter)
    .filter(t =>
      !search ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.font, color: C.text }}>

      {/* Top Bar */}
      <div style={{
        background: C.white, borderBottom: `1.5px solid ${C.border}`,
        padding: "0 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 60, boxShadow: C.shadow,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: C.orange, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LifeBuoy size={17} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: C.text }}>Support Panel</span>
          <span style={{ background: C.orangeLight, color: C.orange, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${C.orangeMid}` }}>Admin</span>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }} transition={{ duration: 0.35 }}
          onClick={fetchTickets}
          style={{
            width: 36, height: 36, borderRadius: 9,
            background: C.grayBg, border: `1.5px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: C.textLight,
          }}>
          <RefreshCw size={15} />
        </motion.button>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { icon: LifeBuoy,      label: "Total Tickets", value: stats.total,    color: C.orange, bg: C.orangeLight },
            { icon: MessageSquare, label: "Open",          value: stats.open,     color: C.red,    bg: C.redBg },
            { icon: Clock,         label: "In Progress",   value: stats.progress, color: C.yellow, bg: C.yellowBg },
            { icon: CheckCircle,   label: "Resolved",      value: stats.resolved, color: C.green,  bg: C.greenBg },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{
          background: C.white, border: `1.5px solid ${C.border}`,
          borderRadius: 14, padding: "14px 18px", marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12, boxShadow: C.shadow,
        }}>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 14px", borderRadius: 20,
                  background: filter === f ? C.orange : C.grayBg,
                  border: `1.5px solid ${filter === f ? C.orange : C.border}`,
                  color: filter === f ? "#fff" : C.textMid,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: C.font, transition: "all 0.18s",
                }}
              >
                {f === "ALL" ? `All (${stats.total})` : f.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", minWidth: 220 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
            <input
              placeholder="Search tickets, users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                border: `1.5px solid ${C.border}`, borderRadius: 9,
                fontSize: 13, color: C.text, outline: "none",
                fontFamily: C.font, width: "100%", boxSizing: "border-box",
                background: C.grayBg, transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = C.orange}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
        </div>

        {/* Ticket List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: C.textLight }}>
            <div style={{
              width: 34, height: 34, border: `3px solid ${C.border}`,
              borderTop: `3px solid ${C.orange}`, borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 14px",
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading tickets…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "60px 24px", textAlign: "center", color: C.textLight, boxShadow: C.shadow }}>
            <LifeBuoy size={40} style={{ color: C.border, marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>No tickets found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((ticket, i) => {
              const isOpen = expanded === ticket._id;
              return (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div style={{
                    background: C.white, border: `1.5px solid ${isOpen ? C.orange + "50" : C.border}`,
                    borderRadius: 14, overflow: "hidden", boxShadow: isOpen ? C.shadowMd : C.shadow,
                    transition: "all 0.2s",
                  }}>
                    {/* Ticket header */}
                    <div
                      onClick={() => setExpanded(isOpen ? null : ticket._id)}
                      style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text }}>{ticket.subject}</h3>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textLight }}>
                            <User size={12} /> {ticket.user?.name} · {ticket.user?.email}
                          </span>
                          <span style={{ fontSize: 12, color: C.textLight }}>{ticket.category?.replace(/_/g, " ")}</span>
                          <span style={{ fontSize: 12, color: C.textLight }}>{ticket.messages?.length || 0} msg{ticket.messages?.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
                        <ChevronDown size={18} style={{ color: C.textLight }} />
                      </motion.div>
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: "hidden" }}
                        >
                          {/* Conversation */}
                          <div style={{ borderTop: `1.5px solid ${C.border}`, padding: "18px 20px" }}>
                            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.07em" }}>Conversation</p>
                            {(!ticket.messages || ticket.messages.length === 0) ? (
                              <p style={{ color: C.textLight, fontSize: 13, textAlign: "center", padding: "12px 0" }}>No messages yet.</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                                {ticket.messages.map((msg, idx) => (
                                  <div key={idx} style={{
                                    maxWidth: "65%",
                                    alignSelf: msg.sender === "admin" ? "flex-end" : "flex-start",
                                    background: msg.sender === "admin" ? C.orangeLight : C.grayBg,
                                    border: `1.5px solid ${msg.sender === "admin" ? C.orangeMid : C.border}`,
                                    borderRadius: msg.sender === "admin" ? "13px 13px 3px 13px" : "13px 13px 13px 3px",
                                    padding: "10px 14px",
                                  }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: msg.sender === "admin" ? C.orange : C.textLight, marginBottom: 4, textTransform: "uppercase" }}>
                                      {msg.sender === "admin" ? "You (Admin)" : ticket.user?.name || "User"}
                                    </div>
                                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{msg.message}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Reply area */}
                          <div style={{ borderTop: `1.5px solid ${C.border}`, padding: "16px 20px", background: C.grayBg }}>
                            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.07em" }}>Reply to Customer</p>
                            <textarea
                              placeholder="Type your reply…"
                              value={replyText[ticket._id] || ""}
                              onChange={e => setReplyText(p => ({ ...p, [ticket._id]: e.target.value }))}
                              style={{
                                width: "100%", border: `1.5px solid ${C.border}`,
                                borderRadius: 10, padding: "10px 13px",
                                color: C.text, fontSize: 13, outline: "none",
                                fontFamily: C.font, boxSizing: "border-box",
                                minHeight: 85, resize: "vertical",
                                background: C.white, marginBottom: 12,
                                transition: "border-color 0.2s",
                              }}
                              onFocus={e => e.target.style.borderColor = C.orange}
                              onBlur={e => e.target.style.borderColor = C.border}
                            />
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <ActionBtn
                                icon={Send}
                                onClick={() => sendReply(ticket._id)}
                                color={C.blue} bg={C.blueBg}
                                disabled={busy[`r${ticket._id}`] || !replyText[ticket._id]?.trim()}
                              >
                                {busy[`r${ticket._id}`] ? "Sending…" : "Send Reply"}
                              </ActionBtn>
                              <ActionBtn
                                icon={CheckCircle}
                                onClick={() => updateStatus(ticket._id, "RESOLVED")}
                                color={C.green} bg={C.greenBg}
                                disabled={busy[`s${ticket._id}RESOLVED`] || ticket.status === "RESOLVED"}
                              >
                                Mark Resolved
                              </ActionBtn>
                              <ActionBtn
                                icon={Clock}
                                onClick={() => updateStatus(ticket._id, "IN_PROGRESS")}
                                color={C.yellow} bg={C.yellowBg}
                                disabled={busy[`s${ticket._id}IN_PROGRESS`] || ticket.status === "IN_PROGRESS"}
                              >
                                In Progress
                              </ActionBtn>
                              <ActionBtn
                                onClick={() => updateStatus(ticket._id, "CLOSED")}
                                color={C.gray} bg={C.grayBg}
                                disabled={busy[`s${ticket._id}CLOSED`] || ticket.status === "CLOSED"}
                              >
                                Close Ticket
                              </ActionBtn>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
