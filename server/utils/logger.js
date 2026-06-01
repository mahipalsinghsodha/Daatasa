const AuditLog = require('../models/AuditLog');

/**
 * Logs an administrative action to the AuditLog collection.
 * 
 * @param {Object} req - The Express request object containing req.user
 * @param {String} action - The action title (e.g., 'CREATE_PRODUCT')
 * @param {String} targetType - The entity type (e.g., 'PRODUCT', 'USER')
 * @param {String} targetId - The ID of the affected entity
 * @param {Object} details - Additional metadata or the changed data
 */
const logAction = async (req, action, targetType, targetId, details = {}) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return; // Only log admin/superadmin actions
    }

    const log = new AuditLog({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action,
      targetType,
      targetId: targetId ? targetId.toString() : null,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    await log.save();
  } catch (error) {
    console.error('AUDIT_LOG_ERROR:', error);
    // We don't want to fail the main request if logging fails, 
    // but in production, you might want to use a more robust queue system.
  }
};

module.exports = { logAction };
