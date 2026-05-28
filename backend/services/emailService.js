const transporter = require('../config/nodemailer');

// ── Unified Email Template System ─────────────────────────────────────────────
const brand = '#e8621a';
const darkBg = '#1a1a2e';
const CLIENT_URL = () => process.env.CLIENT_URL || 'http://localhost:3000';
const FROM = () => `"DhaniFresh" <${process.env.SMTP_USER}>`;

const sendWithRetry = async (mailOptions, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`Email send failed (attempt ${i + 1}/${retries}):`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Simple backoff
    }
  }
};

const wrap = (body) => `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2f4f6;font-family:'Segoe UI',Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px 16px">
<div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07)">
<div style="background:${darkBg};padding:24px 28px;text-align:center">
  <div style="font-size:24px;font-weight:800;color:${brand}">🧈 DhaniFresh</div>
  <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px">Pure & Natural Ghee</div>
</div>
${body}
<div style="padding:16px 28px;border-top:1px solid #e4e9f0;text-align:center;font-size:12px;color:#8899aa">
  © ${new Date().getFullYear()} DhaniFresh · All rights reserved
</div>
</div></div></body></html>`;

const btn = (text, url, bg = brand) =>
  `<div style="text-align:center;margin:24px 0"><a href="${url}" style="display:inline-block;padding:14px 32px;background:${bg};color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.1)">${text}</a></div>`;

const box = (content, bg = '#f8fafc', border = '#e4e9f0') =>
  `<div style="background:${bg};border:1.5px solid ${border};border-radius:12px;padding:16px;margin-bottom:18px">${content}</div>`;

const row = (label, value, vc = darkBg) =>
  `<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:13px;color:#8899aa">${label}</span><span style="font-size:13px;font-weight:700;color:${vc}">${value}</span></div>`;

// ── 1. ORDER CONFIRMED ────────────────────────────────────────────────────────
const sendOrderSuccessEmail = async ({ to, userName, orderId, totalPrice, items, paymentMethod, invoiceNumber }) => {
  const sid = orderId.slice(-8).toUpperCase();
  const itemsHtml = items.map(i => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9">
      <div style="font-size:13px;color:${darkBg}"><strong>${i.name}</strong> <span style="color:#8899aa">×${i.quantity}</span></div>
      <div style="font-size:13px;font-weight:700;color:${darkBg}">₹${(i.price * i.quantity).toFixed(2)}</div>
    </div>`).join('');

  const body = `<div style="padding:28px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:50px;height:50px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><span style="font-size:24px">🎉</span></div>
      <h2 style="margin:0;font-size:22px;font-weight:800;color:${darkBg}">Order Confirmed!</h2>
      <p style="margin:4px 0 0;font-size:14px;color:#8899aa">Order #${sid}</p>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#444455">Hi ${userName},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#444455;line-height:1.6">Thank you for your order! We've received your request and are getting it ready for shipment.</p>
    ${box(`<h3 style="margin:0 0 12px;font-size:12px;font-weight:800;color:#8899aa;text-transform:uppercase;letter-spacing:0.05em">Order Details</h3>
      ${itemsHtml}
      <div style="margin-top:12px;padding-top:12px;border-top:2px solid #e4e9f0">
        ${row('Payment Method', paymentMethod)}
        <div style="display:flex;justify-content:space-between"><span style="font-size:15px;font-weight:800;color:${darkBg}">Total</span><span style="font-size:15px;font-weight:900;color:${brand}">₹${Number(totalPrice).toFixed(2)}</span></div>
      </div>`)}
    ${btn('Track My Order →', `${CLIENT_URL()}/orders`)}
  </div>`;

  const invoiceHtmlContent = `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;padding:20px;">
      <h2>Invoice: ${invoiceNumber || sid}</h2>
      <p>Customer: ${userName}</p>
      <p>Payment Method: ${paymentMethod}</p>
      <hr/>
      ${itemsHtml}
      <hr/>
      <h3>Total: ₹${Number(totalPrice).toFixed(2)}</h3>
    </body></html>
  `;

  await sendWithRetry({ 
    from: FROM(), 
    to, 
    subject: `Order Confirmed: #${sid} | DhaniFresh`, 
    html: wrap(body),
    attachments: [
      {
        filename: `invoice_${invoiceNumber || sid}.html`,
        content: invoiceHtmlContent,
        contentType: 'text/html'
      }
    ]
  });
};

