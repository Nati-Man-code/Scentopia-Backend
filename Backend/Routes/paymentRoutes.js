const express = require('express');
const router = express.Router();
const {  processPayment,capturePayment,refundPayment,viewTransactionHistory, handlePaymentFailures, securePaymentProcessing, sendPaymentNotification} = require('../Controller/PaymentController');
const Payments = require('../Model/Payment');

//Payment routes
router.post('/processPayment', (req, res) => {
    const { paymentType, amount, currency, description, clientDetails } = req.body;
    processPayment(paymentType, amount, currency, description, clientDetails).then(data => res.json(data)).catch(err => res.status(500).json(err));
});

router.post('/capturePayment', (req, res) => {
    const { paymentToken } = req.body;
    capturePayment(paymentToken).then(data => res.json(data)).catch(err => res.status(500).json(err));
});

router.post('/refundPayment', (req, res) => {
    const { paymentToken } = req.body;
    refundPayment(paymentToken).then(data => res.json(data)).catch(err => res.status(500).json(err));
});

router.get('/viewTransactionHistory', (req, res) => {
    viewTransactionHistory().then(data => res.json(data)).catch(err => res.status(500).json(err));
});

router.post('/handlePaymentFailures', (req, res) => {
    const { paymentError } = req.body;
    handlePaymentFailures(paymentError).then(data => res.json(data)).catch(err => res.status(500).json(err));
});

router.post('/securePaymentProcessing', (req, res) => {
    const { creditCardNumber, expirationMonth, expirationYear, cvv } = req.body;
    securePaymentProcessing(creditCardNumber, expirationMonth, expirationYear, cvv).then(data => res.json(data)).catch(err => res.status(500).json(err));
});

router.post('/sendPaymentNotification', (req, res) => {
    const { paymentToken, clientDetails } = req.body;
    sendPaymentNotification(paymentToken, clientDetails).then(data => res.json(data)).catch(err => res.status(500).json(err));
});





module.exports = router;


