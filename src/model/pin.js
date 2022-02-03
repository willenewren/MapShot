/**
* Pin Model
* @module Pin
*/
const db = require('../config/db');

/**
* A Pin
* @typedef {Object} Pin
* @class Pin
* @property {string} title - Pin Title
* @property {string} description - Pin description
* @property {string} img_url - pin image
* @property {double} lat - Pin latitute
* @property {double} lng - Pin longitude
* @param {object} body json object that has pin information
*/
const Pin = function(body) {
  this.title = body.title || 'Untitled',
  this.description = body.descr || '',
  this.location_name = body.location_name,
  this.lat = body.lat,
  this.lng = body.lng,
  this.tag = body.tag;
};

/**
  * Gets all user pins from database
  * @param {number} userId ID of user getting the pins
  * @param {function} result function that takes and error and a list of pins
  */
Pin.getUserPins = async function(userId, result) {
  const query = 'select pin.pin_id, pin.pin_title,  pin.pin_locationName, pin.pin_description, pin.pin_lat, pin.pin_lng, pin.pin_userId, user.user_username, user.user_profilePic FROM pin join user on pin.pin_userId = user.user_id WHERE pin_userId = ' + userId;
  db.query(query, (err, pins, fields) => {
    // if any error while executing above query, throw error
    if (err) throw err;
    // if there is no error, you have the result
    result(null, pins);
  });
};

/**
  * Gets all feed pins from database
  *@param {function} result function that takes and error and a list of pins
  */
Pin.getUserFeed = async function(userId, result) {
  const query = 'select pin.pin_id, pin.pin_title, pin_locationName, pin.pin_description, pin.pin_lat, pin.pin_lng,  pin.pin_userId, user.user_username, user.user_profilePic FROM pin join user on pin.pin_userId = user.user_id';
  db.query(query, (err, pins, fields) => {
    // if any error while executing above query, throw error
    if (err) throw err;
    // if there is no error, you have the result
    result(null, pins);
  });
};


/**
  * Gets a single pin by its id
  * @param {number} pinId ID of the pin
  * @param {function} result function that takes and error and a pin
  */
Pin.getPinById = async function(pinId, result) {
  const self = this;
  const query = 'select pin.pin_id, pin.pin_title, pin_locationName, pin.pin_description, pin.pin_lat, pin.pin_lng, user.user_username, user.user_profilePic FROM pin join user on pin.pin_userId = user.user_id where pin.id = ' + pinId;
  db.query(query, (err, pin, fields) => {
    // if any error while executing above query, throw error
    if (err) throw err;
    // if there is no error, you have the result
    result(null, pin);
  });
};

/**
  * Gets a single pin by its id
  * @param {number} pinId ID of the pin
  * @param {function} result function that takes and error and a pin
  */
Pin.getPinImages = async function(pinId, result) {
  const self = this;
  const query = 'select (photo_path) from pin_photo left join photo on pin_photo.pin_photo_photoId = photo.photo_id where pin_photo_pinId = ' + pinId;
  db.query(query, (err, photos, fields) => {
    // if any error while executing above query, throw error
    if (err) throw err;
    // if there is no error, you have the resul
    result(null, photos);
  });
};

/**
  * Gets a single pin by its id
  * @param {number} pinId ID of the pin
  * @param {function} result function that takes and error and a pin
  */
Pin.getPinTags = async function(pinId, result) {
  const query = 'select (tag_name) from pin_tag left join tag on pin_tag_tagId = tag.tag_id where pin_tag_pinId = ' + pinId;
  db.query(query, (err, tags, fields) => {
    // if any error while executing above query, throw error
    if (err) throw err;
    // if there is no error, you have the result
    //
    result(null, tags);
  });
};

/**
  * Creates a new pin
  * @param {Object} newPin The pin information that is being added
  * @param {Object} user The user who posted the pin
  * @param {function} result function that takes and error and a pin
  */
