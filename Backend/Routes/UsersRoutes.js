const authMiddleware = require('../Middleware/AuthenticationMiddleware');
const express = require('express');
const router = express.Router();
const {registerUser, loginUser, forgotPassword, resetPassword, getUserById, updateUser, deleteUser} = require('../Controller/UserController');
const User = require('../Model/User.js');

router.route('/api/register').post(registerUser);
router.route('/api/login').post(loginUser);
router.route('/api/forgot-password').post(forgotPassword);
router.route('/api/reset-password').post(resetPassword);
router.route('/api/:id').get(getUserById);
router.route('/api/:id').put(updateUser);
router.route('/api/:id').delete(deleteUser);

module.exports = router;
