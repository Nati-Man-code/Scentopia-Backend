const express = require('express');
const router = express.Router();

const { getAllReviews, getReviewById, createReview, updateReview, deleteReview } = require('../controllers/ReviewController');

// @route   GET api/reviews
// @desc    Get all reviews
// @access  Public
router.get('api/reviews', getAllReviews);

// @route   GET api/reviews/:id
// @desc    Get a review by its id
// @access  Public
router.get('api/reviews/:id', getReviewById);

// @route   POST api/reviews
// @desc    Create a review
// @access  Private
router.post('api/reviews', createReview);

// @route   PUT api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('api/reviews/:id', updateReview);

// @route   DELETE api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('api/reviews/:id', deleteReview);

module.exports = router;