Pin.createPin = async function(newPin, user, result) {
  console.log("Start")
  // create new pin
  const pin = {
    pin_userId: user.user_id,
    pin_username: user.user_username,
    pin_title: newPin.title,
    pin_locationName: newPin.location_name,
    pin_description: newPin.description,
    pin_lat: parseFloat(newPin.lat),
    pin_lng: parseFloat(newPin.lng),
    tag: newPin.tag,
  };

  const images = newPin.img_url;
  const pinId = await this.addPin(pin);
  if(images.length > 0) {
    const addedImages = await this.addPinImages(images);
    await this.connectImagesToPin(pinId, addedImages);
  }
  console.log(pin.tag);
  if(pin.tag && pin.tag != "") {
    const tagId = await this.addPinTags(pin.tag);
    await this.connectTagstoPin(pinId, tagId);
  }
  console.log(pin);
  result(null, pin);
};




Pin.addPin = function(pin) {
  return new Promise((resolve, reject) => {
    // MAKE NEW PIN
    const newPinQuery = 'insert into pin (pin_userId, pin_title, pin_locationName, pin_description, pin_lat, pin_lng) values("' + pin.pin_userId + '","' + pin.pin_title + '","' + pin.pin_locationName + '","' + pin.pin_description + '","' + pin.pin_lat + '","' + pin.pin_lng + '")';
    db.query(newPinQuery, (err, pinInsert, fields) => {
      // if any error while executing above query, throw error
      if (err) reject(err)
      console.log(pinInsert)
      resolve(pinInsert.insertId);
    });
  });
};


Pin.addPinImages = function(images) {
  return new Promise((resolve, reject) => {
    const pinPhotos = [];
    // ADD PHOTOS
    if (images && images.length > 0) {
      const newPhotoQuery = 'INSERT INTO photo (photo_id, photo_path) VALUES ?';
      const values = [];
      images.forEach((file) => {
        const trimmedPath = file.path.slice(6);
        //id is the filename
        values.push([file.filename, trimmedPath]);
        pinPhotos.push(file.filename);
      });

      db.query(newPhotoQuery, [values], (err, photos, fields) => {
        if (err) throw err;
        resolve(pinPhotos);
      });
    } else {
      resolve([]);
    }

  });
};

Pin.connectImagesToPin = function(pinId, pinPhotos) {
  return new Promise((resolve, reject) => {
    // CONNECT PIN WITH PHOTOS
    if (pinPhotos.length > 0) {
      const newPinPhotoQuery = 'INSERT INTO pin_photo (pin_photo_pinId, pin_photo_photoId) VALUES ? ';
      const values = [];
      pinPhotos.forEach((photo) => {
        values.push([pinId, photo]);
      });
      db.query(newPinPhotoQuery, [values], (err, pinPhotos, fields) => {
        if (err) reject(err);
        resolve();
      });
    }
  });
};


Pin.addPinTags = function(tag) {
  console.log(tag);
  return new Promise((resolve, reject) => {
    if (tag && tag != "") {
      const checkTagExistsQuery = 'SELECT * FROM tag WHERE tag_name = "' + tag + '"';
      db.query(checkTagExistsQuery, (err, tags, fields) => {
        if (err) reject(err);
        // if tag exists
        if (tags && tags.length > 0) {
          console.log("EXISTING TAG");
          // add pin tag relationship
          console.log("TAGS: ")
          console.log(tags)
          resolve(tags[0].tag_id);
          // if tag doesnt exist
        } else {
          console.log("New TAG");
          // make new tag and add pin tag relationship
          const newTagQuery = 'INSERT INTO tag (tag_name) VALUES("' + tag +'")';
          db.query(newTagQuery, (err, tag, fields) => {
            if (err) reject(err);
            console.log(tag);
            resolve(tag.insertId);
          });
        }
      });
    } else {
      resolve();
    }
  });
};

Pin.connectTagstoPin = function(pinId, tagId) {
  return new Promise((resolve, reject) => {
    const newPinTagQuery = 'INSERT INTO pin_tag (pin_tag_pinId, pin_tag_tagId) VALUES('+ pinId +', '+ tagId +')';
    db.query(newPinTagQuery, (err, tag, fields) => {
      if (err) reject(err)
      resolve();
    });
  });

};


/**
  * Edits a pin
  * @param {number} editedPin ID of the pin
  * @param {function} result function that takes and error
  */
Pin.editPin = async function(editedPin, result) {
  result(null);
};
/**
  * Deletes a pin
  * @param {number} pinId ID of the pin
  * @param {function} result function that takes and error
  */
Pin.deletePin = async function(pinId, result) {
  pins = pins.filter((p) => p.id != pinId);
  result(null);
};

module.exports = Pin;
