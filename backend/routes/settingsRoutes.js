const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// ── GET /api/settings  (PUBLIC — frontend reads this to display GST)
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getGlobal();
    // Only expose safe, public fields
    res.json({
      gstRate: settings.gstEnabled ? settings.gstRate : 0,
      gstEnabled: settings.gstEnabled,
      freeShippingThreshold: settings.freeShippingThreshold,
      shippingCharge: settings.shippingCharge,
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    res.status(500).json({ message: 'Failed to load settings' });
  }
});

// ── PATCH /api/settings  (ADMIN ONLY — update GST/shipping config)
router.patch('/', auth, auth.admin, async (req, res) => {
  try {
    const { gstRate, gstEnabled, freeShippingThreshold, shippingCharge } = req.body;

    // Validate
    if (gstRate !== undefined) {
      const rate = Number(gstRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return res.status(400).json({ message: 'GST rate must be between 0 and 100' });
      }
    }
    if (freeShippingThreshold !== undefined && Number(freeShippingThreshold) < 0) {
      return res.status(400).json({ message: 'Free shipping threshold cannot be negative' });
    }
    if (shippingCharge !== undefined && Number(shippingCharge) < 0) {
      return res.status(400).json({ message: 'Shipping charge cannot be negative' });
    }

    const update = { updatedBy: req.user._id };
    if (gstRate !== undefined)             update.gstRate = Number(gstRate);
    if (gstEnabled !== undefined)          update.gstEnabled = Boolean(gstEnabled);
    if (freeShippingThreshold !== undefined) update.freeShippingThreshold = Number(freeShippingThreshold);
    if (shippingCharge !== undefined)      update.shippingCharge = Number(shippingCharge);

    const settings = await Settings.findByIdAndUpdate(
      'global',
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      message: 'Settings updated successfully',
      settings: {
        gstRate: settings.gstRate,
        gstEnabled: settings.gstEnabled,
        freeShippingThreshold: settings.freeShippingThreshold,
        shippingCharge: settings.shippingCharge,
      },
    });
  } catch (error) {
    console.error('Settings PATCH error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;
