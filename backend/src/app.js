require('dotenv').config();
const express = require('express');

// This line runs the database setup immediately when app starts
const db = require('./db/database');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
