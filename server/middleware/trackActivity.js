const geoip = require('geoip-lite');
const UserActivity = require('../models/UserActivity');

const trackActivity = async (req, res, next) => {
  // Only track GET requests
  if (req.method === 'GET') {
    res.on('finish', async () => {
      try {
        // Skip basic noisy routes if you attach this globally
        if (req.originalUrl.startsWith('/api/health') || req.originalUrl.includes('socket.io')) {
          return;
        }

        let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        
        // Clean up IP
        if (ipAddress) {
          ipAddress = ipAddress.split(',')[0].trim();
        }
        if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1' || !ipAddress) {
          ipAddress = '127.0.0.1';
        }

        let location = 'Local/Unknown';
        if (ipAddress !== '127.0.0.1') {
          const geo = geoip.lookup(ipAddress);
          if (geo) {
            location = `${geo.city || 'Unknown City'}, ${geo.country || 'Unknown Country'}`;
          }
        }

        await UserActivity.create({
          user: req.user ? req.user._id : undefined,
          action: 'PAGE_VISIT',
          details: { path: req.originalUrl },
          ipAddress,
          location
        });
      } catch (err) {
        console.error('Error tracking activity in middleware:', err);
      }
    });
  }
  next();
};

module.exports = trackActivity;
