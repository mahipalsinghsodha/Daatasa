const transporter = require('../config/nodemailer');

// ── Premium Email Template System ─────────────────────────────────────────────
const brandPrimary = '#1B2F6E';
const brandGold = '#F5A623';
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

const wrap = (body, heroImage) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#F7F9FC;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(27,47,110,0.08);">
    
    <!-- Hero Image -->
    <div style="width:100%;height:180px;background-color:${brandPrimary};background-image:url('${heroImage}');background-size:cover;background-position:center;">
    </div>
    
    <!-- Logo -->
    <div style="text-align:center;margin-top:-32px;">
      <div style="display:inline-block;background:#ffffff;padding:12px 28px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);border:1px solid #F1F5F9;">
         <span style="font-size:24px;font-weight:800;color:${brandPrimary};letter-spacing:-0.5px;">Dhani<span style="color:${brandGold};">Fresh</span></span>
      </div>
    </div>
    
    <!-- Content Area -->
    <div style="padding:40px 40px 30px;">
      ${body}
    </div>
    
    <!-- Footer -->
    <div style="background:#F8FAFC;padding:32px 40px;text-align:center;border-top:1px solid #E2E8F0;">
       <div style="color:#64748B;font-size:13px;line-height:1.6;">
         Have questions? Reply to this email or contact our support team.<br/>
         © ${new Date().getFullYear()} DhaniFresh. Crafted with pure love in India.
       </div>
    </div>
  </div>
</body>
</html>`;

const btn = (text, url) =>
  `<div style="text-align:center;margin:32px 0;">
     <a href="${url}" style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg, ${brandPrimary}, #2A4596);color:#ffffff;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;box-shadow:0 8px 24px rgba(27,47,110,0.25);">
       ${text}
     </a>
   </div>`;

const box = (content) =>
  `<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:24px;margin:24px 0;">${content}</div>`;

const row = (label, value) =>
  `<div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;">
     <span style="color:#64748B;">${label}</span>
     <span style="font-weight:700;color:${brandPrimary};">${value}</span>
   </div>`;

const pStyle = "margin:0 0 20px;font-size:15px;color:#334155;line-height:1.8;";
const h2Style = `margin:0 0 24px;font-size:24px;font-weight:800;color:${brandPrimary};letter-spacing:-0.5px;`;

// ── 1. ORDER CONFIRMED ────────────────────────────────────────────────────────
const sendOrderSuccessEmail = async ({ to, userName, orderId, totalPrice, items, paymentMethod, invoiceNumber }) => {
  const sid = orderId.slice(-8).toUpperCase();
  const itemsHtml = items.map(i => `
    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #E2E8F0;font-size:14px;">
      <div style="color:#334155;"><strong>${i.name}</strong> <span style="color:#94A3B8;">×${i.quantity}</span></div>
      <div style="font-weight:700;color:${brandPrimary};">₹${(i.price * i.quantity).toFixed(2)}</div>
    </div>`).join('');

  const body = `
    <h2 style="${h2Style}">Your order is confirmed!</h2>
    <p style="${pStyle}">Hi <strong>${userName}</strong>,</p>
    <p style="${pStyle}">Thank you so much for choosing DhaniFresh! We're thrilled to let you know that we've received your order and our team is already carefully preparing it for you.</p>
    <p style="${pStyle}">You'll receive another email as soon as your premium Bilona Ghee ships. Until then, here is a summary of what you ordered:</p>
    
    ${box(`
      <h3 style="margin:0 0 16px;font-size:13px;font-weight:800;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;">Order #${sid}</h3>
      ${itemsHtml}
      <div style="margin-top:16px;padding-top:16px;">
        ${row('Payment Method', paymentMethod)}
        <div style="display:flex;justify-content:space-between;margin-top:16px;font-size:16px;">
          <span style="font-weight:800;color:#334155;">Total</span>
          <span style="font-weight:900;color:${brandGold};">₹${Number(totalPrice).toFixed(2)}</span>
        </div>
      </div>
    `)}
    
    <p style="${pStyle}">If you need to make any changes to your order, please let us know immediately by replying to this email.</p>
    ${btn('Track My Order', `${CLIENT_URL()}/orders`)}
  `;

  // Hero image: Beautiful Indian spices/food aesthetic
  const heroImg = 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

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
    html: wrap(body, heroImg),
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
  const body = `
    <h2 style="${h2Style}">Action Required: Payment Failed</h2>
    <p style="${pStyle}">Hi <strong>${userName}</strong>,</p>
    <p style="${pStyle}">We're reaching out to let you know that your payment for order <strong>#${sid}</strong> couldn't be processed successfully. Your order has currently been put on hold.</p>
    
    ${box(`
      <div style="font-size:14px;color:#EF4444;font-weight:700;margin-bottom:8px;">Reason provided by bank:</div>
      <div style="font-size:14px;color:#7F1D1D;">${reason || 'The transaction was declined or interrupted.'}</div>
    `)}
    
    <p style="${pStyle}">Don't worry — no funds have been permanently deducted. If any amount was debited, it will be automatically refunded by your bank within 5-7 business days.</p>
    <p style="${pStyle}">You can easily try placing your order again by returning to your cart.</p>
    
    ${btn('Return to Cart', `${CLIENT_URL()}/cart`)}
  `;

  const heroImg = 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  await sendWithRetry({ from: FROM(), to, subject: `Action Required: Payment Failed – Order #${sid}`, html: wrap(body, heroImg) });
};

