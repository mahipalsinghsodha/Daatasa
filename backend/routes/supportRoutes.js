const express = require("express");
const router = express.Router();
const SupportTicket = require("../models/SupportTicket");
const auth = require('../middleware/auth');

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
router.get("/admin", auth, auth.admin, async (req, res) => {
  const tickets = await SupportTicket.find()
    .populate("user")
    .populate("order")
    .sort({ createdAt: -1 });

  res.json(tickets);
});

// Reply to Ticket
router.post("/:id/reply", auth, async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);

  ticket.messages.push({
    sender: req.user.role === "admin" ? "admin" : "user",
    message: req.body.message
  });

  if (req.user.role === "admin") {
    ticket.status = "IN_PROGRESS";
  }

  await ticket.save();
  res.json(ticket);
});

// Update Status (Admin)
router.put("/:id/status", auth, auth.admin, async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);

  ticket.status = req.body.status;

  if (req.body.status === "RESOLVED") {
    ticket.resolvedAt = Date.now();
  }

  await ticket.save();
  res.json(ticket);
});

module.exports = router;
