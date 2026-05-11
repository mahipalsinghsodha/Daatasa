const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// Generate invoice for order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .populate('orderItems.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns order or is admin with order permission/superadmin
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'superadmin' || (req.user.role === 'admin' && req.user.permissions?.includes('orders'));

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!order.isPaid && order.paymentStatus !== 'COD_CONFIRMED') {
      return res.status(400).json({ message: 'Cannot generate invoice for unpaid or unconfirmed orders' });
    }

    // Invoice data
    const invoice = {
      invoiceNumber: order.invoiceNumber || `INV-${order._id.toString().slice(-8).toUpperCase()}`,
      orderId: order._id,
      date: order.createdAt,
      customer: {
        name: order.user.name,
        email: order.user.email,
        address: order.shippingAddress
      },
      items: order.orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: order.itemsPrice,
      tax: order.taxPrice,
      shipping: order.shippingPrice,
      total: order.totalPrice,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.isPaid ? 'Paid' : 'Pending',
      deliveryStatus: order.isDelivered ? 'Delivered' : 'Pending',
      paidAt: order.paidAt,
      deliveredAt: order.deliveredAt
    };

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate multiple invoices
router.post('/bulk', auth, auth.admin, auth.hasPermission('orders'), async (req, res) => {
  try {
    const { orderIds } = req.body;
    const invoices = [];

    for (const orderId of orderIds) {
      const order = await Order.findById(orderId)
        .populate('user', 'name email')
        .populate('orderItems.product');

      if (order && (order.isPaid || order.paymentStatus === 'COD_CONFIRMED')) {
        invoices.push({
          invoiceNumber: order.invoiceNumber || `INV-${order._id.toString().slice(-8).toUpperCase()}`,
          orderId: order._id,
          date: order.createdAt,
          customer: {
            name: order.user.name,
            email: order.user.email,
            address: order.shippingAddress
          },
          items: order.orderItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          })),
          subtotal: order.itemsPrice,
          tax: order.taxPrice,
          shipping: order.shippingPrice,
          total: order.totalPrice,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.isPaid ? 'Paid' : 'Pending',
          deliveryStatus: order.isDelivered ? 'Delivered' : 'Pending'
        });
      }
    }

    await logAction(req, 'GENERATE_BULK_INVOICES', 'ORDER', null, { count: orderIds.length });
    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
