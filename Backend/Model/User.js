// import the necessary modules
const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken'); // If not used, consider removing
const bcrypt = require("bcryptjs");
// const data = require("../Utils/Data.js"); // If not used, consider removing
// const UserController = require('../Controller/UserController'); // If not used, consider removing

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First Name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password should be at least 8 characters long'],
    select: false,
  },
  address: {
    type: String,
  },
  verificationCode: {
    type: String,
  },
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);