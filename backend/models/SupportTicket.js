const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "admin"],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [String],
}, { timestamps: true });

const supportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  subject: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: [
      "ORDER_ISSUE",
      "PAYMENT_ISSUE",
      "RETURN_REQUEST",
      "PRODUCT_ISSUE",
      "OTHER"
    ],
    required: true
  },

  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "MEDIUM"
  },

  status: {
    type: String,
    enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
    default: "OPEN"
  },

  messages: [messageSchema],

  resolvedAt: Date

}, { timestamps: true });

/* Auto Ticket ID Generator */
supportTicketSchema.pre("save", async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model("SupportTicket").countDocuments();
    this.ticketId = `SUP-${(count + 1).toString().padStart(5, "0")}`;
  }
  next();
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
