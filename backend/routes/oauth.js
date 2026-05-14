const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

const makeToken = (user) =>
  jwt.sign(
    { id: user._id, version: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );


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
  (req, res) => {

    const token =
      makeToken(req.user);

    res.send(`
      <script>
        window.opener.postMessage(
          {
            token: "${token}"
          },
          "${process.env.CLIENT_URL}"
        );
        window.close();
      </script>
    `);

  }
);



module.exports = router;