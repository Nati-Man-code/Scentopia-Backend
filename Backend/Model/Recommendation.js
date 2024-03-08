const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recommendationSchema = new Schema({
    perfume_name: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 255
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recommended_perfume_name: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 255
    },
    recommendation_date: {
        type: Date,
        default: Date.now
    },
    recommended_by: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 50
    },
    recommendation_type: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 50
    }
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;

