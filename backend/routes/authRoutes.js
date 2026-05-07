
// routes/auth.js
// Security features on reset link:
//   ✅ Expires in 2 minutes
//   ✅ One-time use — invalidated the moment password is changed
//   ✅ Device-locked — IP + User-Agent fingerprint is stored and verified
//      so copying the link to another browser/device/network returns 403

const express     = require('express');
const router      = express.Router();
const jwt         = require('jsonwebtoken');
const crypto      = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');
const User        = require('../models/User');
const auth     = require('../middleware/auth');
const dbCheck  = require('../middleware/dbCheck');
const { logAction } = require('../utils/logger');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many attempts from this IP, please try again after 15 minutes'
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const makeToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

const safeUser = (u) => ({
  id:        u._id,
  name:      u.name,
  email:     u.email,
  role:      u.role,
  permissions: u.permissions || [],
  phone:     u.phone || '',
  addresses: u.addresses || [],
});

/* ── Device fingerprint helper ──────────────────────────────────────────────
   We hash IP + User-Agent so the stored value is not sensitive in itself.
   The same hash must be reproduced on the reset request to pass validation.
   ─────────────────────────────────────────────────────────────────────────── */
const makeFingerprint = (req) => {
  const ip  = req.ip || req.connection?.remoteAddress || 'unknown';
  const ua  = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}::${ua}`).digest('hex');
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  REGISTER                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
router.post('/register', authLimiter, dbCheck, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ token: makeToken(user._id), user: safeUser(user) });
  } catch (error) {
    if (error.name === 'ValidationError')
      return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
    if (error.code === 11000)
      return res.status(400).json({ message: 'Email already registered' });
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  LOGIN                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
router.post('/login', authLimiter, dbCheck, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: makeToken(user._id), user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  GET CURRENT USER                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
router.get('/me', auth, (req, res) => res.json(safeUser(req.user)));

/* ─────────────────────────────────────────────────────────────────────────── */
/*  UPDATE PROFILE                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(phone !== undefined && { phone }) },
      { new: true, runValidators: true }
    );
    res.json(safeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Update failed' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FORGOT PASSWORD  →  POST /api/auth/forgot-password                        */
/*                                                                             */
/*  New security checks:                                                       */
/*   • 404 if email not registered (frontend redirects to /register)           */
/*   • 409 if a valid link is already active — returns remainingSeconds        */
/*     so the frontend can show a countdown before allowing resend             */
/* ─────────────────────────────────────────────────────────────────────────── */
router.post('/forgot-password', dbCheck, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: 'Please provide your email address' });

    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire +resetPasswordFingerprint');

    // ── 404: email not registered ──────────────────────────────────────────
    if (!user)
      return res.status(404).json({ message: 'No account found with that email address.' });

    // ── 409: a valid (non-expired) link already exists ─────────────────────
    //    Prevents spamming and multiple active links for the same account.
    if (user.resetPasswordToken && user.resetPasswordExpire && user.resetPasswordExpire > Date.now()) {
      const remainingMs      = user.resetPasswordExpire - Date.now();
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return res.status(409).json({
        message:          'A reset link was already sent and is still active. Please check your inbox.',
        remainingSeconds,
      });
    }

    // Generate cryptographically secure token
    const resetToken        = crypto.randomBytes(32).toString('hex');
    const tokenHashed       = crypto.createHash('sha256').update(resetToken).digest('hex');
    const deviceFingerprint = makeFingerprint(req);

    user.resetPasswordToken       = tokenHashed;
    user.resetPasswordExpire      = Date.now() + 2 * 60 * 1000; // 2 minutes
    user.resetPasswordFingerprint = deviceFingerprint;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      userName: user.name,
      resetUrl,
    });

    res.json({ message: 'Reset link sent successfully.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  RESET PASSWORD  →  POST /api/auth/reset-password/:token                   */
/*                                                                             */
/*  Security checks (in order):                                               */
/*   1. Token hash must match                                                  */
/*   2. Token must not be expired (2-min window)                              */
/*   3. Device fingerprint (IP + UA) must match                               */
/*   4. New password must NOT be the same as the current password             */
/*   5. Token cleared immediately — cannot be replayed                        */
/* ─────────────────────────────────────────────────────────────────────────── */
router.post('/reset-password/:token', dbCheck, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // 1. Hash incoming raw token
    const tokenHashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // 2. Find user with matching non-expired token (also select password for same-password check)
    const user = await User.findOne({
      resetPasswordToken:  tokenHashed,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire +resetPasswordFingerprint +password');

    if (!user)
      return res.status(400).json({
        message: 'This reset link has expired or already been used. Please request a new one.',
      });

    // 3. Verify device fingerprint
    const incomingFingerprint = makeFingerprint(req);
    if (user.resetPasswordFingerprint && user.resetPasswordFingerprint !== incomingFingerprint) {
      user.resetPasswordToken       = undefined;
      user.resetPasswordExpire      = undefined;
      user.resetPasswordFingerprint = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(403).json({
        message: 'This link can only be used on the device and browser where the reset was requested. Please request a new reset link.',
      });
    }

    // 4. ── New password must differ from current password ──────────────────
    const bcrypt = require('bcryptjs');
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword)
      return res.status(400).json({
        message: 'Your new password cannot be the same as your current password.',
      });

    // 5. Set new password and clear all reset fields (one-time use)
    user.password                 = password;
    user.resetPasswordToken       = undefined;
    user.resetPasswordExpire      = undefined;
    user.resetPasswordFingerprint = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Password reset failed' });
  }
});


/* ─────────────────────────────────────────────────────────────────────────── */
/*  ADDRESS ROUTES                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
router.post('/addresses', auth, async (req, res) => {
  try {
    const { label, name, phone, street, city, district, state, zipCode, country, isDefault } = req.body;
    if (!name || !phone || !street || !city || !state || !zipCode)
      return res.status(400).json({ message: 'Please fill all required address fields' });

    const user = await User.findById(req.user._id);
    if (isDefault) user.addresses.forEach(a => { a.isDefault = false; });
    user.addresses.push({
      label: label || 'Home', name, phone, street, city,
      district: district || city, state, zipCode,
      country: country || 'India',
      isDefault: isDefault || user.addresses.length === 0,
    });
    await user.save();
    res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add address' });
  }
});

router.put('/addresses/:addrId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const fields = ['label','name','phone','street','city','district','state','zipCode','country','isDefault'];
    fields.forEach(f => { if (req.body[f] !== undefined) addr[f] = req.body[f]; });
    if (req.body.isDefault)
      user.addresses.forEach(a => { if (String(a._id) !== req.params.addrId) a.isDefault = false; });

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update address' });
  }
});

router.delete('/addresses/:addrId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = addr.isDefault;
    addr.deleteOne();
    if (wasDefault && user.addresses.length > 0)
      user.addresses[user.addresses.length - 1].isDefault = true;

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete address' });
  }
});

router.patch('/addresses/:addrId/default', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.forEach(a => { a.isDefault = String(a._id) === req.params.addrId; });
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to set default' });
  }
});

// Admin: Get all users with total orders and spent amount
router.get('/users', auth, auth.admin, auth.hasPermission('users'), async (req, res) => {
  try {

    const User = require('../models/User');
    const Order = require('../models/Order');

    // 1. Fetch all users
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire -resetPasswordFingerprint').lean();

    // 2. Fetch all orders and aggregate by user
    const orders = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" }
        }
      }
    ]);

    // 3. Map aggregates back to users map
    const orderStatsMap = {};
    orders.forEach(stat => {
      if (stat._id) {
        orderStatsMap[stat._id.toString()] = {
          totalOrders: stat.totalOrders,
          totalSpent: stat.totalSpent
        };
      }
    });

    const enrichedUsers = users.map(u => ({
      ...u,
      totalOrders: orderStatsMap[u._id.toString()]?.totalOrders || 0,
      totalSpent: orderStatsMap[u._id.toString()]?.totalSpent || 0
    }));

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: block or unblock a user (toggles)
router.put('/users/:id/block', auth, auth.admin, auth.hasPermission('users'), async (req, res) => {
  try {
    const { reason } = req.body;
    const User = require('../models/User');
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    target.isBlocked = !target.isBlocked;
    await target.save();

    await logAction(req, target.isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER', 'USER', target._id, {
      reason,
      userName: target.name,
      userEmail: target.email
    });

    // Send email notification to user
    try {
      const { sendBlockEmail } = require('../services/emailService');
      await sendBlockEmail({
        to:        target.email,
        userName:  target.name,
        isBlocked: target.isBlocked,
        reason,
      });
    } catch (e) { console.error('Block email error (non-fatal):', e); }

    res.json({
      message:   `User ${target.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: target.isBlocked,
      userId:    target._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