// ── 3. ORDER CANCELLED / REFUND ───────────────────────────────────────────────
const sendCancelEmail = async ({ to, userName, orderId, totalPrice, reason, isRefund, refundId }) => {
  const sid = orderId.slice(-8).toUpperCase();
  const body = `
    <h2 style="${h2Style}">${isRefund ? 'Your refund has been initiated' : 'Your order was cancelled'}</h2>
    <p style="${pStyle}">Hi <strong>${userName}</strong>,</p>
    <p style="${pStyle}">As requested, we have cancelled your order <strong>#${sid}</strong>.</p>
    
    ${isRefund 
      ? box(`
          <div style="font-size:15px;font-weight:800;color:#16A34A;margin-bottom:8px;">✅ Full Refund of ₹${Number(totalPrice).toFixed(2)} Initiated</div>
          <div style="font-size:14px;color:#166534;line-height:1.7;">
            We have processed your refund. It should reflect in your original payment method within <strong>5–7 business days</strong> depending on your bank.<br><br>
            ${refundId ? `Reference ID: <strong>${refundId}</strong>` : ''}
          </div>
        `)
      : box(`
          <div style="font-size:14px;color:#B45309;line-height:1.7;">
            Your order has been cancelled successfully. Since no payment was completed, there is no refund necessary.
          </div>
        `)
    }
    
    <p style="${pStyle}">We hope to serve you again in the future. If you have any questions, just reply to this email.</p>
    ${btn('Browse Products', `${CLIENT_URL()}/products`)}
  `;

  const heroImg = 'https://images.unsplash.com/photo-1584824486509-112e4181f1b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  await sendWithRetry({ from: FROM(), to, subject: isRefund ? `Refund Initiated – #${sid}` : `Order Cancelled – #${sid}`, html: wrap(body, heroImg) });
};

