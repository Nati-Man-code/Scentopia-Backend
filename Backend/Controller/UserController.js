//Import module and dependencies
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 
const jwt = require('jsonwebtoken');
const Payments = require('../Model/Payment');
const { body } = require('express-validator');
const asyncHandler = require('../Middleware/asyncHandler.js'); 
const nodemailer = require('nodemailer');
const User = require('../Model/User');


  exports.registerUser = async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
  
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword
      });
      if (newUser) {
        res.status(201).json({
          message: "User successfully registered", // Added success message here
          _id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
        });
      } else {
          res.status(400).json({ error: "User not created" });
      }
      await newUser.save();


    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while processing your request" });
    }
  };
  
  exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Missing email or password" });
      }
  
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (user) {
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          
        }
      });
    }
    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ message: "An error occurred while processing your request", error: error.message });
      }
};

//Logout users
exports.logoutUser = async (req, res) => {
    try {
        if (!req.body.userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }


        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        // Log the error for debugging
        console.error(error);
        res.status(500).json({ message: 'An error occurred during logout' });
    }
};
exports.sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // use 'gmail' or any other service you prefer
            auth: {
                user: process.env.EMAIL_USER, // your email username
                pass: process.env.EMAIL_PASS, // your email password
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
        });

        console.log('Email sent successfully');
        return { success: true }; // Indicate success
    } catch (error) {
        console.log(`Error: ${error}`);
        return { success: false, error: error }; // Indicate failure 
    }
};
//Reset Password
exports.resetPassword = async (req, res) => {
    const { email } = req.body;

    try {                  
        const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const token = generateToken(user); // Generate a token for the password reset link
            const emailBody = `Please use the following link to reset your password: https://yourapp.com/reset-password?token=${token}`;

            const emailResult = await exports.sendEmail(user.email, 'Password Reset Request', emailBody);
            if (!emailResult.success) {
                         console.log(`Failed to send email: ${emailResult.error}`);
                return res.status(500).json({ message: 'Failed to send password reset email. Please try again later.' });
            }
        
        // Generate a unique password reset token and save it in the database
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetExpires = Date.now() + 3600000; // 1 hour from now

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;

        await user.save();


        res.status(200).json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
//Change Password
exports.changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordMatch = await user.comparePasswords(oldPassword);

        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Invalid old password' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
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
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
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




