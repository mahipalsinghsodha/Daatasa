const cron = require('node-cron');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const startOrderCleanup = () => {
  // Run every 15 minutes — find PENDING orders older than 72 hours
  cron.schedule('*/15 * * * *', async () => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) console.log('[OrderCleanup] Running cleanup check...');

    try {
      const expirationTime = new Date(Date.now() - 72 * 60 * 60 * 1000); // 72 hours (3 days)

      const expiredOrders = await Order.find({
        paymentStatus: 'PENDING',
        createdAt: { $lt: expirationTime }
      })
        .populate('user', 'name email')
        .limit(100);

      if (expiredOrders.length === 0) {
        if (isDev) console.log('[OrderCleanup] No expired orders found.');
        return;
      }

      if (isDev) console.log(`[OrderCleanup] Expiring ${expiredOrders.length} orders...`);

      // ── 1. Bulk-restore stock ─────────────────────────────────────────────
      const bulkOps = [];
      for (const order of expiredOrders) {
        for (const item of order.orderItems) {
          const qtyToRestore = item.quantity || item.qty || 0;
          if (qtyToRestore > 0) {
            bulkOps.push({
              updateOne: {
                filter: { _id: item.product },
                update: { $inc: { stock: qtyToRestore } }
              }
            });
          }
        }
      }
      if (bulkOps.length > 0) await Product.bulkWrite(bulkOps);

      // ── 2. Mark orders EXPIRED ────────────────────────────────────────────
      await Order.updateMany(
        { _id: { $in: expiredOrders.map(o => o._id) } },
        { $set: { paymentStatus: 'EXPIRED' } }
      );

      // ── 3. Send expiry notification emails (non-fatal) ────────────────────
      try {
        const { sendOrderCancelledEmail } = require('../services/emailService');
        const emailPromises = expiredOrders
          .filter(order => order.user?.email)
          .map(order =>
            sendOrderCancelledEmail({
              to: order.user.email,
              userName: order.user.name,
              orderId: order._id.toString(),
              totalPrice: order.totalPrice,
              reason: 'Your order was automatically cancelled because payment was not completed within 72 hours. If any amount was debited, it will be refunded within 5-7 business days.'
            }).catch(err =>
              console.error(`[OrderCleanup] Email failed for order ${order._id}:`, err.message)
            )
          );
        await Promise.allSettled(emailPromises);
      } catch (emailErr) {
        console.error('[OrderCleanup] Email service error (non-fatal):', emailErr.message);
      }

      if (isDev) console.log(`[OrderCleanup] ✅ ${expiredOrders.length} orders expired. Stock restored.`);

    } catch (error) {
      console.error('[OrderCleanup] ERROR:', error);
    }
  });
};

module.exports = startOrderCleanup;
