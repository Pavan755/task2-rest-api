const jwt = require('jsonwebtoken');

// This middleware runs BEFORE any protected route handler
// It checks if the request has a valid JWT token
const authenticate = (req, res, next) => {

  // Tokens are sent in the Authorization header like: "Bearer eyJhbG..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // grab just the token part

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to the request object
    next(); // pass control to the actual route handler
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }

};

// This middleware checks if the logged-in user has the 'admin' role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };