// Import mongoose
const mongoose = require('mongoose');

// Define Payment Schema
const paymentSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: [true, 'Transaction ID is required'],
        unique: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Invalid Amount']
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: {
            values: ['card', 'paypal', 'bankTransfer'],
            message: 'Invalid payment method'
        }
    },
    card: {
        number: {
            type: String,
            required: [function () {
                return this.paymentMethod === 'card';
            }, 'Card number is required']
        },
        ccv: {
            type: String,
            required: [function () {
                return this.paymentMethod === 'card';
            }, 'CCV is required']
        },
        expiry: {
            type: String,
            required: [function () {
                return this.paymentMethod === 'card';
            }, 'Card expiry is required']
        }
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: {
            values: ['pending', 'successful', 'failed'],
            message: 'Invalid status'
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports= mongoose.model('Payment', paymentSchema);


