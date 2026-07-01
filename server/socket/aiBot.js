// socket/aiBot.js
// AI-powered first-response bot using Anthropic Claude API
// Handles: order lookups, product info, policy questions, return eligibility
// Escalates to human when: needs_human=true, frustration detected, timeout

const Anthropic = require('@anthropic-ai/sdk').default;
const ChatMessage = require('../models/ChatMessage');
const ChatSession = require('../models/ChatSession');

// Only initialize Anthropic client if API key is present
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const BOT_NAME   = 'Ghee Assistant';
const BOT_SENDER = 'BOT';

// ─── System Prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "Ghee Assistant", a friendly and helpful customer support agent for Daatasa, 
an online store selling premium ghee and organic products.

Your capabilities:
1. Answer questions about products (ingredients, benefits, storage, usage)
2. Look up order status when given an order ID
3. Explain return/refund policy (7 days from delivery, refund in 5-7 business days)
4. Explain shipping policy (free above ₹500, 3-5 business days standard)
5. Help with basic account issues

Rules:
- Always be warm, helpful, and concise
- If the user has an order ID, call the lookup_order tool to get real status
- If asked something you cannot handle (complex complaints, billing disputes, account blocks), say you'll connect them with a human agent and set needs_human: true
- Never make up information — if unsure, escalate to human
- Keep responses under 3 sentences unless explaining a policy
- Use ₹ for prices, not $
- Do not use markdown formatting in responses — plain text only

You MUST respond with a JSON object in this exact format:
{
  "message": "Your reply to the customer (plain text, no markdown)",
  "needs_human": false,
  "quick_replies": ["Option 1", "Option 2", "Option 3"],
  "order_card": null
}

