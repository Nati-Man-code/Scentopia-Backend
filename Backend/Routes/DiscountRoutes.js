const express = require('express');
const Discount = require('../Model/Discount');
const router = express.Router();
const {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount
} = require('../Controller/DiscountController.js'); // Make sure to replace this with the actual path to your controller file


// Routes
router.get('/', (getAllDiscounts)); // Get all discounts
router.get('/:id', (getDiscountById)); // Get discount by ID
router.post('/',  (createDiscount)); // Create a new discount, assuming verify is an auth middleware
router.put('/:id',  (updateDiscount)); // Update a discount by ID
router.delete('/:id', (deleteDiscount)); // Delete a discount by ID

module.exports = router;