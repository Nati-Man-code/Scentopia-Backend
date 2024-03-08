
// module and dependencies

const express = require('express');
const Category = require('../Model/Category');

// Create Category
const createCategory = async (req, res) => {
    // validate request
    if (!req.body.name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    if (!req.body.description) {
        return res.status(400).json({ error: 'Description is required' });
    }

    // create new category document
    const newCategory = new Category({
        name: req.body.name,
        description: req.body.description,
        parentCategory: req.body.parentCategory,
    });

    try {
        // save the category document to the database
        const savedCategory = await newCategory.save();

        // return the created category document
        res.status(201).json(savedCategory);
    } catch (error) {
        // if something goes wrong, return error message
        res.status(400).json({ error: 'Failed to create category' });
    }
};


// Get all categories
const getAllCategories = async (req, res) => {
    try {
        // retrieve all categories from the database
        const categories = await Category.find();

        // if there are no categories, return an empty array
        if (!categories.length) {
            return res.status(200).json([]);
        }

        // if there are categories, return them
        res.status(200).json(categories);
    } catch (error) {
        // if there is an error, return an error message
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve categories' });
    }
};


//Update Category
const updateCategory = async (req, res) => {
    const { id } = req.params;

    // validate request parameters
    const { error } = categoryValidation(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        // find the category to update
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // update the category
        category.name = req.body.name;
        category.description = req.body.description;
        category.parentCategory = req.body.parentCategory;
        const updatedCategory = await category.save();

        // return the updated category document
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update category' });
    }
};

//Delete Category
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        // find the category by ID
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // check if there are any products associated with the category
        const products = await Product.find({ category: id });
        if (products.length > 0) {
            return res.status(400).json({ error: `Cannot delete category. ${products.length} products are associated with this category.` });
        }

        // delete the category
        const deletedCategory = await Category.findByIdAndDelete(id);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
};


//Get Products by Category
const getProductsByCategory = async (req, res) => {
    const { id } = req.params;

    try {
        // find the category by ID
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // get the products associated with the category
        const products = await Product.find({ _id: { $in: category.products } });

        // return the products
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve products for this category' });
    }
};


// Add Product to Category
const addProductToCategory = async (req, res) => {
    const { categoryId, productId } = req.body;

    // validate request parameters
    if (!categoryId || !productId) {
        return res.status(400).json({ error: 'Both category ID and product ID are required' });
    }

    try {
        // find the category by ID
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // check if the product is already associated with the category
        if (category.products.includes(productId)) {
            return res.status(400).json({ error: 'Product is already associated with this category' });
        }

        // add the product to the category
        category.products.push(productId);

        // save the updated category document to the database
        const updatedCategory = await category.save();

        // return the updated category document
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ error: 'Failed to add product to category' });
    }
};


module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    getProductsByCategory,
    addProductToCategory
};
