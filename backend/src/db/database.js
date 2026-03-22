const Database = require('better-sqlite3');
const path = require('path');

// Create (or open) the database file at the root of /backend
const db = new Database(path.join(__dirname, '../../database.db'));

// Enable WAL mode — makes reads faster, safe for our use case
db.pragma('journal_mode = WAL');

// Create the users table if it doesn't exist yet
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    username  TEXT    NOT NULL UNIQUE,
    email     TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL,
    role      TEXT    NOT NULL DEFAULT 'user',
    createdAt TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// Create the notes table — this is what our API will manage
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    userId    INTEGER NOT NULL,
    title     TEXT    NOT NULL,
    content   TEXT    NOT NULL DEFAULT '',
    createdAt TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`);

console.log('Database connected and tables ready');

module.exports = db;