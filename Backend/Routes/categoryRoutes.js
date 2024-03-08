const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, updateCategory, deleteCategory, getProductsByCategory, addProductToCategory} = require('../Controller/Categorycontroller');
const Category = require('../Model/Category');


//Get all categories
router.get('/', getAllCategories);

//Create new category
router.post('/', createCategory);

//Get category by id
router.get('/:id', getProductsByCategory);

//Update category
router.put('/:id', updateCategory);

//Delete category
router.delete('/:id', deleteCategory);

//Add product to category
router.put('/:id/products/:pid', addProductToCategory);




module.exports = router;

