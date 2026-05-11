const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon'); // We'll create this
const auth = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// ========================================================================
// CREATE ORDER - IMPROVED FLOW
// ========================================================================
router.post('/', auth, async (req, res) => {
  try {
    const { paymentMethod, couponCode } = req.body;

    // 1️⃣ GET CART WITH PRODUCT DETAILS
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 2️⃣ VALIDATE STOCK
    const stockIssues = [];

    for (const item of cart.items) {
      if (!item.product) continue;
      if (item.product.stock < item.quantity) {
        stockIssues.push({
          itemId: item._id,
          productId: item.product._id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          requested: item.quantity,
          available: item.product.stock,
        });
      }
    }

    // If there are stock issues, return them WITHOUT modifying the cart
    if (stockIssues.length > 0) {
      // Return all cart items with stock info so frontend can display the full cart
      const allItems = cart.items
        .filter(i => i.product)
        .map(i => ({
          itemId: i._id,
          productId: i.product._id,
          name: i.product.name,
          image: i.product.image,
          price: i.product.price,
          quantity: i.quantity,
          stock: i.product.stock,
          hasIssue: i.product.stock < i.quantity,
        }));

      return res.status(409).json({
        message: 'Some items have stock issues',
        stockIssues,
        allItems,
      });
    }

    // 3️⃣ PREPARE ORDER ITEMS (all items passed stock check if we reach here)
    const orderItems = cart.items.filter(i => i.product).map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity
    }));

    // 4️⃣ CALCULATE PRICES (BACKEND - SECURE!)
    const itemsPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    let discount = 0;
    let appliedCoupon = null;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (coupon && itemsPrice >= coupon.minOrderValue) {
        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({ message: 'Coupon usage limit exceeded' });
        }

        // Check user-specific usage
        if (coupon.usagePerUser) {
          const userUsage = await Order.countDocuments({
            user: req.user._id,
            'coupon.code': couponCode.toUpperCase()
          });
          if (userUsage >= coupon.usagePerUser) {
            return res.status(400).json({ message: 'You have already used this coupon' });
          }
        }

        // Calculate discount
        if (coupon.discountType === 'percentage') {
          discount = (itemsPrice * coupon.discountValue) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        } else {
          discount = coupon.discountValue;
        }

        appliedCoupon = {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discount
        };
      } else if (coupon && itemsPrice < coupon.minOrderValue) {
        return res.status(400).json({
          message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`
        });
      } else {
        return res.status(400).json({ message: 'Invalid or expired coupon code' });
      }
    }

    const taxPrice = (itemsPrice - discount) * 0.18;
    const shippingPrice = (itemsPrice - discount) > 500 ? 0 : 50;
    const totalPrice = itemsPrice - discount + taxPrice + shippingPrice;

    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    session.startTransaction();

    let order;
    try {
      // 5️⃣ CREATE ORDER DATA
      const orderData = {
        user: req.user._id,
        orderItems,
        shippingAddress: req.body.shippingAddress || req.user.address,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        discount,
        coupon: appliedCoupon,
        isPaid: false,
        paymentStatus: 'PENDING'
      };

      // 6️⃣ CREATE ORDER
      order = new Order(orderData);
      await order.save({ session });

      // 7️⃣ REDUCE STOCK (ATOMIC)
      for (const item of cart.items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        );
        if (!updated) {
          throw new Error(`Insufficient stock for ${item.product.name}.`);
        }
      }

      // 8️⃣ FOR COD - CONFIRM IMMEDIATELY
      if (paymentMethod === 'COD') {
        order.paymentStatus = 'COD_CONFIRMED';
        
        // Generate invoice number
        const orderCount = await Order.countDocuments();
        order.invoiceNumber = `INV-${new Date().getFullYear()}-${String(orderCount).padStart(6, '0')}`;
        
        await order.save({ session });

        // Clear cart
        cart.items = [];
        await cart.save({ session });

        // Increment coupon usage
        if (appliedCoupon) {
          await Coupon.findOneAndUpdate(
            { code: appliedCoupon.code },
            { $inc: { usedCount: 1 } },
            { session }
          );
        }
      }

      await session.commitTransaction();
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }
    // FOR ONLINE - Keep cart until payment succeeds

    await order.populate('user', 'name email');
    await order.populate('orderItems.product');

    // ── 8.5 Send Email (COD only) ─────────────────────────────────────────
    if (paymentMethod === 'COD') {
      try {
        const { sendOrderSuccessEmail } = require('../services/emailService');
        await sendOrderSuccessEmail({
          to: order.user.email,
          userName: order.user.name,
          orderId: order._id.toString(),
          totalPrice: order.totalPrice,
          paymentMethod: 'Cash on Delivery',
          items: order.orderItems.map(i => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price
          }))
        });
      } catch (emailErr) {
        console.error('COD SUCCESS EMAIL ERROR:', emailErr);
      }
    }

    res.status(201).json(order);

  } catch (error) {
    console.error('ORDER CREATION ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========================================================================
// PAYMENT FAILED / CANCELLED
// ========================================================================
router.post('/fail', auth, async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({ message: 'razorpay_order_id required' });
    }

    const order = await Order.findOne({
      user: req.user._id, // Security: Only user's own orders
      paymentStatus: 'PENDING',
      'paymentInfo.razorpay_order_id': razorpay_order_id
    });

    if (!order) {
      return res.status(404).json({
        message: 'Pending order not found'
      });
    }

    // ── 1. Send Failure Email ──────────────────────────────────────────────
    try {
      const { sendOrderFailureEmail } = require('../services/emailService');
      const populatedOrder = await order.populate('user', 'name email');
      await sendOrderFailureEmail({
        to: populatedOrder.user.email,
        userName: populatedOrder.user.name,
        orderId: order._id.toString(),
        totalPrice: order.totalPrice,
        reason: 'Payment was cancelled or failed.'
      });
    } catch (emailErr) {
      console.error('FAILURE EMAIL ERROR:', emailErr);
    }

    // 🔁 RESTORE STOCK
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    // ❌ DELETE ORDER
    await order.deleteOne();

    res.json({
      success: true,
      message: 'Payment cancelled. Stock restored and failure email sent.'
    });

  } catch (error) {
    console.error('ORDER FAIL ERROR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ========================================================================
// VERIFY COUPON (BEFORE CHECKOUT)
// ========================================================================
router.post('/verify-coupon', auth, async (req, res) => {
  try {
    const { couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const itemsPrice = cart.items.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }

    if (itemsPrice < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value of ₹${coupon.minOrderValue} required`,
        minOrderValue: coupon.minOrderValue,
        currentValue: itemsPrice
      });
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });
    }

    if (coupon.usagePerUser) {
      const userUsage = await Order.countDocuments({
        user: req.user._id,
        'coupon.code': couponCode.toUpperCase()
      });
      if (userUsage >= coupon.usagePerUser) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (itemsPrice * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount
      },
      itemsPrice,
      discount,
      finalPrice: itemsPrice - discount
    });

  } catch (error) {
    console.error('COUPON VERIFY ERROR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ========================================================================
// GET USER ORDERS
// ========================================================================
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================================================
// GET SINGLE ORDER
// ========================================================================
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isAdmin = req.user.role === 'superadmin' || req.user.role === 'admin';
    if (order.user.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================================================
// ADMIN: GET ALL ORDERS
// ========================================================================
router.get('/', auth, auth.admin, auth.hasPermission('orders'), async (req, res) => {
  try {

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product')
      .sort({ createdAt: -1 });

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const newOrdersCount = orders.filter(
      order => new Date(order.createdAt) > fiveMinutesAgo && !order.isPaid
    ).length;

    res.json({ orders, newOrdersCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================================================
// ADMIN: UPDATE ORDER STATUS
// ========================================================================
router.put('/:id/status', auth, auth.admin, auth.hasPermission('orders'), async (req, res) => {
  try {

    const { isPaid, isDelivered } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (isPaid !== undefined) {
      order.isPaid = isPaid;
      if (isPaid) {
        order.paidAt = new Date();
        order.paymentStatus = 'PAID';
      }
    }

    if (isDelivered !== undefined) {
      order.isDelivered = isDelivered;
      if (isDelivered) {
        order.deliveredAt = new Date();
      }
    }

    await order.save();

    await logAction(req, 'UPDATE_ORDER_STATUS', 'ORDER', order._id, {
      isPaid, isDelivered,
      paymentStatus: order.paymentStatus
    });

    await order.populate('user', 'name email');
    await order.populate('orderItems.product');

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ========================================================================
// ADMIN: MARK AS PAID
// ========================================================================
router.put('/:id/pay', auth, auth.admin, auth.hasPermission('orders'), async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentStatus = 'PAID';
    await order.save();

    await logAction(req, 'MARK_ORDER_PAID', 'ORDER', order._id);

    await order.populate('user', 'name email');
    await order.populate('orderItems.product');

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ========================================================================
// ADMIN: MARK AS DELIVERED
// ========================================================================
router.put('/:id/deliver', auth, auth.admin, auth.hasPermission('orders'), async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    await order.save();

    await logAction(req, 'MARK_ORDER_DELIVERED', 'ORDER', order._id);

    await order.populate('user', 'name email');
    await order.populate('orderItems.product');

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ========================================================================
// ADMIN: BULK UPDATE
// ========================================================================
router.put('/bulk/update', auth, auth.admin, auth.hasPermission('orders'), async (req, res) => {
  try {

    const { orderIds, action } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Invalid order IDs' });
    }

    const updatePromises = orderIds.map(async (orderId) => {
      const order = await Order.findById(orderId);
      if (order) {
        if (action === 'pay') {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentStatus = 'PAID';
        } else if (action === 'deliver') {
          order.isDelivered = true;
          order.deliveredAt = new Date();
        }
        return order.save();
      }
    });

    await Promise.all(updatePromises);

    await logAction(req, 'BULK_ORDER_UPDATE', 'ORDER', null, {
      orderIds, action
    });

    const updatedOrders = await Order.find({ _id: { $in: orderIds } })
      .populate('user', 'name email')
      .populate('orderItems.product');

    res.json({
      message: `${orderIds.length} orders updated successfully`,
      orders: updatedOrders
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ========================================================================
// CANCEL ORDER — user cancels own order, admin cancels any order
// ========================================================================
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    // Superadmin/Admin can cancel any order; user can only cancel their own
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const query = isAdmin
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const order = await Order.findOne(query).populate('user', 'name email');

    if (isAdmin && !req.user.permissions?.includes('orders') && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. You need order permissions.' });
    }

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.isDelivered) return res.status(400).json({ message: 'Cannot cancel a delivered order' });
    if (['CANCELLED', 'FAILED'].includes(order.paymentStatus)) {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // ── 1. Restore stock ──────────────────────────────────────────────────
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    // ── 2. Razorpay refund (only for paid online orders) ──────────────────
    let refundInfo = null;
    const isOnlinePaid =
      order.paymentStatus === 'PAID' &&
      order.paymentMethod === 'Online' &&
      order.paymentInfo?.razorpay_payment_id;

    if (isOnlinePaid) {
      try {
        const razorpay = require('../config/razorpay');
        const refund = await razorpay.payments.refund(
          order.paymentInfo.razorpay_payment_id,
          {
            amount: Math.round(order.totalPrice * 100), // paise
            speed: 'normal',
            notes: { orderId: order._id.toString(), reason: reason || 'Cancelled' },
          }
        );
        refundInfo = {
          refund_id: refund.id,
          status: refund.status,
          amount: order.totalPrice,
          initiatedAt: new Date(),
        };
      } catch (refundErr) {
        console.error('RAZORPAY REFUND ERROR:', refundErr);
        return res.status(500).json({
          message: 'Refund initiation failed. Please contact support.',
        });
      }
    }

    // ── 3. Update order ───────────────────────────────────────────────────
    order.paymentStatus = 'CANCELLED';
    order.cancelReason = reason || '';
    order.cancelledAt = new Date();
    order.cancelledBy = (req.user.role === 'admin' || req.user.role === 'superadmin') ? 'admin' : 'user';
    if (refundInfo) order.refundInfo = refundInfo;
    await order.save();

    if (isAdmin) {
      await logAction(req, 'CANCEL_ORDER', 'ORDER', order._id, { reason });
    }

    // ── 4. Emails (non-fatal) ─────────────────────────────────────────────
    try {
      const { sendCancelEmail } = require('../services/emailService');
      await sendCancelEmail({
        to: order.user.email,
        userName: order.user.name,
        orderId: order._id.toString(),
        totalPrice: order.totalPrice,
        reason,
        isRefund: !!refundInfo,
        refundId: refundInfo?.refund_id,
      });
    } catch (emailErr) {
      console.error('EMAIL ERROR (non-fatal):', emailErr);
    }

    res.json({
      success: true,
      message: isOnlinePaid ? 'Order cancelled. Refund initiated.' : 'Order cancelled successfully.',
      refund: refundInfo,
    });

  } catch (error) {
    console.error('CANCEL ORDER ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========================================================================
// RETURN REQUEST
// ========================================================================
router.post('/:id/return-request', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (!order.isDelivered) {
      return res.status(400).json({ message: 'Can only request return for delivered orders' });
    }
    
    const daysSinceDelivery = (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      return res.status(400).json({ message: 'Return window (7 days) has expired' });
    }

    order.returnRequest = {
      reason,
      requestedAt: new Date(),
      status: 'PENDING'
    };
    await order.save();
    res.json({ message: 'Return request submitted successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;