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
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/discount' ,discount);
app.use('./api/wishlist', wishlist);
app.use('./api/recommendations', recommendations);
app.use('./api/review', review);

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello, world!\n');
});
// Start the server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});