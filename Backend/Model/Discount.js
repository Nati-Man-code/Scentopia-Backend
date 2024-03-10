const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discountSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  expirationDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  }
});

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;


