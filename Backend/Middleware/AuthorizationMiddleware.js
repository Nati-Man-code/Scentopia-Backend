// Server/Middleware/AuthMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../Model/User');

const authMiddleware = async (req, res, next) => {
    // Get the token from the headers
    const token = req.header('Authorization');

    // If no token, return a 401
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by ID
        const user = await User.findById(decoded._id);

        // If no user is found, return a 401
        if (!user) {
            return res.status(401).json({ error: 'Invalid token, user not found' });
        }

        // Check if user is archived
        if (user.isArchived) {
            return res.status(401).json({ error: 'User is archived' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({ error: 'User is not verified' });
        }

        // If we reach here, the user is valid
        req.user = user;

        // Pass the execution to the next middleware function
        next();

    } catch (error) {
        // If there's an error, return a 401
        return res.status(401).json({ error: 'Invalid token' });
    }
};



module.exports = authMiddleware;
