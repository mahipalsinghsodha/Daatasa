const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const auth = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// ========================================================================
// CREATE COUPON (ADMIN ONLY)
// ========================================================================
router.post('/', auth, auth.admin, auth.hasPermission('coupons'), async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      validFrom,
      validUntil,
      usageLimit,
      usagePerUser,
      description
    } = req.body;

    // Check if code already exists
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue: minOrderValue || 0,
      validFrom: validFrom || Date.now(),
      validUntil,
      usageLimit,
      usagePerUser,
      description
    });

    await logAction(req, 'CREATE_COUPON', 'COUPON', coupon._id, { code: coupon.code, discountType });
    res.status(201).json(coupon);
  } catch (error) {
    console.error('COUPON CREATE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========================================================================
// GET ALL COUPONS (ADMIN ONLY)
// ========================================================================
router.get('/', auth, auth.admin, auth.hasPermission('coupons'), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================================================
// GET ACTIVE COUPONS (PUBLIC - for display to users)
// ========================================================================
router.get('/active', async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    }).select('code discountType discountValue maxDiscount minOrderValue description');

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================================================
// UPDATE COUPON (ADMIN ONLY)
// ========================================================================
router.put('/:id', auth, auth.admin, auth.hasPermission('coupons'), async (req, res) => {
  try {
    const couponSizeBefore = await Coupon.findById(req.params.id);
    if (!couponSizeBefore) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    await logAction(req, 'UPDATE_COUPON', 'COUPON', coupon._id, { code: coupon.code, changes: req.body });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================================================
// DELETE COUPON (ADMIN ONLY)
// ========================================================================
router.delete('/:id', auth, auth.admin, auth.hasPermission('coupons'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await logAction(req, 'DELETE_COUPON', 'COUPON', req.params.id, { code: coupon.code });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================================================
// TOGGLE COUPON STATUS (ADMIN ONLY)
// ========================================================================
router.patch('/:id/toggle', auth, auth.admin, auth.hasPermission('coupons'), async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    await logAction(req, 'TOGGLE_COUPON', 'COUPON', coupon._id, { code: coupon.code, isActive: coupon.isActive });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;