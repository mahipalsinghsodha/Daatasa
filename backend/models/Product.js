const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x400?text=Ghee+Product'
  },
  images: [{
    type: String
  }],
  weight: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reviews: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:      { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true },
    verified:  { type: Boolean, default: false },   // verified purchase
    createdAt: { type: Date, default: Date.now },
  }]
}, {
  timestamps: true
});

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' }); // For search
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
