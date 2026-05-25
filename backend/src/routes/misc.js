const express = require('express');

const pool = require('../db/connection');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimits');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const HttpError = require('../utils/HttpError');

const router = express.Router();

// ==================== GALLERY ====================
router.get(
  '/gallery',
  schemas.pagination,
  validate,
  asyncHandler(async (req, res) => {
    const { category, event_id, featured } = req.query;
    const limit = req.query.limit ?? 20;
    const offset = req.query.offset ?? 0;

    const clauses = [];
    const params = [];
    let idx = 1;
    if (category) { clauses.push(`g.category = $${idx++}`); params.push(category); }
    if (event_id) { clauses.push(`g.event_id = $${idx++}`); params.push(event_id); }
    if (featured === 'true') clauses.push('g.is_featured = true');
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT g.*, e.title AS event_title
         FROM gallery g LEFT JOIN events e ON g.event_id = e.id
         ${whereSql}
         ORDER BY g.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    res.json({ success: true, images: rows, limit, offset });
  })
);

router.post(
  '/gallery',
  authMiddleware,
  adminOnly,
  schemas.galleryCreate,
  validate,
  asyncHandler(async (req, res) => {
    const { title, description, image_url, event_id, category, is_featured } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO gallery (title, description, image_url, event_id, category, is_featured, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, image_url, event_id || null, category || 'general', is_featured ?? false, req.user.id]
    );
    res.status(201).json({ success: true, image: rows[0] });
  })
);

router.delete(
  '/gallery/:id',
  authMiddleware,
  adminOnly,
  schemas.uuidParam(),
  validate,
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM gallery WHERE id = $1', [req.params.id]);
    if (!rowCount) throw new HttpError(404, 'Image not found');
    res.json({ success: true, message: 'Deleted' });
  })
);

// ==================== MEMBERSHIP ====================
router.post(
  '/membership/apply',
  writeLimiter,
  schemas.membershipApply,
  validate,
  asyncHandler(async (req, res) => {
    const {
      name, email, phone, college, branch, year_of_study,
      roll_number, ieee_membership_id, membership_type,
    } = req.body;

    const existing = await pool.query('SELECT id FROM memberships WHERE email = $1', [email]);
    if (existing.rows[0]) throw new HttpError(409, 'Application already submitted with this email');

    const { rows } = await pool.query(
      `INSERT INTO memberships
        (name, email, phone, college, branch, year_of_study, roll_number, ieee_membership_id, membership_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, email, phone, college, branch, year_of_study, roll_number, ieee_membership_id, membership_type || 'student']
    );
    res.status(201).json({ success: true, membership: rows[0], message: 'Membership application submitted' });
  })
);

router.get(
  '/membership',
  authMiddleware,
  adminOnly,
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query('SELECT * FROM memberships ORDER BY applied_at DESC');
    res.json({ success: true, memberships: rows });
  })
);

router.put(
  '/membership/:id/status',
  authMiddleware,
  adminOnly,
  schemas.uuidParam(),
  schemas.membershipStatus,
  validate,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { rows } = await pool.query(
      `UPDATE memberships SET status = $1, approved_at = $2, approved_by = $3
       WHERE id = $4 RETURNING *`,
      [status, status === 'active' ? new Date() : null, req.user.id, req.params.id]
    );
    if (!rows[0]) throw new HttpError(404, 'Membership not found');
    res.json({ success: true, membership: rows[0] });
  })
);

// ==================== CONTACT ====================
router.post(
  '/contact',
  writeLimiter,
  schemas.contactCreate,
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO contacts (name, email, subject, message) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, email, subject, message]
    );
    res.status(201).json({ success: true, contact: rows[0], message: 'Message sent' });
  })
);

router.get(
  '/contact',
  authMiddleware,
  adminOnly,
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json({ success: true, contacts: rows });
  })
);

module.exports = router;
