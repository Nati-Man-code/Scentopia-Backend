// Server/Controller/ReviewController.js

// Import module and dependencies
const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const { body } = require('express-validator');

// Get all reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().select('-__v');
        res.status(200).json(reviews);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Get review by ID
const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).select('-__v');
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json(review);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


// Create a new review
const createReview = [
    // Validate data
    body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters long'),
    body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters long'),
    body('rating').isNumeric().withMessage('Rating must be a number'),

    // Sanitize data
    sanitizeBody('title').escape(),
    sanitizeBody('description').escape(),

    // Process request after validation and sanitization
    async (req, res) => {
        // Extract the validation errors from a request
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            description,
            rating,
        } = req.body;

        try {
            const newReview = new Review({
                title,
                description,
                rating,
            });

            const review = await newReview.save();
            res.status(201).json(review);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
];


// Update review by ID
const updateReview = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'rating'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        updates.forEach(update => review[update] = req.body[update]);

        await review.save();

        res.status(200).json(review);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};




// Delete review by ID
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


module.exports = {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
};
