// routes/reviewRoutes.js
// Only users with a DELIVERED order for the product can review.
// One review per user per product — enforced by unique index.

const express = require('express');
const router  = express.Router();
const Review  = require('../models/Review');
const Order   = require('../models/Order');
const auth    = require('../middleware/auth');

/* ─────────────────────────────────────────────────────────────────────────── */
/*  GET reviews for a product                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
router.get('/product/:productId', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar')
        .lean(),
      Review.countDocuments({ product: req.params.productId, isActive: true }),
    ]);

    res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CREATE review (auth required + must have delivered order)                 */
/* ─────────────────────────────────────────────────────────────────────────── */
router.post('/', auth, async (req, res) => {
  try {
    const { productId, orderId, rating, title, body, images } = req.body;

    if (!productId || !orderId || !rating || !body) {
      return res.status(400).json({ message: 'productId, orderId, rating, and body are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify the order belongs to this user and is DELIVERED
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      isDelivered: true,
    });
    if (!order) {
      return res.status(403).json({ message: 'You can only review products from delivered orders.' });
    }

    // Verify the product was in this order
    const hasProduct = order.orderItems.some(i => String(i.product) === productId);
    if (!hasProduct) {
      return res.status(403).json({ message: 'This product was not part of that order.' });
    }

    // Check for duplicate (unique index will also catch this)
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this product.' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: orderId,
      rating: parseInt(rating),
      title: title?.trim(),
      body: body.trim(),
      images: (images || []).slice(0, 3),
      verified: true,
    });

    await review.populate('user', 'name avatar');
    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this product.' });
    }
    res.status(500).json({ message: error.message || 'Failed to submit review' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HELPFUL upvote toggle                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const idx = review.helpful.findIndex(uid => String(uid) === String(req.user._id));
    if (idx > -1) {
      review.helpful.splice(idx, 1);
    } else {
      review.helpful.push(req.user._id);
    }
    await review.save();
    res.json({ helpfulCount: review.helpful.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DELETE review (admin only)                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
router.delete('/:id', auth, auth.admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Check if user can review a product                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
router.get('/can-review/:productId', auth, async (req, res) => {
  try {
    // Check for delivered order containing this product
    const order = await Order.findOne({
      user: req.user._id,
      isDelivered: true,
      'orderItems.product': req.params.productId,
    });

    const alreadyReviewed = !!(await Review.findOne({
      product: req.params.productId,
      user: req.user._id,
      isActive: true,
    }));

    res.json({
      canReview: !!order && !alreadyReviewed,
      hasDeliveredOrder: !!order,
      alreadyReviewed,
      orderId: order?._id || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
