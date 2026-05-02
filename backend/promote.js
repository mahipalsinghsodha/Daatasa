require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const promoteUser = async (email) => {
  try {
    // Look for .env in current directory or parent
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = 'superadmin';
    const allPermissions = ['products', 'categories', 'orders', 'users', 'coupons', 'support', 'dashboard'];
    user.permissions = allPermissions;

    await user.save();
    console.log(`Successfully promoted ${user.name} (${email}) to Super Admin.`);
    process.exit(0);
  } catch (error) {
    console.error('Promotion error:', error);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Usage: node promote.js <email>');
  process.exit(1);
}

promoteUser(email);
