const express = require("express");
const router = express.Router();
const SupportTicket = require("../models/SupportTicket");
const auth = require('../middleware/auth');
const { logAction } = require('../utils/logger');


// Create Ticket
router.post("/", auth,  async (req, res) => {
  const { subject, category, order, message } = req.body;

  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject,
    category,
    order,
    messages: [
      {
        sender: "user",
        message
      }
    ]
  });

  res.status(201).json(ticket);
});

// Get My Tickets
router.get("/my", auth, async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id })
    .populate("order")
    .sort({ createdAt: -1 });

  res.json(tickets);
});

// Admin: Get All Tickets
router.get("/admin", auth, auth.admin, auth.hasPermission('support'), async (req, res) => {
  const tickets = await SupportTicket.find()
    .populate("user")
    .populate("order")
    .sort({ createdAt: -1 });

  res.json(tickets);
});

// Reply to Ticket
router.post("/:id/reply", auth, async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const isAdmin = req.user.role === 'superadmin' || (req.user.role === 'admin' && req.user.permissions?.includes('support'));
  
  // If admin is replying, check permissions
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      if (!isAdmin) {
          return res.status(403).json({ message: 'Access denied' });
      }
      ticket.messages.push({
        sender: "admin",
        message: req.body.message
      });
      ticket.status = "IN_PROGRESS";
      await logAction(req, 'REPLY_TICKET', 'SUPPORT', ticket._id, { status: ticket.status });
  } else {
      // Regular user check
      if (ticket.user.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Unauthorized' });
      }
      ticket.messages.push({
        sender: "user",
        message: req.body.message
      });
  }

  await ticket.save();
  res.json(ticket);
});

// Update Status (Admin)
router.put("/:id/status", auth, auth.admin, auth.hasPermission('support'), async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  ticket.status = req.body.status;

  if (req.body.status === "RESOLVED") {
    ticket.resolvedAt = Date.now();
  }

  await ticket.save();
  await logAction(req, 'UPDATE_TICKET_STATUS', 'SUPPORT', ticket._id, { status: ticket.status });
  res.json(ticket);
});

module.exports = router;
