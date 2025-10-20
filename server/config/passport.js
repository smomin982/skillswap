const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          let changed = false;
          // Update Google ID if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            changed = true;
          }
          // Store refresh token if provided (e.g., calendar connect)
          if (refreshToken) {
            user.google = user.google || {};
            user.google.refreshToken = refreshToken;
            // Enable calendar sync if the request was for calendar connection
            if (req.query && req.query.state === 'calendar') {
              user.google.calendarSyncEnabled = true;
            }
            // Optionally store scopes from query if available
            if (req.query && req.query.scope) {
              user.google.scopes = Array.isArray(req.query.scope)
                ? req.query.scope
                : String(req.query.scope).split(' ');
            }
            changed = true;
          }
          if (changed) await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value,
          password: Math.random().toString(36).slice(-8), // Random password for OAuth users
        });

        // Save refresh token if available
        if (refreshToken) {
          user.google = user.google || {};
          user.google.refreshToken = refreshToken;
          if (req.query && req.query.state === 'calendar') {
            user.google.calendarSyncEnabled = true;
          }
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
