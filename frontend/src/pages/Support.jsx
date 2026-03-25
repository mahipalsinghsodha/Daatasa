import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, LifeBuoy, Clock, CheckCircle,
  Send, Plus, ChevronDown, ChevronLeft, X,
} from "lucide-react";

// ── Brand Tokens ──────────────────────────────────────────────────────────────
const C = {
  orange:      "#e8621a",
  orangeHov:   "#cf561a",
  orangeLight: "#fff4ee",
  orangeMid:   "#fddcca",
  bg:          "#f2f4f6",
  white:       "#ffffff",
  text:        "#1a1a2e",
  textMid:     "#555566",
  textLight:   "#8899aa",
  border:      "#e4e9f0",
  shadow:      "0 2px 12px rgba(0,0,0,0.07)",
  shadowMd:    "0 6px 24px rgba(0,0,0,0.11)",
  green:       "#16a34a", greenBg:  "#dcfce7",
  yellow:      "#b45309", yellowBg: "#fef3c7",
  red:         "#dc2626", redBg:    "#fee2e2",
  gray:        "#64748b", grayBg:   "#f1f5f9",
  font:        "'Inter', system-ui, sans-serif",
};

const BADGE_MAP = {
  OPEN:        { label: "Open",        color: C.red,    bg: C.redBg },
  IN_PROGRESS: { label: "In Progress", color: C.yellow, bg: C.yellowBg },
  RESOLVED:    { label: "Resolved",    color: C.green,  bg: C.greenBg },
  CLOSED:      { label: "Closed",      color: C.gray,   bg: C.grayBg },
};

const StatusBadge = ({ status }) => {
  const s = BADGE_MAP[status] || BADGE_MAP.OPEN;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
};

