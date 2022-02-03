/**
* Bucket
*@module Bucket
*/
const db = require('../config/db');

/**
* A Bucket
* @typedef {Object} Bucket
* @class User
* @property {string} pinId - Users real name
* @property {string} userId - Username
* @param {object} bucket
*/
const Bucket = function(bucket) {
  this.userId = bucket.pin_userId,
  this.lat = bucket.lat,
  this.lng = bucket.lng,
  this.location = bucket.location
};


/**
  * Creates a new user
  * @param {Object} newBucket The pin information that is being added
  * @param {function} result function that takes and error and the new user
  */
Bucket.createBucket = async function(newBucket, userId, result) {
  console.log("HERE")
  const query = 'insert into bucket (bucket_userId, bucket_lat, bucket_lng, bucket_location) values("' + userId + '","' + newBucket.lat + '","' + newBucket.lng + '","' + newBucket.location + '")';
  console.log(newBucket);
  db.query(query, (err, bucket, fields) => {
    if (err) result(err, null);

    result(null, bucket);
  });
};


/**
  * Creates a new user
  * @param {Object} newUser The pin information that is being added
  * @param {function} result function that takes and error and the new user
  */
Bucket.getUserBuckets = async function(userId, result) {
  const query = 'SELECT * FROM bucket WHERE bucket_userId = ' + userId

  db.query(query, (err, buckets, fields) => {
    if (err) throw err;
    console.log(buckets);
    result(null, buckets);
  });
};

/**
  * Creates a new user
  * @param {Object} newUser The pin information that is being added
  * @param {function} result function that takes and error and the new user
  */
Bucket.deleteBucket = async function(bucketId, result) {
  console.log(bucketId);
  const query = 'DELETE FROM bucket WHERE bucket_id = ' + bucketId;

  db.query(query, (err, bucket, fields) => {
    if (err) throw err;
    console.log(bucket)
    result(null, bucket);
  });
};

module.exports = Bucket;
