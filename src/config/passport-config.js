const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

// Load User model
const User = require('../model/user');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({usernameField: 'username', passwordFeild: 'password'}, (username, password, done) => {
      // Match user
      User.getUserByUsername(username, (err, user) => {
        if (err) {
          return done(err);
        }
        if(!user) {
          return done(null, false, {message: "User does not exists"})
        }
        bcrypt.compare(password, user.user_password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password. Please try again!' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.user_id);
  });

  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });
}
