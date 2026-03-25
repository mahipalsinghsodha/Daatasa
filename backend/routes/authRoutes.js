// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const auth = require('../middleware/auth');
// const dbCheck = require('../middleware/dbCheck');

// // Register
// router.post('/register', dbCheck, async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'Please provide name, email, and password' });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ message: 'Password must be at least 6 characters' });
//     }

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create user
//     const user = new User({ name, email, password });
//     await user.save();

//     // Generate token
//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
//       { expiresIn: '30d' }
//     );

//     res.status(201).json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: messages.join(', ') });
//     }
    
//     // Handle duplicate key error
//     if (error.code === 11000) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }
    
//     // Handle other errors
//     res.status(500).json({ 
//       message: error.message || 'Registration failed',
//       error: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// });

// // Login
// router.post('/login', dbCheck, async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Please provide email and password' });
//     }

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Check password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Generate token
//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
//       { expiresIn: '30d' }
//     );

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ 
//       message: error.message || 'Login failed',
//       error: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// });

// // Get current user
// router.get('/me', auth, async (req, res) => {
//   res.json({
//     id: req.user._id,
//     name: req.user.name,
//     email: req.user.email,
//     role: req.user.role,
//     address: req.user.address
//   });
// });

// module.exports = router;

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const auth    = require('../middleware/auth');
const dbCheck = require('../middleware/dbCheck');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const makeToken  = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

const safeUser = (u) => ({
  id: u._id, name: u.name, email: u.email,
  role: u.role, phone: u.phone || '',
  addresses: u.addresses || [],
});

// ── Register ──────────────────────────────────────────────────────────────────
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

// ── Login ─────────────────────────────────────────────────────────────────────
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

// ── Get current user ──────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  res.json(safeUser(req.user));
});

// ── Update profile (name, phone) ──────────────────────────────────────────────
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

// ── Add new address ───────────────────────────────────────────────────────────
router.post('/addresses', auth, async (req, res) => {
  try {
    const { label, name, phone, street, city, district, state, zipCode, country, isDefault } = req.body;
    if (!name || !phone || !street || !city || !state || !zipCode)
      return res.status(400).json({ message: 'Please fill all required address fields' });

    const user = await User.findById(req.user._id);

    // If new address should be default, un-default others
    if (isDefault) user.addresses.forEach(a => { a.isDefault = false; });

    const newAddr = { label: label || 'Home', name, phone, street, city, district: district || city, state, zipCode, country: country || 'India', isDefault: isDefault || user.addresses.length === 0 };
    user.addresses.push(newAddr);
    await user.save();
    res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add address' });
  }
});

// ── Update address ────────────────────────────────────────────────────────────
router.put('/addresses/:addrId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const fields = ['label','name','phone','street','city','district','state','zipCode','country','isDefault'];
    fields.forEach(f => { if (req.body[f] !== undefined) addr[f] = req.body[f]; });

    if (req.body.isDefault) user.addresses.forEach(a => { if (String(a._id) !== req.params.addrId) a.isDefault = false; });

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update address' });
  }
});

// ── Delete address ────────────────────────────────────────────────────────────
router.delete('/addresses/:addrId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = addr.isDefault;
    addr.deleteOne();

    // Re-assign default to last address if needed
    if (wasDefault && user.addresses.length > 0)
      user.addresses[user.addresses.length - 1].isDefault = true;

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete address' });
  }
});

// ── Set default address ───────────────────────────────────────────────────────
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

module.exports = router;

