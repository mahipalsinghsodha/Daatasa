const cron = require('node-cron');
const Order = require('../models/Order');
const Product = require('../models/Product');

const startOrderCleanup = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('--- STARTING ORDER CLEANUP ---');
    try {
      const expirationTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

      const expiredOrders = await Order.find({
        paymentStatus: 'PENDING',
        createdAt: { $lt: expirationTime }
      });

      if (expiredOrders.length === 0) {
        console.log('No expired orders found.');
        return;
      }

      console.log(`Found ${expiredOrders.length} expired orders. Restoring stock...`);

      for (const order of expiredOrders) {
        // Restore stock
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }

        // Mark as EXPIRED instead of deleting to keep record
        order.paymentStatus = 'EXPIRED';
        await order.save();
        console.log(`Order ${order._id} marked as EXPIRED and stock restored.`);
      }

      console.log('--- ORDER CLEANUP COMPLETED ---');
    } catch (error) {
      console.error('ORDER_CLEANUP_ERROR:', error);
    }
  });
};

module.exports = startOrderCleanup;