// ── 2. PAYMENT FAILED ─────────────────────────────────────────────────────────
const sendOrderFailureEmail = async ({ to, userName, orderId, totalPrice, reason }) => {
  const sid = orderId.slice(-8).toUpperCase();
  const body = `<div style="padding:28px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:50px;height:50px;background:#fee2e2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><span style="font-size:24px">⚠️</span></div>
      <h2 style="margin:0;font-size:20px;font-weight:800;color:${darkBg}">Payment Failed</h2>
      <p style="margin:4px 0 0;font-size:14px;color:#8899aa">Order #${sid}</p>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#444455">Hi ${userName},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#444455;line-height:1.6">We're sorry, but your payment for order <strong>#${sid}</strong> was not successful. Your order has been cancelled and reserved items returned to stock.</p>
    ${box(`<div style="font-size:13px;color:${brand};font-weight:700;margin-bottom:4px">Reason:</div><div style="font-size:13px;color:${brand}">${reason || 'Payment was cancelled or failed at the bank.'}</div>`, '#fff4ee', '#fddcca')}
    <p style="font-size:13px;color:#8899aa;margin-bottom:24px">If funds were deducted, they will be refunded within 5-7 business days.</p>
    ${btn('Return to Cart', `${CLIENT_URL()}/cart`, darkBg)}
  </div>`;

  await sendWithRetry({ from: FROM(), to, subject: `Payment Failed – Order #${sid} | DhaniFresh`, html: wrap(body) });
};

// ── 3. ORDER CANCELLED / REFUND ───────────────────────────────────────────────
const sendCancelEmail = async ({ to, userName, orderId, totalPrice, reason, isRefund, refundId }) => {
  const sid = orderId.slice(-8).toUpperCase();
  const body = `<div style="padding:28px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:50px;height:50px;background:${isRefund ? '#dcfce7' : '#fee2e2'};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><span style="font-size:24px">${isRefund ? '↩️' : '❌'}</span></div>
      <h2 style="margin:0;font-size:20px;font-weight:800;color:${darkBg}">${isRefund ? 'Refund Initiated' : 'Order Cancelled'}</h2>
      <p style="margin:4px 0 0;font-size:14px;color:#8899aa">Order #${sid}</p>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#444455">Hi ${userName},</p>
    ${box(`${row('Order ID', `#${sid}`)}${row('Amount', `₹${Number(totalPrice).toFixed(2)}`, brand)}${reason ? row('Reason', reason, '#444455') : ''}`)}
    ${isRefund ? box(`<div style="font-size:14px;font-weight:800;color:#16a34a;margin-bottom:6px">✅ Full Refund of ₹${Number(totalPrice).toFixed(2)} Initiated</div>
      <div style="font-size:13px;color:#16a34a;line-height:1.7">Refund will be credited within <strong>5–7 business days</strong>.${refundId ? `<br>Refund ID: <strong>${refundId}</strong>` : ''}</div>`, '#dcfce7', '#86efac')
    : box(`<div style="font-size:13px;color:${brand};line-height:1.7">Your order has been cancelled. No payment was collected.</div>`, '#fff4ee', '#fddcca')}
    ${btn('View My Orders →', `${CLIENT_URL()}/orders`)}
  </div>`;

  await sendWithRetry({ from: FROM(), to, subject: isRefund ? `Refund Initiated – #${sid} | DhaniFresh` : `Order Cancelled – #${sid} | DhaniFresh`, html: wrap(body) });
};

// ── 4. ACCOUNT BLOCKED / UNBLOCKED ────────────────────────────────────────────
const sendBlockEmail = async ({ to, userName, isBlocked, reason }) => {
  const body = `<div style="padding:28px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:50px;height:50px;background:${isBlocked ? '#fee2e2' : '#dcfce7'};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><span style="font-size:24px">${isBlocked ? '🔒' : '✅'}</span></div>
      <h2 style="margin:0;font-size:20px;font-weight:800;color:${darkBg}">${isBlocked ? 'Account Suspended' : 'Account Reinstated'}</h2>
    </div>
    <p style="margin:0 0 18px;font-size:14px;color:#8899aa">Hi ${userName},</p>
    ${box(`<div style="font-size:14px;font-weight:700;color:${isBlocked ? '#dc2626' : '#16a34a'};margin-bottom:6px">${isBlocked ? 'Your account has been temporarily suspended.' : 'Your account has been reinstated successfully.'}</div>
      ${reason ? `<div style="font-size:13px;color:${isBlocked ? '#dc2626' : '#16a34a'}">Reason: ${reason}</div>` : ''}`,
      isBlocked ? '#fee2e2' : '#dcfce7', isBlocked ? '#fca5a5' : '#86efac')}
    <p style="font-size:13px;color:#8899aa;line-height:1.7">If you believe this is an error, please contact our support team.</p>
  </div>`;

  await sendWithRetry({ from: FROM(), to, subject: isBlocked ? 'Your DhaniFresh account has been suspended' : 'Your DhaniFresh account has been reinstated', html: wrap(body) });
};

