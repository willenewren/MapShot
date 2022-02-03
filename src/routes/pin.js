// Router for event information

const express = require('express');
const router = express.Router();
const pinController = require('../controller/pin');
const upload = require('../config/multer-config');

const {ensureAuthenticated} = require('../config/auth');

router.get('/images', ensureAuthenticated, pinController.get_pin_images);
router.get('/tags', ensureAuthenticated, pinController.get_pin_tags);


router.get('/user', ensureAuthenticated, pinController.get_user_pins);
router.get('/feed', ensureAuthenticated, pinController.get_user_feed);
router.get('/explore', ensureAuthenticated, pinController.get_explore_feed);

// router.get('/explore', ensureAuthenticated, pinController.get_explore_feed);
router.post('/', ensureAuthenticated, upload.array('images', 10), pinController.post_pin);
router.get('/:pinId', ensureAuthenticated, pinController.get_pin_by_id);
router.put('/:pinId', ensureAuthenticated, pinController.edit_pin);
router.delete('/:pinId', ensureAuthenticated, pinController.delete_pin);


module.exports = router;
