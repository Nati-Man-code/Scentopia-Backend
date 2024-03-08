// Server/Controller/WishlistController.js

//Import module and dependencies 
const express = require('express');
const mongoose = require('mongoose');
const Wishlist = require('../Model/Wishlist');
const { body } = require('express-validator');

// Create Wishlist
const createWishlist = async (req, res) => {
    try {
        // Validate request body
        if (!req.body || !req.body.data) {
            res.status(400).json({ error: 'Invalid request body' });
            return;
        }
        
        // Logic to create a new wishlist
        const wishlist = await createNewWishlist(); // Assuming there is a function to create a new wishlist
        res.status(201).json({ message: 'Wishlist created successfully' });
    } catch (error) {
        if (error instanceof SpecificErrorType) {
            res.status(400).json({ error: 'Specific error message' });
        } else if (error instanceof AnotherErrorType) {
            res.status(401).json({ error: 'Another specific error message' });
        } else {
            res.status(500).json({ error: 'Failed to create wishlist' });
        }
    }
};

// Update Wishlist
const updateWishlist = async (req, res) => {
    try {
        // Validate request body
        if (!req.body || !req.body.data) {
            res.status(400).json({ error: 'Invalid request body' });
            return;
        }
        
        // Logic to update a wishlist
        const wishlistId = req.params.id;
        const updateParams = req.body.data;
        const updatedWishlist = await Wishlist.findByIdAndUpdate(wishlistId, updateParams, { new: true });
        
        if (!updatedWishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }
        
        res.status(200).json({ message: 'Wishlist updated successfully', wishlist: updatedWishlist });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update wishlist' });
    }
};


// Get Single Wishlist
const getWishlist = async (req, res) => {
    try {
        const wishlistId = req.params.id;
        const wishlist = await Wishlist.findById(wishlistId);

        if (!wishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        res.status(200).json({ wishlist });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get wishlist' });
    }
};


// Get All Wishlists
const getAllWishlists = async (req, res) => {
    try {
        const wishlists = await Wishlist.find({}).populate('products'); // Populate products in wishlist
        res.status(200).json({ wishlists });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get all wishlists' });
    }
};


// Delete Wishlist
const deleteWishlist = async (req, res) => {
    try {
        const wishlistId = req.params.id;
        const deletedWishlist = await Wishlist.findByIdAndDelete(wishlistId);

        if (!deletedWishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        res.status(200).json({ message: 'Wishlist deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete wishlist' });
    }
};


// Search Wishlist
const searchWishlist = async (req, res) => {
    try {
        const searchQuery = req.query.query; // Get search query from request query parameters
        const wishlists = await Wishlist.find({ name: { $regex: searchQuery, $options: 'i' } }); // Search for wishlists by name, case insensitive

        if (wishlists.length === 0) {
            return res.status(404).json({ error: 'No wishlists found for the search query' });
        }

        res.status(200).json({ wishlists });
    } catch (error) {
        res.status(500).json({ error: 'Failed to search wishlists' });
    }
};


// Add Products to Wishlist
const addProductsToWishlist = async (req, res) => {
    try {
        const { wishlistId, productIds } = req.body;
        const wishlist = await Wishlist.findById(wishlistId);

        if (!wishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        wishlist.products = [...wishlist.products, ...productIds];
        await wishlist.save();

        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add products to wishlist' });
    }
};


module.exports = {
    createWishlist,
    updateWishlist,
    getWishlist,
    getAllWishlists,
    deleteWishlist,
    searchWishlist,
    addProductsToWishlist
};