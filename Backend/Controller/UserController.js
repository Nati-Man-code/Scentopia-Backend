//Import module and dependencies
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const Payments = require('../Model/Payment');
const { body } = require('express-validator');
const asyncHandler = require('../Middleware/asyncHandler.js'); 
const nodemailer = require('nodemailer');
const User = require('../Model/User');
const crypto = require('crypto');
const data = require("../Utils/Data.js");

exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        // Validate user input
        const { error } = validateUserInput(req.body);
        if (error) {
            return res.status(400).json({ error: 'Invalid user input' });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email: email  });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const user = new User({
            firstName: firstName,
            lastName:lastName,
            email: email,
            password: hashedPassword
        });

        if (user) {
            generateToken(res, user. id);
        
            res.status(201).json({
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              isAdmin: user.isAdmin,
            });
          } else {
            res.status(400);
            throw new Error('Invalid user data');
          }
    
        try {
            const savedUser = await user.save();
            const { id, username } = savedUser;
            const token = generateToken(savedUser); // Function to generate JWT token
            res.status(201).json({ token });     // Send verification email
            await sendEmail(
                user.email,
                'Verify your email',
                `Please verify your email by clicking on this link: http://yourwebsite.com/verify?token=${token}`
            );    } catch (err) {
            res.status(500).json({ error: 'Failed to save user' });
        }
        
        } catch (err) {
            console.log(err.message);
            res.status(400).json({ error: 'An error occurred' });
    }
};
exports.sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // use 'gmail' or any other service you prefer
            auth: {
                user: process.env.EMAIL_USERNAME, // your email username
                pass: process.env.EMAIL_PASSWORD, // your email password
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
        });

        console.log('Email sent successfully');
    } catch (error) {
        console.log(`Error: ${error}`);
    }
};
//Reset Password
exports.resetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a unique password reset token and save it in the database
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetExpires = Date.now() + 3600000; // 1 hour from now

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;

        await user.save();

        // Send an email to the user with a password reset link containing the token
        const resetUrl = `http://yourwebsite.com/reset-password?token=${resetToken}`;

        await sendEmail(
            user.email,
            'Password Reset Request',
            `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, 
            or paste this into your browser to complete the process within one hour of receiving it:\n\n${resetUrl}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        );
        // Send an email to the user with a password reset link containing the token

        res.status(200).json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
//Change Password
exports.changePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordMatch = await user.comparePasswords(oldPassword);

        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Invalid old password' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
//verification
exports.generateVerificationCode = () => {
    const prefix = 'VER-';
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    return prefix + randomCode;
};
//Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Logic to handle forgot password, such as sending email with password reset link
        // Create a reset token and expiry
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;

        await user.save();

        // Send an email with the token
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-password',
            },
        });

        const mailOptions = {
            to: user.email,
            from: 'passwordreset@demo.com',
            subject: 'Node.js Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/reset/${resetToken}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

//Login Users
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find the user by email
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate and send JWT token
        const token = generateToken(user._id); // assuming user._id exists
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

//Logout users
exports.logoutUser = async (req, res) => {
    try {
        if (!req.body.userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Add a check to see if user is already logged out
        if (!req.cookies.jwt) {
            return res.status(400).json({ message: 'User is already logged out' });
        }

        // Clear the JWT cookie
        res.clearCookie('jwt');

        // If using sessions, destroy the session here
        // req.session.destroy();

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        // Log the error for debugging
        console.error(error);
        res.status(500).json({ message: 'An error occurred during logout' });
    }
};
//Get single Users 
exports.getUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ data: null, error: 'User not found' });
        } else {
            res.status(200).json({ data: user, error: null });
        }

    } catch (error) {
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
};
//Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error', details: error.message });    }
};
//Update Users
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;

    // Validate inputs
    if (!userId || !userData) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ status: 'success', data: updatedUser, error: null });
    } catch (error) {
        res.status(500).json({ status: 'error', data: null, error: error.message });
    }
};
//delete Users
exports.deleteUser = async (req, res) => {
    if (!req.params.hasOwnProperty('id')) {
        return res.status(400).json({ error: 'User ID not provided' });
    }

    const userId = req.params.id;

    // Validate userId format
    if (!userId) {
        return res.status(400).json({ error: 'Invalid userId format' });
    }

    try {
        if (!await User.findByIdAndDelete(userId)) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error(error); // Log the actual error message for debugging purposes
        res.status(500).json({ error: `An error occurred while deleting the user: ${error.message}` }); // Send a specific error message to the client    
    } 
};




