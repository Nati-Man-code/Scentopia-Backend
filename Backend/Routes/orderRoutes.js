const express = require('express');
const {getAllOrders, getOrderById, updateOrderById, deleteOrderById} = require('../Controller/OrderController');
const Order = require('../Model/Order');

const router = express.Router();

//RESTful routes for Orders
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id', updateOrderById);
router.delete('/:id', deleteOrderById);



module.exports = router;

