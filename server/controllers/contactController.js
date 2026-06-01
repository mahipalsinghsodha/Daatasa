const { sendContactAdminEmail, sendContactAutoReply } = require('../services/emailService');

const sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required.' });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({ message: 'Message cannot exceed 2000 characters.' });
    }

    // Send both emails in parallel
    await Promise.all([
      sendContactAdminEmail({ name, email, phone, subject, message }),
      sendContactAutoReply({ name, email, phone, subject, message }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you shortly.',
    });
  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or contact us directly.',
    });
  }
};

module.exports = { sendContactEmail };
