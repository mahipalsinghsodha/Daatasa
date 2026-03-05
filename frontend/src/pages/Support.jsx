import { useState, useEffect } from "react";
import axios from "axios";

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    category: "",
    message: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch user's tickets
  const fetchTickets = async () => {
    try {
      const res = await axios.get("/api/support/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Create ticket
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/support", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm({
        subject: "",
        category: "",
        message: "",
      });

      fetchTickets();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const getStatusColor = (status) => {
    if (status === "RESOLVED") return "text-green-600";
    if (status === "IN_PROGRESS") return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Customer Support</h2>

      {/* Create Ticket */}
      <div className="bg-white shadow-md rounded p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">
          Create New Ticket
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) =>
              setForm({ ...form, subject: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />

         <select
  value={form.category}
  onChange={(e) =>
    setForm({ ...form, category: e.target.value })
  }
  className="w-full border p-2 rounded"
  required
>
  <option value="">Select Category</option>

  <option value="ORDER_ISSUE">Order Issue</option>
  <option value="PAYMENT_ISSUE">Payment Issue</option>
  <option value="RETURN_REQUEST">Return Request</option>
  <option value="PRODUCT_ISSUE">Product Issue</option>
  <option value="OTHER">Other</option>

</select>


          <textarea
            placeholder="Describe your issue..."
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
            className="w-full border p-2 rounded h-24"
            required
          />

          <button
            type="submit"
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Submit Ticket
          </button>
        </form>
      </div>

      {/* My Tickets */}
      <h3 className="text-lg font-semibold mb-4">
        My Tickets
      </h3>

      {tickets.length === 0 ? (
        <p>No tickets created yet.</p>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="bg-white shadow p-4 rounded mb-4"
          >
            <h4 className="font-semibold">
              {ticket.subject}
            </h4>

            <p className="text-sm text-gray-500 mb-2">
              Category: {ticket.category}
            </p>

            <p>
              <strong>Status: </strong>
              <span className={getStatusColor(ticket.status)}>
                {ticket.status}
              </span>
            </p>

            {/* Conversation Messages */}
            <div className="mt-3 space-y-2">
              {ticket.messages?.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    msg.sender === "admin"
                      ? "bg-blue-100 text-right"
                      : "bg-gray-100"
                  }`}
                >
                  <strong>
                    {msg.sender === "admin"
                      ? "Admin"
                      : "You"}
                    :
                  </strong>
                  <p>{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Support;
