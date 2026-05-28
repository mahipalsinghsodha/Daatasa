// socket/chatHandlers.js
// All real-time chat socket events

const { v4: uuidv4 }  = require('crypto');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { handleBotMessage } = require('./aiBot');

// Helper: generate short unique session ID
const generateSessionId = () => require('crypto').randomBytes(12).toString('hex');

// Phrases that trigger human escalation
const ESCALATION_TRIGGERS = [
  'human', 'agent', 'person', 'real person', 'speak to someone',
  'talk to someone', 'live agent', 'not helpful', "can't help",
  'useless', 'frustrated', 'not satisfied',
];

function needsEscalation(text) {
  const lower = text.toLowerCase();
  return ESCALATION_TRIGGERS.some(trigger => lower.includes(trigger));
}

function registerChatHandlers(io, socket) {
  /* ── USER: Start a new chat session ─────────────────────────────────────── */
  socket.on('chat:start', async (data) => {
    try {
      const { guestName, guestEmail, category = 'OTHER', orderId } = data;

      const sessionId = generateSessionId();
      const session   = await ChatSession.create({
        sessionId,
        userId:     socket.user?._id || null,
        guestName:  socket.user?.name || guestName,
        guestEmail: socket.user?.email || guestEmail,
        status:     'BOT_HANDLING',
        category,
        orderId:    orderId || null,
      });

      // Join the session room
      socket.join(`session:${sessionId}`);
      socket.sessionId = sessionId;

      // Welcome message from bot
      const welcomeMessage = await ChatMessage.create({
        sessionId,
        senderId:   'BOT',
        senderType: 'BOT',
        senderName: 'Ghee Assistant',
        content:    `Hi ${socket.user?.name || guestName || 'there'}! 👋 I'm Ghee Assistant. How can I help you today?`,
        messageType: 'QUICK_REPLY',
        metadata: {
          options: getCategoryQuickReplies(category),
        },
      });

      socket.emit('chat:session_created', { sessionId, status: 'BOT_HANDLING' });
      socket.emit('chat:message', welcomeMessage);

      // If order category, try to auto-fetch order info via bot
      if (category === 'ORDER' && orderId && socket.user) {
        setTimeout(() => {
          handleBotMessage(session, '', io, socket, 'auto_fetch_order').catch(console.error);
        }, 500);
      }
    } catch (error) {
      console.error('[Chat] chat:start error:', error);
      socket.emit('chat:error', { message: 'Failed to start chat. Please try again.' });
    }
  });

  /* ── USER: Send a message ───────────────────────────────────────────────── */
  socket.on('chat:message', async (data) => {
    try {
      const { sessionId, content, messageType = 'TEXT' } = data;
      if (!sessionId || !content?.trim()) return;

      const session = await ChatSession.findOne({ sessionId });
      if (!session) return socket.emit('chat:error', { message: 'Session not found' });

      // Check for escalation keywords
      if (needsEscalation(content) && session.status === 'BOT_HANDLING') {
        await escalateToHuman(io, socket, session);
        return;
      }

      // Save user message
      const msg = await ChatMessage.create({
        sessionId,
        senderId:   socket.user?._id || 'guest',
        senderType: 'USER',
        senderName: socket.user?.name || session.guestName || 'Guest',
        content:    content.trim(),
        messageType,
      });

      // Broadcast to the session room (so agent sees it too)
      io.to(`session:${sessionId}`).emit('chat:message', msg);

      // Notify admins of new message in their queue
      io.to('admin_room').emit('admin:session_update', {
        sessionId,
        status:      session.status,
        lastMessage: msg,
        lastMessageAt: new Date(),
      });

      // Update session lastMessageAt
      await ChatSession.findOneAndUpdate({ sessionId }, { lastMessageAt: new Date() });

      // If bot is handling, route to AI
      if (session.status === 'BOT_HANDLING') {
        // Detect frustration: 3+ messages → escalate
        const userMsgCount = await ChatMessage.countDocuments({ sessionId, senderType: 'USER' });
        if (userMsgCount >= 3 && session.botMessageCount >= 3) {
          await escalateToHuman(io, socket, session, 'Multiple unanswered questions detected.');
          return;
        }

        // Route to AI bot (async, don't await — bot responds via socket.io)
        handleBotMessage(session, content.trim(), io, socket).catch(console.error);
      }
    } catch (error) {
      console.error('[Chat] chat:message error:', error);
      socket.emit('chat:error', { message: 'Message failed to send.' });
    }
  });

  /* ── USER: Typing indicator ─────────────────────────────────────────────── */
  socket.on('chat:typing', async ({ sessionId, isTyping }) => {
    socket.to(`session:${sessionId}`).emit('chat:user_typing', { isTyping });
  });

  /* ── USER: Close chat ───────────────────────────────────────────────────── */
  socket.on('chat:close', async ({ sessionId }) => {
    try {
      const session = await ChatSession.findOneAndUpdate(
        { sessionId },
        { status: 'CLOSED', closedAt: new Date(), closedBy: 'user' },
        { new: true }
      );
      if (!session) return;

      const sysMsg = await ChatMessage.create({
        sessionId,
        senderId:   'SYSTEM',
        senderType: 'SYSTEM',
        senderName: 'System',
        content:    'Chat closed by user.',
        messageType: 'TEXT',
      });

      io.to(`session:${sessionId}`).emit('chat:session_closed', {
        reason:        'user_closed',
        rating_prompt: true,
      });
      io.to(`session:${sessionId}`).emit('chat:message', sysMsg);
      io.to('admin_room').emit('admin:session_update', { sessionId, status: 'CLOSED' });
    } catch (error) {
      console.error('[Chat] chat:close error:', error);
    }
  });

  /* ── USER: Rejoin existing session (page refresh) ───────────────────────── */
  socket.on('chat:rejoin', async ({ sessionId }) => {
    try {
      const session = await ChatSession.findOne({ sessionId });
      if (!session || session.status === 'CLOSED') return;

      socket.join(`session:${sessionId}`);
      socket.sessionId = sessionId;

      // Send last 50 messages
      const messages = await ChatMessage.find({ sessionId })
        .sort({ createdAt: 1 })
        .limit(50)
        .lean();

      socket.emit('chat:history', { sessionId, messages, status: session.status });
    } catch (error) {
      console.error('[Chat] chat:rejoin error:', error);
    }
  });

  /* ── AGENT: Join a session ──────────────────────────────────────────────── */
  socket.on('agent:join_session', async ({ sessionId }) => {
    try {
      if (!socket.user || !['admin', 'superadmin'].includes(socket.user.role)) return;

      socket.join(`session:${sessionId}`);

      const session = await ChatSession.findOneAndUpdate(
        { sessionId, status: { $ne: 'CLOSED' } },
        { agentId: socket.user._id, status: 'ACTIVE' },
        { new: true }
      );
      if (!session) return;

      const sysMsg = await ChatMessage.create({
        sessionId,
        senderId:   'SYSTEM',
        senderType: 'SYSTEM',
        senderName: 'System',
        content:    `${socket.user.name} has joined the chat.`,
        messageType: 'TEXT',
      });

      io.to(`session:${sessionId}`).emit('chat:agent_joined', {
        agentName:   socket.user.name,
        agentAvatar: socket.user.avatar,
      });
      io.to(`session:${sessionId}`).emit('chat:message', sysMsg);
      io.to('admin_room').emit('admin:session_update', { sessionId, status: 'ACTIVE', agentId: socket.user._id });

      // Load message history for the agent
      const messages = await ChatMessage.find({ sessionId })
        .sort({ createdAt: 1 })
        .lean();

      socket.emit('chat:history', { sessionId, messages, status: 'ACTIVE' });
    } catch (error) {
      console.error('[Chat] agent:join_session error:', error);
    }
  });

  /* ── AGENT: Send message ────────────────────────────────────────────────── */
  socket.on('agent:message', async ({ sessionId, content, messageType = 'TEXT', metadata = {} }) => {
    try {
      if (!socket.user || !['admin', 'superadmin'].includes(socket.user.role)) return;
      if (!content?.trim()) return;

      const msg = await ChatMessage.create({
        sessionId,
        senderId:   socket.user._id,
        senderType: 'AGENT',
        senderName: socket.user.name,
        content:    content.trim(),
        messageType,
        metadata,
      });

      await ChatSession.findOneAndUpdate({ sessionId }, { lastMessageAt: new Date() });
      io.to(`session:${sessionId}`).emit('chat:message', msg);
    } catch (error) {
      console.error('[Chat] agent:message error:', error);
    }
  });

  /* ── AGENT: Typing indicator ─────────────────────────────────────────────── */
  socket.on('agent:typing', ({ sessionId, isTyping }) => {
    socket.to(`session:${sessionId}`).emit('chat:agent_typing', { isTyping });
  });

  /* ── AGENT: Close chat ──────────────────────────────────────────────────── */
  socket.on('agent:close_session', async ({ sessionId, resolution }) => {
    try {
      if (!socket.user || !['admin', 'superadmin'].includes(socket.user.role)) return;

      await ChatSession.findOneAndUpdate(
        { sessionId },
        { status: 'CLOSED', closedAt: new Date(), closedBy: 'agent', resolutionNote: resolution },
      );

      const sysMsg = await ChatMessage.create({
        sessionId,
        senderId:   'SYSTEM',
        senderType: 'SYSTEM',
        senderName: 'System',
        content:    `Chat resolved by ${socket.user.name}. ${resolution ? `Resolution: ${resolution}` : ''}`,
        messageType: 'TEXT',
      });

      io.to(`session:${sessionId}`).emit('chat:session_closed', {
        reason:        'agent_resolved',
        rating_prompt: true,
      });
      io.to(`session:${sessionId}`).emit('chat:message', sysMsg);
      io.to('admin_room').emit('admin:session_update', { sessionId, status: 'CLOSED' });
    } catch (error) {
      console.error('[Chat] agent:close_session error:', error);
    }
  });
}

