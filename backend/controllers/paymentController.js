const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');

/**
 * CREATE RAZORPAY ORDER
 * ✅ Amount calculated from backend order (secure)
 * ✅ Auth required
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find order and verify it belongs to this user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security: Only create Razorpay order for PENDING payments
    if (order.paymentStatus !== 'PENDING') {
      return res.status(400).json({ message: 'Order already processed' });
    }

    // Create Razorpay order with BACKEND-calculated amount
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalPrice * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    });

    // Save Razorpay order ID to our order
    order.paymentInfo = {
      razorpay_order_id: razorpayOrder.id
    };
    await order.save();

    res.status(200).json(razorpayOrder);

  } catch (error) {
    console.error('RAZORPAY ORDER ERROR:', error);
    res.status(500).json({ message: 'Razorpay order creation failed' });
  }
};

/**
 * VERIFY PAYMENT
 * ✅ Signature verification
 * ✅ Amount verification (prevent frontend manipulation)
 * ✅ Clear cart only after successful payment
 * ✅ Increment coupon usage
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Find order
    const order = await Order.findOne({
      user: req.user._id,
      'paymentInfo.razorpay_order_id': razorpay_order_id,
      paymentStatus: 'PENDING'
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or already processed' });
    }

    // 1️⃣ VERIFY SIGNATURE
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // 2️⃣ FETCH PAYMENT DETAILS FROM RAZORPAY (VERIFY AMOUNT)
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      // Security: Verify amount matches
      const expectedAmount = Math.round(order.totalPrice * 100);
      if (payment.amount !== expectedAmount) {
        console.error('AMOUNT MISMATCH:', {
          expected: expectedAmount,
          received: payment.amount
        });
        return res.status(400).json({ message: 'Payment amount mismatch' });
      }

      // Verify payment is captured/successful
      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        return res.status(400).json({ message: 'Payment not successful' });
      }

    } catch (fetchError) {
      console.error('PAYMENT FETCH ERROR:', fetchError);
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // 3️⃣ MARK ORDER AS PAID
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = 'PAID';
    
    // Generate invoice number
    if (!order.invoiceNumber) {
      const orderCount = await Order.countDocuments();
      order.invoiceNumber = `INV-${new Date().getFullYear()}-${String(orderCount).padStart(6, '0')}`;
    }

    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };

    await order.save();

    // 4️⃣ CLEAR USER'S CART (Only after successful payment)
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] }
    );

    // 5️⃣ INCREMENT COUPON USAGE (if coupon was used)
    if (order.coupon && order.coupon.code) {
      await Coupon.findOneAndUpdate(
        { code: order.coupon.code },
        { $inc: { usedCount: 1 } }
      );
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order._id
    });

    // ── 6️⃣ SEND SUCCESS EMAIL (Background) ───────────────────────────────
    try {
      const { sendOrderSuccessEmail } = require('../services/emailService');
      const populatedOrder = await order.populate('user', 'name email');
      await sendOrderSuccessEmail({
        to:            populatedOrder.user.email,
        userName:      populatedOrder.user.name,
        orderId:       order._id.toString(),
        totalPrice:    order.totalPrice,
        paymentMethod: 'Online Payment',
        items:         order.orderItems.map(i => ({
          name:     i.name,
          quantity: i.quantity,
          price:    i.price
        }))
      });
    } catch (emailErr) {
      console.error('ONLINE SUCCESS EMAIL ERROR:', emailErr);
    }

  } catch (error) {
    console.error('VERIFY PAYMENT ERROR:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};