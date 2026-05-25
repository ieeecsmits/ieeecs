const express = require('express');

const pool = require('../db/connection');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const buildUpdate = require('../utils/buildUpdate');
const HttpError = require('../utils/HttpError');

const router = express.Router();

const BEARER_UPDATABLE_COLUMNS = new Set([
  'name', 'position', 'department', 'year', 'email',
  'linkedin_url', 'github_url', 'image_url', 'bio',
  'order_index', 'is_active', 'tenure_year',
]);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { tenure_year, active } = req.query;
    const clauses = [];
    const params = [];
    if (active !== 'false') clauses.push('is_active = true');
    if (tenure_year) { clauses.push('tenure_year = $1'); params.push(tenure_year); }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT * FROM office_bearers ${whereSql} ORDER BY order_index ASC`,
      params
    );
    res.json({ success: true, bearers: rows });
  })
);

router.post(
  '/',
  authMiddleware,
  adminOnly,
  schemas.officeBearerCreate,
  validate,
  asyncHandler(async (req, res) => {
    const {
      name, position, department, year, email,
      linkedin_url, github_url, image_url, bio, order_index, tenure_year,
    } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO office_bearers
        (name, position, department, year, email, linkedin_url, github_url, image_url, bio, order_index, tenure_year)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [name, position, department, year, email, linkedin_url, github_url, image_url, bio, order_index ?? 0, tenure_year]
    );
    res.status(201).json({ success: true, bearer: rows[0] });
  })
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  schemas.uuidParam(),
  validate,
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, BEARER_UPDATABLE_COLUMNS, req.params.id);
    const { rows } = await pool.query(
      `UPDATE office_bearers SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    if (!rows[0]) throw new HttpError(404, 'Office bearer not found');
    res.json({ success: true, bearer: rows[0] });
  })
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  schemas.uuidParam(),
  validate,
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM office_bearers WHERE id = $1', [req.params.id]);
    if (!rowCount) throw new HttpError(404, 'Office bearer not found');
    res.json({ success: true, message: 'Deleted' });
  })
);

module.exports = router;
