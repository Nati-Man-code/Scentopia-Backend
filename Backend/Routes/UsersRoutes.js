const authMiddleware = require('../Middleware/AuthenticationMiddleware');
const express = require('express');
const router = express.Router();
const {registerUser, loginUser, forgotPassword, resetPassword, getUserById, updateUser, deleteUser} = require('../Controller/UserController');
const User = require('../Model/User.js');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/:id').get(getUserById);
router.route('/:id').put(updateUser);
router.route('/:id').delete(deleteUser);

module.exports = router;
