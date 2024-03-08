// Server/routes/wishlistRoutes.js

const express = require('express');
const router = express.Router();
const {
    createWishlist,
    updateWishlist,
    getWishlist,
    getAllWishlists,
    deleteWishlist,
    searchWishlist,
    addProductsToWishlist
} = require('../Controller/WishlistController');

// Route to create a new wishlist
router.post('/wishlist', createWishlist);

// Route to update an existing wishlist by ID
router.put('/wishlist/:id', updateWishlist);

// Route to get a single wishlist by ID
router.get('/wishlist/:id', getWishlist);

// Route to get all wishlists
router.get('/wishlists', getAllWishlists);

// Route to delete a wishlist by ID
router.delete('/wishlist/:id', deleteWishlist);

// Route to search wishlists
router.get('/search', searchWishlist);

// Route to add products to a wishlist
router.post('/wishlist/addProducts', addProductsToWishlist);

module.exports = router;