const transporter = require('../config/nodemailer');

const brand = '#e8621a';
const wrap = (body) => `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f2f4f6;font-family:'Segoe UI',Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px 16px">
<div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07)">
<div style="background:#1a1a2e;padding:18px 28px">
  <div style="font-size:22px;font-weight:800;color:${brand}">🧈 Ghee Store</div>
  <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">Pure & Natural A1 Ghee</div>
</div>
${body}
<div style="padding:14px 28px;border-top:1px solid #e4e9f0;text-align:center;font-size:12px;color:#8899aa">
  © ${new Date().getFullYear()} Ghee Store · All rights reserved
</div>
</div></div></body></html>`;

// ── Cancel / Refund email → user ──────────────────────────────────────────────
const sendCancelEmail = async ({ to, userName, orderId, totalPrice, reason, isRefund, refundId }) => {
  const shortId = orderId.slice(-8).toUpperCase();

  const body = `
  <div style="padding:28px">
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#1a1a2e">
      ${isRefund ? '↩ Refund Initiated' : '❌ Order Cancelled'}
    </h2>
    <p style="margin:0 0 20px;font-size:14px;color:#8899aa">Hi ${userName},</p>

    <div style="background:#f8fafc;border:1.5px solid #e4e9f0;border-radius:12px;padding:16px;margin-bottom:18px">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:13px;color:#8899aa">Order ID</span>
        <span style="font-size:13px;font-weight:700;color:#1a1a2e">#${shortId}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:${reason ? '8px' : '0'}">
        <span style="font-size:13px;color:#8899aa">Amount</span>
        <span style="font-size:13px;font-weight:700;color:${brand}">₹${Number(totalPrice).toFixed(2)}</span>
      </div>
      ${reason ? `<div style="display:flex;justify-content:space-between">
        <span style="font-size:13px;color:#8899aa">Reason</span>
        <span style="font-size:13px;font-weight:600;color:#444455">${reason}</span>
      </div>` : ''}
    </div>

    ${isRefund ? `
    <div style="background:#dcfce7;border:1.5px solid #86efac;border-radius:12px;padding:14px;margin-bottom:18px">
      <div style="font-size:14px;font-weight:800;color:#16a34a;margin-bottom:6px">✅ Full Refund of ₹${Number(totalPrice).toFixed(2)} Initiated</div>
      <div style="font-size:13px;color:#16a34a;line-height:1.7">
        Your refund has been processed via Razorpay and will be credited to your original
        payment method within <strong>5–7 business days</strong>.
        ${refundId ? `<br>Refund ID: <strong>${refundId}</strong>` : ''}
      </div>
    </div>` : `
    <div style="background:#fff4ee;border:1.5px solid #fddcca;border-radius:12px;padding:14px;margin-bottom:18px">
      <div style="font-size:13px;color:${brand};line-height:1.7">
        Your order has been cancelled. Any reserved stock has been released.
        ${/* COD - no charges */ ''}No payment was collected.
      </div>
    </div>`}

    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders"
       style="display:inline-block;padding:12px 24px;background:${brand};color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">
      View My Orders →
    </a>
  </div>`;

  await transporter.sendMail({
    from: `"Ghee Store" <${process.env.SMTP_USER}>`,
    to,
    subject: isRefund
      ? `Refund Initiated – Order #${shortId} | Ghee Store`
      : `Order Cancelled – #${shortId} | Ghee Store`,
    html: wrap(body),
  });
};

// ── Admin notification when user cancels ──────────────────────────────────────
const sendAdminCancelNotification = async ({ orderId, userName, userEmail, totalPrice, reason, isRefund }) => {
  const shortId = orderId.slice(-8).toUpperCase();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  const body = `
  <div style="padding:28px">
    <h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#1a1a2e">
      ⚠️ Order #${shortId} Cancelled${isRefund ? ' + Refund Issued' : ''}
    </h2>
    <div style="background:#f8fafc;border:1.5px solid #e4e9f0;border-radius:12px;padding:16px">
      <div style="margin-bottom:8px;font-size:13px"><span style="color:#8899aa">Customer: </span><strong>${userName}</strong> (${userEmail})</div>
      <div style="margin-bottom:8px;font-size:13px"><span style="color:#8899aa">Amount: </span><strong style="color:${brand}">₹${Number(totalPrice).toFixed(2)}</strong></div>
      <div style="font-size:13px"><span style="color:#8899aa">Reason: </span><strong>${reason || 'Not specified'}</strong></div>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"Ghee Store" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `[Admin] Order #${shortId} Cancelled${isRefund ? ' + Refund Issued' : ''}`,
    html: wrap(body),
  });
};

