const express = require('express');
const router = express.Router();
const UserActivity = require('../models/UserActivity');
const auth = require('../middleware/auth');
const geoip = require('geoip-lite');

// POST /api/activity/track
// This allows the frontend SPA to explicitly log page visits or actions
router.post('/track', auth.optional, async (req, res) => {
  try {
    const { action = 'PAGE_VISIT', details = {} } = req.body;
    
    let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    if (ipAddress) ipAddress = ipAddress.split(',')[0].trim();
    if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1' || !ipAddress) ipAddress = '127.0.0.1';

    let location = 'Local/Unknown';
    if (ipAddress !== '127.0.0.1') {
      const geo = geoip.lookup(ipAddress);
      if (geo) {
        location = `${geo.city || 'Unknown City'}, ${geo.country || 'Unknown Country'}`;
      }
    }

    const newActivity = await UserActivity.create({
      user: req.user ? req.user._id : undefined,
      action,
      details,
      ipAddress,
      location
    });

    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Error tracking frontend activity:', error);
    res.status(500).json({ message: 'Error tracking activity' });
  }
});

// GET /api/activity/admin
// For Step 11: Admin User Activity Page
router.get('/admin', auth, auth.admin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days if no date provided
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filter.createdAt = { $gte: thirtyDaysAgo };
    }

    const activities = await UserActivity.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(5000);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