If you have order data to show, set order_card to:
{
  "orderId": "...",
  "status": "...",
  "items": [...],
  "trackingNumber": "...",
  "estimatedDelivery": "..."
}`;

// ─── Tools available to Claude ───────────────────────────────────────────────
const BOT_TOOLS = [
  {
    name: 'lookup_order',
    description: 'Look up an order by order ID to get its current status, items, and tracking info',
    input_schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'The order ID to look up' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'get_product_info',
    description: 'Get details about a product by name or partial name',
    input_schema: {
      type: 'object',
      properties: {
        productName: { type: 'string', description: 'Product name or partial name to search for' },
      },
      required: ['productName'],
    },
  },
  {
    name: 'check_return_eligibility',
    description: 'Check if an order is within the 7-day return window',
    input_schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'The order ID to check return eligibility for' },
      },
      required: ['orderId'],
    },
  },
];

// ─── Tool Execution ───────────────────────────────────────────────────────────

async function executeTool(toolName, toolInput, session) {
  try {
    const Order   = require('../models/Order');
    const Product = require('../models/Product');
    const mongoose = require('mongoose');

    if (toolName === 'lookup_order') {
      const { orderId } = toolInput;
      const userId = session.userId;

      // Build query — admin can see any order; user only sees their own
      const query = mongoose.Types.ObjectId.isValid(orderId)
        ? { _id: orderId }
        : { 'paymentInfo.razorpay_order_id': orderId };

      if (userId) query.user = userId;

      const order = await Order.findOne(query)
        .populate('orderItems.product', 'name image price')
        .lean();

      if (!order) {
        return { found: false, message: 'Order not found. Please check your order ID.' };
      }

      return {
        found: true,
        orderId:           order._id.toString(),
        status:            order.paymentStatus,
        items:             order.orderItems.map(i => ({
          name:     i.name || i.product?.name,
          quantity: i.quantity,
          price:    i.price,
        })),
        trackingNumber:    order.trackingNumber || null,
        shippingProvider:  order.shippingProvider || null,
        isPaid:            order.isPaid,
        isDelivered:       order.isDelivered,
        deliveredAt:       order.deliveredAt || null,
        createdAt:         order.createdAt,
        totalPrice:        order.totalPrice,
      };
    }

    if (toolName === 'get_product_info') {
      const { productName } = toolInput;
      const regex   = new RegExp(productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const product = await Product.findOne({ name: regex, isActive: true })
        .select('name description price mrp stock weight tags rating numReviews')
        .lean();

      if (!product) return { found: false };
      return { found: true, ...product };
    }

    if (toolName === 'check_return_eligibility') {
      const { orderId } = toolInput;
      const order = await Order.findById(orderId).lean();
      if (!order) return { eligible: false, reason: 'Order not found' };
      if (!order.isDelivered) return { eligible: false, reason: 'Order has not been delivered yet' };

      const daysSinceDelivery = (Date.now() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > 7) {
        return { eligible: false, reason: `Return window expired (${Math.floor(daysSinceDelivery)} days since delivery, policy is 7 days)` };
      }

      return {
        eligible:          true,
        daysLeft:          Math.floor(7 - daysSinceDelivery),
        deliveredAt:       order.deliveredAt,
        returnDeadline:    new Date(new Date(order.deliveredAt).getTime() + 7 * 24 * 60 * 60 * 1000),
      };
    }

    return { error: `Unknown tool: ${toolName}` };
  } catch (err) {
    console.error(`[Bot] Tool ${toolName} error:`, err.message);
    return { error: err.message };
  }
}

// ─── Main Bot Handler ─────────────────────────────────────────────────────────

/**
 * Handle a user message with the AI bot.
 * Emits response messages via socket.io.
 */
async function handleBotMessage(session, userMessage, io, socket, mode = 'normal') {
  if (!anthropic) {
    // No API key — fall back to simple rule-based responses
    await handleFallbackBot(session, userMessage, io, socket);
    return;
  }

  try {
    // Emit typing indicator
    io.to(`session:${session.sessionId}`).emit('chat:agent_typing', { isTyping: true });

    // Build conversation history (last 10 messages for context)
    const history = await ChatMessage.find({ sessionId: session.sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const messages = history
      .reverse()
      .filter(m => m.senderType === 'USER' || m.senderType === 'BOT')
      .map(m => ({
        role:    m.senderType === 'USER' ? 'user' : 'assistant',
        content: m.content,
      }));

    // Add current message
    if (userMessage && mode === 'normal') {
      messages.push({ role: 'user', content: userMessage });
    } else if (mode === 'auto_fetch_order') {
      messages.push({
        role: 'user',
        content: `Please look up my order${session.orderId ? ` (order ID: ${session.orderId})` : ''} and tell me its current status.`,
      });
    }

    // Ensure messages alternate properly (Claude requirement)
    const cleanMessages = [];
    for (const msg of messages) {
      const last = cleanMessages[cleanMessages.length - 1];
      if (last && last.role === msg.role) {
        // Merge consecutive same-role messages
        last.content += '\n' + msg.content;
      } else {
        cleanMessages.push({ ...msg });
      }
    }

    if (cleanMessages.length === 0 || cleanMessages[cleanMessages.length - 1].role !== 'user') {
      cleanMessages.push({ role: 'user', content: userMessage || 'Hello' });
    }

    // ── Call Claude API ──────────────────────────────────────────────────────
    let response = await anthropic.messages.create({
      model:      'claude-sonnet-4-5',
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      tools:      BOT_TOOLS,
      messages:   cleanMessages,
    });

    // ── Handle tool_use (Claude wants to call a tool) ────────────────────────
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolUse) => {
          const result = await executeTool(toolUse.name, toolUse.input, session);
          return {
            type:       'tool_result',
            tool_use_id: toolUse.id,
            content:    JSON.stringify(result),
          };
        })
      );

      // Continue conversation with tool results
      cleanMessages.push({ role: 'assistant', content: response.content });
      cleanMessages.push({ role: 'user', content: toolResults });

      response = await anthropic.messages.create({
        model:      'claude-sonnet-4-5',
        max_tokens: 1024,
        system:     SYSTEM_PROMPT,
        tools:      BOT_TOOLS,
        messages:   cleanMessages,
      });
    }

    // ── Parse bot response ───────────────────────────────────────────────────
    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock) throw new Error('No text response from bot');

    let botResponse;
    try {
      // Try to parse JSON response
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      botResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: textBlock.text, needs_human: false };
    } catch {
      botResponse = { message: textBlock.text, needs_human: false };
    }

    // Stop typing
    io.to(`session:${session.sessionId}`).emit('chat:agent_typing', { isTyping: false });

    // Check if bot wants to escalate
    if (botResponse.needs_human) {
      const { escalateToHuman } = require('./chatHandlers');
      await escalateToHuman(io, socket, session, 'Bot escalation');
      return;
    }

    // Determine message type
    let messageType = 'TEXT';
    let metadata    = {};

    if (botResponse.quick_replies?.length) {
      messageType = 'QUICK_REPLY';
      metadata    = { options: botResponse.quick_replies };
    }
    if (botResponse.order_card) {
      messageType = 'ORDER_CARD';
      metadata    = botResponse.order_card;
    }

    // Save and emit bot message
    const botMsg = await ChatMessage.create({
      sessionId:   session.sessionId,
      senderId:    BOT_SENDER,
      senderType:  'BOT',
      senderName:  BOT_NAME,
      content:     botResponse.message || 'I could not process that. Let me connect you with a human agent.',
      messageType,
      metadata,
    });

    // Update session bot message count
    await ChatSession.findOneAndUpdate(
      { sessionId: session.sessionId },
      { $inc: { botMessageCount: 1 }, lastMessageAt: new Date() }
    );

    io.to(`session:${session.sessionId}`).emit('chat:message', botMsg);
  } catch (error) {
    console.error('[Bot] handleBotMessage error:', error.message);
    io.to(`session:${session.sessionId}`).emit('chat:agent_typing', { isTyping: false });

    // Send error message and escalate
    const errorMsg = await ChatMessage.create({
      sessionId:  session.sessionId,
      senderId:   'SYSTEM',
      senderType: 'SYSTEM',
      senderName: 'System',
      content:    "I'm having trouble right now. Let me connect you with a human agent.",
      messageType: 'TEXT',
    });
    io.to(`session:${session.sessionId}`).emit('chat:message', errorMsg);

    const { escalateToHuman } = require('./chatHandlers');
    await escalateToHuman(io, socket, session, 'Bot error');
  }
}

// ─── Fallback: Rule-based responses when no Anthropic API key ────────────────
async function handleFallbackBot(session, userMessage, io, socket) {
  const lower = userMessage.toLowerCase();
  let reply   = "I'm here to help! For the best support, please share your query and I'll assist you.";
  let options = ['Track my order', 'Return policy', 'Talk to a person'];

  if (lower.includes('order') || lower.includes('track')) {
    reply   = 'To track your order, please go to My Orders in your account, or share your order ID here.';
    options = ['Track with order ID', 'Cancel order', 'Talk to a person'];
  } else if (lower.includes('return') || lower.includes('refund')) {
    reply   = 'Our return policy allows returns within 7 days of delivery. Refunds are processed in 5-7 business days.';
    options = ['Start a return', 'Refund status', 'Talk to a person'];
  } else if (lower.includes('delivery') || lower.includes('shipping')) {
    reply   = 'Standard delivery takes 3-5 business days. Shipping is free on orders above ₹500.';
    options = ['Track my order', 'Return policy', 'Talk to a person'];
  }

  io.to(`session:${session.sessionId}`).emit('chat:agent_typing', { isTyping: true });
  await new Promise(r => setTimeout(r, 1000)); // Simulate thinking
  io.to(`session:${session.sessionId}`).emit('chat:agent_typing', { isTyping: false });

  const botMsg = await ChatMessage.create({
    sessionId:   session.sessionId,
    senderId:    BOT_SENDER,
    senderType:  'BOT',
    senderName:  BOT_NAME,
    content:     reply,
    messageType: 'QUICK_REPLY',
    metadata:    { options },
  });

  await ChatSession.findOneAndUpdate(
    { sessionId: session.sessionId },
    { $inc: { botMessageCount: 1 }, lastMessageAt: new Date() }
  );

  io.to(`session:${session.sessionId}`).emit('chat:message', botMsg);
}

module.exports = { handleBotMessage };
