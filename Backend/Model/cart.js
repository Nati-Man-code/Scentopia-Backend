const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: [true, 'Product is required'],
                },
                quantity: {
                    type: Number,
                    required: [true, 'Quantity is required'],
                    validate: {
                        validator: function (v) {
                            return v >= 1;
                        },
                        message: 'Quantity should be greater than or equal to 1',
                    },
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

cartSchema.index({ user: 1, 'items.product': 1 }, { unique: true });

cartSchema.pre('save', async function (next) {
    const cart = this;
    const totalAmount = cart.items.reduce((acc, item) => {
        return acc + item.product.price * item.quantity;
    }, 0);
    cart.totalAmount = totalAmount;
    next();
});

cartSchema.virtual('itemsCount', {
    ref: 'CartItem',
    localField: '_id',
    foreignField: 'cart',
    count: true,
});