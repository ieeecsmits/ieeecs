const express = require('express');

const pool = require('../db/connection');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimits');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const buildUpdate = require('../utils/buildUpdate');
const HttpError = require('../utils/HttpError');

const router = express.Router();

const EVENT_UPDATABLE_COLUMNS = new Set([
  'title', 'description', 'short_description', 'event_type', 'status',
  'date', 'time', 'end_date', 'venue', 'is_online', 'meeting_link',
  'registration_link', 'max_participants', 'current_participants',
  'image_url', 'tags', 'is_featured',
]);

router.get(
  '/',
  schemas.pagination,
  validate,
  asyncHandler(async (req, res) => {
    const { status, type, featured } = req.query;
    const limit = req.query.limit ?? 20;
    const offset = req.query.offset ?? 0;

    const clauses = [];
    const params = [];
    let idx = 1;
    if (status) { clauses.push(`status = $${idx++}`); params.push(status); }
    if (type) { clauses.push(`event_type = $${idx++}`); params.push(type); }
    if (featured === 'true') clauses.push('is_featured = true');
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const [list, count] = await Promise.all([
      pool.query(
        `SELECT * FROM events ${whereSql} ORDER BY date DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM events ${whereSql}`, params),
    ]);

    res.json({ success: true, events: list.rows, total: count.rows[0].total, limit, offset });
  })
);

router.get(
  '/:id',
  schemas.uuidParam(),
  validate,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (!rows[0]) throw new HttpError(404, 'Event not found');
    res.json({ success: true, event: rows[0] });
  })
);

router.post(
  '/',
  authMiddleware,
  adminOnly,
  schemas.eventCreate,
  validate,
  asyncHandler(async (req, res) => {
    const {
      title, description, short_description, event_type, status,
      date, time, end_date, venue, is_online, meeting_link,
      registration_link, max_participants, image_url, tags, is_featured,
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO events (title, description, short_description, event_type, status, date, time,
        end_date, venue, is_online, meeting_link, registration_link, max_participants,
        image_url, tags, is_featured, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [title, description, short_description, event_type, status, date, time,
       end_date, venue, is_online, meeting_link, registration_link, max_participants,
       image_url, tags, is_featured, req.user.id]
    );
    res.status(201).json({ success: true, event: rows[0] });
  })
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  schemas.uuidParam(),
  validate,
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, EVENT_UPDATABLE_COLUMNS, req.params.id);
    const { rows } = await pool.query(
      `UPDATE events SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    if (!rows[0]) throw new HttpError(404, 'Event not found');
    res.json({ success: true, event: rows[0] });
  })
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  schemas.uuidParam(),
  validate,
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    if (!rowCount) throw new HttpError(404, 'Event not found');
    res.json({ success: true, message: 'Event deleted' });
  })
);

router.post(
  '/:id/register',
  writeLimiter,
  schemas.uuidParam(),
  schemas.eventRegister,
  validate,
  asyncHandler(async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const eventRes = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [req.params.id]);
      const event = eventRes.rows[0];
      if (!event) throw new HttpError(404, 'Event not found');
      if (['completed', 'cancelled'].includes(event.status)) {
        throw new HttpError(400, `Registration closed: event is ${event.status}`);
      }
      if (event.max_participants && event.current_participants >= event.max_participants) {
        throw new HttpError(400, 'Event is full');
      }

      const dup = await client.query(
        'SELECT id FROM event_registrations WHERE event_id = $1 AND email = $2',
        [req.params.id, req.body.email]
      );
      if (dup.rows[0]) throw new HttpError(409, 'Already registered with this email');

      const {
        name, email, phone, college, branch, year_of_study,
        roll_number, ieee_member_id, is_ieee_member, notes,
      } = req.body;

      const { rows } = await client.query(
        `INSERT INTO event_registrations
           (event_id, name, email, phone, college, branch, year_of_study,
            roll_number, ieee_member_id, is_ieee_member, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [req.params.id, name, email, phone, college, branch, year_of_study,
         roll_number, ieee_member_id, is_ieee_member ?? false, notes]
      );

      await client.query(
        'UPDATE events SET current_participants = current_participants + 1 WHERE id = $1',
        [req.params.id]
      );

      await client.query('COMMIT');
      res.status(201).json({ success: true, registration: rows[0], message: 'Registration successful' });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  })
);

router.get(
  '/:id/registrations',
  authMiddleware,
  adminOnly,
  schemas.uuidParam(),
  validate,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      'SELECT * FROM event_registrations WHERE event_id = $1 ORDER BY registered_at DESC',
      [req.params.id]
    );
    res.json({ success: true, registrations: rows });
  })
);

module.exports = router;
