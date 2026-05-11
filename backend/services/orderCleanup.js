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

      const bulkOps = [];
      for (const order of expiredOrders) {
        for (const item of order.orderItems) {
          bulkOps.push({
            updateOne: {
              filter: { _id: item.product },
              update: { $inc: { stock: item.quantity } }
            }
          });
        }
      }

      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
      }

      await Order.updateMany(
        { _id: { $in: expiredOrders.map(o => o._id) } },
        { $set: { paymentStatus: 'EXPIRED' } }
      );
      console.log(`Marked ${expiredOrders.length} orders as EXPIRED and stock restored.`);

      console.log('--- ORDER CLEANUP COMPLETED ---');
    } catch (error) {
      console.error('ORDER_CLEANUP_ERROR:', error);
    }
  });
};

module.exports = startOrderCleanup;
