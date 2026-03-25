const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup (optional)
transporter.verify((err) => {
  if (err) console.error('SMTP connection error:', err);
  else console.log('SMTP server ready ✅');
});

module.exports = transporter;