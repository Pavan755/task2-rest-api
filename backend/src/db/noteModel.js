const db = require('./database');

const noteModel = {

  // Get all notes belonging to a specific user
  findByUserId: (userId) => {
    return db.prepare('SELECT * FROM notes WHERE userId = ? ORDER BY createdAt DESC').all(userId);
  },

  // Get a single note by ID
  findById: (id) => {
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  },

  // Create a new note
  create: (userId, title, content) => {
    const stmt = db.prepare('INSERT INTO notes (userId, title, content) VALUES (?, ?, ?)');
    const result = stmt.run(userId, title, content);
    return result.lastInsertRowid;
  },

  // Update a note — only if it belongs to the requesting user
  update: (id, userId, title, content) => {
    const stmt = db.prepare(
      'UPDATE notes SET title = ?, content = ? WHERE id = ? AND userId = ?'
    );
    return stmt.run(title, content, id, userId);
  },

  // Delete a note — only if it belongs to the requesting user
  delete: (id, userId) => {
    return db.prepare('DELETE FROM notes WHERE id = ? AND userId = ?').run(id, userId);
  },

  // Admin only — get ALL notes from all users
  findAll: () => {
    return db.prepare('SELECT notes.*, users.username FROM notes JOIN users ON notes.userId = users.id ORDER BY notes.createdAt DESC').all();
  }

};

module.exports = noteModel;