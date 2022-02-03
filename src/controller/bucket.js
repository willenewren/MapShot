/**
* Tag Controler
* @module Tag Controller
*/

const Bucket = require('../model/bucket');

/**
* gets user id from request and responds with an array of user tags
* @param {Object} req client request
* @param {Object} res server response
*/
exports.get_user_buckets = function(req, res) {
  console.log(req.user);
  const userId = req.user.user_id;

  Bucket.getUserBuckets(userId, (err, rows) => {
    if (err) throw err;
    res.status(200).json(rows);
  });
};

/**
* gets user and new pin from request and
* responds with a json object of the new post
* @param {Object} req client request
* @param {Object} res server response
*/
exports.post_bucket = function(req, res, next) {
  const newBucket = new Bucket(req.body);
  const userId = req.user.user_id;
  Bucket.createBucket(newBucket, userId, (err, bucket) => {
    if (err) return next(err);
    else {
      res.status(201).json(bucket);
    }
  });
};
/**
* deletes a tag based on an id received by the request
* responds with 201 if successfull
* @param {Object} req client request
* @param {Object} res server response
*/
exports.delete_bucket = function(req, res) {
  const bucketId = req.params.bucketId;
  Bucket.deleteBucket(bucketId, (err, bucket) => {
    if (err) throw err;
    console.log("BUCKET DELETED")
    res.sendStatus(200);
  });
};
