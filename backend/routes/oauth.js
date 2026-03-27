router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect:
      `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {

    const token =
      makeToken(req.user._id);

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