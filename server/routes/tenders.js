const express = require('express');
const db      = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/tenders — public list
router.get('/', async (req, res) => {
  try {
    const { category, status = 'open', search } = req.query;
    let sql    = 'SELECT * FROM tenders WHERE 1=1';
    const params = [];

    if (status)   { sql += ' AND status = ?';              params.push(status); }
    if (category) { sql += ' AND category = ?';            params.push(category); }
    if (search)   { sql += ' AND title LIKE ?';            params.push(`%${search}%`); }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tenders/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tenders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Tender not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tenders — government/admin only
router.post('/', authenticate, authorize('government', 'admin'), async (req, res) => {
  const { title, description, category, budget, deadline, location, province } = req.body;
  if (!title || !category || !budget || !deadline) {
    return res.status(400).json({ message: 'title, category, budget and deadline are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO tenders (title, description, category, budget, deadline, location, province, created_by) VALUES (?,?,?,?,?,?,?,?)',
      [title, description, category, budget, deadline, location, province, req.user.id]
    );
    res.status(201).json({ id: result.insertId, message: 'Tender created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tenders/:id/apply — contractors only
router.post('/:id/apply', authenticate, authorize('contractor'), async (req, res) => {
  const { proposal, bid_amount } = req.body;
  try {
    const [tender] = await db.query('SELECT id, status FROM tenders WHERE id = ?', [req.params.id]);
    if (tender.length === 0)          return res.status(404).json({ message: 'Tender not found' });
    if (tender[0].status !== 'open')  return res.status(400).json({ message: 'Tender is not open' });

    await db.query(
      'INSERT INTO applications (tender_id, user_id, proposal, bid_amount) VALUES (?,?,?,?)',
      [req.params.id, req.user.id, proposal, bid_amount]
    );
    res.status(201).json({ message: 'Application submitted' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Already applied' });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
