const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    }
});

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                
            if (value <= 0) {
                throw new Error('Price must be a positive number');
            }
            return true;
        }
    }
    },
    description: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    category: {
        type: String,
        required: true,
        index: true,
        trim: true,
        lowercase: true
    },
    sold: {
        type: Number,
        default: 0,
        select: false,
      },
    brand: {
        type: String,
        required: true,
        index: true,
        trim: true,
        lowercase: true
    },
    quantity: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                if (value <= 0) {
                    throw new Error('Quantity must be a positive number');
                }
                return true;
            },
        }
    },
    
    numReviews: {
        type: Number,
        required: true,
        default: 0,
      },
    imageURL: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
                return urlRegex.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    created_at: {
        type: Date,
        default: () => Date.now()
    },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
