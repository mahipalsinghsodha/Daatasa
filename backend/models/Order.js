const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  image: String,
  price: Number,
  quantity: Number
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  orderItems: [orderItemSchema],

  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
cancelReason:  { type: String, default: '' },
cancelledAt:   Date,
cancelledBy:   { type: String, enum: ['user', 'admin'] },
refundInfo: {
  refund_id:   String,
  status:      String,
  amount:      Number,
  initiatedAt: Date,
},
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Online']
  },

  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'COD_CONFIRMED'],
    default: 'PENDING'
  },

  // Razorpay payment info
  paymentInfo: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String
  },

  // Price breakdown
  itemsPrice: {
    type: Number,
    required: true,
    default: 0
  },

  // ✅ NEW: Discount from coupon
  discount: {
    type: Number,
    default: 0
  },

  // ✅ NEW: Applied coupon details
  coupon: {
    code: String,
    discountType: String,
    discountValue: Number,
    discountAmount: Number
  },

  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },

  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },

  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },

  isPaid: {
    type: Boolean,
    default: false
  },

  paidAt: Date,

  isDelivered: {
    type: Boolean,
    default: false
  },

  deliveredAt: Date
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'paymentInfo.razorpay_order_id': 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;