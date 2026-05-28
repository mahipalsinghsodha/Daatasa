// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true, // Must have a delivered order to review
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  images: [{
    type: String, // Cloudinary URLs
  }],
  verified: {
    type: Boolean,
    default: true, // True = verified purchase (order delivered)
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }], // Users who found this helpful (upvotes)
  isActive: {
    type: Boolean,
    default: true, // Admin can soft-delete
  },
}, { timestamps: true });

// Compound index: one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

// After a review is saved/updated/deleted, recalculate product rating
const recalcProductRating = async (productId) => {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: productId, isActive: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const Product = require('./Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avg * 10) / 10,
      numReviews: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
  }
};

reviewSchema.post('save', async function () {
  await recalcProductRating(this.product);
});

reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await recalcProductRating(doc.product);
});

reviewSchema.post('deleteOne', { document: true }, async function () {
  await recalcProductRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
