const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order   = require('../models/Order');
const auth = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const dbCheck = require('../middleware/dbCheck');
const mongoose = require('mongoose');

// Whitelist of fields that clients may set on a product
const ALLOWED_PRODUCT_FIELDS = [
  'name', 'description', 'price', 'mrp', 'image', 'images', 'category',
  'stock', 'weight', 'featured', 'isActive', 'tags'
];

const pickAllowed = (body) => {
  const data = {};
  for (const field of ALLOWED_PRODUCT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  }
  return data;
};

// Get products with server-side pagination, sort, and search
router.get('/', dbCheck, async (req, res) => {
  try {
    const {
      category, featured, search,
      page    = 1,
      limit   = 12,
      sort    = 'default',
      all,          // admin flag: include inactive
    } = req.query;

    const query = {};

    // ── Active filter (skip for admin "all" flag) ──────────────────────────
    if (all !== 'true') {
      query.isActive = { $ne: false };
    }

    if (category) query.category = category;
    if (featured === 'true') query.featured = true;

    // ── Search: prefer $text index (fast), fall back to $regex only if needed
    if (search && search.trim()) {
      // $text uses the defined text index on name + description
      query.$text = { $search: search.trim() };
    }

    // ── Sort ──────────────────────────────────────────────────────────────
    const sortMap = {
      default:    { createdAt: -1 },
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      rating:     { rating: -1 },
      newest:     { createdAt: -1 },
    };
    const mongoSort = sortMap[sort] || { createdAt: -1 };

    // ── Pagination ────────────────────────────────────────────────────────
    const pageNum   = Math.max(1, parseInt(page)  || 1);
    const limitNum  = Math.min(48, Math.max(1, parseInt(limit) || 12)); // cap at 48
    const skip      = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(mongoSort).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      total,
      page:  pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: error.message || 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Get single product
router.get('/:id', dbCheck, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ 
      message: error.message || 'Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create product (Admin with 'products' permission or Superadmin)
router.post('/', auth, auth.admin, auth.hasPermission('products'), async (req, res) => {
  try {
    const safeData = pickAllowed(req.body);
    const product = new Product(safeData);
    await product.save();
    
    await logAction(req, 'CREATE_PRODUCT', 'PRODUCT', product._id, {
      name: product.name,
      price: product.price,
      category: product.category
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product (Admin with 'products' permission or Superadmin)
router.put('/:id', auth, auth.admin, auth.hasPermission('products'), async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const safeData = pickAllowed(req.body);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      safeData,
      { new: true, runValidators: true }
    );

    await logAction(req, 'UPDATE_PRODUCT', 'PRODUCT', product._id, {
      name: product.name,
      changes: safeData
    });

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product (Admin with 'products' permission or Superadmin)
router.delete('/:id', auth, auth.admin, auth.hasPermission('products'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await logAction(req, 'DELETE_PRODUCT', 'PRODUCT', product._id, {
      name: product.name
    });

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ── Check review eligibility (has delivered order + not yet reviewed) ─────────
router.get('/:id/review-eligibility', auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId    = req.user._id;

    // Has the user received a delivered order containing this product?
    const deliveredOrder = await Order.findOne({
      user:        userId,
      isDelivered: true,
      'orderItems.product': productId,
    });

    const product = await Product.findById(productId).select('reviews');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = (product.reviews || []).some(
      r => r.user.toString() === userId.toString()
    );

    res.json({
      eligible:        !!deliveredOrder && !alreadyReviewed,
      hasDelivered:    !!deliveredOrder,
      alreadyReviewed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Add a product review (verified purchase required) ─────────────────────────
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!comment?.trim()) {
      return res.status(400).json({ message: 'Review comment is required' });
    }

    // ── Verified purchase gate ────────────────────────────────────────────────
    const deliveredOrder = await Order.findOne({
      user:        req.user._id,
      isDelivered: true,
      'orderItems.product': req.params.id,
    });
    if (!deliveredOrder) {
      return res.status(403).json({ message: 'You can only review products you have received.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!product.reviews) product.reviews = [];

    // One review per user — cannot be removed by user
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      user:      req.user._id,
      name:      req.user.name,
      rating:    Number(rating),
      comment:   comment.trim(),
      verified:  true,          // verified purchase badge
      createdAt: new Date(),
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating     = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added', rating: product.rating, numReviews: product.numReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
