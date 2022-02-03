// Router for user information

const express = require('express');
const router = express.Router();
const userController = require('../controller/user');

const {ensureAuthenticated, forwardAuthenticated} = require('../config/auth');


router.post('/register', forwardAuthenticated, userController.register_user);

router.post('/login', forwardAuthenticated, userController.authenticate_user);

router.post('/changePassword', ensureAuthenticated, userController.change_password);

router.get('/style', ensureAuthenticated, userController.get_style);

router.put('/style', ensureAuthenticated, userController.edit_style);

router.get('/info', ensureAuthenticated, userController.get_user_info);

router.get('/tags', ensureAuthenticated, userController.get_user_tags);

router.post('/logout', userController.logout_user);

module.exports = router;
