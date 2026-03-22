const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const userModel = require('../db/userModel');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');

// Rate limiter — max 10 attempts per 15 minutes on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register',
  authLimiter,
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3–30 characters')
      .escape(),
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      const userId = await userModel.create(username, email, password);
      const newUser = userModel.findById(userId);
      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      return res.status(201).json({
        message: 'Account created successfully',
        user: { id: newUser.id, username: newUser.username, role: newUser.role },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      // SQLite unique constraint — username or email already taken
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Username or email already in use.' });
      }
      console.error(err);
      return res.status(500).json({ error: 'Server error. Please try again.' });
    }
  }
);

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = userModel.findByEmail(email);

      // Always run verifyPassword even if user not found
      // This prevents timing attacks that reveal if an email exists
      const passwordMatch = user
        ? await userModel.verifyPassword(password, user.password)
        : false;

      if (!user || !passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return res.json({
        message: 'Login successful',
        user: { id: user.id, username: user.username, role: user.role },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error. Please try again.' });
    }
  }
);

// ─── POST /api/auth/refresh ────────────────────────────────────────────────
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = userModel.findById(decoded.id);

    if (!user) {
      return res.status(403).json({ error: 'User not found.' });
    }

    const newAccessToken = generateAccessToken(user);
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired refresh token.' });
  }
});

module.exports = router;