/* ── Escalate to human ───────────────────────────────────────────────────── */
async function escalateToHuman(io, socket, session, reason = 'User requested human agent') {
  try {
    await ChatSession.findOneAndUpdate(
      { sessionId: session.sessionId },
      { status: 'WAITING' }
    );

    const waitingCount = await ChatSession.countDocuments({ status: 'WAITING' });
    const position = waitingCount;
    const estimatedWait = Math.max(2, position * 2);

    const sysMsg = await ChatMessage.create({
      sessionId:   session.sessionId,
      senderId:    'SYSTEM',
      senderType:  'SYSTEM',
      senderName:  'System',
      content:     `You've been added to the support queue. An agent will join shortly. Estimated wait: ${estimatedWait}-${estimatedWait + 2} minutes.${position > 1 ? ` You are #${position} in queue.` : ''}`,
      messageType: 'TEXT',
    });

    io.to(`session:${session.sessionId}`).emit('chat:message', sysMsg);
    io.to(`session:${session.sessionId}`).emit('chat:status_changed', { status: 'WAITING', position });

    // Notify all connected agents
    const sessionData = await ChatSession.findOne({ sessionId: session.sessionId })
      .populate('userId', 'name email')
      .lean();

    io.to('admin_room').emit('admin:new_session', sessionData);
    io.to('admin_room').emit('admin:queue_count', { count: waitingCount });
  } catch (error) {
    console.error('[Chat] escalateToHuman error:', error);
  }
}

/* ── Quick reply options by category ────────────────────────────────────── */
function getCategoryQuickReplies(category) {
  const map = {
    ORDER:   ['Where is my order?', 'Track with order ID', 'Cancel order'],
    PAYMENT: ['Payment failed', 'Refund status', 'Wrong amount charged'],
    RETURN:  ['Start a return', 'Refund status', 'Return policy'],
    PRODUCT: ['Product ingredients', 'Storage tips', 'Place a new order'],
    OTHER:   ['Track my order', 'Return policy', 'Talk to a person'],
  };
  return map[category] || map.OTHER;
}

module.exports = { registerChatHandlers, escalateToHuman };
