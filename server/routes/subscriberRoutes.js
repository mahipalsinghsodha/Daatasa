const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Subscriber = require('../models/Subscriber');
const { sendNewsletterEmail } = require('../services/emailService');

// @route   POST /api/subscribers/subscribe
// @desc    Add a new subscriber (Public)
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if already subscribed
    let subscriber = await Subscriber.findOne({ email });
    if (subscriber) {
      if (!subscriber.isActive) {
        subscriber.isActive = true;
        await subscriber.save();
        return res.json({ success: true, message: 'Successfully resubscribed to the newsletter!' });
      }
      return res.status(400).json({ success: false, message: 'This email is already subscribed' });
    }

    subscriber = new Subscriber({ email });
    await subscriber.save();

    res.status(201).json({ success: true, message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ success: false, message: 'Server error during subscription' });
  }
});

// @route   GET /api/subscribers
// @desc    Get all subscribers
// @access  Private (Admin only)
router.get('/', auth, auth.admin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json({ success: true, data: subscribers });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/subscribers/send-email
// @desc    Send promotional email to all active subscribers
// @access  Private (Admin only)
router.post('/send-email', auth, auth.admin, async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const activeSubscribers = await Subscriber.find({ isActive: true });
    
    if (activeSubscribers.length === 0) {
      return res.status(400).json({ success: false, message: 'No active subscribers found' });
    }

    // Send emails (Warning: for a very large list, this should be done via a background job / queue)
    // Here we use Promise.allSettled to not fail the whole batch if one email fails
    const emailPromises = activeSubscribers.map(sub => 
      sendNewsletterEmail({ to: sub.email, subject, message })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - successful;

    res.json({ 
      success: true, 
      message: `Newsletter sent successfully to ${successful} subscribers${failed > 0 ? ` (${failed} failed)` : ''}.` 
    });
  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({ success: false, message: 'Server error sending newsletter' });
  }
});

// @route   DELETE /api/subscribers/:id
// @desc    Remove a subscriber
// @access  Private (Admin only)
router.delete('/:id', auth, auth.admin, async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subscriber removed' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
