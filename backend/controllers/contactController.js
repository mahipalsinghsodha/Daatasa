const transporter = require('../utils/sendEmail');

 const sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    // ── Validation ────────────────────────────────────────────────────────────
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required.' })
    }

    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' })
    }

    // ── 1. Email TO you (admin notification) ─────────────────────────────────
    const adminMailOptions = {
      from:    `"Ghee Store Contact" <${process.env.SMTP_USER}>`,
      to:       process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
      subject: `📩 New Contact: ${subject} — from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background:#f2f4f6; color:#1a1a2e; }
            .wrapper { max-width:600px; margin:24px auto; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.12); }
            .header { background:linear-gradient(135deg,#1a1a2e,#2d1810); padding:32px 32px 24px; text-align:center; }
            .logo { font-size:28px; font-weight:900; color:#e8621a; letter-spacing:-0.5px; }
            .logo-sub { font-size:12px; color:rgba(255,255,255,0.5); margin-top:4px; }
            .tag { display:inline-block; margin-top:14px; padding:5px 14px; background:rgba(232,98,26,0.2); border:1px solid rgba(232,98,26,0.4); border-radius:20px; color:#e8621a; font-size:12px; font-weight:700; letter-spacing:1px; }
            .body { background:#ffffff; padding:28px 32px; }
            .section-title { font-size:11px; font-weight:700; color:#e8621a; text-transform:uppercase; letter-spacing:1.5px; margin:0 0 12px; }
            .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; }
            .info-box { background:#f8f9fb; border:1.5px solid #e4e9f0; border-radius:10px; padding:12px 14px; }
            .info-label { font-size:11px; color:#8899aa; font-weight:600; margin-bottom:3px; }
            .info-value { font-size:14px; font-weight:700; color:#1a1a2e; word-break:break-word; }
            .message-box { background:#fff4ee; border:1.5px solid #fddcca; border-radius:12px; padding:18px 20px; margin-bottom:24px; }
            .message-text { font-size:14px; color:#444455; line-height:1.8; }
            .footer { background:#f8f9fb; padding:18px 32px; text-align:center; border-top:1.5px solid #e4e9f0; }
            .footer-text { font-size:12px; color:#8899aa; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <div class="logo">🧈 Ghee Store</div>
              <div class="logo-sub">Pure & Natural A1 Ghee</div>
              <div class="tag">NEW CONTACT MESSAGE</div>
            </div>
            <div class="body">
              <p class="section-title">Sender Details</p>
              <div class="info-grid">
                <div class="info-box">
                  <div class="info-label">Full Name</div>
                  <div class="info-value">${name}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Email</div>
                  <div class="info-value">${email}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${phone || 'Not provided'}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Subject</div>
                  <div class="info-value">${subject}</div>
                </div>
              </div>

              <p class="section-title">Message</p>
              <div class="message-box">
                <div class="message-text">${message.replace(/\n/g, '<br/>')}</div>
              </div>

              <p style="font-size:13px;color:#8899aa;text-align:center;">
                Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' })} IST
              </p>
            </div>
            <div class="footer">
              <p class="footer-text">Ghee Store Admin Panel · Reply directly to <strong>${email}</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Set reply-to so clicking Reply goes to the customer
      replyTo: `${name} <${email}>`,
    }

    // ── 2. Auto-reply TO the customer ─────────────────────────────────────────
    const customerMailOptions = {
      from:    `"Ghee Store Support" <${process.env.SMTP_USER}>`,
      to:      `${name} <${email}>`,
      subject: `We received your message — Ghee Store 🧈`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background:#f2f4f6; color:#1a1a2e; }
            .wrapper { max-width:600px; margin:24px auto; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.12); }
            .header { background:linear-gradient(135deg,#1a1a2e,#2d1810); padding:40px 32px 32px; text-align:center; }
            .logo { font-size:30px; font-weight:900; color:#e8621a; }
            .logo-sub { font-size:12px; color:rgba(255,255,255,0.5); margin-top:4px; }
            .emoji { font-size:52px; margin:16px 0 8px; display:block; }
            .title { font-size:22px; font-weight:800; color:#ffffff; margin:0; }
            .subtitle { font-size:14px; color:rgba(255,255,255,0.6); margin-top:8px; }
            .body { background:#ffffff; padding:32px; }
            .greeting { font-size:16px; font-weight:700; color:#1a1a2e; margin-bottom:12px; }
            .para { font-size:14px; color:#555566; line-height:1.8; margin-bottom:14px; }
            .summary { background:#fff4ee; border:1.5px solid #fddcca; border-radius:12px; padding:16px 20px; margin:20px 0; }
            .summary-label { font-size:11px; font-weight:700; color:#e8621a; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
            .summary-row { display:flex; gap:8px; font-size:13px; color:#555; margin-bottom:5px; }
            .summary-key { font-weight:600; min-width:70px; color:#1a1a2e; }
            .badge-row { text-align:center; margin:24px 0 8px; }
            .badge { display:inline-block; padding:10px 24px; background:#e8621a; color:#fff; border-radius:10px; font-size:14px; font-weight:700; text-decoration:none; }
            .divider { border:none; border-top:1.5px solid #e4e9f0; margin:24px 0; }
            .footer { background:#f8f9fb; padding:20px 32px; text-align:center; border-top:1.5px solid #e4e9f0; }
            .footer-text { font-size:12px; color:#8899aa; line-height:1.6; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <div class="logo">🧈 Ghee Store</div>
              <div class="logo-sub">Pure & Natural A1 Ghee</div>
              <span class="emoji">✉️</span>
              <h1 class="title">Message Received!</h1>
              <p class="subtitle">We'll get back to you within 24 hours</p>
            </div>
            <div class="body">
              <p class="greeting">Hi ${name},</p>
              <p class="para">
                Thank you for reaching out to <strong>Ghee Store</strong>! We've successfully received your message and our support team will review it shortly.
              </p>

              <div class="summary">
                <div class="summary-label">Your Message Summary</div>
                <div class="summary-row"><span class="summary-key">Subject:</span><span>${subject}</span></div>
                ${phone ? `<div class="summary-row"><span class="summary-key">Phone:</span><span>${phone}</span></div>` : ''}
                <div class="summary-row"><span class="summary-key">Message:</span><span style="white-space:pre-line">${message}</span></div>
              </div>

              <p class="para">
                While you wait, feel free to browse our collection of premium A1 &amp; A2 ghee products crafted using the traditional Bilona method.
              </p>

              <div class="badge-row">
                <a href="${process.env.FRONTEND_URL || 'https://gheestore.in'}/products" class="badge">
                  Browse Our Products →
                </a>
              </div>

              <hr class="divider"/>
              <p class="para" style="font-size:13px;color:#8899aa;">
                If you didn't send this message, please ignore this email or contact us at
                <strong> ${process.env.CONTACT_RECEIVER || process.env.SMTP_USER}</strong>.
              </p>
            </div>
            <div class="footer">
              <p class="footer-text">
                🧈 <strong>Ghee Store</strong> — Pure &amp; Natural A1 Ghee<br/>
                123, Dairy Lane, Mumbai, Maharashtra – 400058<br/>
                <a href="mailto:${process.env.CONTACT_RECEIVER}" style="color:#e8621a;">support@gheestore.in</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    // ── Send both emails in parallel ──────────────────────────────────────────
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions),
    ])

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you shortly.',
    })

  } catch (error) {
    console.error('Contact email error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or contact us directly.',
    })
  }
}

module.exports = { sendContactEmail };
