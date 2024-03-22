const { authMiddleware } = require('../Middleware/AuthenticationMiddleware');
const express = require('express');
const router = express.Router();
const {registerUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserById, updateUser, deleteUser, getAllUsers} = require('../Controller/UserController');
const User = require('../Model/User.js');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/logout').post(logoutUser);
router.route('/').get(authMiddleware, getAllUsers); // Added this line for getting all users
router.route('/:id').get(authMiddleware, getUserById);
router.route('/:id').put(authMiddleware, updateUser);
router.route('/:id').delete(authMiddleware, deleteUser);

module.exports = router;