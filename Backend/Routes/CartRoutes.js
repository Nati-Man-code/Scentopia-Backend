const express = require('express');
const router = express.Router();
const { createCart, getAllCarts, getCart, updateCart, deleteCart } = require('../Controller/CartController');

// Create a new cart
router.post('/', createCart);

// Get all carts
router.get('/', getAllCarts);

// Get a single cart by ID
router.get('/:cartId', getCart);

// Update a cart by ID
router.put('/:cartId', updateCart);

// Delete a cart by ID
router.delete('/:cartId', deleteCart);

module.exports = router;