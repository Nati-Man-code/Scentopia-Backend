// Load environment variables
require('dotenv').config();
const bodyParser = require('body-parser');
const crypto = require('crypto'); 
const http = require('http');
// Load dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');



// Load routes
const userRoutes = require('./Routes/UsersRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const productRoutes = require('./Routes/productRoutes');
const categoryRoutes = require('./Routes/categoryRoutes');
const cartRoutes = require('./Routes/CartRoutes');
const discount = require('./Routes/DiscountRoutes');
const wishlist = require('./Routes/WishlistRoutes')
const recommendations = require('./Routes/recommendationsRoutes');
const review = require('./Routes/reviewRoutes');

// Initialize Express app
const app = express();

const sessionSecret = process.env.SESSION_SECRET;

// Use middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(compression());
app.use(session({
    secret: sessionSecret,
    cookie: { secure: false, httpOnly: true },
    saveUninitialized: false,
    resave: false, 
}));
// Parse incoming request bodies
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

// Define routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/discount' ,discount);
app.use('/api/v1/wishlist', wishlist);
app.use('/api/v1/recommendations', recommendations);
app.use('/api/v1/review', review);

const connectDb = require("./Config/Database.js");
connectDb();

// Start the server
const Port = process.env.PORT;
app.listen(Port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${Port}`);
});
