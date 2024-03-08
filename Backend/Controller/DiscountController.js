
// module and dependencies
const app = express();
const db = require('../config/mongoose');
const verify = require('../Middleware/verifyToken');
const asyncHandler = require('../Middleware/asyncHandler.js');
const express = require('express');
const mongoose = require('mongoose');
const Discount = require('../models/Discount');
const { body } = require('express-validator');

// Get all discounts
const getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find()
            .select('-__v')
            .sort('-createdAt')
            .exec();

        if (!discounts) {
            return res.status(404).json({ error: 'No discounts found' });
        }

        res.status(200).json(discounts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get discounts' });
    }
};


// Get discount by ID
const getDiscountById = async (req, params) => {
    try {
        const discount = await Discount.findOne({
            _id: params.id
        })
            .select('-__v')
            .exec();

        if (!discount) {
            return res.status(404).json({ error: 'Discount not found' });
        }
        res.status(200).json(discount);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get discount' });
    }
};

// Create a new discount
const createDiscount = async (req, res) => {
    const { code, amount, expirationDate } = req.body;
    if (!code || !amount || !expirationDate) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }
    const discountFields = {};
    discountFields.code = code;
    discountFields.amount = amount;
    discountFields.expirationDate = expirationDate;

    try {
        const newDiscount = new Discount(discountFields);
        const savedDiscount = await newDiscount.save();
        res.status(201).json(savedDiscount);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create discount' });
    }
};

// Update a discount
const updateDiscount = async (req, res) => {
    const { code, amount, expirationDate } = req.body;
    // ensure that we only update fields that are being sent in the request
    const updateFields = {};
    if (code) {
        updateFields.code = code;
    }
    if (amount) {
        updateFields.amount = amount;
    }
    if (expirationDate) {
        updateFields.expirationDate = expirationDate;
    }

    try {
        const updatedDiscount = await Discount.findByIdAndUpdate(req.params.id, updateFields, {
            new: true,
            runValidators: true,
        });

        if (!updatedDiscount) {
            return res.status(404).json({ error: 'Discount not found' });
        }

        res.status(200).json(updatedDiscount);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update discount' });
    }
};


// Delete a discount
const deleteDiscount = async (req, res) => {
    try {
        const deletedDiscount = await Discount.findById(req.params.id)
            .then(discount => {
                if (!discount) {
                    return res.status(404).json({ error: 'Discount not found' });
                }
                return discount.remove()
                    .then(() => {
                        res.status(200).json({ message: 'Discount deleted successfully' });
                    });
            })
            .catch(error => {
                res.status(500).json({ error: 'Failed to delete discount' });
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete discount' });
    }
};


module.exports = {
    getAllDiscounts,
    getDiscountById,
    createDiscount,
    updateDiscount,
    deleteDiscount,
};