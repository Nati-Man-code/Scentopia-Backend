const express = require('express');
const {getAllOrders, getOrderById, updateOrderById, deleteOrderById} = require('../Controller/OrderController');
const Order = require('../Model/Order');

const router = express.Router();

//RESTful routes for Orders
router.route('/getAllOrders').get(getAllOrders);
router.route('/getOrderById/:id').get(getOrderById);
router.route('/updateOrderById/:id').put(updateOrderById);
router.route('/deleteOrderById/:id').delete(deleteOrderById);



module.exports = router;