// ── Block / Unblock user email ─────────────────────────────────────────────────
const sendBlockEmail = async ({ to, userName, isBlocked, reason }) => {
  const body = `
  <div style="padding:28px">
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#1a1a2e">
      ${isBlocked ? '🔒 Account Suspended' : '✅ Account Reinstated'}
    </h2>
    <p style="margin:0 0 18px;font-size:14px;color:#8899aa">Hi ${userName},</p>
    <div style="background:${isBlocked ? '#fee2e2' : '#dcfce7'};border:1.5px solid ${isBlocked ? '#fca5a5' : '#86efac'};border-radius:12px;padding:14px">
      <div style="font-size:14px;font-weight:700;color:${isBlocked ? '#dc2626' : '#16a34a'};margin-bottom:6px">
        ${isBlocked ? 'Your account has been temporarily suspended.' : 'Your account has been reinstated successfully.'}
      </div>
      ${reason ? `<div style="font-size:13px;color:${isBlocked ? '#dc2626' : '#16a34a'}">Reason: ${reason}</div>` : ''}
    </div>
    <p style="font-size:13px;color:#8899aa;margin-top:16px;line-height:1.7">
      If you believe this is an error, please contact our support team.
    </p>
  </div>`;

  await transporter.sendMail({
    from: `"Ghee Store" <${process.env.SMTP_USER}>`,
    to,
    subject: isBlocked ? 'Your Ghee Store account has been suspended' : 'Your Ghee Store account has been reinstated',
    html: wrap(body),
  });
};

// ── Order Success email → user ────────────────────────────────────────────────
const sendOrderSuccessEmail = async ({ to, userName, orderId, totalPrice, items, paymentMethod }) => {
  const shortId = orderId.slice(-8).toUpperCase();

  const itemsHtml = items.map(item => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9">
      <div style="font-size:13px;color:#1a1a2e">
        <strong>${item.name}</strong> <span style="color:#8899aa">×${item.quantity}</span>
      </div>
      <div style="font-size:13px;font-weight:700;color:#1a1a2e">₹${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');

  const body = `
  <div style="padding:28px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:50px;height:50px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px">
        <span style="font-size:24px">🎉</span>
      </div>
      <h2 style="margin:0;font-size:22px;font-weight:800;color:#1a1a2e">Order Confirmed!</h2>
      <p style="margin:4px 0 0;font-size:14px;color:#8899aa">Order #${shortId}</p>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#444455">Hi ${userName},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#444455;line-height:1.6">
      Thank you for your order! We've received your request and are getting it ready for shipment. 
      You'll receive another email once your items are on the way.
    </p>

    <div style="background:#f8fafc;border:1.5px solid #e4e9f0;border-radius:14px;padding:20px;margin-bottom:24px">
      <h3 style="margin:0 0 12px;font-size:12px;font-weight:800;color:#8899aa;text-transform:uppercase;letter-spacing:0.05em">Order Details</h3>
      ${itemsHtml}
      <div style="margin-top:12px;padding-top:12px;border-top:2px solid #e4e9f0">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:13px;color:#8899aa">Payment Method</span>
          <span style="font-size:13px;font-weight:700;color:#1a1a2e">${paymentMethod}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="font-size:15px;font-weight:800;color:#1a1a2e">Total Amount</span>
          <span style="font-size:15px;font-weight:900;color:${brand}">₹${Number(totalPrice).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="text-align:center">
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders"
         style="display:inline-block;padding:14px 32px;background:${brand};color:#fff;border-radius:12px;font-size:14px;font-weight:800;text-decoration:none;box-shadow:0 4px 12px rgba(232,98,26,0.2)">
        Track My Order →
      </a>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"Ghee Store" <${process.env.SMTP_USER}>`,
    to,
    subject: `Order Confirmed: #${shortId} | Ghee Store`,
    html: wrap(body),
  });
};

// ── Order Failure email → user ────────────────────────────────────────────────
const sendOrderFailureEmail = async ({ to, userName, orderId, totalPrice, reason }) => {
  const shortId = orderId.slice(-8).toUpperCase();

  const body = `
  <div style="padding:28px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:50px;height:50px;background:#fee2e2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px">
        <span style="font-size:24px">⚠️</span>
      </div>
      <h2 style="margin:0;font-size:20px;font-weight:800;color:#1a1a2e">Payment Failed</h2>
      <p style="margin:4px 0 0;font-size:14px;color:#8899aa">Order #${shortId}</p>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#444455">Hi ${userName},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#444455;line-height:1.6">
      We're sorry, but your payment for order <strong>#${shortId}</strong> was not successful. 
      As a result, your order has been cancelled and any reserved items have been returned to stock.
    </p>

    <div style="background:#fff4ee;border:1.5px solid #fddcca;border-radius:12px;padding:16px;margin-bottom:24px">
      <div style="font-size:13px;color:${brand};font-weight:700;margin-bottom:4px">Reason for Failure:</div>
      <div style="font-size:13px;color:${brand}">${reason || 'Payment was cancelled or failed at the bank.'}</div>
    </div>

    <p style="font-size:13px;color:#8899aa;margin-bottom:24px">
      If funds were deducted from your account, they will be automatically refunded by your bank within 5-7 business days. 
      You can try placing the order again using a different payment method.
    </p>

    <div style="text-align:center">
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/cart"
         style="display:inline-block;padding:12px 24px;background:#1a1a2e;color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">
        Return to Cart
      </a>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"Ghee Store" <${process.env.SMTP_USER}>`,
    to,
    subject: `Payment Failed Alert – Order #${shortId} | Ghee Store`,
    html: wrap(body),
  });
};

module.exports = { 
  sendCancelEmail, 
  sendAdminCancelNotification, 
  sendBlockEmail,
  sendOrderSuccessEmail,
  sendOrderFailureEmail
};