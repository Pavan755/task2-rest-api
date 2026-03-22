const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, requireAdmin } = require('../middleware/auth');
const noteModel = require('../db/noteModel');

// All notes routes require a valid JWT token
router.use(authenticate);

// ─── GET /api/notes ────────────────────────────────────────────────────────
// Regular users get their own notes only
// Admins get ALL notes from every user
router.get('/', (req, res) => {
  try {
    const notes = req.user.role === 'admin'
      ? noteModel.findAll()
      : noteModel.findByUserId(req.user.id);

    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch notes.' });
  }
});

// ─── POST /api/notes ───────────────────────────────────────────────────────
router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').escape(),
    body('content').trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content = '' } = req.body;
      const noteId = noteModel.create(req.user.id, title, content);
      const note = noteModel.findById(noteId);
      res.status(201).json({ message: 'Note created', note });
    } catch (err) {
      res.status(500).json({ error: 'Could not create note.' });
    }
  }
);

// ─── PUT /api/notes/:id ────────────────────────────────────────────────────
router.put('/:id',
  [
    body('title').trim().notEmpty().withMessage('Title is required').escape(),
    body('content').trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content = '' } = req.body;
      const result = noteModel.update(req.params.id, req.user.id, title, content);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Note not found or not yours.' });
      }

      const updated = noteModel.findById(req.params.id);
      res.json({ message: 'Note updated', note: updated });
    } catch (err) {
      res.status(500).json({ error: 'Could not update note.' });
    }
  }
);

// ─── DELETE /api/notes/:id ─────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    // Admins can delete any note, users can only delete their own
    const result = req.user.role === 'admin'
      ? noteModel.delete(req.params.id, noteModel.findById(req.params.id)?.userId)
      : noteModel.delete(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found or not yours.' });
    }

    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete note.' });
  }
});

// ─── GET /api/notes/admin/all ──────────────────────────────────────────────
// Extra admin-only route to get all notes with usernames
router.get('/admin/all', requireAdmin, (req, res) => {
  try {
    const notes = noteModel.findAll();
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch notes.' });
  }
});

module.exports = router;