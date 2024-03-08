// modules and dependencies
const express = require('express');
const Order = require('../Model/Order');
const { body, validationResult } = require('express-validator');

// GET all orders
const getAllOrders = async (req, res) => {
    try {
        // populate the orders with the user's email, name and cart data
        const orders = await Order.find().populate('user', 'email name');
        // loop through the orders and populate the cart items with the product and quantity
        orders.forEach(order => {
            order.cart.items.forEach(item => {
                item.populate('product', 'name price').execPopulate();
            });
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get orders' });
    }
};


// GET order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'email name').populate('cart.items.product', 'name price');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // populate the cart items with the product name, price and quantity
        order.cart.items.forEach(item => {
            item.populate('product', 'name price').execPopulate();
        });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get order' });
    }
};



// PUT update order by ID
const updateOrderById = async (req, res) => {
    const { error } = validationResult(req);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { id } = req.params;
    const { status, cart } = req.body;

    try {
        const order = await Order.findById(id).populate('user', 'email name');
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (status) order.status = status;
        if (cart) {
            const cartItems = cart.items.map(cartItem => {
                const product = order.cart.items.find(item => item.product.toString() === cartItem.product);
                const quantity = product ? product.quantity + cartItem.quantity : cartItem.quantity;
                return { product: cartItem.product, quantity: quantity };
            });
            order.cart.items = cartItems;
        }

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
};

// DELETE order by ID
const deleteOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const items = order.cart.items;
        items.forEach(async item => {
            const product = await Product.findById(item.product);
            product.quantity += item.quantity;
            await product.save();
        });

        const deletedOrder = await Order.findByIdAndDelete(id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
};


module.exports = {
    getAllOrders,
    getOrderById,
    updateOrderById,
    deleteOrderById
};
