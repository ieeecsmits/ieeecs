const express = require('express');
const pool = require('../db/connection');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    const { status, type, featured, limit = 20, offset = 0 } = req.query;
    const filterClauses = [];
    const filterParams = [];
    let idx = 1;

    if (status) { filterClauses.push(`status = $${idx++}`); filterParams.push(status); }
    if (type) { filterClauses.push(`event_type = $${idx++}`); filterParams.push(type); }
    if (featured === 'true') { filterClauses.push(`is_featured = true`); }

    const whereSql = filterClauses.length ? `WHERE ${filterClauses.join(' AND ')}` : '';

    const listQuery = `SELECT * FROM events ${whereSql} ORDER BY date DESC LIMIT $${idx++} OFFSET $${idx++}`;
    const listParams = [...filterParams, Number(limit), Number(offset)];

    const [result, countResult] = await Promise.all([
      pool.query(listQuery, listParams),
      pool.query(`SELECT COUNT(*) FROM events ${whereSql}`, filterParams),
    ]);

    res.json({ success: true, events: result.rows, total: parseInt(countResult.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    console.error('GET /events/:id error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/events - Create event (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      title, description, short_description, event_type, status,
      date, time, end_date, venue, is_online, meeting_link,
      registration_link, max_participants, image_url, tags, is_featured
    } = req.body;

    const result = await pool.query(`
      INSERT INTO events (title, description, short_description, event_type, status, date, time,
        end_date, venue, is_online, meeting_link, registration_link, max_participants,
        image_url, tags, is_featured, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *
    `, [title, description, short_description, event_type, status, date, time,
        end_date, venue, is_online, meeting_link, registration_link, max_participants,
        image_url, tags, is_featured, req.user.id]);

    res.status(201).json({ success: true, event: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

const EVENT_UPDATABLE_COLUMNS = new Set([
  'title', 'description', 'short_description', 'event_type', 'status',
  'date', 'time', 'end_date', 'venue', 'is_online', 'meeting_link',
  'registration_link', 'max_participants', 'current_participants',
  'image_url', 'tags', 'is_featured',
]);

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const entries = Object.entries(req.body).filter(([k]) => EVENT_UPDATABLE_COLUMNS.has(k));
    if (entries.length === 0) {
      return res.status(400).json({ success: false, message: 'No updatable fields provided' });
    }
    const setClause = entries.map(([k], i) => `${k} = $${i + 2}`).join(', ');
    const values = [req.params.id, ...entries.map(([, v]) => v)];
    const result = await pool.query(
      `UPDATE events SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// DELETE /api/events/:id (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    console.error('DELETE /events/:id error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/events/:id/register - Register for event
router.post('/:id/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, phone, college, branch, year_of_study, roll_number, ieee_member_id, is_ieee_member, notes } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    await client.query('BEGIN');

    const eventRes = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [req.params.id]);
    const event = eventRes.rows[0];
    if (!event) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: `Registration closed: event is ${event.status}` });
    }

    if (event.max_participants && event.current_participants >= event.max_participants) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    const existing = await client.query(
      'SELECT id FROM event_registrations WHERE event_id = $1 AND email = $2',
      [req.params.id, email]
    );
    if (existing.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Already registered with this email' });
    }

    const result = await client.query(`
      INSERT INTO event_registrations
        (event_id, name, email, phone, college, branch, year_of_study, roll_number, ieee_member_id, is_ieee_member, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `, [req.params.id, name, email, phone, college, branch, year_of_study, roll_number, ieee_member_id, is_ieee_member || false, notes]);

    await client.query('UPDATE events SET current_participants = current_participants + 1 WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');
    res.status(201).json({ success: true, registration: result.rows[0], message: 'Registration successful!' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/events/:id/registrations (admin only)
router.get('/:id/registrations', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM event_registrations WHERE event_id = $1 ORDER BY registered_at DESC',
      [req.params.id]
    );
    res.json({ success: true, registrations: result.rows });
  } catch (err) {
    console.error('GET /events/:id/registrations error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
