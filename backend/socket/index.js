// socket/index.js
// Socket.io server initialization with JWT auth middleware

const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');
const User       = require('../models/User');

let io;

/**
 * Initialize the Socket.io server.
 * Called once from server.js after http.createServer(app).
 */
function initSocketServer(httpServer) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    // Reconnection handled on client side
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Auth middleware for sockets ────────────────────────────────────────────
  // Guests can connect without a token (for chat widget)
  // Authenticated users/agents pass JWT in handshake.auth.token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      // Allow guest connection (chat widget for non-logged-in users)
      socket.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('name email role avatar isBlocked tokenVersion');

      if (!user || user.isBlocked || decoded.version !== user.tokenVersion) {
        return next(new Error('Authentication failed'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // ── Register event namespaces ──────────────────────────────────────────────
  const { registerChatHandlers } = require('./chatHandlers');

  io.on('connection', (socket) => {
    const userId = socket.user?._id?.toString() || 'guest';
    const role   = socket.user?.role || 'guest';
    console.log(`[Socket] ${role} connected: ${userId} (${socket.id})`);

    // Join personal room for targeted events
    if (socket.user) {
      socket.join(`user:${userId}`);

      // Admin/agent joins admin room for broadcast events
      if (role === 'admin' || role === 'superadmin') {
        socket.join('admin_room');
        console.log(`[Socket] Admin ${socket.user.name} joined admin_room`);
      }
    }

    registerChatHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] ${role} disconnected: ${userId} — reason: ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket] Error from ${userId}:`, err.message);
    });
  });

  console.log('[Socket.io] Server initialized');
  return io;
}

/**
 * Get the Socket.io instance (for use in other modules like controllers)
 */
function getIO() {
  if (!io) throw new Error('Socket.io not initialized. Call initSocketServer first.');
  return io;
}

module.exports = { initSocketServer, getIO };
