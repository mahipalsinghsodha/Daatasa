const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  
  // For percentage discounts, max discount in rupees
  maxDiscount: {
    type: Number,
    default: null
  },
  
  minOrderValue: {
    type: Number,
    default: 0
  },
  
  validFrom: {
    type: Date,
    default: Date.now
  },
  
  validUntil: {
    type: Date,
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Total usage limit (null = unlimited)
  usageLimit: {
    type: Number,
    default: null
  },
  
  // Usage per user limit (null = unlimited)
  usagePerUser: {
    type: Number,
    default: 1
  },
  
  usedCount: {
    type: Number,
    default: 0
  },
  
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster lookups
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;