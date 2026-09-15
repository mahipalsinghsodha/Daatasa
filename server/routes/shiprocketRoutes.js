const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const shiprocketService = require('../services/shiprocketService');
const { getIO } = require('../socket');
const { logAction } = require('../utils/logger');
const { sendShippingUpdateEmail } = require('../services/emailService');
const { sendShippingUpdateWhatsApp } = require('../services/whatsappService');

/**
 * Calculate dynamic order weight (in KG) from order items
 */
function calculateOrderWeight(orderItems) {
  let totalKg = 0;
  for (const item of orderItems || []) {
    const qty = Number(item.quantity) || 1;
    let itemKg = 0.9; // Standard 0.9kg default per dairy bottle if weight not specified
    if (item.weight) {
      const wStr = String(item.weight).toLowerCase().trim();
      const num = parseFloat(wStr) || 1;
      if (wStr.includes('kg') || wStr.includes('l') || wStr.includes('ltr') || wStr.includes('liter') || wStr.includes('litre')) {
        itemKg = num;
      } else if (wStr.includes('g') || wStr.includes('gm') || wStr.includes('ml')) {
        itemKg = num / 1000;
      } else {
        itemKg = num;
      }
    }
    totalKg += itemKg * qty;
  }
  return Math.max(0.5, Math.round(totalKg * 100) / 100);
}

/**
 * Helper to build Shiprocket order payload with real customer & order data
 */
function buildShiprocketPayload(order) {
  const addr = order.shippingAddress || {};

  // Validate customer shipping address
  if (!addr.street || String(addr.street).trim().length < 3) {
    throw new Error('Customer street address is required and must be at least 3 characters.');
  }
  if (!addr.city || !String(addr.city).trim()) {
    throw new Error('Customer shipping city is required.');
  }
  if (!addr.zipCode || !String(addr.zipCode).trim()) {
    throw new Error('Customer postal pincode is required.');
  }
  if (!addr.state || !String(addr.state).trim()) {
    throw new Error('Customer shipping state is required.');
  }

  // Name splitting
  const rawName = (addr.name || order.user?.name || "Customer").trim();
  const nameParts = rawName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";

  // Phone number sanitization (keep 10 digits)
  let cleanPhone = String(addr.phone || "").replace(/\D/g, '');
  if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
    cleanPhone = cleanPhone.slice(2);
  }
  if (cleanPhone.length < 10) {
    cleanPhone = String(order.user?.phone || "").replace(/\D/g, '');
    if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) cleanPhone = cleanPhone.slice(2);
  }
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error('A valid 10-digit customer contact phone number is required for shipping.');
  }

  // Email
  const customerEmail = order.guestEmail || (order.user && order.user.email) || process.env.CONTACT_RECEIVER || "customer@daatasaghee.com";

  // Items
  const items = (order.orderItems || []).map((item, idx) => ({
    name: item.name || `Product Item ${idx + 1}`,
    sku: item.product?._id ? item.product._id.toString().slice(-8) : (item.product ? item.product.toString().slice(-8) : (item._id ? item._id.toString().slice(-8) : `SKU-${idx + 1}`)),
    units: Math.max(1, Number(item.quantity) || 1),
    selling_price: Math.max(0, Number(item.price) || 0),
    discount: 0,
    tax: 0,
    hsn: 441122
  }));

  if (items.length === 0) {
    throw new Error('Order must contain at least one product item to ship.');
  }

  // Calculate box dimensions based on total quantity
  const totalItemsCount = items.reduce((acc, it) => acc + it.units, 0);
  const calculatedWeight = calculateOrderWeight(order.orderItems);
  const boxLength = Math.min(50, 12 + Math.max(0, totalItemsCount - 1) * 3);
  const boxBreadth = Math.min(50, 12 + Math.max(0, totalItemsCount - 1) * 2);
  const boxHeight = 15;

  const totalDiscount = Math.round(((order.discount || 0) + (order.walletUsed || 0) + (order.giftCard?.amountUsed || 0)) * 100) / 100;
  const subTotal = Number(order.itemsPrice) || items.reduce((acc, it) => acc + (it.selling_price * it.units), 0);

  return {
    order_id: order.orderIdString || order._id.toString(),
    order_date: new Date(order.createdAt || Date.now()).toISOString().split('T')[0],
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Home",
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: addr.street.trim(),
    billing_address_2: (addr.district || "").trim(),
    billing_city: addr.city.trim(),
    billing_pincode: String(addr.zipCode).trim(),
    billing_state: addr.state.trim(),
    billing_country: (addr.country || "India").trim(),
    billing_email: customerEmail,
    billing_phone: cleanPhone,
    shipping_is_billing: true,
    order_items: items,
    payment_method: ['COD', 'cod'].includes(order.paymentMethod) ? 'COD' : 'Prepaid',
    shipping_charges: Number(order.shippingPrice) || 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: totalDiscount,
    sub_total: subTotal,
    length: boxLength,
    breadth: boxBreadth,
    height: boxHeight,
    weight: calculatedWeight
  };
}

