const cron = require('node-cron');
const https = require('https');
const http = require('http');
const Product = require('./models/Product');
const User = require('./models/User');
const { sendLowStockAlertEmail, sendAbandonedCartEmail } = require('./services/emailService');
const Cart = require('./models/Cart');
const Notification = require('./models/Notification');


// ─── Individual Tasks (Callable directly for tests or admin triggers) ─────────

const runLowStockCheck = async () => {
  console.log('[CRON] Running daily low stock check...');
  try {
    const lowStockProducts = await Product.find({ stock: { $lte: 10 }, isActive: true })
      .select('name stock category')
      .limit(100)
      .lean();

    if (lowStockProducts.length > 0) {
      console.log(`[CRON] Found ${lowStockProducts.length} low stock products.`);

      // Find superadmins and admins
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('email name');

      if (admins.length > 0) {
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
    console.error('[CRON] Error running low stock check:', error.message);
  }
};

const runAbandonedCartCheck = async () => {
  console.log('[CRON] Running hourly abandoned cart check...');
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find carts updated between 48h and 2h ago that are not empty and haven't had a reminder sent yet
    const abandonedCarts = await Cart.find({
      updatedAt: { $lte: twoHoursAgo, $gt: fortyEightHoursAgo },
      'items.0': { $exists: true },
      reminderSentAt: null
    }).populate('user', 'name email').populate('items.product', 'name price');

    if (abandonedCarts.length > 0) {
      console.log(`[CRON] Found ${abandonedCarts.length} abandoned carts to remind.`);

      for (const cart of abandonedCarts) {
        if (!cart.user || !cart.user.email) continue;

        const cartItems = cart.items.map(item => ({
          name: item.product?.name || 'Product',
          quantity: item.quantity,
          price: item.product?.price || 0
        }));

        try {
          await sendAbandonedCartEmail({
            to: cart.user.email,
            userName: cart.user.name,
            cartItems
          });

          try {
            const { sendAbandonedCartWhatsApp } = require('./services/whatsappService');
            await sendAbandonedCartWhatsApp(cart.user, cartItems);
          } catch (waErr) {
            console.error(`[CRON] Abandoned Cart WhatsApp error for ${cart.user.email} (non-fatal):`, waErr.message);
          }
        } catch (emailErr) {
          console.error(`[CRON] Failed to send abandoned cart email to ${cart.user.email}:`, emailErr.message);
        } finally {
          // Guarantee reminderSentAt timestamp is set to prevent spamming the customer every hour on partial failures
          try {
            cart.reminderSentAt = new Date();
            await cart.save();
          } catch (saveErr) {
            console.error(`[CRON] Error saving reminderSentAt for cart ${cart._id}:`, saveErr.message);
          }
        }
      }
      console.log('[CRON] Abandoned cart process completed.');
    } else {
      console.log('[CRON] No abandoned carts found requiring reminders.');
    }
  } catch (error) {
    console.error('[CRON] Error running abandoned cart check:', error.message);
  }
};

const runNotificationCleanup = async () => {
  console.log('[CRON] Running daily read-notifications cleanup...');
  try {
    const result = await Notification.deleteMany({ isRead: true });
    if (result.deletedCount > 0) {
      console.log(`[CRON] Deleted ${result.deletedCount} read notifications.`);
    } else {
      console.log('[CRON] No read notifications found to delete.');
    }
  } catch (error) {
    console.error('[CRON] Error deleting read notifications:', error.message);
  }
};

const initCronJobs = () => {
  // Keep-alive self-ping for Render Free Tier (runs every 5 minutes)
  const pingKeepAlive = () => {
    const backendUrl = process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || 'https://daatasa.onrender.com';
    const healthUrl = `${backendUrl.replace(/\/$/, '')}/api/health`;

    try {
      const urlObj = new URL(healthUrl);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.get(
        healthUrl,
        {
          headers: {
            'User-Agent': 'Daatasa-KeepAlive-Cron/1.0',
            'Accept': 'application/json',
          },
          timeout: 15000,
        },
        (res) => {
          if (res.statusCode === 200) {
            console.log(`[CRON] Keep-alive ping OK (200): ${healthUrl}`);
          } else {
            console.warn(`[CRON] Keep-alive ping status: ${res.statusCode} for ${healthUrl}`);
          }
          // Consume response data to free up memory/socket
          res.resume();
        }
      );

      req.on('timeout', () => {
        req.destroy();
        console.warn(`[CRON] Keep-alive ping timed out for ${healthUrl}`);
      });

      req.on('error', (err) => {
        console.error('[CRON] Keep-alive ping error:', err.message);
      });
    } catch (err) {
      console.error('[CRON] Keep-alive trigger error:', err.message);
    }
  };

  // Run keep-alive every 5 minutes
  cron.schedule('*/5 * * * *', pingKeepAlive);

  // Initial ping 10 seconds after server starts up
  setTimeout(pingKeepAlive, 10000);

  // Run every day at 10:00 AM (0 10 * * *)
  cron.schedule('0 10 * * *', runLowStockCheck);

  // Run every hour (0 * * * *)
  cron.schedule('0 * * * *', runAbandonedCartCheck);

  // Run every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', runNotificationCleanup);

  console.log('[CRON] Background jobs initialized.');
};

initCronJobs.runLowStockCheck = runLowStockCheck;
initCronJobs.runAbandonedCartCheck = runAbandonedCartCheck;
initCronJobs.runNotificationCleanup = runNotificationCleanup;

module.exports = initCronJobs;
