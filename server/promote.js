require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User');

// ── Validate email format before touching DB ──────────────────────────────────
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const ask = (q) => new Promise(res => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(q, ans => { rl.close(); res(ans.trim()); });
});

const promoteUser = async (email) => {
  if (!isValidEmail(email)) {
    console.error('❌  Invalid email format. Usage: node promote.js <email>');
    process.exit(1);
  }

  const answer = await ask(
    `⚠️  You are about to promote "${email}" to SUPERADMIN.\nType CONFIRM to proceed: `
  );
  if (answer !== 'CONFIRM') {
    console.log('Aborted.');
    process.exit(0);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  Connected to MongoDB.');

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.error(`❌  User with email "${email}" not found.`);
      process.exit(1);
    }

    user.role = 'superadmin';
    user.permissions = ['products', 'categories', 'orders', 'users', 'coupons', 'support', 'dashboard'];
    await user.save();

    console.log(`✅  Successfully promoted ${user.name} (${email}) to Super Admin.`);
    process.exit(0);
  } catch (error) {
    console.error('❌  Promotion error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Usage: node promote.js <email>');
  process.exit(1);
}

promoteUser(email);

