const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const Product = require('../models/Product');
const razorpay = require('../config/razorpay');

// @route   GET /api/subscriptions/plans
// @desc    Get all active subscription plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).populate('product', 'name price image weight');
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/subscriptions/plans
// @desc    Create a new subscription plan (Admin)
// @access  Private (Admin)
router.post('/plans', auth, auth.admin, async (req, res) => {
  try {
    const { productId, name, description, period, interval, price } = req.body;

    if (!productId || !name || !period || !interval || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Create plan on Razorpay
    const rpPlan = await razorpay.plans.create({
      period,
      interval,
      item: {
        name,
        description: description || `Subscription for ${product.name}`,
        amount: Math.round(price * 100), // paise
        currency: 'INR'
      }
    });

    // Save to DB
    const plan = new SubscriptionPlan({
      product: productId,
      name,
      description,
      period,
      interval,
      price,
      razorpayPlanId: rpPlan.id
    });

    await plan.save();

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    console.error('Create plan error:', error);
    const msg = error.error?.description || error.message || 'Server error creating plan';
    res.status(500).json({ success: false, message: msg, raw: error });
  }
});

// @route   POST /api/subscriptions/create
// @desc    Create a user subscription (Returns razorpay subscription_id for frontend)
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const { planId, totalCount, shippingAddress } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Plan not found or inactive' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Create subscription on Razorpay
    const rpSub = await razorpay.subscriptions.create({
      plan_id: plan.razorpayPlanId,
      customer_notify: 1,
      total_count: totalCount || 12, // default 12 billing cycles
      notes: {
        userId: req.user._id.toString(),
        planDbId: plan._id.toString()
      }
    });

    // Save to DB
    const userSub = new UserSubscription({
      user: req.user._id,
      plan: plan._id,
      razorpaySubscriptionId: rpSub.id,
      status: rpSub.status, // usually 'created'
      totalCount: rpSub.total_count,
      shippingAddress
    });

    await userSub.save();

    res.json({ success: true, subscription_id: rpSub.id });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ success: false, message: error.error?.description || 'Server error' });
  }
});

// @route   GET /api/subscriptions/my
// @desc    Get user's subscriptions
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const subs = await UserSubscription.find({ user: req.user._id })
      .populate({
        path: 'plan',
        populate: { path: 'product', select: 'name image weight' }
      })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: subs });
  } catch (error) {
    console.error('Get my subs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/subscriptions/all
// @desc    Get all users' subscriptions (Admin)
// @access  Private (Admin)
router.get('/all', auth, auth.admin, async (req, res) => {
  try {
    const subs = await UserSubscription.find()
      .populate('user', 'name email')
      .populate({
        path: 'plan',
        populate: { path: 'product', select: 'name' }
      })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: subs });
  } catch (error) {
    console.error('Get all subs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/subscriptions/cancel
// @desc    Cancel a subscription
// @access  Private
router.post('/cancel', auth, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const sub = await UserSubscription.findById(subscriptionId);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    // Verify ownership or admin
    if (sub.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Cancel on Razorpay
    await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId);

    sub.status = 'cancelled';
    await sub.save();

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel sub error:', error);
    res.status(500).json({ success: false, message: error.error?.description || 'Failed to cancel subscription' });
  }
});

module.exports = router;
