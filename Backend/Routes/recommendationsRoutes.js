
const express = require('express');
const router = express.Router();
const {    getAllRecommendations,
  getRecommendationById,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation} = require('../Controller/recommendationsController');


// Route to get all recommendations
router.get('/', getAllRecommendations);

// Route to get a recommendation by ID
router.get('/:id', getRecommendationById);

// Route to create a new recommendation
// Note: The validation and sanitization middleware are included directly in the route definition
router.post('/:perfumeId',  createRecommendation);

// Route to update a recommendation
router.put('/:id',updateRecommendation);

// Route to delete recommendations for selected perfume
router.delete('/:id', deleteRecommendation);

module.exports = router;