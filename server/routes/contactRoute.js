const express = require('express');
const { sendContactEmail } = require('../controllers/contactController');

const rateLimit = require('express-rate-limit');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 contact form submissions per IP per hour
  message: 'Too many messages sent. Please try again after an hour.'
});

// POST /api/contact
router.post('/', contactLimiter, sendContactEmail);

module.exports = router;
