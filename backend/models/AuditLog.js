const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
    // e.g., 'CREATE_PRODUCT', 'UPDATE_ORDER_STATUS', 'BLOCK_USER'
  },
  targetType: {
    type: String,
    required: true
    // e.g., 'PRODUCT', 'ORDER', 'USER', 'CATEGORY'
  },
  targetId: {
    type: String
    // ID of the object being modified
  },
  details: {
    type: mongoose.Schema.Types.Mixed
    // Stores JSON of what changed
  },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

// Index for faster searching
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ adminId: 1 });
auditLogSchema.index({ action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