const CATS = [
  { value: "ORDER_ISSUE",    label: "Order Issue" },
  { value: "PAYMENT_ISSUE",  label: "Payment Issue" },
  { value: "RETURN_REQUEST", label: "Return Request" },
  { value: "PRODUCT_ISSUE",  label: "Product Issue" },
  { value: "OTHER",          label: "Other" },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function Support() {
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded]   = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ subject: "", category: "", message: "" });
  const [filterStatus, setFilter] = useState("ALL");
  const bottomRef                 = useRef({});
  const token                     = localStorage.getItem("token");

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    if (expanded && bottomRef.current[expanded]) {
      setTimeout(() => bottomRef.current[expanded]?.scrollIntoView({ behavior: "smooth" }), 120);
    }
  }, [expanded]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/support/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/api/support", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ subject: "", category: "", message: "" });
      setShowForm(false);
      fetchTickets();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const stats = {
    total:    tickets.length,
    open:     tickets.filter(t => t.status === "OPEN").length,
    progress: tickets.filter(t => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter(t => t.status === "RESOLVED").length,
  };

  const FILTERS = ["ALL","OPEN","IN_PROGRESS","RESOLVED","CLOSED"];
  const visible = filterStatus === "ALL"
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

  // ── Shared input style ──────────────────────────────────────────────────────
  const inp = (extra = {}) => ({
    width: "100%", border: `1.5px solid ${C.border}`,
    borderRadius: 10, padding: "10px 13px",
    fontSize: 14, color: C.text, outline: "none",
    fontFamily: C.font, boxSizing: "border-box",
    background: C.white, transition: "border-color 0.2s", ...extra,
  });
  const focusOrange = e => { e.target.style.borderColor = C.orange; };
  const blurGray    = e => { e.target.style.borderColor = C.border; };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.font, color: C.text }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{
        background: C.white, borderBottom: `1.5px solid ${C.border}`,
        padding: "24px 32px 0", boxShadow: C.shadow,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, paddingBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, background: C.orange,
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <LifeBuoy size={22} color="#fff" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>Support Center</h1>
                <p style={{ margin: 0, fontSize: 13, color: C.textLight }}>Raise a ticket · Track your requests</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", background: showForm ? C.grayBg : C.orange,
                border: `1.5px solid ${showForm ? C.border : C.orange}`,
                borderRadius: 10, color: showForm ? C.textMid : "#fff",
                fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: C.font,
              }}
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Cancel" : "New Ticket"}
            </motion.button>
          </div>

          {/* Stat tabs */}
          <div style={{ display: "flex", gap: 28, overflowX: "auto", paddingBottom: 0 }}>
            {[
              { key:"ALL",         label:"All Tickets",   val: stats.total    },
              { key:"OPEN",        label:"Open",          val: stats.open,    color: C.red    },
              { key:"IN_PROGRESS", label:"In Progress",   val: stats.progress,color: C.yellow },
              { key:"RESOLVED",    label:"Resolved",      val: stats.resolved,color: C.green  },
            ].map(tab => {
              const active = filterStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "10px 0", fontFamily: C.font,
                    borderBottom: active ? `3px solid ${C.orange}` : "3px solid transparent",
                    color: active ? C.orange : C.textLight,
                    fontWeight: active ? 700 : 500,
                    fontSize: 14, whiteSpace: "nowrap",
                    display: "flex", alignItems: "center", gap: 7,
                    transition: "all 0.15s",
                  }}
                >
                  {tab.label}
                  <span style={{
                    background: active ? C.orangeLight : C.grayBg,
                    color: active ? C.orange : C.textLight,
                    border: `1px solid ${active ? C.orangeMid : C.border}`,
                    padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  }}>{tab.val}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>

        {/* New Ticket Form (slide-in) */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                background: C.white, border: `1.5px solid ${C.border}`,
                borderRadius: 16, padding: "24px 28px", boxShadow: C.shadowMd,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.orange }} />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.text }}>Create New Ticket</h3>
                </div>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Subject</label>
                      <input
                        style={inp()} placeholder="Brief description of your issue"
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        required onFocus={focusOrange} onBlur={blurGray}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</label>
                      <select
                        style={inp({ cursor: "pointer" })}
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        required onFocus={focusOrange} onBlur={blurGray}
                      >
                        <option value="">Select a category</option>
                        {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Message</label>
                    <textarea
                      style={inp({ minHeight: 110, resize: "vertical" })}
                      placeholder="Describe your issue in detail…"
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      required onFocus={focusOrange} onBlur={blurGray}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <motion.button
                      type="submit" disabled={submitting}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{
                        padding: "11px 26px", background: submitting ? "#f0a070" : C.orange,
                        border: "none", borderRadius: 10, color: "#fff",
                        fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: 8, fontFamily: C.font,
                      }}
                    >
                      <Send size={15} /> {submitting ? "Submitting…" : "Submit Ticket"}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      style={{
                        padding: "11px 20px", background: C.grayBg,
                        border: `1.5px solid ${C.border}`, borderRadius: 10,
                        color: C.textMid, fontWeight: 600, fontSize: 14,
                        cursor: "pointer", fontFamily: C.font,
                      }}
                    >Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ticket List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: C.textLight }}>
            <div style={{
              width: 36, height: 36, border: `3px solid ${C.border}`,
              borderTop: `3px solid ${C.orange}`, borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 14px",
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ margin: 0, fontSize: 14 }}>Loading your tickets…</p>
          </div>
        ) : visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: C.white, border: `1.5px solid ${C.border}`,
              borderRadius: 16, padding: "60px 24px", textAlign: "center",
              boxShadow: C.shadow,
            }}
          >
            <div style={{
              width: 64, height: 64, background: C.orangeLight,
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 16px",
            }}>
              <LifeBuoy size={30} style={{ color: C.orange }} />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: C.text }}>
              {filterStatus === "ALL" ? "No tickets yet" : `No ${filterStatus.replace(/_/g, " ").toLowerCase()} tickets`}
            </h3>
            <p style={{ margin: "0 0 20px", color: C.textLight, fontSize: 14 }}>
              {filterStatus === "ALL" ? "Create your first ticket to get help from our team." : "Try a different filter."}
            </p>
            {filterStatus === "ALL" && (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowForm(true)}
                style={{
                  padding: "10px 22px", background: C.orange,
                  border: "none", borderRadius: 10, color: "#fff",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 8, fontFamily: C.font,
                }}
              >
                <Plus size={16} /> Create First Ticket
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visible.map((ticket, i) => {
              const isOpen = expanded === ticket._id;
              return (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div style={{
                    background: C.white,
                    border: `1.5px solid ${isOpen ? C.orange + "60" : C.border}`,
                    borderRadius: 14, overflow: "hidden",
                    boxShadow: isOpen ? C.shadowMd : C.shadow,
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}>
                    {/* Ticket row */}
                    <div
                      onClick={() => setExpanded(isOpen ? null : ticket._id)}
                      style={{
                        padding: "16px 20px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 14,
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 42, height: 42, borderRadius: 11,
                        background: isOpen ? C.orangeLight : C.grayBg,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        transition: "background 0.2s",
                      }}>
                        <MessageSquare size={18} style={{ color: isOpen ? C.orange : C.textLight }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{ticket.subject}</span>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <div style={{ fontSize: 12, color: C.textLight }}>
                          {ticket.category?.replace(/_/g, " ")}
                          <span style={{ margin: "0 6px" }}>·</span>
                          {ticket.messages?.length || 0} message{ticket.messages?.length !== 1 ? "s" : ""}
                        </div>
                      </div>

                      {/* Chevron */}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ flexShrink: 0 }}
                      >
                        <ChevronDown size={18} style={{ color: C.textLight }} />
                      </motion.div>
                    </div>

                    {/* Expanded: conversation */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.26 }}
                          style={{ overflow: "hidden" }}
                        >
                          {/* Messages */}
                          <div style={{ borderTop: `1.5px solid ${C.border}`, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
                            {(!ticket.messages || ticket.messages.length === 0) ? (
                              <p style={{ color: C.textLight, fontSize: 13, textAlign: "center", padding: "12px 0", margin: 0 }}>
                                No messages yet. Our team will respond soon.
                              </p>
                            ) : ticket.messages.map((msg, idx) => (
                              <div key={idx} style={{
                                maxWidth: "65%",
                                alignSelf: msg.sender === "admin" ? "flex-end" : "flex-start",
                                background: msg.sender === "admin" ? C.orangeLight : C.grayBg,
                                border: `1.5px solid ${msg.sender === "admin" ? C.orangeMid : C.border}`,
                                borderRadius: msg.sender === "admin"
                                  ? "14px 14px 3px 14px"
                                  : "14px 14px 14px 3px",
                                padding: "10px 14px",
                              }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: msg.sender === "admin" ? C.orange : C.textLight, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                  {msg.sender === "admin" ? "Support Team" : "You"}
                                </div>
                                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>{msg.message}</div>
                              </div>
                            ))}
                            <div ref={el => bottomRef.current[ticket._id] = el} />
                          </div>

                          {/* Footer note */}
                          <div style={{ borderTop: `1.5px solid ${C.border}`, padding: "12px 22px", background: C.grayBg }}>
                            <p style={{ margin: 0, fontSize: 12, color: C.textLight, textAlign: "center" }}>
                              {["RESOLVED", "CLOSED"].includes(ticket.status)
                                ? "✓ This ticket has been resolved. Create a new one if you need further help."
                                : "⏳ Our support team will reply soon. You'll be notified on updates."}
                            </p>
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
