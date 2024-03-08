const mongoose = require('mongoose');
const connectDB = async () => {
    // Check if mongoose has an active connection
    if (mongoose.connection.readyState === 1) {
        console.log("Mongoose is already connected.");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