/**
 * POST /api/shiprocket/ship/:orderId
 * 🚀 1-CLICK ALL-IN-ONE DISPATCH WITH SHIPROCKET
 * Creates Order in Shiprocket + Generates AWB (Delhivery/BlueDart/etc) + Marks Shipped
 */
router.post('/ship/:orderId', auth, auth.admin, auth.hasPermission('orders'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.isDelivered) return res.status(400).json({ message: 'Cannot ship a delivered order' });
    if (['CANCELLED', 'FAILED'].includes(order.paymentStatus)) {
      return res.status(400).json({ message: 'Cannot ship a cancelled order' });
    }

    // 1️⃣ Push to Shiprocket if not already pushed
    if (!order.shiprocketOrderId || !order.shiprocketShipmentId) {
      const orderPayload = buildShiprocketPayload(order);
      const pushRes = await shiprocketService.createOrder(orderPayload);
      order.shiprocketOrderId = pushRes.order_id;
      order.shiprocketShipmentId = pushRes.shipment_id;
      await order.save();
    }

    // 2️⃣ Generate AWB / Assign Courier (e.g. Delhivery, BlueDart)
    if (!order.awbCode) {
      const awbRes = await shiprocketService.generateAWB(order.shiprocketShipmentId);
      const awbData = awbRes.response?.data || awbRes;
      order.awbCode = awbData.awb_code || `SR${Date.now()}`;
      order.shippingProvider = awbData.courier_name || 'Shiprocket Express';
      order.trackingNumber = order.awbCode;
    }

    // 3️⃣ Update Order status to SHIPPED
    order.orderStatus = 'SHIPPED';
    order.statusHistory.push({
      status: 'SHIPPED',
      note: `Shipped via ${order.shippingProvider} (AWB: ${order.awbCode})`,
      updatedBy: req.user._id,
      updatedAt: new Date()
    });

    await order.save();

    // 4️⃣ Log Action
    await logAction(req, 'SHIPROCKET_SHIP', 'ORDER', order._id, {
      awbCode: order.awbCode,
      courier: order.shippingProvider,
      shiprocketOrderId: order.shiprocketOrderId
    });

    // 5️⃣ Real-time socket notification & Customer alerts
    try {
      const io = getIO();
      io.to(`order:${order._id}`).emit('orderStatusUpdated', order);

      if (order.user) {
        const Notification = require('../models/Notification');
        const notif = new Notification({
          user: order.user._id || order.user,
          type: 'ORDER_SHIPPED',
          title: 'Order Dispatched 🚚',
          message: `Your order has been shipped via ${order.shippingProvider}. Tracking AWB: ${order.awbCode}`,
          link: `/orders/${order._id}`
        });
        await notif.save();
        io.to(`user:${notif.user}`).emit('notification', notif);
      }
    } catch (err) {}

    // Send WhatsApp & Email
    try {
      if (order.user?.email || order.guestEmail) {
        sendShippingUpdateEmail({
          to: order.user?.email || order.guestEmail,
          userName: order.user?.name || order.shippingAddress?.name || 'Customer',
          orderId: order._id.toString(),
          trackingNumber: order.awbCode,
          shippingProvider: order.shippingProvider
        }).catch(() => {});
      }
      sendShippingUpdateWhatsApp(order).catch(() => {});
    } catch (notifyErr) {}

    res.json({
      success: true,
      message: `Order successfully shipped via ${order.shippingProvider}!`,
      awbCode: order.awbCode,
      courier: order.shippingProvider,
      order
    });

  } catch (error) {
    console.error('Shiprocket 1-Click Ship Error:', error);
    res.status(400).json({ message: error.message || 'Failed to dispatch via Shiprocket' });
  }
});

/**
 * GET /api/shiprocket/label/:orderId
 * Fetch Shiprocket Label PDF URL
 */
