const express = require('express');
const router = express.Router();
const { createProduct, updateProduct, getProductById, getAllProducts, deleteProduct, searchProduct,} = require('../Controller/ProductController');
const Product = require('../Model/Product');

//Get all products
router.get('/', getAllProducts);

//Create new product
router.post('/', createProduct);

//Get single product
router.get('/:id', getProductById);

//Update product
router.put('/:id', updateProduct);

//Delete product
router.delete('/:id', deleteProduct);

//Search products
router.get('/search/:query', searchProduct);



module.exports = router;


