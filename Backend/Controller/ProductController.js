//Import module and dependencies 
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../Model/Product');
const Review = require('../Model/Review');
const Wishlist = require('../Model/Wishlist');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');
// Create Product
const createProduct = async (req, res) => {
    try {
        const { error } = validateProduct(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            image: req.body.image,
            brand: req.body.brand,
            category: req.body.category,
            countInStock: req.body.countInStock,
            user: req.user._id,
        });

        await product.save();

        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

//Update Product
const updateProduct = async (req, res, next) => {
    try {
        const { error } = validateProduct(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const productId = req.params.productId;
        const updateParams = req.body;
        const updatedProduct = await productService.updateProduct(productId, updateParams);

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
        next(error);
    }
};
//Get single Product 
const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!isValidProductId(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const product = await productService.getProductById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get product' });
    }
};


//Get all products
const getAllProducts = async (req, res) => {
    const pageSize = 10; // Set your page size here
    const page = Number(req.query.pageNumber) || 1;

    const count = await Product.countDocuments();
    const products = await Product.find().limit(pageSize)
    .skip(pageSize * (page - 1)).catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Failed to get all products' });
    });

    if(products) res.status(200).json({ 
        products, 
        page, 
        pages: Math.ceil(count / pageSize) 
    });};
//Delete Product
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        // Check user's role or permissions before deleting the product
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Validate productId
        if (!isValidProductId(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete product',details: error.message });
    }
};
//Search Product 
const searchProduct = async (req, res) => {
    try {
        const searchQuery = req.query.query; // Get search query from request query parameters
        if (!searchQuery) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // If we have a large number of products, returning all of them at once might not be efficient.
        // Instead we want to implement pagination to control the number of results we return.
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'name'; // Sort by product name by default

        // Using MongoDB's built-in text search capabilities
        const textSearchQuery = { $text: { $search: searchQuery } };

        // Get the total number of products that match the search query
        const count = await Product.countDocuments(textSearchQuery);

        // Use the skip and limit operators to implement pagination
        const products = await Product.find(textSearchQuery).skip((page - 1) * limit).limit(limit).sort(sort);

        // Check if any products were found
        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found for the search query' });
        }

        // Return the list of products along with pagination metadata
        res.status(200).json({
            products,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to search for products', details: error.message });
    }
};

module.exports = {
    createProduct,
    updateProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
    searchProduct,
};