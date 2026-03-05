const crypto = require('crypto')
const razorpay = require('../config/razorpay')
const Order = require('../models/Order')

/**
 * CREATE RAZORPAY ORDER
 * Auth required
 * Amount decided by backend
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body

    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalPrice * 100,
      currency: 'INR',
      receipt: `receipt_${order._id}`
    })

    order.paymentInfo = {
      razorpay_order_id: razorpayOrder.id
    }

    await order.save()

    res.status(200).json(razorpayOrder)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Razorpay order creation failed' })
  }
}



/**
 * VERIFY PAYMENT
 * Signature + amount verification
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body

    const order = await Order.findOne({
      user: req.user._id,
      'paymentInfo.razorpay_order_id': razorpay_order_id
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' })
    }

    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    }

    await order.save()

    res.json({ success: true })
  } catch (error) {
    console.error('VERIFY ERROR 👉', error)
    res.status(500).json({ message: 'Payment verification failed' })
  }
}

