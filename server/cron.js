const cron = require('node-cron');
const Product = require('./models/Product');
const User = require('./models/User');
const { sendLowStockAlertEmail, sendAbandonedCartEmail } = require('./services/emailService');
const Cart = require('./models/Cart');
const Notification = require('./models/Notification');

const initCronJobs = () => {
  // Run every day at 10:00 AM (0 10 * * *)
  cron.schedule('0 10 * * *', async () => {
    console.log('[CRON] Running daily low stock check...');
    try {
      const lowStockProducts = await Product.find({ stock: { $lte: 10 }, isActive: true })
        .select('name stock category')
        .lean();

      if (lowStockProducts.length > 0) {
        console.log(`[CRON] Found ${lowStockProducts.length} low stock products.`);
        
        // Find superadmins and admins
        const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('email name');
        
        if (admins.length > 0) {
          // In a real app, you might just email the primary superadmin or all admins.
          // For now, let's email the first superadmin or admin found.
          const primaryAdmin = admins.find(a => a.role === 'superadmin') || admins[0];
          
          await sendLowStockAlertEmail({
            to: primaryAdmin.email,
            products: lowStockProducts
          });
          
          console.log(`[CRON] Low stock alert sent to ${primaryAdmin.email}`);
        } else {
          console.log('[CRON] No admins found to receive alert.');
        }
      } else {
        console.log('[CRON] Stock levels are healthy.');
      }
    } catch (error) {
      console.error('[CRON] Error running low stock check:', error);
    }
  });

  // Run every day at 12:00 PM (0 12 * * *)
  cron.schedule('0 12 * * *', async () => {
    console.log('[CRON] Running daily abandoned cart check...');
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      // Find carts updated between 48h and 24h ago that are not empty
      // We limit to 48h to avoid spamming the same users every day
      const abandonedCarts = await Cart.find({
        updatedAt: { $lte: twentyFourHoursAgo, $gt: fortyEightHoursAgo },
        'items.0': { $exists: true }
      }).populate('user', 'name email').populate('items.product', 'name price');

      if (abandonedCarts.length > 0) {
        console.log(`[CRON] Found ${abandonedCarts.length} abandoned carts.`);
        
        for (const cart of abandonedCarts) {
          if (!cart.user || !cart.user.email) continue;

          // Prepare items
          const cartItems = cart.items.map(item => ({
            name: item.product?.name || 'Product',
            quantity: item.quantity,
            price: item.product?.price || 0
          }));

          await sendAbandonedCartEmail({
            to: cart.user.email,
            userName: cart.user.name,
            cartItems
          });
        }
        console.log('[CRON] Abandoned cart emails sent.');
      } else {
        console.log('[CRON] No abandoned carts found.');
      }
    } catch (error) {
      console.error('[CRON] Error running abandoned cart check:', error);
    }
  });

  // Run every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily read-notifications cleanup...');
    try {
      const result = await Notification.deleteMany({ isRead: true });
      if (result.deletedCount > 0) {
        console.log(`[CRON] Deleted ${result.deletedCount} read notifications.`);
      } else {
        console.log('[CRON] No read notifications found to delete.');
      }
    } catch (error) {
      console.error('[CRON] Error deleting read notifications:', error);
    }
  });

  console.log('[CRON] Background jobs initialized.');
};

module.exports = initCronJobs;
