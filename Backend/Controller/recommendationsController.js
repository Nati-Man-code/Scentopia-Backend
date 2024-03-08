// Server/Controller/RecommendationsController.js

//Import module and dependencies 
const express = require('express');
const mongoose = require('mongoose');
const Recommendation = require('../models/Recommendation');
const { body } = require('express-validator');

//Get all Recommendations
exports.getAllRecommendations = async (req, res) => {
    try {
        const recommendations = await Recommendation.find();
        res.status(200).json(recommendations);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

//Get Recommendation by ID
const getRecommendationById = async (req, res) => {
    const { id } = req.params;
    try {
        const recommendation = await Recommendation.findById(id);
        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }
        res.status(200).json(recommendation);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

//Create Recommendation for selected perfume
exports.createRecommendation = [
    //Validate data
    body('recommendationText', 'Recommendation text must not be empty.').trim().isLength({ min: 1 }),

    //Sanitize data
    sanitizeBody('recommendationText').escape(),

    //Process request after validation and sanitization
    async (req, res) => {
        //Extract the validation errors from a request
        const errors = validationResult(req);

        //Create a new recommendation
        const recommendation = new Recommendation({
            recommendationText: req.body.recommendationText,
            perfume: req.params.perfumeId
        });

        if (!errors.isEmpty()) {
            //There are errors. Render form again with sanitized values/errors messages
            res.render('recommendationForm', {
                title: 'Add Recommendation',
                recommendation,
                errors: errors.array()
            });
            return;
        }
        else {
            try {
                await recommendation.save();
                res.redirect(recommendation.perfume + '/recommendations');
            }
            catch (error) {
                console.error(error.message);
                res.status(500).send('Server Error');
            }
        }
    }
];


//Update Recommendation
const updateRecommendation = async (req, res) => {
    const { id } = req.params;
    const { recommendationText } = req.body;
    try {
        let recommendation = await Recommendation.findById(id);
        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }
        recommendation.recommendationText = recommendationText;
        recommendation.selected = req.body.selected;
        recommendation = await recommendation.save();
        res.status(200).json(recommendation);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


//Delete Recommendations for Selected Above
const deleteRecommendationsForSelectedAbove = async (req, res) => {
    const { id } = req.params;
    try {
        let perfume = await Perfume.findById(id);
        if (!perfume) {
            return res.status(404).json({ message: 'Perfume not found' });
        }
        let recommendations = await Recommendation.find({perfume: perfume, selected: true});
        for (let recommendation of recommendations) {
            await recommendation.remove();
        }
        res.status(200).json({ message: 'Recommendations for selected above deleted' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getAllRecommendations,
    getRecommendationById,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation
};