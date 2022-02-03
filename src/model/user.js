/**
* User
*@module User
*/
const db = require('../config/db');

/**
* A User
* @typedef {Object} User
* @class User
* @property {string} name - Users real name
* @property {string} username - Username
* @property {string} password - User password
* @property {string} email - User email
* @param {object} user
*/
const User = function(user) {
  this.name = user.name,
  this.username = user.username,
  this.password = user.password,
  this.email = user.email;
};

/**
  * Creates a new user
  * @param {Object} newUser The pin information that is being added
  * @param {function} result function that takes and error and the new user
  */
User.createUser = async function(newUser, result) {
  const user = {
    username: newUser.username,
    name: newUser.name,
    email: newUser.email,
    password: newUser.password,
  };
  const query = 'insert into user (user_username, user_password, user_email, user_name) values("' + user.username + '","' + user.password + '","' + user.email + '","' + user.name + '")';

  db.query(query, (err, user, fields) => {
    // if any error while executing above query, throw error
    if (err) throw err;
    // if there is no error, you have the result
    const mapquery = 'insert into mapstyle (mapStyle_template, mapStyle_userId) values("[]", '+ user.insertId+')';
    db.query(mapquery, (err, user, fields) => {
      if (err) throw err;
      result(null, user);
    });
  });
};
/**
  * Gets a user by username
  * @param {number} username username of the user
  * @param {function} result function that takes and error and user
  */
User.getUserByUsername = function(username, result) {
  const query = 'select * from user WHERE user_username = "' + username+'"';

  db.query(query, (err, user, fields) => {
    // if any error while executing above query, throw error
    if (err) result(err, null);
    else {
      // if there is no error, you have the result
      result(null, user[0]);
    }
  });
};
/**
  * Gets a single user by its id
  * @param {number} id ID of the user
  * @param {function} result function that takes and error and a user
  */
User.getUserById = function(id, result) {
  const query = 'select * from user WHERE user_id = "' + id + '"';

  db.query(query, (err, user, fields) => {
    // if any error while executing above query, throw error
    if (err) result(err, null);
    else {
      // if there is no error, you have the result
      result(null, user[0]);
    }
  });
};

/**
  * Gets a single user by its id
  * @param {number} id ID of the user
  * @param {function} result function that takes and error and a user
  */
User.getUserInfo = function(id, result) {
  const query = 'select user_username, user_name, user_profilePic, user_bio from user WHERE user_id = "' + id + '"';

  db.query(query, (err, user, fields) => {
    // if any error while executing above query, throw error
    if (err) result(err, null);
    else {
      // if there is no error, you have the result
      result(null, user[0]);
    }
  });
};


/**
  * Gets a single user by its id
  * @param {number} id ID of the user
  * @param {function} result function that takes and error and a user
  */
User.getUserTags = function(id, result) {
  const query = 'select distinct tag.tag_name, tag.tag_id from tag left join pin_tag on pin_tag.pin_tag_tagId = tag.tag_id inner join pin on pin_tag.pin_tag_pinId = pin.pin_id where  pin.pin_userId = ' + id;

  db.query(query, (err, tags, fields) => {
    // if any error while executing above query, throw error
    if (err) result(err, null);
    else {
      // if there is no error, you have the result
      console.log(tags);
      result(null, tags);
    }
  });
};


/**
  * Gets a single pin by its id
  * @param {string} username users username
  * @param {string} newPassword password the user want to change to
  * @param {function} result function that takes and user
  */
User.changePassword = function(username, newPassword, result) {
  const query = 'update user set user_password =\'' + newPassword +'\' where user_username = "'+ username + '"';

  db.query(query, (err, user, fields) => {
    // if any error while executing above query, throw error
    if (err) result(err, null);
    else {
      // if there is no error, you have the result
      result(null, user[0]);
    }
  });
};

/**
  * Sets user style to new template
  * @param {string} userId users username
  * @param {function} result function that takes and style template
  */
User.getUserStyle = function(userId, result) {
  const query = 'select * from mapstyle where mapStyle_userId = ' + userId;

  db.query(query, (err, mapStyle, fields) => {
    // if any error while executing above query, throw error
    if (err) result(err, null);
    else {
      // if there is no error, you have the result
      result(null, mapStyle[0]);
    }
  });
};

/**
  * Sets user style to new template
  * @param {string} userId users username
  * @param {array} newStyle new user style
  * @param {function} result function that takes and style template
  */
User.changeStyle = function(userId, newStyle, result) {
  db.query('select * from mapstyle where mapStyle_userId =' + userId, (err, mapStyle, fields) => {
    // if any error while executing above query, throw error
    if (err) result(err, null);
    else {
      if (mapStyle.length === 0) {
        const query = 'insert into mapstyle (mapStyle_userId, mapStyle_template) values("'+ userId +'", \'' + newStyle + '\')';
        db.query(query, (err, mapStyle, fields) => {
          // if any error while executing above query, throw error
          if (err) result(err, null);
          else {
            // if there is no error, you have the result
            result(null, mapStyle);
          }
        });
      } else {
        const query = 'update mapstyle set mapStyle_template = \'' + newStyle + '\' where mapStyle_userId = "'+ userId + '"';
        db.query(query, (err, mapStyle, fields) => {
          // if any error while executing above query, throw error
          if (err) result(err, null);
          else {
            // if there is no error, you have the result
            result(null, mapStyle);
          }
        });
      }
    }
  });
};


module.exports = User;
