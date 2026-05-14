const mongoose = require('mongoose');

/**
 * Platform-wide settings stored in a single document.
 * Key fields the admin can configure:
 *   - gstRate      : GST percentage applied to all orders (e.g. 5 for 5%)
 *   - freeShippingThreshold : Cart subtotal above which shipping is free
 *   - shippingCharge        : Fixed shipping fee when below threshold
 */
const settingsSchema = new mongoose.Schema(
  {
    // Use a fixed identifier so there is always exactly ONE settings doc
    _id: { type: String, default: 'global' },

    // ── GST ──────────────────────────────────────────────────────────────
    gstRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 5,          // 5% — typical for packaged food in India
    },
    gstEnabled: {
      type: Boolean,
      default: true,
    },

    // ── Shipping ─────────────────────────────────────────────────────────
    freeShippingThreshold: {
      type: Number,
      default: 500,        // free shipping on orders > ₹500
    },
    shippingCharge: {
      type: Number,
      default: 50,
    },

    // ── Meta ─────────────────────────────────────────────────────────────
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    // We use a custom string _id so disable the default ObjectId cast
    _id: false,
    id: false,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

// ── Helper: get-or-create the single settings document ──────────────────
Settings.getGlobal = async () => {
  let settings = await Settings.findById('global');
  if (!settings) {
    settings = await Settings.create({ _id: 'global' });
  }
  return settings;
};

module.exports = Settings;
