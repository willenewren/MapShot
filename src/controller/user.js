/**
* User Controller
*@module UserController
*/

const User = require('../model/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

/**
* authenticates user with passport
* @param {Object} req client request
* @param {Object} res server response
* @param {Object} next function for express to call next
*/
exports.authenticate_user = function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
};
/**
* get userInfo from req and delete password, then return user info
* @param {Object} req client request
* @param {Object} res server response
*/
exports.get_user_info = function(req, res) {
  User.getUserById(req.user.user_id, function(err, user) {
    if (err) return err;
    delete user['password'];
    res.status(200).json(user);
  });
};

/**
* get userInfo from req and delete password, then return user info
* @param {Object} req client request
* @param {Object} res server response
*/
exports.get_user_tags = function(req, res) {
  User.getUserTags(req.user.user_id, function(err, tags) {
    if (err) return err;
    console.log(tags);
    res.status(200).json(tags);
  });
};


/**
* get userInfo from req and delete password, then return user info
* @param {Object} req client request
* @param {Object} res server response
*/
exports.get_style = function(req, res) {
  User.getUserStyle(req.user.user_id, function(err, mapStyle) {
    if (err) {
      return err;
    }
    res.status(200).json(mapStyle);
  });
};

/**
* sets user styles based on template from req
* @param {Object} req client request
* @param {Object} res server response
*/
exports.edit_style = function(req, res) {
  const newStyle = req.body.userStyle;
  User.changeStyle(req.user.user_id, newStyle, (err, style) => {
    if (err) return err;
    res.status(201).json(style);
  });
};

/**
* logs out user
* @param {Object} req client request
* @param {Object} res server response
*/
exports.logout_user = function(req, res) {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
};

/**
* gets user id from request and respond with user
* @param {Object} req client request
* @param {Object} res server response
*/
exports.get_user_by_id = function(req, res) {
  const id = parseInt(req.params.id);
  User.getUserById(id, function(err, user) {
    if (err) {
      return err;
    }
    if (user == null) {
      res.status(401).json({
        message: 'Invalid Login',
      });
    } else {
      delete user.password;
      res.status(200).json(user);
    }
  });
};
/**
* gets user info from request and creates user
* responds with the new user
* @param {Object} req client request
* @param {Object} res server response
*/
exports.register_user = function(req, res) {
  const {firstname, lastname, username, email, password} = req.body;
  const name = firstname + ' ' + lastname;
  const errors = [];

  User.getUserByUsername(username, (err, user) => {
    if (user) {
      errors.push({msg: 'Username already exisits'});
    }
  });

  password2 = password;


  if (!name || !email || !password || !password2) {
    errors.push({msg: 'Please enter all fields'});
  }
  if (password != password2) {
    errors.push({msg: 'Passwords do not match'});
  }
  /*
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }*/
  if (errors.length > 0) {
    res.render('register', {
      errors,
    });
  } else {
    // add new user
    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password: password,
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        // add user to database
        User.createUser(newUser, (err, user) => {
          if (err) {
            res.status(500).json({
              error: err,
              message: err.message,
            });
            return;
          } else {
            res.redirect('/login');
          }
        });
      });
    });
  }
};
/**
* gets new password and old password andn changes password
* @param {Object} req client request
* @param {Object} res server response
*/
exports.change_password = function(req, res) {
  const {oldPassword, newPassword, newPassword2} = req.body;

  const errors = [];

  if (newPassword != newPassword2) {
    errors.push({msg: 'Passwords do not match'});
  }

  if (errors.length > 0) {
    res.render('changePassword', {
      errors,
    });
  } else {
    // change password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newPassword, salt, (err, hash) => {
        if (err) throw err;
        // add user to database
        User.changePassword(req.user.user_username, hash, (err, user) => {
          if (err) {
            res.status(500).json({
              error: err,
              message: err.message,
            });
            return;
          } else {
            res.redirect('/');
          }
        });
      });
    });
  }
};
