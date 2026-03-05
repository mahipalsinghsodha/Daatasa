import { useEffect, useState } from "react";
import axios from "axios";

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [replyText, setReplyText] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("/api/support/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendReply = async (id) => {
    if (!replyText[id]) return;

    await axios.post(
      `/api/support/${id}/reply`,
      { message: replyText[id] },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReplyText({ ...replyText, [id]: "" });
    fetchTickets();
  };

  const updateStatus = async (id, status) => {
    await axios.put(
      `/api/support/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchTickets();
  };

  const getStatusColor = (status) => {
    if (status === "RESOLVED") return "text-green-600";
    if (status === "IN_PROGRESS") return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Admin Support Panel
      </h2>

      {tickets.map((ticket) => (
        <div
          key={ticket._id}
          className="bg-white p-6 shadow rounded mb-6"
        >
          <div className="mb-2">
            <strong>User:</strong> {ticket.user?.name} (
            {ticket.user?.email})
          </div>

          <div>
            <strong>Subject:</strong> {ticket.subject}
          </div>

          <div>
            <strong>Category:</strong> {ticket.category}
          </div>

          <div>
            <strong>Status:</strong>{" "}
            <span className={getStatusColor(ticket.status)}>
              {ticket.status}
            </span>
          </div>

          {/* Conversation */}
          <div className="mt-4 space-y-2">
            {ticket.messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded ${
                  msg.sender === "admin"
                    ? "bg-blue-100 text-right"
                    : "bg-gray-100"
                }`}
              >
                <strong>
                  {msg.sender === "admin"
                    ? "Admin"
                    : "User"}
                </strong>
                <p>{msg.message}</p>
              </div>
            ))}
          </div>

          {/* Reply Box */}
          <div className="mt-4">
            <textarea
              placeholder="Write reply..."
              value={replyText[ticket._id] || ""}
              onChange={(e) =>
                setReplyText({
                  ...replyText,
                  [ticket._id]: e.target.value,
                })
              }
              className="w-full border p-2 rounded"
            />

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => sendReply(ticket._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Send Reply
              </button>

              <button
                onClick={() =>
                  updateStatus(ticket._id, "RESOLVED")
                }
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Mark Resolved
              </button>

              <button
                onClick={() =>
                  updateStatus(ticket._id, "CLOSED")
                }
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminSupport;
