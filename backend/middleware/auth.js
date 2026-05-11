
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ SAME auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    if (decoded.version !== user.tokenVersion) return res.status(401).json({ message: 'Token is revoked' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ✅ Updated Admin middleware (allows superadmin too)
auth.admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};

// ✅ Super Admin only middleware
auth.superadmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Super Admin access only' });
  }
};

// ✅ Permission-specific middleware
auth.hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    // Superadmin has all permissions
    if (req.user.role === 'superadmin') return next();
    
    // Check specific permission
    if (req.user.role === 'admin' && req.user.permissions?.includes(permission)) {
      return next();
    }
    
    res.status(403).json({ 
      message: `Access denied. You need '${permission}' permission to perform this action.` 
    });
  };
};

module.exports = auth;
