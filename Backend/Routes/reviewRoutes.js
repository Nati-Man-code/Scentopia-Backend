const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview
} = require('../Controller/ReviewController');

// Middleware for validation and sanitization
const { body, sanitizeBody, validationResult } = require('express-validator');

// Get all reviews
router.get('/', getAllReviews);

// Get a single review by ID
router.get('/:id', getReviewById);

// Create a new review
router.post('/', createReview);

// Update a review by ID
router.patch('/:id', updateReview);

// Delete a review by ID
router.delete('/:id', deleteReview);

module.exports = router;