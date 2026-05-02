

// const express = require('express');
// const router  = express.Router();
// const jwt     = require('jsonwebtoken');
// const User    = require('../models/User');
// const auth    = require('../middleware/auth');
// const dbCheck = require('../middleware/dbCheck');

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
// const makeToken  = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// const safeUser = (u) => ({
//   id: u._id, name: u.name, email: u.email,
//   role: u.role, phone: u.phone || '',
//   addresses: u.addresses || [],
// });

// // ── Register ──────────────────────────────────────────────────────────────────
// router.post('/register', dbCheck, async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password)
//       return res.status(400).json({ message: 'Please provide name, email, and password' });
//     if (password.length < 6)
//       return res.status(400).json({ message: 'Password must be at least 6 characters' });
//     if (await User.findOne({ email }))
//       return res.status(400).json({ message: 'User already exists' });

//     const user = new User({ name, email, password });
//     await user.save();
//     res.status(201).json({ token: makeToken(user._id), user: safeUser(user) });
//   } catch (error) {
//     if (error.name === 'ValidationError')
//       return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
//     if (error.code === 11000)
//       return res.status(400).json({ message: 'Email already registered' });
//     res.status(500).json({ message: error.message || 'Registration failed' });
//   }
// });

// // ── Login ─────────────────────────────────────────────────────────────────────
// router.post('/login', dbCheck, async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: 'Please provide email and password' });
//     const user = await User.findOne({ email });
//     if (!user || !(await user.comparePassword(password)))
//       return res.status(401).json({ message: 'Invalid credentials' });
//     res.json({ token: makeToken(user._id), user: safeUser(user) });
//   } catch (error) {
//     res.status(500).json({ message: error.message || 'Login failed' });
//   }
// });

// // ── Get current user ──────────────────────────────────────────────────────────
// router.get('/me', auth, async (req, res) => {
//   res.json(safeUser(req.user));
// });

// // ── Update profile (name, phone) ──────────────────────────────────────────────
// router.put('/profile', auth, async (req, res) => {
//   try {
//     const { name, phone } = req.body;
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { ...(name && { name }), ...(phone !== undefined && { phone }) },
//       { new: true, runValidators: true }
//     );
//     res.json(safeUser(user));
//   } catch (error) {
//     res.status(500).json({ message: error.message || 'Update failed' });
//   }
// });

// // ── Add new address ───────────────────────────────────────────────────────────
// router.post('/addresses', auth, async (req, res) => {
//   try {
//     const { label, name, phone, street, city, district, state, zipCode, country, isDefault } = req.body;
//     if (!name || !phone || !street || !city || !state || !zipCode)
//       return res.status(400).json({ message: 'Please fill all required address fields' });

//     const user = await User.findById(req.user._id);

//     // If new address should be default, un-default others
//     if (isDefault) user.addresses.forEach(a => { a.isDefault = false; });

//     const newAddr = { label: label || 'Home', name, phone, street, city, district: district || city, state, zipCode, country: country || 'India', isDefault: isDefault || user.addresses.length === 0 };
//     user.addresses.push(newAddr);
//     await user.save();
//     res.status(201).json({ addresses: user.addresses });
//   } catch (error) {
//     res.status(500).json({ message: error.message || 'Failed to add address' });
//   }
// });

// // ── Update address ────────────────────────────────────────────────────────────
// router.put('/addresses/:addrId', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const addr = user.addresses.id(req.params.addrId);
//     if (!addr) return res.status(404).json({ message: 'Address not found' });

//     const fields = ['label','name','phone','street','city','district','state','zipCode','country','isDefault'];
//     fields.forEach(f => { if (req.body[f] !== undefined) addr[f] = req.body[f]; });

//     if (req.body.isDefault) user.addresses.forEach(a => { if (String(a._id) !== req.params.addrId) a.isDefault = false; });

//     await user.save();
//     res.json({ addresses: user.addresses });
//   } catch (error) {
//     res.status(500).json({ message: error.message || 'Failed to update address' });
//   }
// });

// // ── Delete address ────────────────────────────────────────────────────────────
// router.delete('/addresses/:addrId', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const addr = user.addresses.id(req.params.addrId);
//     if (!addr) return res.status(404).json({ message: 'Address not found' });

//     const wasDefault = addr.isDefault;
//     addr.deleteOne();

//     // Re-assign default to last address if needed
//     if (wasDefault && user.addresses.length > 0)
//       user.addresses[user.addresses.length - 1].isDefault = true;

//     await user.save();
//     res.json({ addresses: user.addresses });
//   } catch (error) {
//     res.status(500).json({ message: error.message || 'Failed to delete address' });
//   }
// });

