const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' }, // Home, Work, Other
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
}, { _id: true, timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: String,
  addresses: [addressSchema],
  // keep legacy single address for backward compat
  address: {
    street: String, city: String, state: String, zipCode: String, country: String
  },
}, { timestamps: true });

// Ensure only one default address
userSchema.pre('save', function (next) {
  const defaults = this.addresses.filter(a => a.isDefault);
  if (defaults.length === 0 && this.addresses.length > 0) {
    // Auto-set last address as default
    this.addresses[this.addresses.length - 1].isDefault = true;
  } else if (defaults.length > 1) {
    // Keep only the last-set default
    let found = false;
    for (let i = this.addresses.length - 1; i >= 0; i--) {
      if (this.addresses[i].isDefault) {
        if (found) this.addresses[i].isDefault = false;
        else found = true;
      }
    }
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) { next(error); }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual: default address
userSchema.virtual('defaultAddress').get(function () {
  return this.addresses.find(a => a.isDefault) || this.addresses[this.addresses.length - 1] || null;
});

const User = mongoose.model('User', userSchema);
module.exports = User;
