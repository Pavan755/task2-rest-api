const db = require('./database');
const bcrypt = require('bcryptjs');

const userModel = {

  // Create a new user — hashes password before saving
  create: async (username, email, password, role = 'user') => {
    const hashed = await bcrypt.hash(password, 12);
    const stmt = db.prepare(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(username, email, hashed, role);
    return result.lastInsertRowid;
  },

  // Find a user by email (used during login)
  findByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  // Find a user by ID (used after token verification)
  findById: (id) => {
    return db.prepare('SELECT id, username, email, role, createdAt FROM users WHERE id = ?').get(id);
  },

  // Check if a password matches the stored hash
  verifyPassword: async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

};

module.exports = userModel;