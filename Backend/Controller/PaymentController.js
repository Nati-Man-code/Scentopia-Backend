//Process Payment:

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Payments = require('../Model/Payment');
const nodemailer = require('nodemailer');

const processPayment = async (req, res) => {
    try {
        const paymentDetails = req.body;

        // validate request body
        if (!paymentDetails.amount || !paymentDetails.currency || !paymentDetails.description) {
            return res.status(400).json({ error: 'Please provide amount, currency and description for the payment' });
        }

        // create a new Payment document
        const newPayment = new Payment({
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            description: paymentDetails.description,
            status: 'pending'
        });

        // save the Payment document to the database
        const savedPayment = await newPayment.save();

        // redirect user to the payment gateway
        res.redirect(307, `${process.env.PAYMENT_GATEWAY_URL}/pay/${savedPayment.id}`);

    } catch (error) {
        res.status(500).json({ error: 'An error occurred during payment processing' });
    }
};


//Capture Payment:
const capturePayment = async (req, res) => {
    try {
        const paymentId = req.params.id;
        if (!paymentId) {
            return res.status(400).json({ error: 'Please provide a payment ID to capture' });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ error: 'This payment has already been captured or refunded' });
        }

        // call your payment gateway's capture API here
        // update payment status to 'completed' if successful
        // set payment.capture_details = {capture_id, captured_at}

        // add your payment gateway's capture API call and update payment status and details here
        payment.status = 'completed';
        payment.capture_details = {
            capture_id: 'ch_1IUfCxIeZvKYlo2CrhTU2vMg',
            captured_at: Date.now()
        };
        const updatedPayment = await payment.save();

        res.status(200).json({ message: 'Payment captured successfully', payment: updatedPayment });

    } catch (error) {
        res.status(500).json({ error: 'An error occurred during payment capture' });
    }
};



//Refund Payment:
const refundPayment = async (req, res) => {
    try {
        const paymentId = req.params.id;
        if (!paymentId) {
            return res.status(400).json({ error: 'Please provide a payment ID to refund' });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({ error: 'This payment has not been captured yet' });
        }

        // call your payment gateway's refund API here
        // update payment status to 'refunded' if successful
        // set payment.refund_details = {refund_id, refunded_at}

        // add your payment gateway's refund API call and update payment status and details here
        const refund = await stripe.refunds.create({
            payment_intent: payment.payment_intent_id
        });

        payment.status = 'refunded';
        payment.refund_details = {
            refund_id: refund.id,
            refunded_at: Date.now()
        };
        const updatedPayment = await payment.save();

        res.status(200).json({ message: 'Payment refunded successfully', payment: updatedPayment });

    } catch (error) {
        res.status(500).json({ error: 'An error occurred during payment refund' });
    }
};


//View Transaction History:
const viewTransactionHistory = async (req, res) => {
    try {
        // Retrieve all payments and send back to the user
        const payments = await Payment.find({}, 'payment_intent_id status created_at capture_details refund_details').populate('order_id', 'order_number customer_id');

        // Format the response
        const response = payments.map(payment => {
            const formattedPayment = payment._doc;
            formattedPayment.order = payment.order_id._doc;
            delete formattedPayment.order_id;
            return formattedPayment;
        });

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while viewing transaction history' });
    }
};


//Handle Payment Failures:
const handlePaymentFailures = async (req, res) => {
    try {
        const paymentId = req.params.id;
        if (!paymentId) {
            return res.status(400).json({ error: 'Please provide a payment ID to handle failures' });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (payment.status === 'refunded') {
            return res.status(400).json({ error: 'This payment has already been refunded' });
        }

        // call your payment gateway's payment failure handling API here
        // update payment status to 'failed' if successful
        // set payment.failure_details = {failure_reason, failed_at}

        // add your payment gateway's payment failure handling API call and update payment status and details here
        const failureReason = 'Payment declined by the bank';
        payment.status = 'failed';
        payment.failure_details = {
            failure_reason,
            failed_at: Date.now()
        };
        const updatedPayment = await payment.save();

        res.status(200).json({ message: 'Payment failures handled successfully', payment: updatedPayment });

    } catch (error) {
        res.status(500).json({ error: 'An error occurred while handling payment failures' });
    }
};


//Secure Payment Processing:
const securePaymentProcessing = async (req, res) => {
    try {
        const paymentId = req.params.id;
        if (!paymentId) {
            return res.status(400).json({ error: 'Please provide a payment ID to process securely' });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (payment.status !== 'initiated') {
            return res.status(400).json({ error: 'Payment has already been processed' });
        }

        const paymentDetails = {
            amount: payment.amount,
            currency: payment.currency,
            description: payment.description,
            card_number: payment.card_number,
            exp_month: payment.exp_month,
            exp_year: payment.exp_year,
            cvc: payment.cvc
        };

        // call your payment gateway's payment processing API here
        // update payment status to 'paid' if successful
        // set payment.transaction_id = payment_gateway's transaction_id
        // set payment.paid_at = current timestamp
        // set payment.gateway_response = payment_gateway's response

        // add your payment gateway's payment processing API call and update payment status and details here
        const paymentGateway = 'CHAPA';
        const apiKey = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'; // replace with your CHAPA secret key
        const CHAPA = require('CHAPA')(apiKey);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            description: paymentDetails.description,
            payment_method_data: {
                card: {
                    number: paymentDetails.card_number,
                    exp_month: paymentDetails.exp_month,
                    exp_year: paymentDetails.exp_year,
                    cvc: paymentDetails.cvc
                }
            }
        });

        payment.status = 'paid';
        payment.transaction_id = paymentIntent.id;
        payment.paid_at = Date.now();
        payment.gateway_response = paymentIntent;
        const updatedPayment = await payment.save();

        res.status(200).json({ message: 'Payment processed securely', payment: updatedPayment });

    } catch (error) {
        res.status(500).json({ error: 'An error occurred during secure payment processing' });
    }
};



//Payment Notifications:
const sendPaymentNotification = async (req, res) => {
    try {
        const payment = await Payment.findById(req.body.paymentId);

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const paymentNotification = {
            paymentId: payment._id,
            orderId: payment.order,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            transactionId: payment.transaction_id,
            paidAt: payment.paid_at,
            gatewayResponse: payment.gateway_response
        };

        await axios.post(process.env.PAYMENT_NOTIFICATION_URL, paymentNotification);

        res.status(200).json({ message: 'Payment notification sent successfully', paymentNotification });

    } catch (error) {
        res.status(500).json({ error: 'An error occurred while sending payment notification' });
    }
};


module.exports = {
    processPayment,
    capturePayment,
    refundPayment,
    viewTransactionHistory,
    handlePaymentFailures,
    securePaymentProcessing,
    sendPaymentNotification
};