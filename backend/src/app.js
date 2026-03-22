require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

// Database runs on startup
require('./db/database');

const authRoutes = require('./routes/auth');

const app = express();

// Security headers on every response
app.use(helmet());

// Allow requests from our React frontend
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});