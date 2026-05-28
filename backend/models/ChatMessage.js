// models/ChatMessage.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.Mixed, // ObjectId or 'BOT' or 'SYSTEM'
    required: true,
  },
  senderType: {
    type: String,
    enum: ['USER', 'AGENT', 'BOT', 'SYSTEM'],
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  messageType: {
    type: String,
    enum: ['TEXT', 'IMAGE', 'FILE', 'ORDER_CARD', 'QUICK_REPLY'],
    default: 'TEXT',
  },
  // Extra data for rich messages
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    // For ORDER_CARD: { orderId, status, items, trackingNumber }
    // For QUICK_REPLY: { options: ['Track order', 'Return policy', ...] }
    // For FILE/IMAGE: { url, fileName, fileSize }
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ sessionId: 1, isRead: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = ChatMessage;
