// Router for event information

const express = require('express');
const router = express.Router();
const bucketController = require('../controller/bucket');

const {ensureAuthenticated} = require('../config/auth');


// router.get('/explore', ensureAuthenticated, pinController.get_explore_feed);
router.post('/', ensureAuthenticated, bucketController.post_bucket);
router.get('/', ensureAuthenticated, bucketController.get_user_buckets);
router.delete('/:bucketId', ensureAuthenticated, bucketController.delete_bucket);


module.exports = router;
