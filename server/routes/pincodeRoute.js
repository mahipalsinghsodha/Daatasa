const express = require('express');
const router = express.Router();

// Proxy pincode lookup to avoid CORS issues when calling from browser
// GET /api/pincode/:code
router.get('/:code', async (req, res) => {
  const { code } = req.params;

  // Basic validation
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: 'Invalid PIN code format' });
  }

  try {
    // Use built-in fetch (Node 18+) or fallback to https
    const upstream = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!upstream.ok) {
      return res.status(502).json({ message: 'Upstream pincode service unavailable' });
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    console.error('Pincode proxy error:', err.message);
    res.status(502).json({ message: 'Could not fetch pincode data. Please fill manually.' });
  }
});

module.exports = router;