// // ── Set default address ───────────────────────────────────────────────────────
// router.patch('/addresses/:addrId/default', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     user.addresses.forEach(a => { a.isDefault = String(a._id) === req.params.addrId; });
//     await user.save();
//     res.json({ addresses: user.addresses });
//   } catch (error) {
//     res.status(500).json({ message: error.message || 'Failed to set default' });
//   }
// });

// module.exports = router;

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
const transporter = require('../utils/sendEmail');
const User        = require('../models/User');
const auth     = require('../middleware/auth');
const dbCheck  = require('../middleware/dbCheck');
const { logAction } = require('../utils/logger');

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
router.post('/register', dbCheck, async (req, res) => {
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
router.post('/login', dbCheck, async (req, res) => {
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

    await transporter.sendMail({
      from:    `"Ghee Store Support" <${process.env.SMTP_USER}>`,
      to:      `${user.name} <${user.email}>`,
      subject: 'Reset your Ghee Store password 🔐',
      replyTo: process.env.SMTP_USER,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family:'Segoe UI',Arial,sans-serif; background:#f2f4f6; color:#1a1a2e; }
            .wrapper { max-width:600px; margin:24px auto; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.12); }
            .header { background:linear-gradient(135deg,#1a1a2e,#2d1810); padding:40px 32px 32px; text-align:center; }
            .logo { font-size:28px; font-weight:900; color:#e8621a; }
            .logo-sub { font-size:12px; color:rgba(255,255,255,0.5); margin-top:4px; }
            .emoji { font-size:52px; margin:16px 0 8px; display:block; }
            .title { font-size:22px; font-weight:800; color:#fff; margin:0; }
            .subtitle { font-size:14px; color:rgba(255,255,255,0.6); margin-top:8px; }
            .body { background:#fff; padding:32px; }
            .para { font-size:14px; color:#555566; line-height:1.8; margin-bottom:14px; }
            .btn-wrap { text-align:center; margin:28px 0; }
            .btn { display:inline-block; padding:14px 36px; background:#e8621a; color:#fff; text-decoration:none; border-radius:10px; font-weight:700; font-size:15px; }
            .timer-box { background:#fef3c7; border:1.5px solid #fde68a; border-radius:10px; padding:14px 18px; font-size:13px; color:#92400e; margin-bottom:16px; text-align:center; font-weight:600; }
            .security-box { background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:10px; padding:14px 18px; font-size:13px; color:#166534; margin-bottom:16px; }
            .security-box ul { margin-top:6px; padding-left:16px; }
            .security-box li { margin-bottom:4px; }
            .warning { background:#fff4ee; border:1.5px solid #fddcca; border-radius:10px; padding:14px 18px; font-size:13px; color:#8899aa; margin-top:8px; }
            .footer { background:#f8f9fb; padding:20px 32px; text-align:center; border-top:1.5px solid #e4e9f0; }
            .footer-text { font-size:12px; color:#8899aa; line-height:1.6; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <div class="logo">🧈 Ghee Store</div>
              <div class="logo-sub">Pure &amp; Natural A1 Ghee</div>
              <span class="emoji">🔐</span>
              <h1 class="title">Password Reset Request</h1>
              <p class="subtitle">Requested on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</p>
            </div>
            <div class="body">
              <p class="para">Hi <strong>${user.name}</strong>,</p>
              <p class="para">We received a request to reset your Ghee Store password. Use the button below — it is only valid for <strong>2 minutes</strong> and can only be used <strong>once</strong>.</p>
              <div class="timer-box">⏱ This link expires in <strong>2 minutes</strong></div>
              <div class="btn-wrap">
                <a href="${resetUrl}" class="btn">Reset My Password →</a>
              </div>
              <div class="security-box">
                <strong>🔒 Security Notice</strong>
                <ul>
                  <li>This link works <strong>only on the device &amp; browser</strong> you used to request it</li>
                  <li>It will expire immediately once you reset your password</li>
                  <li>Copying this link to another device will not work</li>
                </ul>
              </div>
              <div class="warning">
                <strong>Didn't request this?</strong> Ignore this email — your password stays unchanged and this link will expire in 2 minutes.
              </div>
            </div>
            <div class="footer">
              <p class="footer-text">
                🧈 <strong>Ghee Store</strong> — Pure &amp; Natural A1 Ghee<br/>
                <a href="mailto:${process.env.SMTP_USER}" style="color:#e8621a;">${process.env.SMTP_USER}</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
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

// Add to authRoutes.js

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

// Also update all order routes that do .populate('user', 'name email')
// Change to: .populate('user', 'name email isBlocked')

module.exports = router;