// ── 4. ACCOUNT BLOCKED / UNBLOCKED ────────────────────────────────────────────
const sendBlockEmail = async ({ to, userName, isBlocked, reason }) => {
  const body = `
    <h2 style="${h2Style}">${isBlocked ? 'Important Account Notice' : 'Your Account is Reinstated!'}</h2>
    <p style="${pStyle}">Hi <strong>${userName}</strong>,</p>
    
    ${isBlocked 
      ? `<p style="${pStyle}">We are writing to inform you that your DhaniFresh account has been temporarily suspended to protect the security of our platform.</p>
         ${box(`<div style="font-size:14px;color:#EF4444;font-weight:700;">Reason: ${reason || 'Violation of terms or suspicious activity.'}</div>`)}
         <p style="${pStyle}">If you believe this was done in error, please reply to this email and our support team will help resolve the issue immediately.</p>`
      : `<p style="${pStyle}">Great news! After review, your DhaniFresh account has been fully reinstated.</p>
         <p style="${pStyle}">We apologize for any inconvenience this may have caused. You can now log back in and continue enjoying our premium products.</p>
         ${btn('Log In Now', `${CLIENT_URL()}/login`)}`
    }
  `;

  const heroImg = isBlocked 
    ? 'https://images.unsplash.com/photo-1614064641913-6b71a2eaae37?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    : 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  await sendWithRetry({ from: FROM(), to, subject: isBlocked ? 'Notice regarding your DhaniFresh account' : 'Your DhaniFresh account is reinstated', html: wrap(body, heroImg) });
};

// ── 5. PASSWORD RESET ─────────────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ to, userName, resetUrl }) => {
  const body = `
    <h2 style="${h2Style}">Reset your password</h2>
    <p style="${pStyle}">Hi <strong>${userName}</strong>,</p>
    <p style="${pStyle}">We received a request to reset the password for your DhaniFresh account. Don't worry, we've got you covered.</p>
    <p style="${pStyle}">Click the button below to securely set a new password. For your security, this link is only valid for <strong>2 minutes</strong>.</p>
    
    ${btn('Securely Reset Password', resetUrl)}
    
    ${box(`
      <strong style="color:#334155;font-size:14px;">Didn't make this request?</strong><br>
      <span style="color:#64748B;font-size:13px;line-height:1.6;">If you didn't ask to reset your password, you can safely ignore this email. Your account is completely secure and your password will not be changed.</span>
    `)}
  `;

  const heroImg = 'https://images.unsplash.com/photo-1510511459019-5efa325f6e80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  await sendWithRetry({ from: FROM(), to: `${userName} <${to}>`, subject: 'Reset your DhaniFresh password', replyTo: process.env.SMTP_USER, html: wrap(body, heroImg) });
};

// ── 6. CONTACT FORM — Admin notification ──────────────────────────────────────
const sendContactAdminEmail = async ({ name, email, phone, subject, message }) => {
  const body = `
    <h2 style="${h2Style}">New Customer Inquiry</h2>
    
    ${box(`
      ${row('Name', name)}
      ${row('Email', email)}
      ${row('Phone', phone || 'Not provided')}
      ${row('Subject', subject)}
    `)}
    
    <h3 style="margin:24px 0 12px;font-size:14px;font-weight:800;color:#94A3B8;text-transform:uppercase;">Message</h3>
    <div style="background:#F8FAFC;border-left:4px solid ${brandGold};padding:16px 24px;font-size:15px;color:#334155;line-height:1.8;">
      ${message.replace(/\n/g, '<br/>')}
    </div>
  `;

  const heroImg = 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  await sendWithRetry({ from: FROM(), to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER, subject: `Inquiry: ${subject} — from ${name}`, replyTo: `${name} <${email}>`, html: wrap(body, heroImg) });
};

// ── 7. CONTACT FORM — Auto-reply to customer ─────────────────────────────────
const sendContactAutoReply = async ({ name, email, phone, subject, message }) => {
  const body = `
    <h2 style="${h2Style}">We've received your message</h2>
    <p style="${pStyle}">Hi <strong>${name}</strong>,</p>
    <p style="${pStyle}">Thank you so much for reaching out to us! This is just a quick note to let you know we've safely received your message.</p>
    <p style="${pStyle}">Our dedicated support team is reviewing your inquiry and we promise to get back to you with a thoughtful response within 24 hours.</p>
    
    ${box(`
      <h3 style="margin:0 0 12px;font-size:12px;font-weight:800;color:#94A3B8;text-transform:uppercase;">Your Message Summary</h3>
      <div style="font-weight:700;color:#334155;margin-bottom:8px;">${subject}</div>
      <div style="font-size:14px;color:#64748B;font-style:italic;">"${message}"</div>
    `)}
    
    <p style="${pStyle}">While you wait, feel free to explore our latest premium ghee collections.</p>
    ${btn('Browse Store', `${CLIENT_URL()}/products`)}
  `;

  const heroImg = 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  await sendWithRetry({ from: FROM(), to: `${name} <${email}>`, subject: `We've received your message — DhaniFresh`, html: wrap(body, heroImg) });
};

