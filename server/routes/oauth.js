const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

const crypto = require("crypto");
// GOOGLE LOGIN

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);


// GOOGLE CALLBACK

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect:
      `${process.env.CLIENT_URL}/login`,
  }),
  async (req, res) => {
    // 1. Generate Access Token (15m)
    const accessToken = jwt.sign(
      { id: req.user._id, version: req.user.tokenVersion || 0, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // 2. Generate Refresh Token (7d)
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const refreshToken = jwt.sign(
      { id: req.user._id, version: req.user.tokenVersion || 0, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // 3. Save Refresh Token Hash to DB
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    let activeTokens = (req.user.refreshTokens || []).filter(t => t.expiresAt > Date.now());
    if (activeTokens.length >= 5) activeTokens.shift();
    activeTokens.push({
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: (req.headers['user-agent'] || '').substring(0, 100),
    });
    req.user.refreshTokens = activeTokens;
    await req.user.save({ validateBeforeSave: false });

    // 4. Set httpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // 5. Send postMessage to frontend popup opener
    res.send(`
      <script>
        try {
          if (window.opener && window.opener !== window) {
            window.opener.postMessage(
              {
                token: "${accessToken}"
              },
              "${process.env.CLIENT_URL}"
            );
            window.close();
          } else {
            window.location.href = "${process.env.CLIENT_URL}/login?token=${accessToken}";
          }
        } catch (error) {
          window.location.href = "${process.env.CLIENT_URL}/login?token=${accessToken}";
        }
      </script>
    `);
  }
);



module.exports = router;