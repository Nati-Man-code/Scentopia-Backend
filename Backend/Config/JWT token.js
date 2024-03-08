const jwt = require('jsonwebtoken');
const SECRET = 'secret';

const generateToken = user => jwt.sign({ _id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin }, SECRET, { expiresIn: '30d' });

/**
 * Middleware function to verify JWT token
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const verifyToken = (req, res, next) => {
  // Get the token from the header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // If there is no token in the header, return an error
    return res.status(401).json({ error: 'No token provided' });
  }

  // If there is a token in the header, split it and get the second part
  const token = authHeader.split(' ')[1];

  // Verify the token
  jwt.verify(token, SECRET, (err, decoded) => {
    // If there is a token verification error, return an error
    if (err) {
      return res.status(403).json({ error: 'Token is not valid' });
    }

    // If there is no error, save the decoded token data to the request object
    req.user = decoded;

    // Call the next middleware function
    next();
  });
};


module.exports = { generateToken, verifyToken };