// ── 8. WELCOME EMAIL ──────────────────────────────────────────────────────────
const sendWelcomeEmail = async ({ to, userName }) => {
  const body = `
    <h2 style="${h2Style}">Welcome to the family!</h2>
    <p style="${pStyle}">Hi <strong>${userName}</strong>,</p>
    <p style="${pStyle}">I'm absolutely thrilled to welcome you to DhaniFresh. When we started this journey, our mission was simple: to bring the purest, most authentic, and deeply nourishing Bilona Ghee back to our kitchen tables.</p>
    <p style="${pStyle}">You're not just a customer to us — you're joining a community that values health, tradition, and uncompromising quality.</p>
    
    ${box(`
      <h3 style="margin:0 0 16px;font-size:14px;font-weight:800;color:${brandPrimary};">What makes our Ghee special?</h3>
      <div style="font-size:14px;color:#475569;line-height:1.8;">
        <strong>✨ 100% Pure & Natural:</strong> We use absolutely zero additives or preservatives.<br/>
        <strong>✨ Traditional Bilona Method:</strong> Hand-churned from curd, ensuring maximum nutrition.<br/>
        <strong>✨ Rich in Antioxidants:</strong> Crafted to boost immunity and promote healthy digestion.
      </div>
    `)}
    
    <p style="${pStyle}">To celebrate your first step with us, we'd love to offer you a little gift. Use the code below at checkout to enjoy <strong>10% off</strong> your very first order.</p>
    
    <div style="text-align:center;margin:32px 0;">
      <span style="display:inline-block;padding:12px 24px;background:#FEF3C7;color:#D97706;font-size:20px;font-weight:900;letter-spacing:2px;border:2px dashed #F5A623;border-radius:12px;">FIRST10</span>
    </div>
    
    <p style="${pStyle}">Thank you again for trusting us. I can't wait for you to experience the DhaniFresh difference.</p>
    
    ${btn('Shop Our Collection', `${CLIENT_URL()}/products`)}
  `;

  // Warm, beautiful Indian cooking / spices aesthetic
  const heroImg = 'https://images.unsplash.com/photo-1606859191214-25806e8e2423?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  await sendWithRetry({
    from: FROM(),
    to,
    subject: `Welcome to DhaniFresh, ${userName}!`,
    html: wrap(body, heroImg),
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

  const body = `
    <h2 style="${h2Style}">Your package is on its way!</h2>
    <p style="${pStyle}">Hi <strong>${userName}</strong>,</p>
    <p style="${pStyle}">Great news! Your premium ghee order <strong>#${sid}</strong> has been packed with care, handed over to our delivery partner, and is currently traveling to your doorstep.</p>
    
    ${box(`
      <h3 style="margin:0 0 16px;font-size:13px;font-weight:800;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;">Shipping Details</h3>
      ${row('Courier', shippingProvider || 'Our Delivery Partner')}
      ${row('Tracking Number', trackingNumber)}
    `)}
    
    <p style="${pStyle}">You can track your package's journey by clicking the button below. Please note that it may take up to 24 hours for the tracking link to show active progress.</p>
    
    ${btn('Track My Package', trackingUrl)}
  `;

  const heroImg = 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  await sendWithRetry({
    from: FROM(),
    to,
    subject: `Your DhaniFresh order #${sid} has been shipped!`,
    html: wrap(body, heroImg),
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