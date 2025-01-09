const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const User = require("../modules/user/models/user");

module.exports = function (app) {
  // initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // use local strategy is used to authenticate users based on email and password
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'Incorrect email.' });
      if (user.authProvider === 'google') {
        return done(null, false, { message: 'Please login with Google.' });
      }
      if (!user.isActive) return done(null, false, { message: 'Account not activated.' });
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  // serialize user is used to store user id in the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  // deserialize user is used to retrieve user information from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};