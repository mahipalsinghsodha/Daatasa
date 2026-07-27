const passport = require("passport");
const GoogleStrategy =
  require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const googleauth = () => {

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,

        clientSecret:
          process.env.GOOGLE_CLIENT_SECRET,

        callbackURL:
          "/api/auth/google/callback",
        proxy: true,
      },

      async (
        accessToken,
        refreshToken,
        profile,
        done
      ) => {
        try {
          const email =
            profile.emails[0].value;

          let user =
            await User.findOne({ email });

          if (!user) {
            user =
              await User.create({
                name:
                  profile.displayName,
                email,
                password:
                  "google-oauth",
              });
          }

          done(null, user);

        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  passport.serializeUser(
    (user, done) => {
      done(null, user.id);
    }
  );

  passport.deserializeUser(
    async (id, done) => {
      const user =
        await User.findById(id);
      done(null, user);
    }
  );

};

module.exports = googleauth;