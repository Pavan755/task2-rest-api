require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

require('./db/database');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const { errorHandler } = require('./middleware/errorHandler.js');

const app = express();

// ── Security headers (helmet adds 11 headers automatically) ──────────────
app.use(helmet());

// ── Global rate limiter — all routes max 100 req/15min per IP ────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── CORS — only allow our frontend origin ────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:8000', 'http://localhost:8000'],
  credentials: true,
}));

// ── Parse JSON bodies ─────────────────────────────────────────────────────
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});