router.get('/label/:orderId', auth, auth.admin, auth.hasPermission('orders'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.shiprocketShipmentId) {
      return res.status(400).json({ message: 'Shipment has not been generated for this order yet' });
    }

    const labelRes = await shiprocketService.generateLabel(order.shiprocketShipmentId);
    res.json(labelRes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/shiprocket/track/:orderId
 * Real-time Shiprocket Tracking data
 */
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.awbCode) {
      return res.status(400).json({ message: 'No AWB assigned to this order yet' });
    }

    const trackRes = await shiprocketService.trackShipment(order.awbCode);
    res.json(trackRes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/shiprocket/webhook
 * Receive live automated tracking events from Shiprocket
 */
router.post('/webhook', async (req, res) => {
  try {
    const { awb, current_status } = req.body;
    
    if (!awb || !current_status) {
      return res.status(400).send('Invalid payload');
    }

    const order = await Order.findOne({ $or: [{ awbCode: awb }, { trackingNumber: awb }] });
    if (!order) return res.status(404).send('Order not found');

    const statusUpper = (current_status || '').toUpperCase();
    let newStatus = null;

    if (statusUpper.includes('PICKED UP') || statusUpper.includes('IN TRANSIT') || statusUpper.includes('SHIPPED')) {
      newStatus = 'SHIPPED';
    } else if (statusUpper.includes('OUT FOR DELIVERY')) {
      newStatus = 'OUT_FOR_DELIVERY';
    } else if (statusUpper.includes('DELIVERED')) {
      newStatus = 'DELIVERED';
    } else if (statusUpper.includes('RTO') || statusUpper.includes('RETURN')) {
      newStatus = 'RETURNED';
    } else if (statusUpper.includes('CANCEL')) {
      newStatus = 'CANCELLED';
    }

    if (newStatus && order.orderStatus !== newStatus) {
      order.orderStatus = newStatus;
      order.statusHistory.push({
        status: newStatus,
        note: `Shiprocket Tracking Update: ${current_status}`,
        updatedAt: new Date()
      });

      if (newStatus === 'DELIVERED') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
        order.isPaid = true;
        order.paymentStatus = 'PAID';

        // Award Reward Points upon successful delivery
        if (order.user && !order.rewardPointsAwarded) {
          try {
            const User = require('../models/User');
            const WalletTransaction = require('../models/WalletTransaction');
            const Notification = require('../models/Notification');
            const user = await User.findById(order.user._id || order.user);
            if (user) {
              const points = Math.floor((order.totalPrice || 0) / 10);
              user.rewardPoints = (user.rewardPoints || 0) + points;

              // Referral Bonus check
              if (user.referredBy && !user.referralRewardClaimed) {
                const referrer = await User.findById(user.referredBy);
                if (referrer) {
                  user.walletBalance = (user.walletBalance || 0) + 50;
                  referrer.walletBalance = (referrer.walletBalance || 0) + 50;
                  user.referralRewardClaimed = true;
                  await referrer.save();

                  await WalletTransaction.create([
                    {
                      user: user._id,
                      type: 'CREDIT',
                      amount: 50,
                      balanceAfter: user.walletBalance,
                      description: 'Referral bonus (first order delivered)',
                      transactionType: 'REWARD_CONVERSION'
                    },
                    {
                      user: referrer._id,
                      type: 'CREDIT',
                      amount: 50,
                      balanceAfter: referrer.walletBalance,
                      description: `Referral bonus for inviting ${user.name} (first order delivered)`,
                      transactionType: 'REWARD_CONVERSION'
                    }
                  ]);

                  try {
                    const notifReferrer = new Notification({
                      user: referrer._id,
                      type: 'SYSTEM',
                      title: 'Referral Bonus Earned! 🎉',
                      message: `You earned ₹50 in your wallet because ${user.name} completed their first order!`,
                      link: '/profile'
                    });
                    await notifReferrer.save();
                  } catch (e) {}
                }
              }

              await user.save();
              order.rewardPointsAwarded = true;

              if (points > 0) {
                const notif = new Notification({
                  user: user._id,
                  type: 'SYSTEM',
                  title: 'Reward Points Earned! 🎁',
                  message: `You earned ${points} reward points for your delivered order #${order.orderIdString || order._id.toString().slice(-8)}. Convert them into wallet cash anytime!`,
                  link: '/profile'
                });
                await notif.save();
              }
            }
          } catch (rewardErr) {
            console.error('Shiprocket reward points error:', rewardErr);
          }
        }

        // Auto send invoice email
        try {
          const { sendInvoiceEmail } = require('../services/emailService');
          const populated = await order.populate('user', 'name email');
          const userEmail = populated.user ? populated.user.email : populated.guestEmail;
          if (userEmail) {
            await sendInvoiceEmail(populated, userEmail);
          }
        } catch (mailErr) {}
      }

      await order.save();

      // Real-time socket & notifications
      try {
        const io = getIO();
        io.to(`order:${order._id}`).emit('orderStatusUpdated', order);

        if (order.user) {
          const Notification = require('../models/Notification');
          const notifTitle = newStatus === 'OUT_FOR_DELIVERY'
            ? 'Out for Delivery 🛵'
            : newStatus === 'DELIVERED'
              ? 'Order Delivered 🎉'
              : 'Shipment Update 📦';
          const notifMsg = newStatus === 'OUT_FOR_DELIVERY'
            ? `Your package is out for delivery with ${order.shippingProvider || 'courier'}.`
            : newStatus === 'DELIVERED'
              ? 'Your order has been delivered successfully. Thank you for shopping with Daatasa!'
              : `Your shipment status is now: ${current_status}`;

          const notif = new Notification({
            user: order.user._id || order.user,
            type: newStatus === 'DELIVERED' ? 'ORDER_DELIVERED' : 'ORDER_SHIPPED',
            title: notifTitle,
            message: notifMsg,
            link: `/orders/${order._id}`
          });
          await notif.save();
          io.to(`user:${notif.user}`).emit('notification', notif);
        }
      } catch (sockErr) {}

      // Send WhatsApp alert
      try {
        if (newStatus === 'SHIPPED' || newStatus === 'OUT_FOR_DELIVERY') {
          await order.populate('user', 'name email');
          sendShippingUpdateWhatsApp(order).catch(() => {});
        }
      } catch (waErr) {}
    }

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Shiprocket Webhook Error:', error);
    res.status(500).send('Internal Error');
  }
});

module.exports = router;