// ── 5. PASSWORD RESET ─────────────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ to, userName, resetUrl }) => {
  const body = `<div style="padding:28px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:50px;height:50px;background:#fef3c7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><span style="font-size:24px">🔐</span></div>
      <h2 style="margin:0;font-size:20px;font-weight:800;color:${darkBg}">Password Reset Request</h2>
      <p style="margin:4px 0 0;font-size:13px;color:#8899aa">Requested on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</p>
    </div>
    <p style="margin:0 0 14px;font-size:14px;color:#444455">Hi <strong>${userName}</strong>,</p>
    <p style="margin:0 0 20px;font-size:14px;color:#444455;line-height:1.6">We received a request to reset your password. Use the button below — valid for <strong>2 minutes</strong>, one-time use only.</p>
    ${box(`<div style="text-align:center;font-size:13px;color:#92400e;font-weight:600">⏱ This link expires in <strong>2 minutes</strong></div>`, '#fef3c7', '#fde68a')}
    ${btn('Reset My Password →', resetUrl)}
    ${box(`<strong style="color:#166534">🔒 Security Notice</strong>
      <ul style="margin-top:8px;padding-left:16px;font-size:13px;color:#166534;line-height:1.8">
        <li>Works <strong>only on the device & browser</strong> used to request it</li>
        <li>Expires immediately after use</li>
        <li>Cannot be copied to another device</li>
      </ul>`, '#f0fdf4', '#bbf7d0')}
    ${box(`<strong>Didn't request this?</strong> Ignore this email — your password stays unchanged.`, '#fff4ee', '#fddcca')}
  </div>`;

  await sendWithRetry({ from: FROM(), to: `${userName} <${to}>`, subject: 'Reset your DhaniFresh password 🔐', replyTo: process.env.SMTP_USER, html: wrap(body) });
};

// ── 6. CONTACT FORM — Admin notification ──────────────────────────────────────
const sendContactAdminEmail = async ({ name, email, phone, subject, message }) => {
  const body = `<div style="padding:28px">
    <div style="text-align:center;margin-bottom:20px">
      <span style="display:inline-block;padding:5px 14px;background:rgba(232,98,26,0.15);border:1px solid rgba(232,98,26,0.3);border-radius:20px;color:${brand};font-size:12px;font-weight:700;letter-spacing:1px">NEW CONTACT MESSAGE</span>
    </div>
    ${box(`${row('Name', name)}${row('Email', email)}${row('Phone', phone || 'Not provided')}${row('Subject', subject)}`)}
    <h4 style="font-size:12px;font-weight:800;color:${brand};text-transform:uppercase;letter-spacing:1px;margin:0 0 10px">Message</h4>
    ${box(`<div style="font-size:14px;color:#444455;line-height:1.8">${message.replace(/\n/g, '<br/>')}</div>`, '#fff4ee', '#fddcca')}
    <p style="font-size:13px;color:#8899aa;text-align:center">Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' })} IST</p>
  </div>`;

  await sendWithRetry({ from: FROM(), to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER, subject: `📩 New Contact: ${subject} — from ${name}`, replyTo: `${name} <${email}>`, html: wrap(body) });
};

// ── 7. CONTACT FORM — Auto-reply to customer ─────────────────────────────────
const sendContactAutoReply = async ({ name, email, phone, subject, message }) => {
  const body = `<div style="padding:28px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:50px;height:50px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><span style="font-size:24px">✉️</span></div>
      <h2 style="margin:0;font-size:20px;font-weight:800;color:${darkBg}">Message Received!</h2>
      <p style="margin:4px 0 0;font-size:13px;color:#8899aa">We'll get back to you within 24 hours</p>
    </div>
    <p style="margin:0 0 14px;font-size:14px;color:#444455">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 20px;font-size:14px;color:#444455;line-height:1.6">Thank you for reaching out to <strong>DhaniFresh</strong>! Our support team will review your message shortly.</p>
    ${box(`<div style="font-size:12px;font-weight:800;color:${brand};text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Your Message Summary</div>
      ${row('Subject', subject)}${phone ? row('Phone', phone) : ''}
      <div style="margin-top:8px;font-size:13px;color:#555;white-space:pre-line">${message}</div>`, '#fff4ee', '#fddcca')}
    ${btn('Browse Our Products →', `${CLIENT_URL()}/products`)}
  </div>`;

  await sendWithRetry({ from: FROM(), to: `${name} <${email}>`, subject: `We received your message — DhaniFresh 🧈`, html: wrap(body) });
};

// ── 8. WELCOME EMAIL ──────────────────────────────────────────────────────────
const sendWelcomeEmail = async ({ to, userName }) => {
  const body = `<div style="padding:28px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:50px;height:50px;background:#fff7ed;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><span style="font-size:24px">👋</span></div>
      <h2 style="margin:0;font-size:22px;font-weight:800;color:${darkBg}">Welcome to DhaniFresh!</h2>
      <p style="margin:4px 0 0;font-size:14px;color:#8899aa">Pure & Natural Desi Ghee</p>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#444455">Hi <strong>${userName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;color:#444455;line-height:1.6">We are absolutely thrilled to welcome you to our family! At DhaniFresh, we are dedicated to crafting the finest Bilona Desi Ghee, sourcing directly from local milk farms and using traditional hand-churned methods.</p>
    ${box(`<h3 style="margin:0 0 12px;font-size:12px;font-weight:800;color:#8899aa;text-transform:uppercase;letter-spacing:0.05em">Why Bilona Ghee?</h3>
      <div style="font-size:13px;color:#444455;line-height:1.7">
        • <strong>100% Pure:</strong> Free from additives, preservatives, and artificial flavorings.<br/>
        • <strong>Hand-Churned:</strong> Made using the ancient Bilona slow-cooking method.<br/>
        • <strong>Nutritious:</strong> Rich in vitamins, antioxidants, and healthy fats that boost digestion.
      </div>`)}
    <p style="margin:0 0 20px;font-size:14px;color:#444455;line-height:1.6">To celebrate your new journey, use the discount code below on your first purchase:</p>
    ${box(`<div style="text-align:center;font-size:16px;color:${brand};font-weight:800;letter-spacing:2px">CODE: FIRST10</div>
      <div style="text-align:center;font-size:12px;color:#8899aa;margin-top:4px">Get 10% off on your first order above ₹500</div>`, '#fff7ed', '#fed7aa')}
    ${btn('Explore Our Collection', `${CLIENT_URL()}/products`)}
  </div>`;

  await sendWithRetry({
    from: FROM(),
    to,
    subject: `Welcome to DhaniFresh, ${userName}! 🧈`,
    html: wrap(body),
  });
};

// ── 9. SHIPPING UPDATE ────────────────────────────────────────────────────────
const sendShippingUpdateEmail = async ({ to, userName, orderId, trackingNumber, shippingProvider }) => {
  const sid = orderId.slice(-8).toUpperCase();
  const trackingUrl = shippingProvider?.toLowerCase().includes('delhivery')
    ? `https://www.delhivery.com/track/package/${trackingNumber}`
    : shippingProvider?.toLowerCase().includes('bluedart')
    ? `https://www.bluedart.com/tracking?trackid=${trackingNumber}`
    : `https://www.google.com/search?q=track+package+${trackingNumber}`;

  const body = `<div style="padding:28px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:50px;height:50px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><span style="font-size:24px">🚚</span></div>
      <h2 style="margin:0;font-size:20px;font-weight:800;color:${darkBg}">Your Order is Shipped!</h2>
      <p style="margin:4px 0 0;font-size:14px;color:#8899aa">Order #${sid}</p>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#444455">Hi ${userName},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#444455;line-height:1.6">Great news! Your premium ghee package has been handed over to our courier partner and is on its way to your kitchen.</p>
    ${box(`<h3 style="margin:0 0 12px;font-size:12px;font-weight:800;color:#8899aa;text-transform:uppercase;letter-spacing:0.05em">Tracking Details</h3>
      ${row('Courier Partner', shippingProvider || 'Our Delivery Partner')}
      ${row('Tracking ID', trackingNumber)}`)}
    ${btn('Track Package', trackingUrl)}
    <p style="font-size:13px;color:#8899aa;text-align:center;margin-top:20px">Please allow up to 24 hours for the tracking information to update.</p>
  </div>`;

  await sendWithRetry({
    from: FROM(),
    to,
    subject: `Your order #${sid} has been shipped! 🚚`,
    html: wrap(body),
  });
};

module.exports = {
  sendCancelEmail,
  sendBlockEmail,
  sendOrderSuccessEmail,
  sendOrderFailureEmail,
  sendPasswordResetEmail,
  sendContactAdminEmail,
  sendContactAutoReply,
  sendWelcomeEmail,
  sendShippingUpdateEmail,
};